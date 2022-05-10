from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.sast.constants import Constants
from Patronus.core.utils.elastic import elastic
from mysql.connector import errorcode
from mysql.connector import Error
from Patronus.config.config import Config
from os.path import dirname
import mysql.connector
import configparser
import subprocess
import operator
import logging
import json
import os
import hashlib
import requests
import uuid
import time
import sys
import datetime
from datetime import timedelta
from sqlalchemy import create_engine, Integer, String, ForeignKey, Column
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from Patronus.models.models import Scans, Results, Assets, con
from sqlalchemy import func, and_, or_
from sqlalchemy import Date, cast
from datetime import date


class Utils():

    def __init__(self):
        self.const = Constants()
        self.config = Config()
        con.connect()
        con.session = con.Session()
        self.session = con.session
        #new ones added
        self.config = Config()
        self.const = Constants()
        self.maven = []
        self.gradle = []

    def __exit__(self):
        self.session.close()

    def execute_cmd(self, command, repo):
        try:
            subprocess.run(command.split())
            logging.info("Executed command ` %s on project %s`" %
                         (command, repo))
        except Exception as e:
            logging.debug(
                "Error while executing command on project %s ` %s `" % (command, repo))
        return

    def run_cloc(self, repo: str):
        parent_dir = dirname(
            dirname(os.path.abspath(os.path.dirname(__file__))))
        os.chdir(parent_dir + '/tools')
        self.execute_cmd('cloc %s%s --json --out=%s%s/cloc.txt' %
                         (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo), repo)
        return

    def parse_cloc(self, repo: str):
        lang = self.config.PATRONUS_SUPPORTED_LANG
        lang_dict = {}

        if os.path.exists('%s%s/cloc.txt' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/cloc.txt' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                res = json.loads(file.read())
                if res.get('Java'):
                    if res['Java']['nFiles']:
                        lang_dict["java"] = res['Java']['nFiles']

                if res.get('JavaScript'):
                    if res['JavaScript']['nFiles']:
                        lang_dict["javascript"] = res['JavaScript']['nFiles']

                if res.get('Go'):
                    if res['Go']['nFiles']:
                        lang_dict["go"] = res['Go']['nFiles']
            return lang_dict

    def run_linguist(self, repo:str):
        os.chdir('%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        f = open("linguist.json", "w")
        subprocess.run(["/usr/local/rvm/gems/ruby-3.0.0/bin/github-linguist --json"], stdout=f, shell=True)
        return

    def parse_linguist_output(self, repo:str):
        languages_list = []
        languages_dict = {}

        if os.path.exists('%s%s/linguist.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/linguist.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                if os.path.getsize('%s%s/linguist.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) > 3:
                    try:
                        file = json.loads(file.read())
                        for lang in file:
                            languages_list.append(lang)
                        for lang in languages_list:
                            languages_dict[lang] = float(file[lang]['percentage'])
                            print(languages_dict)
                        try:
                            return max(zip(languages_dict.values(), languages_dict.keys()))[1]
                        except:
                            pass
                    except Exception as e:
                        print(e)
                        pass
                else:
                    pass
        else:
            print('file not found')
    def detect_programming_language(self, repo: str):
        self.run_linguist(repo)
        lang_dict = self.parse_linguist_output(repo)
        if lang_dict:
            return {'repo': repo, 'lang': lang_dict}
        return        

    def sent_result_to_db(self, **kwargs):
        results = Results()
        repo = kwargs.get('repo')
        text = kwargs.get('text')
        language = kwargs.get('language')
        scanner = kwargs.get('scanner')
        severity = kwargs.get('severity', None)
        bug_class = kwargs.get('bug_class', None)
        dependency_url = kwargs.get('dependency_url', None)
        secrets_scanning_tag = kwargs.get('secrets_scanning_tag', None)
        public_exploit_status = kwargs.get('has_public_expoit')
        image_name = kwargs.get('image_name', None)
        invoke_type = kwargs.get('invoke_type', None)
        invoke_id=kwargs.get('invoke_id', None)
        
        results.scan_id = uuid.uuid4()
        results.project_name = repo
        results.issue = text
        results.language = language
        results.scanner = scanner
        results.hash = hashlib.sha256(text.encode()).hexdigest()
        results.creation_date = datetime.datetime.now()
        results.severity = severity
        results.bug_class = bug_class
        results.dependency_url = dependency_url
        results.secrets_scanning_tag = secrets_scanning_tag
        results.has_public_expoit = public_exploit_status
        results.image_name = image_name
        results.invoke_type=invoke_type
        results.invoke_id=invoke_id

        self.session.add(results)
        self.session.commit()

        return

    def check_issue_exits(self, repo: str, issue: str):
        results = Results()
        res_hash = hashlib.sha256(issue.encode()).hexdigest()
        results = [r.hash for r in self.session.query(
            Results).filter(Results.hash == res_hash)]
        if res_hash in results:
            return True
        else:
            return False

    def sent_asset_to_db(self, repo: str, language: str, last_commit_date, base_image: str):
        assets = Assets()

        assets.asset_id = uuid.uuid1()
        assets.asset_name = repo
        assets.creation_date = datetime.datetime.now()
        assets.language = language
        assets.last_commit_date = last_commit_date
        assets.image_name = base_image

        self.session.add(assets)
        self.session.commit()
        return
        
    def check_asset_exits(self, repo: str):
        assets = Assets()
        assets = [r.asset_name for r in self.session.query(Assets).all()]
        if repo in assets:
            return True
        else:
            return False

    def sent_to_slack(self, repo: str, data: str):
        url = self.config.PATRONUS_SLACK_WEB_HOOK_URL

        title = data['title']
        description = data['description']
        text = "`[*] New vulnerability found in %s` \n```Title: %s \nDescription: %s ```" % (
            repo, title, description)
        payload = {'text': text}
        requests.post(url, data=json.dumps(payload))

    def get_report_to_sent_to_slack(self):
        con.connect()
        con.session = con.Session()
        session = con.session
        last_week = datetime.datetime.utcnow() - datetime.timedelta(days=7)
        result = {}
        result['newly_added_assets_count'] = session.query(Assets).filter(
            cast(Assets.creation_date, Date) == date.today()).count()

        result['newly_added_vuln_count'] = session.query(Results).filter(
            cast(Results.creation_date, Date) == date.today()).count()

        result['newly_added_sast_count'] = session.query(Results).filter(and_(or_(
            Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), cast(Results.creation_date, Date) == date.today())).count()

        result['newly_added_sca_count'] = session.query(Results).filter(and_(or_(
            Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), cast(Results.creation_date, Date) == date.today())).count()

        result['newly_added_ss_count'] = session.query(Results).filter(and_(
            Results.scanner == 'gitleaks', cast(Results.creation_date, Date) == date.today())).count()

        vuln_count_last_week = session.query(Results).filter(
            Results.creation_date > last_week).count()

        sast_count_last_week = session.query(Results).filter(and_(or_(
            Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), Results.creation_date > last_week)).count()

        sca_count_last_week = session.query(Results).filter(and_(or_(
            Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), Results.creation_date > last_week)).count()

        ss_count_last_week = session.query(Results).filter(
            and_(Results.scanner == 'gitleaks', Results.creation_date > last_week)).count()

        result['percentage_change_vuln_count_from_last_week'] = self.percentage_change(
            result['newly_added_vuln_count'], vuln_count_last_week)

        result['percentage_change_sast_count_from_last_week'] = self.percentage_change(
            result['newly_added_sast_count'], sast_count_last_week)

        result['percentage_change_sca_count_from_last_week'] = self.percentage_change(
            result['newly_added_sca_count'], sca_count_last_week)

        result['percentage_change_ss_count_from_last_week'] = self.percentage_change(
            result['newly_added_ss_count'], ss_count_last_week)

        return result

    def percentage_change(self, new, old):
        if new == 0:
            return 0
        return int(((new - old) * 100) / new)

    def sent_daily_report_to_slack(self):
        url = self.config.PATRONUS_SLACK_WEB_HOOK_URL
        report = self.get_report_to_sent_to_slack()
        message = {
            "attachments": [
                {
                    "color": "#1867f0",
                    "title": "Daily Scan Report",
                    "text": "*New assets found:* %s\n*Total vulnerability count:* %s\n*Total SAST Scan Report:* %s\n*Total SCA Scan Report:* %s\n*Total Hard-coded keys Scan Report:* %s\n*SAST Percentage Change from last week:* %s\n*SCA Percentage Change from last week:* %s\n*Hard-coded keys Percentage Change from last week:* %s\n*Total Security Issues Percentage Change from last week:* %s" % (report['newly_added_assets_count'], report['newly_added_vuln_count'], report['newly_added_sast_count'], report['newly_added_sca_count'], report['newly_added_ss_count'], report['percentage_change_vuln_count_from_last_week'], report['percentage_change_sast_count_from_last_week'], report['percentage_change_sca_count_from_last_week'], report['percentage_change_ss_count_from_last_week']),
                    "footer": "\nPatronus| " + str(datetime.datetime.now())
                }
            ]
        }
        requests.post(url, data=json.dumps(message))
        return

    def slack_report_on_demand(self,repo:str):
        con.connect()
        con.session = con.Session()
        session = con.session        
        results=session.query(Results).filter_by(reponame="%s") % (repo)
        return results
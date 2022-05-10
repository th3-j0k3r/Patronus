from pathlib import Path
import datetime
from datetime import timedelta

from pathlib import Path
from os.path import dirname
import hmac, time
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from colorama import Fore, Style
from multiprocessing import Pool

from sqlalchemy import create_engine, Integer, String, ForeignKey, Column
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy import func, and_, or_,Column, Boolean, DateTime,text

import multiprocessing,requests,logging,shutil,uuid,time,json,os
from sqlalchemy import create_engine, Integer, String, ForeignKey, Column
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import warnings
warnings.filterwarnings("ignore")
import sys
from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
from Patronus.core.secretsscanning.gitleaks import Gitleaks
from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.parsers.gitleaks import Gitleaksparser
from Patronus.core.parsers.dependency_check_parser import Dependencycheckparser
from Patronus.core.compositionanalysis.dependencycheck import DependencyCheck
from Patronus.core.parsers.npmaudit_parser import Npmauditparser
from Patronus.core.parsers.findsecbugs_parser import Fsbparser
from Patronus.core.parsers.gosec_parser import Gosecparser
from Patronus.core.secretsscanning.gitleaks import Gitleaks
from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.parsers.gitleaks import Gitleaksparser
from Patronus.core.sast.constants import Constants
from Patronus.core.utils.commands import Command
from Patronus.core.sast.nodejs import NodeJs
from Patronus.core.sast.golang import GoLang
from Patronus.core.utils.utils import Utils
from Patronus.config.config import Config
from Patronus.models.models import Scans, Results, Assets
from Patronus.core.sast.java import Java
from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner,Scantype
from Patronus.models.models import Scans, Results, Assets, con


mrc = MyRemoteCallbacks()
config = Config()
java = Java()
dc = DependencyCheck()
go = GoLang()
node = NodeJs()
command = Command()
const = Constants()
gp = Gosecparser()
fsbp = Fsbparser()
dcp = Dependencycheckparser()
np = Npmauditparser()
utils = Utils()
gl = Gitleaks()
glp = Gitleaksparser()


java_repos = []
go_repos = []
node_repos = []
repos_to_scan = []
mrc = MyRemoteCallbacks()
gl = Gitleaks()
glp = Gitleaksparser()



client = WebClient(token=config.APP_SLACK_TOKEN)




class dashboard():


    def scan_repo(repo: str,invoke_id:str):
        if len(node_repos)>0:
            try:
                command.run_command(Scanner.npm_audit.value, node_repos[0])
                np.node_output(node_repos[0],invoke_id)
            except:
                logging.debug(
                    Fore.RED + "[+]---------- npm_audit Exception -------------" + Style.RESET_ALL)

        if len(go_repos)>0:
            try:
                command.run_command(Scanner.gosec.value, go_repos[0])
                gp.golang_output(go_repos[0],invoke_id)
            except:
                logging.debug('Exception running gosec for project %s' % (go_repos[0]))

        if len(java_repos)>0:
            try:
                command.run_command(Scanner.findsecbugs.value, java_repos[0])
                logging.info(
                    'Completed runnning findsecbugs for project %s' % (java_repos[0]))
                if java.check_build(repo) == JavaBuild.maven.value:
                    fsbp.find_sec_bugs_parser(java_repos[0], JavaBuild.maven.value,invoke_id)
                elif java.check_build(repo) == JavaBuild.gradle.value:
                    fsbp.find_sec_bugs_parser(java_repos[0], JavaBuild.gradle.value,invoke_id)
                else:
                    pass
            except:
                logging.debug(
                    'Exception runnning findsecbugs for project %s' % (java_repos[0]))         
        return


    def dependency_check(repo: str,invoke_id):
        try:
            if java.check_build(repo[0]) == JavaBuild.maven.value:
                dc.dependency_check_maven(repo[0])
                if not os.path.exists('%s%s/target/dependency-check-report.json' % (config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                    dc.dependency_check(repo[0])
                dcp.dependency_check_parser(repo[0], JavaBuild.maven.value,invoke_id)
            if java.check_build(repo[0]) == JavaBuild.gradle.value:
                dc.dependency_check_gradle(repo[0])
                if not os.path.exists('%s%s/build/reports/dependency-check-report.json' % (config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                    dc.dependency_check(repo[0])
                dcp.dependency_check_parser(repo[0], JavaBuild.gradle.value,invoke_id)
            logging.info(
                'Completed dependencycheck scanning for project %s' % (repo[0]))
        except:
            logging.debug("Error while scanning for dependencycheck")
        return


    def get_all_repos(repos):
        if utils.detect_programming_language(repos) is not None:
            repos_to_scan.append(utils.detect_programming_language(repos))
        return repos_to_scan

    def filter_repos_by_lang(reponame):
        con.connect()
        con.session = con.Session()
        session = con.session   
        repo_lang = session.query(Assets).filter(Assets.asset_name == reponame).first()
        print(repo_lang.language)
        if repo_lang.language == Language.Java.value:
            java_repos.append(reponame)
        elif repo_lang.language == Language.Go.value:
            go_repos.append(reponame)
        elif repo_lang.language == Language.JavaScript.value:
            node_repos.append(reponame)
        session.close
        return

    def gitleaks(repo: str,invoke_id: str):
        gl.gitleaks_scan(repo)
        glp.gitleaks_output(repo,invoke_id)
        return



    def add_all_asset():
        for repo in java_repos:
            logging.info('check asset for java project %s' % (repo))
            utils.check_asset_exits(repo, Language.Java.value)
        for repo in go_repos:
            utils.check_asset_exits(repo, Language.Go.value)
            logging.info('check asset for go project %s' % (repo))
        for repo in node_repos:
            utils.check_asset_exits(repo, "javascript")
            logging.info('check asset for javascript project %s' % (repo))
        return

    def add_all_assets_to_db(reponame):
        for repo in repos_to_clone:
            base_image = dashboard.find_base_image_for_an_repo(reponame)
            lang = utils.detect_programming_language(reponame)

            if utils.check_asset_exits(reponame) == False:
                print('inside check asset ext')
                print(lang)
                if lang is not None:
                    print(repo[0], lang['lang'], repo[3], base_image)
                    utils.sent_asset_to_db(repo[0], lang['lang'], repo[3], base_image)
                else:
                    utils.sent_asset_to_db(repo[0], None, repo[3], base_image)
            else:
                dashboard.update_last_commit_date_for_repo(repo[0], repo[3])
                if os.path.exists('%s%s' % (config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                    dashboard.update_image_name_for_an_repo(repo[0], base_image)
                else:
                    pass
        return

    def update_last_commit_date_for_repo(repo, last_commit_date):
        con.connect()
        con.session = con.Session()
        session = con.session
        session.query(Assets).filter(Assets.asset_name == repo).update(
            dict(last_commit_date=last_commit_date))
        session.commit()
        session.close
        return

    def update_image_name_for_an_repo(repo, base_image):
        con.connect()
        con.session = con.Session()
        session = con.session
        session.query(Assets).filter(Assets.asset_name == repo).update(
            dict(image_name=base_image))
        session.commit()
        session.close
        return


    def find_base_image_for_an_repo(repo):
        baseimage = ''
        if os.path.exists('%s%s/Dockerfile' % (config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            try:
                with open('%s%s/Dockerfile' % (config.PATRONUS_DOWNLOAD_LOCATION, repo), "r", encoding="utf-8") as dockerfile:
                    return dockerfile.read().split('FROM ')[1].split()[0]
            except FileNotFoundError:
                    pass


    def modify_pom_and_gradle_for_java_repo(repo):
        if java.check_build(repo) == JavaBuild.maven.value:
            try:
                java.modify_pom_for_findsecbugs(repo)
            except:
                logging.debug("Failed to modify maven file for the repo %s" % (repo))
        elif java.check_build(repo) == JavaBuild.gradle.value:
            try:
                java.modify_gradle_for_findsecbugs(repo)
            except:
                logging.debug("Failed to modify gralde file for the repo %s" % (repo))
        return

    def modify_pom_and_gradle_for_all_java_repo():
        for repo in java_repos:
            modify_pom_and_gradle_for_java_repo(repo)
        return

    def scan_status(*args, **kwargs):
        con.connect()
        con.session = con.Session()
        session = con.session
        scans = Scans()
        scan_id = kwargs.get('scan_id', None)
        scan_invoke_id= kwargs.get('invoke_id', None)
        scan_start_time = kwargs.get('scan_start_time', None)
        scan_end_time = kwargs.get('scan_end_time', None)
        scan_status = kwargs.get('scan_status', False)
        reponame=kwargs.get('reponame', None)
        branch=kwargs.get('branch', None)
        scan_type=kwargs.get('scan_type', None)
        invoke_type=kwargs.get('invoke_type', None)
        author=kwargs.get('author', None)
        if scan_start_time:
            scans.scan_id = scan_id
            scans.scan_invoke_id=scan_invoke_id
            scans.scan_start_time = scan_start_time
            scans.scan_successful = scan_status
            scans.reponame = reponame
            scans.branch = branch
            scans.scan_type = scan_type
            scans.invoke_type = invoke_type
            scans.author = author
            session.add(scans)
            session.commit()
        if scan_end_time:
            update = session.query(Scans).filter(Scans.scan_id == scan_id).update(
                dict(scan_end_time=scan_end_time, scan_successful=scan_status))
            session.commit()
        session.close()
        return



    def initiate_scan_for_single_repo(reponame, branch,scan_type=None,invoke_id=None,invoke_type=None,author=None):
        scan_id = uuid.uuid1()
        scan_start_time = datetime.datetime.now()
        dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_start_time=scan_start_time,reponame=reponame,branch=branch,scan_type=scan_type,invoke_type=invoke_type,author=author)
        mrc.clean_one_repos(reponame)
        mrc.clone_im(reponame,branch)
        dashboard.filter_repos_by_lang(reponame)
        if scan_type == Scantype.sast.value:
            dashboard.scan_repo(java_repos + go_repos,invoke_id)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)
        elif scan_type == Scantype.sca.value:
            dashboard.scan_repo(node_repos,invoke_id)
            dashboard.dependency_check(java_repos,invoke_id)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id, invoke_id=invoke_id,scan_end_time=scan_end_time, scan_status=True)
        elif scan_type == Scantype.ss.value:
            dashboard.gitleaks(reponame,invoke_id)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)            
        else:
            dashboard.scan_repo(java_repos + go_repos + node_repos,invoke_id)
            dashboard.dependency_check(java_repos + node_repos,invoke_id)
            dashboard.gitleaks(reponame,invoke_id)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)            
        return

    def initiate_slack_scan(reponame, branch,scan_type=None,invoke_id=None,user_id=None,channel=None,invoke_type=None,author=None):
        scan_id = uuid.uuid1()
        scan_start_time = datetime.datetime.now()
        dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_start_time=scan_start_time,reponame=reponame,branch=branch,scan_type=scan_type,invoke_type=invoke_type,author=author)        
        mrc.clean_one_repos(reponame)
        mrc.clone_im(reponame,branch)
        dashboard.filter_repos_by_lang(reponame)
        if scan_type == Scantype.sast.value:
            dashboard.scan_repo(java_repos + go_repos,invoke_id)            
            dashboard.slack_send_result(reponame,invoke_id,user_id,channel)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)             
        elif scan_type == Scantype.sca.value:
            dashboard.scan_repo(node_repos,invoke_id)
            dashboard.dependency_check(java_repos,invoke_id)
            dashboard.slack_send_result(reponame,invoke_id,user_id,channel)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)             
        elif scan_type == Scantype.ss.value:
            dashboard.gitleaks(reponame,invoke_id)
            dashboard.slack_send_result(reponame,invoke_id,user_id,channel)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)             
        else:
            dashboard.scan_repo(java_repos + go_repos + node_repos,invoke_id)
            dashboard.dependency_check(java_repos + node_repos,invoke_id)
            dashboard.gitleaks(reponame,invoke_id)
            dashboard.slack_send_result(reponame,invoke_id,user_id,channel)
            scan_end_time = datetime.datetime.now()
            dashboard.scan_status(scan_id=scan_id,invoke_id=invoke_id, scan_end_time=scan_end_time, scan_status=True)             
        return


    def slack_send_result(repo,invoke_id,user_id,channel_id):
        try:
            report = dashboard.get_report_to_sent_to_slack(invoke_id)
            response = client.chat_postMessage(
                channel=channel_id,
                attachments=[
                {
                    "color": "#1867f0",
                    "title": "Patronus Scan for Repo:%s Initiated by <@%s|cal>" %(repo,user_id),
                    "text": "*Total vulnerability count:* %s\n*Total SAST Scan Report:* %s\n*Total SCA Scan Report:* %s\n*Total Hard-coded keys Scan Report:* %s\n See Detailed Report at http://domain-name.com:3000/on-demand-scan/%s" % ( report['newly_added_vuln_count'], report['newly_added_sast_count'], report['newly_added_sca_count'], report['newly_added_ss_count'],invoke_id), 
                    "footer": "\nPatronus| " + str(datetime.datetime.now())
                }
            ])
        except SlackApiError as e:
            print(e)

    def get_report_to_sent_to_slack(invoke_id):
        con.connect()
        session = con.Session()
        result = {}
        result['newly_added_vuln_count'] = session.query(Results).filter(Results.invoke_id == invoke_id).count()

        result['newly_added_sast_count'] = session.query(Results).filter(and_(or_(
            Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), Results.invoke_id == invoke_id)).count()

        result['newly_added_sca_count'] = session.query(Results).filter(and_(or_(
            Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), Results.invoke_id == invoke_id)).count()

        result['newly_added_ss_count'] = session.query(Results).filter(and_(
            Results.scanner == 'gitleaks', Results.invoke_id == invoke_id)).count()
        return result


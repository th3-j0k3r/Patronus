from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.parsers.result_template import issue
from requests.adapters import HTTPAdapter
from Patronus.core.utils.elastic import elastic
from mysql.connector import errorcode
from Patronus.core.utils.utils import Utils
from mysql.connector import Error
from Patronus.config.config import Config
import mysql.connector
import configparser
import requests
import logging
import hashlib
import json
import uuid
import time
import sys
import os


class Dependencycheckparser():

    def __init__(self):
        self.utils = Utils()
        self.config = Config()
        self.has_public_expoit = 0

    def dependency_check_parser(self, repo: str, build: str,invoke_id=None):
        result = ""
        if build == JavaBuild.maven.value:
            result_paths = self.get_maven_results_path()
        if build == JavaBuild.gradle.value:
            result_paths = self.get_gradle_results_path()
        result_path = self.return_file_path_exists(result_paths, repo)
        if os.path.exists('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path)):
            with open('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path)) as file:
                res = json.loads(file.read())
                for i in res['dependencies']:
                    issue["repo"] = repo
                    issue["scanner"] = Scanner.dependencycheck.value
                    issue["language"] = Language.Java.value
                    if i.get('vulnerabilities'):
                        for j in i['vulnerabilities']:
                            issue["dependency_url"] = i['packages'][0]['url']
                            issue["title"] = j['name']
                            issue["description"] = j['description']
                            issue["source_url"] = j['references'][0]['url']
                            issue["source"] = j['source']
                            try:
                                if "baseScore" in j['cvssv3']:
                                    issue["cvss_score"] = j[
                                        'cvssv3']['baseScore']
                                elif "score" in j['cvssv2']:
                                    issue["cvss_score"] = j['cvssv2']['score']
                            except:
                                if "CVE-" in issue["title"]:
                                    issue['cvss_score'] = self.cvss_checker(
                                        issue['title'])
                                else:
                                    logging.info('No cvss score found')
                            if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                                if issue['cvss_score'] >= self.config.PATRONUS_CVSS_SCORE_FILTER:
                                    if (self.check_public_exploit_available_exploit_db(issue['title'])):
                                        self.has_public_expoit = 1
                                    print(str(json.dumps(issue)))
                                    self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                        issue)), language='java', scanner='dependency-check', dependency_url=i['packages'][0]['url'],invoke_id=invoke_id, has_public_expoit=self.has_public_expoit)
                            self.has_public_expoit = 0

    def get_maven_results_path(self):
        return ['/target/dependency-check-report.json', '/dependency-check-report.json']

    def get_gradle_results_path(self):
        return ['/build/reports/dependency-check-report.json', '/dependency-check-report.json']

    def return_file_path_exists(self, result_paths, repo):
        for result_path in result_paths:
            if os.path.exists('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path)):
                return result_path
            else:
                return

    def cvss_checker(self, cve: str):
        req = requests.get(self.config.PATRONUS_CVSS_URL + cve)
        cvss = json.loads(req.text)['cvss']
        return cvss

    def check_public_exploit_available_exploit_db(self, cve):
        try:
            exploitdb = requests.Session()
            exploitdb.mount(
                self.config.PATRONUS_PUBLIC_EXPLOIT_EXPLOIT_DB_URL, HTTPAdapter(max_retries=5))
            req = exploitdb.get(
                self.config.PATRONUS_PUBLIC_EXPLOIT_EXPLOIT_DB_URL + "%s" % (cve), headers=self.config.PATRONUS_PUBLIC_EXPLOIT_EXPLOIT_DB_URL_HEADERS)
            res = json.loads(req.text)
            try:
                if res['recordsTotal'] > 0:
                    return True
                else:
                    return False
            except:
                log.error(
                    "Error parsing exploit-db response for the cve %s" % (cve))
        except TimeoutError:
            log.error("TimeoutError")

    def check_public_exploit_available_sploitus(self, cve):
        try:
            sploitus = requests.Session()
            sploitus.mount(
                self.config.PATRONUS_PUBLIC_EXPLOIT_SPLOITUS_URL, HTTPAdapter(max_retries=5))
            body = {"offset": 0, "query": cve, "sort": "default",
                    "title": False, "type": "exploits"}
            req = sploitus.post(
                self.config.PATRONUS_PUBLIC_EXPLOIT_SPLOITUS_URL, json=body, headers=self.config.PATRONUS_PUBLIC_EXPLOIT_SPLOITUS_URL_HEADERS)
            res = json.loads(req.text)
            try:
                if res['exploits_total'] > 0:
                    return True
                else:
                    return False
            except:
                log.error(
                    "Error parsing sploitus response for the cve %s" % (cve))
        except TimeoutError:
            log.error("TimeoutError")
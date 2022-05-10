from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.parsers.result_template import issue
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


class Fsbparser():

    def __init__(self):
        self.utils = Utils()
        self.config = Config()

    def find_sec_bugs_parser(self, repo: str, build: str,invoke_id:str):
        result_paths = []
        if build == JavaBuild.maven.value:
            result_paths = self.get_maven_results_path()
        if build == JavaBuild.gradle.value:
            result_paths = self.get_gradle_results_path()
        result_path = self.return_file_path_exists(result_paths, repo)
        if os.path.exists('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path)):
            with open('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path), encoding="utf-8") as file:
                res = json.loads(file.read())
                if "BugInstance" in res['BugCollection']:
                    for i in res['BugCollection']['BugInstance']:
                        issue["repo"] = repo
                        issue["scanner"] = Scanner.findsecbugs.value
                        issue["language"] = Language.Java.value
                        try:
                            if i['@category'] == "SECURITY":
                                issue['bug_type'] = i['@type']
                                issue["title"] = i["ShortMessage"]
                                issue["description"] = i["LongMessage"]
                                issue['class_name'] = i[
                                    'Class']['@classname']
                                if "Method" in i:
                                    issue["method_name"] = i[
                                        'Method']['@name']
                                if type(i['SourceLine']) == list:
                                    issue["line_no_start"] = i[
                                        'SourceLine'][0]['@start']
                                    issue["line_no_end"] = i[
                                        'SourceLine'][0]['@start']
                                if type(i['SourceLine']) == dict:
                                    issue["line_no_start"] = i[
                                        'SourceLine']['@start']
                                    issue["line_no_end"] = i[
                                        'SourceLine']['@start']
                                if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                                    logging.debug(
                                        "Successfully parsed json file for project %s" % (repo))
                                    print(str(json.dumps(issue)))    
                                    self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                        issue)), language='java', scanner='find-sec-bugs', bug_class=i['@type'],invoke_id=invoke_id)

                        except Exception as e:
                            logging.debug(
                                "Error parsing json file for project %s. Error: %s" % (repo, e))
        return

    def get_maven_results_path(self):
        return ['/target/spotbugsXml.json', '/spotbugsXml.json']

    def get_gradle_results_path(self):
        return ['/build/reports/findbugs/main.json', '/main.json']

    def return_file_path_exists(self, result_paths, repo):
        for result_path in result_paths:
            if os.path.exists('%s%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo, result_path)):
                return result_path
            else:
                return

from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.utils.token import Token, validate_all
from Patronus.core.parsers.result_template import issue
from Patronus.core.utils.elastic import elastic
from mysql.connector import errorcode
from Patronus.core.utils.utils import Utils
from mysql.connector import Error
from Patronus.config.config import Config
from os.path import dirname
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
import re
import toml


class Gitleaksparser():

    def __init__(self):
        self.utils = Utils()
        self.config = Config()
        self.token = Token()
        self.token_types = self.get_all_regex_types()

    def gitleaks_output(self, repo: str,invoke_id=None):
        if os.path.exists('%s%s/gitleaks.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/gitleaks.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "r", encoding="utf-8") as file:
                res = {}
                if os.path.getsize("%s%s/gitleaks.json" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) != 0:
                    try:
                        res = json.loads(file.read())
                    except ValueError as e:
                        logging.debug('%s%s is not a json file' % (
                            self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
                    for i in res:
                        issue["repo"] = repo
                        issue["scanner"] = Scanner.gitleaks.value
                        issue["language"] = ""
                        issue["title"] = "hard coded secrets"
                        issue["description"] = "hardcoded " + i['rule']
                        issue["file_name"] = i['file']
                        issue["line_no"] = i['line']
                        issue["author"] = i['author']
                        issue["commit"] = i['commit']
                        issue["date"] = i['date']
                        issue["tags"] = i["tags"]
                        if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                            try:
                                extract_pattern_value = self.extract_pattern(
                                    issue['line_no'], i['rule'])
                                if self.token_validator(extract_pattern_value['access_token'], extract_pattern_value['token_type']) == True:
                                    self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                        issue)), language='', scanner='gitleaks', secrets_scanning_tag=i["tags"],invoke_id=invoke_id)

                                if self.token_validator(extract_pattern_value['access_token'], extract_pattern_value['token_type']) is None:
                                    print(str(json.dumps(issue)))
                                    self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                        issue)), language='', scanner='gitleaks',
                                        secrets_scanning_tag=i["tags"],invoke_id=invoke_id)

                            except:
                                pass
        return

    def get_all_regex_types(self):
        list_of_regex_info = []
        parent_dir = dirname(
            dirname(os.path.abspath(os.path.dirname(__file__))))
        with open('%s/config/config.toml' % (parent_dir), "r", encoding="utf-8") as gitleaks_config:
            res = toml.loads(gitleaks_config.read())
            for r in res['rules']:
                regex_info = {}
                regex_info['token_type'] = r['description']
                regex_info['regex'] = r['regex']
                list_of_regex_info.append(regex_info)
        return list_of_regex_info

    def extract_pattern(self, line, rule_name):
        for rule in self.token_types:
            if rule['token_type'] in rule_name:
                pattern = re.compile(rule['regex'])
                extracted_value = pattern.search(line)
                return {"token_type": rule['token_type'], "access_token": extracted_value[0]}

    def token_validator(self, access_token, token_type=None):
        if "Slack" in token_type:
            return self.token.slack(access_token)
        if "Asymmetric Private Key" in token_type:
            return None
        if "asana" in token_type:
            return self.token.asana(access_token)
        if "gitlab" in token_type:
            return self.token.gitlab(access_token)
        if "github" in token_type:
            return self.token.github(access_token)
        if token_type is None:
            res = validate_all(access_token)
            self.token_validator(access_token, res)

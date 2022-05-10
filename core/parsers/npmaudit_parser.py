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


class Npmauditparser():

    def __init__(self):
        self.utils = Utils()
        self.config = Config()

    def node_output(self, repo: str,invoke_id=None):
        if os.path.exists('%s%s/node_results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/node_results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), encoding="utf8") as file:
                try:
                    res = json.loads(file.read())
                except ValueError as e:
                    logging.debug(
                        'Error could not load the json file for the project: %s' % (repo))
                for i in res['advisories']:
                    try:
                        issue["repo"] = repo
                        issue["scanner"] = Scanner.npm_audit.value
                        issue["language"] = Language.JavaScript.value

                        issue["module_name"] = res[
                            'advisories'][i]['module_name']
                        issue["title"] = res['advisories'][i]['title']
                        issue["description"] = res['advisories'][i]['overview']
                        issue["severity"] = res['advisories'][i]['severity']
                        issue["advisories_url"] = res['advisories'][i]['url']
                        issue["vulnerable_versions"] = res[
                            'advisories'][i]['vulnerable_versions']
                        issue["patched_versions"] = res[
                            'advisories'][i]['patched_versions']
                        issue["severity"] = res['advisories'][i]['severity']
                        issue["cve"] = res['advisories'][i]['cves']
                        if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                            print(str(json.dumps(issue)))
                            self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                issue)), language='node-js', scanner='npm-audit', dependency_url=res['advisories'][i]['module_name'],invoke_id=invoke_id)

                    except Exception as e:
                        logging.debug(
                            "Error parsing json file for project %s. Error: %s" % (repo, e))
        return

from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.parsers.result_template import issue
from Patronus.core.sast.constants import Constants
from Patronus.core.utils.elastic import elastic
from mysql.connector import errorcode
from Patronus.core.utils.utils import Utils
from mysql.connector import Error
from Patronus.config.config import Config
import mysql.connector
import configparser
import requests
import hashlib
import logging
import json
import uuid
import time
import sys
import os


class Gosecparser():

    def __init__(self):
        self.const = Constants()
        self.utils = Utils()
        self.config = Config()

    def golang_output(self, repo: str,invoke_id=None):
        print(repo+invoke_id)
        if os.path.exists('%s%s/results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                try:
                    res = json.loads(file.read())
                    print(res)
                except ValueError as e:
                    logging.debug(
                        'Error could not load the json file for the project: %s' % (repo))

                for i in res['Issues']:
                    issue["repo"] = repo
                    issue["scanner"] = Scanner.gosec.value
                    issue["language"] = Language.Go.value

                    issue["description"] = i['details']
                    issue["file_name"] = i['file']
                    issue["vulnerable_code"] = i['code']
                    issue["line_no"] = i['line']
                    issue["severity"] = i["severity"]
                    print("\n\n\n\n")
                    print(str(issue))
                    if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                        self.utils.sent_result_to_db(repo=repo, text=str(
                            json.dumps(issue)), language='golang', scanner='gosec',invoke_id=invoke_id)

        return

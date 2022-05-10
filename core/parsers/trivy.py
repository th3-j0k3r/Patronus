from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.parsers.result_template import issue
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


class Trivyparser():

    def __init__(self):
        self.utils = Utils()
        self.config = Config()

    def trivy_output(self, repo: str):
        if os.path.exists('%s%s/results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            with open('%s%s/results.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), encoding="utf8") as file:
                try:
                    Vulnerabilities = json.loads(file.read())
                except ValueError as e:
                    logging.debug(
                        'Error could not load the json file for the project: %s' % (repo))
                for Vulnerability in Vulnerabilities[0]['Vulnerabilities']:
                    image_name = Vulnerabilities[0]['Target']
                    try:
                        if Vulnerability['Severity'] == "HIGH":
                            issue['image_name'] = Vulnerabilities[0]['Target']
                            issue['image_type'] = Vulnerabilities[0]['Type']
                            issue['cve'] = Vulnerability['VulnerabilityID']
                            issue['package_name'] = Vulnerability['PkgName']
                            issue['installed_version'] = Vulnerability['InstalledVersion']
                            issue['severity'] = Vulnerability['Severity']
                            if "FixedVersion" in Vulnerability:
                                issue['fixed_version'] = Vulnerability['FixedVersion']
                            if "Description" in Vulnerability:
                                issue['description']  = Vulnerability['Description']

                            if "CVSS" in Vulnerability:
                                if "nvd" in Vulnerability['CVSS']:
                                    if "V2Score" in Vulnerability['CVSS']['nvd']:
                                        issue['cvss'] = Vulnerability['CVSS']['nvd']['V2Score']

                            if self.utils.check_issue_exits(repo, str(json.dumps(issue))) == False and str(json.dumps(issue)) != "":
                                self.utils.sent_result_to_db(repo=repo, text=str(json.dumps(
                                    issue)), scanner='trivy', image_name=image_name)

                    except Exception as e:
                        logging.debug(
                            "Error parsing json file for project %s. Error: %s" % (repo, e))
        return

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
from Patronus.main import sent_to_slack,scan_status,modify_pom_and_gradle_for_all_java_repo,scan_all_repos,dependency_check_for_all_repos,gitleaks_for_all_repos,scan_complete,scan_status,find_base_image_for_an_repo,update_last_commit_date_for_repo,update_image_name_for_an_repo,update_all_repos_and_commit_date
from colorama import Fore, Style
from multiprocessing import Pool
from Patronus.config.config import Config
from Patronus.core.sast.java import Java
from requests.auth import HTTPBasicAuth
import multiprocessing
import datetime
import requests
import logging
import shutil
import uuid
import time
import json
import yaml
import subprocess
import os
import datetime
from datetime import timedelta
from mysql.connector import errorcode
from mysql.connector import Error
import mysql.connector
from sqlalchemy import create_engine, Integer, String, ForeignKey, Column
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from Patronus.models.models import Scans, Results, Assets, con
from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
mrc = MyRemoteCallbacks()
config = Config()
java = Java()
dc = DependencyCheck()
go = GoLang()
node = NodeJs()
repos = mrc.scan_repos()
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
BITBUCKET_USERNAME = config.BITBUCKET_USERNAME
BITBUCKET_APP_PASSWORD = config.BITBUCKET_APP_PASSWORD
BITBUCKET_OWNER=config.BITBUCKET_OWNER
PATRONUS_DOWNLOAD_LOCATION=config.PATRONUS_DOWNLOAD_LOCATION


def filter_repos_by_lang(repos_to_clone):
    con.connect()
    con.session = con.Session()
    session = con.session
    for repo in repos_to_clone:    
        repo_lang = session.query(Assets).filter(Assets.asset_name == repo[0]).first()
        if repo_lang.language == Language.Java.value:
            java_repos.append(repo[0])
        elif repo_lang.language == Language.Go.value:
            go_repos.append(repo[0])
        elif repo_lang.language == Language.JavaScript.value:
            node_repos.append(repo[0])
    session.close
    return

def repo_and_data():
    full_repo_list = []
    next_page_url = 'https://api.bitbucket.org/2.0/repositories/%s?pagelen=100&fields=next,values.links.clone.href,values.slug,values.updated_on' %(BITBUCKET_OWNER)
    while next_page_url is not None:
        response = requests.get(next_page_url, auth=HTTPBasicAuth(BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD))
        page_json = response.json()
        for repo in page_json['values']:
            updated_on=repo['updated_on']
            reponame=repo['slug']
            di=(reponame,updated_on)
            full_repo_list.append(di)
        next_page_url = page_json.get('next', None)
    if next_page_url is None:
        return full_repo_list

def clone_all_repos():
    full_repo_list = []
    next_page_url = 'https://api.bitbucket.org/2.0/repositories/%s?pagelen=100&fields=next,values.links.clone.href,values.slug,values.updated_on' %(BITBUCKET_OWNER)
    while next_page_url is not None:
        response = requests.get(next_page_url, auth=HTTPBasicAuth(BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD))
        page_json = response.json()
        for repo in page_json['values']:
            full_repo_list.append(repo['slug'])
        next_page_url = page_json.get('next', None)
    if next_page_url is None:
        return full_repo_list

def clone(repo):
    subprocess.run("git clone https://%s:%s@bitbucket.org/%s/%s %s%s" % (BITBUCKET_USERNAME,BITBUCKET_APP_PASSWORD,BITBUCKET_OWNER,repo,PATRONUS_DOWNLOAD_LOCATION,repo),shell=True)

def cloneall(lists):
    pool = Pool(processes=multiprocessing.cpu_count())
    res = pool.map(clone, lists)
    pool.close()
    pool.join()
    return

def add_all_assets_to_db(repos_to_clone):
    for repo in repos_to_clone:
        base_image = find_base_image_for_an_repo(repo)
        lang = utils.detect_programming_language(repo[0])

        if utils.check_asset_exits(repo[0]) == False:
            if lang is not None:
                print(repo[0], lang['lang'], repo[1], base_image)
                utils.sent_asset_to_db(repo[0], lang['lang'], repo[1], base_image)
            else:
                utils.sent_asset_to_db(repo[0], None, repo[1], base_image)
        else:
            update_last_commit_date_for_repo(repo[0], repo[1])
            update_language_for_repo(repo[0],lang['lang'])
            if os.path.exists('%s%s' % (config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                update_image_name_for_an_repo(repo[0], base_image)
            else:
                pass
    return

def initialize():
    sent_to_slack("Initial Setup started")
    update_all_repos_and_commit_date(repos)
    reponames=clone_all_repos()
    repos_to_clone=repo_and_data()
    cloneall(reponames)
    add_all_assets_to_db(repos_to_clone)
    sent_to_slack("Initial Setup Scan completed")

if __name__ == '__main__':
    initialize()    
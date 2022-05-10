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
from colorama import Fore, Style
from multiprocessing import Pool
from Patronus.config.config import Config
from Patronus.core.sast.java import Java
import multiprocessing
import datetime
import requests
import logging
import shutil
import uuid
import time
import json
import yaml
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

repos_to_clone = []
java_repos = []
go_repos = []
node_repos = []
repos_to_scan = []
BITBUCKET_USERNAME = config.BITBUCKET_USERNAME
BITBUCKET_APP_PASSWORD = config.BITBUCKET_APP_PASSWORD
BITBUCKET_OWNER=config.BITBUCKET_OWNER

def scan_complete():
    """
    """
    print(Fore.GREEN +
          "[+]---------- Scan completed -------------" + Style.RESET_ALL)
    logging.info('Completed Scanning')
    return


def scan_all_repos(repos: str):
    """
    Function to intitiate the static analysis for java, node and spotbugs for all repos in the organisation

    accepts list
    """
    pool = Pool(processes=multiprocessing.cpu_count())
    res = pool.map(scan_repo, repos)
    pool.close()
    pool.join()
    return


def scan_repo(repo: str):
    """
    Function to intitiate the static analysis for java, node and spotbugs for a single repo
    """

    if repo in node_repos:
        print(
            Fore.YELLOW + "[+]---------- Starting scan for  nodejs project %s -------------" % (repo) + Style.RESET_ALL)
        try:
            command.run_command(Scanner.npm_audit.value, repo)
            logging.info('Completed npm_audit for project %s' % (repo))
            np.node_output(repo)
        except:
            logging.debug(
                Fore.RED + "[+]---------- npm_audit Exception -------------" + Style.RESET_ALL)

    if repo in go_repos:
        try:
            print(
                Fore.YELLOW + "[+]---------- Starting scan for go project %s -------------" % (repo) + Style.RESET_ALL)
            command.run_command(Scanner.gosec.value, repo)
            logging.info('Completed running gosec for project %s' % (repo))
            gp.golang_output(repo)
        except:
            logging.debug('Exception running gosec for project %s' % (repo))

    if repo in java_repos:
        try:
            print(
                Fore.YELLOW + "[+]---------- Starting scan for java project %s -------------" % (repo) + Style.RESET_ALL)

            command.run_command(Scanner.findsecbugs.value, repo)
            logging.info(
                'Completed runnning findsecbugs for project %s' % (repo))
            if java.check_build(repo) == JavaBuild.maven.value:
                fsbp.find_sec_bugs_parser(repo, JavaBuild.maven.value)
            elif java.check_build(repo) == JavaBuild.gradle.value:
                fsbp.find_sec_bugs_parser(repo, JavaBuild.gradle.value)
            else:
                pass
        except:
            logging.debug(
                'Exception runnning findsecbugs for project %s' % (repo))
    return


def dependency_check(repo: str):
    """
    Scans all the repos for dependency checking
    """
    print(Fore.YELLOW + "[+]---------- DependencyCheck scanning for  %s -------------" % (
        repo) + Style.RESET_ALL)
    try:
        if java.check_build(repo) == JavaBuild.maven.value:
            dc.dependency_check_maven(repo)
            if not os.path.exists('%s%s/target/dependency-check-report.json' % (config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                dc.dependency_check(repo)
            dcp.dependency_check_parser(repo, JavaBuild.maven.value)
        if java.check_build(repo) == JavaBuild.gradle.value:
            dc.dependency_check_gradle(repo)
            if not os.path.exists('%s%s/build/reports/dependency-check-report.json' % (config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                dc.dependency_check(repo)
            dcp.dependency_check_parser(repo, JavaBuild.gradle.value)
        logging.info(
            'Completed dependencycheck scanning for project %s' % (repo))
    except:
        logging.debug("Error while scanning for dependencycheck")
    return


def dependency_check_for_all_repos(repos: str):
    """
    """
    pool = Pool(processes=multiprocessing.cpu_count())
    res = pool.map(dependency_check, repos)
    pool.close()
    pool.join()
    return


def get_all_repos(repos):
    """
    """
    for repo in repos:
        if utils.detect_programming_language(repo[0]) is not None:
            repos_to_scan.append(utils.detect_programming_language(repo[0]))
    return repos_to_scan

def update_language_for_repo(repo,language):
    con.connect()
    con.session = con.Session()
    session = con.session
    if language is not None:
        print(language)
        session.query(Assets).filter(Assets.asset_name == repo).update(dict(language=language))
        session.commit()
        session.close
        return
    if language is None:
        return

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

def gitleaks(repo: str):
    print(Fore.YELLOW + "[+]---------- Gitleaks scanning for  %s -------------" % (
        repo) + Style.RESET_ALL)
    gl.gitleaks_scan(repo)
    glp.gitleaks_output(repo)
    return


def gitleaks_for_all_repos(repos: str):
    pool = Pool(processes=multiprocessing.cpu_count())
    res = pool.map(gitleaks, repos)
    pool.close()
    pool.join()
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


def add_all_assets_to_db(repos_to_clone):
    for repo in repos_to_clone:
        base_image = find_base_image_for_an_repo(repo[0])
        lang = utils.detect_programming_language(repo[0])
        if lang is not None:
            update_language_for_repo(repo[0],lang['lang'])
        if utils.check_asset_exits(repo[0]) == False:
            if lang is not None:
                print(repo[0], lang['lang'], repo[3], base_image)
                utils.sent_asset_to_db(repo[0], lang['lang'], repo[3], base_image)
            else:
                utils.sent_asset_to_db(repo[0], None, repo[3], base_image)
        else:
            update_last_commit_date_for_repo(repo[0], repo[3])
            if os.path.exists('%s%s' % (config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                update_image_name_for_an_repo(repo[0], base_image)
            else:
                pass
    return


def update_last_commit_date_for_repos():
    for repo in repos:
        update_last_commit_date_for_repo(repo[0], repo[3])
    return


# def new_list_to_clone():
#     new_list_to_clone = []
#     one_day_interval_before = datetime.datetime.now() - timedelta(days=1)
#     con.connect()
#     con.session = con.Session()
#     session = con.session
#     repos_to_clone = [r.asset_name for r in session.query(Assets).filter(
#         (Assets.last_commit_date >= one_day_interval_before))]
#     for repo in repos_to_clone:
#         repo_info = [item for item in repos if item[0] == repo]
#         new_list_to_clone.append(repo_info[0])
#     return new_list_to_clone


def new_list_to_clone():
    new_list_to_clone = []
    repos_to_clone_2 = []
    try:
        with con.engine.connect() as connect:
                a_query="select DISTINCT GROUP_CONCAT(asset_name) from asset_inventory where last_commit_date >= date_add(NOW() - INTERVAL 1 DAY, interval 330 minute)"
                result = connect.execute(a_query)
                for asset in result:
                    repos_to_clone_2 += asset[0].split(",")
                    
    except Exception as e:
        sent_to_slack("ERROR" + str(e))
        print(e)
    # sent_to_slack("repos --->"+str(repos_to_clone_2))
    for repo in repos_to_clone_2:
        repo_info = [item for item in repos if item[0] == repo]
        new_list_to_clone.append(repo_info[0])
    return new_list_to_clone


def update_all_repos_and_commit_date(repos):
    for repo in repos:
        con.connect()
        con.session = con.Session()
        session = con.session
        results = [r.asset_name for r in session.query(Assets).filter(Assets.asset_name == repo[0])]
        if repo[0] in results:
            update_last_commit_date_for_repo(repo[0],repo[3])
        if repo[0] not in results:
            repos_to_clone.append(repo[0])
            assets=Assets()
            assets.asset_id = uuid.uuid1()
            assets.asset_name=repo[0]
            assets.creation_date = datetime.datetime.now()
            assets.last_commit_date=repo[3]
            session.add(assets)
            session.commit()
        

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


def initiate_scan():
    """
    """
    #add_all_assets_to_db(repos)
    mrc.clean_all_repos(repos)
    update_all_repos_and_commit_date(repos)
   # update_last_commit_date_for_repos()   
    print(Fore.YELLOW +
          "[+]---------- Cloning all repos -------------" + Style.RESET_ALL)

    # change to repos to clone entire repos
    
    repos_to_clone = new_list_to_clone()
    print(repos_to_clone)
    mrc.clone_all_repository(repos_to_clone)
    add_all_assets_to_db(repos_to_clone)

    print(Fore.YELLOW +
          "[+]---------- Completed cloning all repos -------------" + Style.RESET_ALL)

    get_all_repos(repos_to_clone)
    filter_repos_by_lang(repos_to_clone)
    modify_pom_and_gradle_for_all_java_repo()
    scan_all_repos(java_repos + go_repos + node_repos)
    dependency_check_for_all_repos(java_repos + node_repos)
    all_repos_names = [project_name[0] for project_name in repos_to_clone]
    gitleaks_for_all_repos(all_repos_names)
    utils.sent_daily_report_to_slack()
    scan_complete()
    return


def find_base_image_for_an_repo(repo):
    baseimage = ''
    if os.path.exists('%s%s/Dockerfile' % (config.PATRONUS_DOWNLOAD_LOCATION, repo)):
        try:
            with open('%s%s/Dockerfile' % (config.PATRONUS_DOWNLOAD_LOCATION, repo), "r", encoding="utf-8") as dockerfile:
               return dockerfile.read().split('FROM ')[1].split()[0]
        except FileNotFoundError:
                pass



def initiate_scan_for_single_repo(repo, scan_type=None):
    """
    """
    mrc.clean_all_repos([repo])
    repo_to_clone = [_ for _ in repos if _[0] == repo]
    mrc.clone_all_repository(repo_to_clone)
    get_all_repos(repo_to_clone)
    filter_repos_by_lang()
    if scan_type is "sast":
        scan_all_repos(java_repos + go_repos + node_repos)
    elif scan_type is "sca":
        dependency_check_for_all_repos(java_repos + node_repos)
    elif scan_type is "ss":
        gitleaks_for_all_repos([repo])
    else:
        scan_all_repos(java_repos + go_repos + node_repos)
        dependency_check_for_all_repos(java_repos + node_repos)
        gitleaks_for_all_repos([repo])
    return


def scan_status(*args, **kwargs):
    con.connect()
    con.session = con.Session()
    session = con.session
    scans = Scans()
    scan_id = kwargs.get('scan_id', None)
    scan_start_time = kwargs.get('scan_start_time', None)
    scan_end_time = kwargs.get('scan_end_time', None)
    scan_status = kwargs.get('scan_status', False)

    if scan_start_time:
        scans.scan_id = scan_id
        scans.scan_start_time = scan_start_time
        scans.scan_successful = scan_status
        session.add(scans)
        session.commit()
    if scan_end_time:
        update = session.query(Scans).filter(Scans.scan_id == scan_id).update(
            dict(scan_end_time=scan_end_time, scan_successful=scan_status))
        session.commit()
    session.close()
    return


def sent_to_slack(message: str):
    url = config.PATRONUS_SLACK_WEB_HOOK_URL
    payload = {'text': message}
    requests.post(url, data=json.dumps(payload))
    return

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

def logo():
    print("""
         ######:
         #######:              ##
         ##   :##              ##
         ##    ##   :####    #######    ##.####   .####.   ##.####   ##    ##   :#####.
         ##   :##   ######   #######    #######  .######.  #######   ##    ##  ########
         #######:   #:  :##    ##       ###.     ###  ###  ###  :##  ##    ##  ##:  .:#
         ######:     :#####    ##       ##       ##.  .##  ##    ##  ##    ##  ##### .
         ##        .#######    ##       ##       ##    ##  ##    ##  ##    ##  .######:
         ##        ## .  ##    ##       ##       ##.  .##  ##    ##  ##    ##     .: ##
         ##        ##:  ###    ##.      ##       ###  ###  ##    ##  ##:  ###  #:.  :##
         ##        ########    #####    ##       .######.  ##    ##   #######  ########
         ##          ###.##    .####    ##        .####.   ##    ##    ###.##  . ####
        """
          )




def main():
    sent_to_slack("Scanning started")
    scan_id = uuid.uuid1()
    scan_start_time = datetime.datetime.now()
    scan_status(scan_id=scan_id, scan_start_time=scan_start_time)
    log_file = os.path.dirname(os.path.abspath(__file__)) + "logs.txt"
    logging.basicConfig(format='%(asctime)s %(levelname)-8s %(message)s',
                        filename=log_file, level=logging.INFO, datefmt='%Y-%m-%d %H:%M:%S')
    logging.info('Starting logging')
    logo()
    initiate_scan()
    scan_end_time = datetime.datetime.now()
    scan_status(scan_id=scan_id, scan_end_time=scan_end_time, scan_status=True)
    sent_to_slack("Scanning completed")
    return

if __name__ == '__main__':
    main()

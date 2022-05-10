from Patronus.core.sast.constants import Constants
from bitbucket.client import Client
from Patronus.config.config import Config
from multiprocessing import Pool
from pathlib import Path
import multiprocessing
import configparser
import subprocess
import logging
import pygit2
import shutil
import json
import os


class MyRemoteCallbacks(pygit2.RemoteCallbacks):
    """
    """

    def __init__(self):
        self.config = Config()
        self.username = self.config.BITBUCKET_USERNAME
        self.app_password = self.config.BITBUCKET_APP_PASSWORD
        self.owner = self.config.BITBUCKET_OWNER
        self.client = Client(self.username, self.app_password, self.owner)

    def credentials(self, url, username_from_url, allowed_types):
        if allowed_types & pygit2.credentials.GIT_CREDTYPE_USERNAME:
            return pygit2.Username("git")
        elif allowed_types & pygit2.credentials.GIT_CREDTYPE_SSH_KEY:
            return pygit2.Keypair(username_from_url, self.config.SSH_PUB_KEY, self.config.SSH_PRI_KEY, self.config.SSH_PRI_KEY)
        else:
            return None

    def scan_repos(self):
        repos = []
        i = 1
        while self.client.get_repositories({"page": i}).get('next'):
            i = self.client.get_repositories({"page": i})['page']
            paginator = self.client.get_repositories({"page": int(i)})
            for key in paginator['values']:
                repo_name = key['slug']
                lang = key['language']
                cl = key['links']['clone']
                last_commit_date = key['updated_on']
                for j in cl:
                    if j['name'] == "ssh":
                        ssh_url = j['href']
                        det = (repo_name, ssh_url, lang, last_commit_date)
                        repos.append(det)
            i += 1
        return repos

    def clone_repository(self, repo: str, url: str, lang: str=None, last_commit_date=None):
        """
        """
        path = Path("%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        try:
            pygit2.clone_repository("ssh://%s" % (url.replace('org:', 'org/')),
                                    "%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), callbacks=MyRemoteCallbacks())
            logging.info('Successfully cloned repo %s to %s%s' %
                         (repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        except Exception as e:
            print(e)
            logging.debug('Error while cloning repo %s to %s%s' %
                          (repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        return

    def clone_wrapper(self, args):
        return self.clone_repository(*args)

    def clone_im(self,repo:str,branch:str):
        subprocess.run("git clone --branch %s https://%s:%s@bitbucket.org/%s/%s %s/%s" % (branch,self.username,self.app_password,self.owner,repo,self.config.PATRONUS_DOWNLOAD_LOCATION, repo),shell=True)    
        return

    def clone_all_repository(self, repos: str):
        pool = Pool(processes=multiprocessing.cpu_count())
        res = pool.map(self.clone_wrapper, repos)
        pool.close()
        pool.join()
        return

    def clean_all_repos(self, repos: str):
        """
        """
        for repo in repos:
            if os.path.exists('%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo[0])):
                try:
                    shutil.rmtree(
                        "%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo[0]))
                    logging.info("Deleted repo %s from %s%s" % (
                        repo[0], self.config.PATRONUS_DOWNLOAD_LOCATION, repo[0]))
                except:
                    logging.debug("Error deleting repo %s from %s%s" % (
                        repo[0], self.config.PATRONUS_DOWNLOAD_LOCATION, repo[0]))
            else:
                pass


    def clean_one_repos(self, repo: str):
        """
        """
        if os.path.exists('%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            try:
                shutil.rmtree(
                    "%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
                logging.info("Deleted repo %s from %s%s" % (
                    repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
            except:
                logging.debug("Error deleting repo %s from %s%s" % (
                    repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        else:
            pass

from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.utils.utils import Utils
from Patronus.core.sast.constants import Constants
import subprocess
import logging
import os
from Patronus.config.config import Config


class GoLang():
    """
    """

    def __init__(self):
        self.const = Constants()
        self.utils = Utils()
        self.config = Config()
        
    def gosec(self, repo: str):
        """
        Initiates gosec scan
        """
        # if os.path.exists()
        os.chdir('%s%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        try:
            self.utils.execute_cmd("gosec -no-fail -fmt=json -out=%s%s/results.json ./..." % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo),repo)
        except:
            logging.debug("Error running dependency-check on %s" % (repo))
        return
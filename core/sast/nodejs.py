from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.utils.utils import Utils
from Patronus.config.config import Config
import subprocess
import os

class NodeJs():
    """
    """

    def __init__(self):
        self.config = Config()
        self.utils = Utils() 

    def npm_audit(self, repo: str):
        """
        Runs npm audit
        """
        if os.path.exists("%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION,repo)):
            os.chdir("%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        if not os.path.exists('%s%s/package.json' % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
            return
        if not os.path.exists('package-lock.json'):
            try:
                subprocess.call(["npm", "i", "--package-lock-only"]) 
            except:
                logging.debug("Error running npm i --package-lock-only on repo:  %s" % (repo))
        res = open("node_results.json", "w")
        subprocess.run(["npm", "audit", "--json"], stdout=res)
        return
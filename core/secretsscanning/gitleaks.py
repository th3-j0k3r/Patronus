from Patronus.core.utils.utils import Utils
from Patronus.config.config import Config
from os.path import dirname
import os


class Gitleaks():
    """
    """

    def __init__(self):
        self.utils = Utils()
        self.config = Config()

    def gitleaks_scan(self, repo: str):
        os.chdir('%s' % (self.config.PATRONUS_DOWNLOAD_LOCATION))
        parent_dir = dirname(
            dirname(os.path.abspath(os.path.dirname(__file__))))
        self.utils.execute_cmd(
            "gitleaks -r %s --report=%s/gitleaks.json --report-format=json --config=%s/config/config.toml" % (repo, repo, parent_dir), repo)
        return

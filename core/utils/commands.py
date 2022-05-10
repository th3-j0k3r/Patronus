from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.sast.golang import GoLang
from Patronus.core.sast.nodejs import NodeJs
from Patronus.core.sast.java import Java


class Command():
    """
    """

    def __init__(self):
        """
        """
        self.go = GoLang()
        self.npm = NodeJs()
        self.java = Java()

    def run_command(self, cmd_name: str, repo: str):
        """
        """
        if cmd_name is Scanner.findsecbugs.value:
            return self.java.project_build(repo)
        elif cmd_name is Scanner.gosec.value:
            return self.go.gosec(repo)
        elif cmd_name is Scanner.npm_audit.value:
            return self.npm.npm_audit(repo)

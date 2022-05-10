from enum import Enum, auto


class AutoName(Enum):

    def _generate_next_value_(name, start, count, last_values):
        return name


class Language(AutoName):
    Java = auto()
    Go = auto()
    JavaScript = auto()


class JavaBuild(AutoName):
    maven = auto()
    gradle = auto()


class Scanner(AutoName):
    findsecbugs = auto()
    dependencycheck = auto()
    gitleaks = auto()
    gosec = auto()
    npm_audit = auto()

class Scantype(AutoName):
    sast = auto()
    sca = auto()
    ss = auto()
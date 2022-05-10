from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner
from Patronus.core.vcs.bitbucket import MyRemoteCallbacks
from Patronus.core.sast.constants import Constants
from Patronus.core.utils.utils import Utils
import xml.etree.ElementTree as ET
from colorama import Fore, Style
from Patronus.config.config import Config
from bs4 import BeautifulSoup
from os.path import dirname
from pathlib import Path
import subprocess
import xmltodict
import datetime
import logging
import json
import sys
import os


class Java():
    """
    """

    def __init__(self):
        self.config = Config()
        self.const = Constants()
        self.utils = Utils()
        self.maven = []
        self.gradle = []



    def check_build(self, repo: str):
        """
        Check if build is maven or gradle
        """
        build = ""
        mvn = Path("%s%s/pom.xml" %
                   (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        gradle = Path("%s%s/build.gradle" %
                      (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        if mvn.is_file():
            build = JavaBuild.maven.value
            self.maven.append(repo)
            return build
        elif gradle.is_file():
            build = JavaBuild.gradle.value
            self.gradle.append(repo)
            return build
        else:
            pass

    def build_maven(self, repo: str):
        """
        """
        os.chdir("%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        try:
            rc = self.utils.execute_cmd("mvn compile", repo)
            rc2 = self.utils.execute_cmd("mvn spotbugs:spotbugs", repo)
            logging.info("successfully build maven project %s " % (repo))
        except:
            logging.debug('Error building maven project %s' % (repo))
        return

    def build_gradle(self, repo:  str):
        """
        """
        os.chdir("%s%s" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
        try:
            self.utils.execute_cmd("./gradlew check -x test", repo)
            logging.info("successfully build gradle project %s " % (repo))
        except:
            logging.debug("Error building gradle project %s" % (repo))
        return

    def register_all_namespaces(self, filename):
        """
        https://stackoverflow.com/questions/54439309/how-to-preserve-namespaces-when-parsing-xml-via-elementtree-in-python
        """
        namespaces = dict(
            [node for _, node in ET.iterparse(filename, events=['start-ns'])])
        for ns in namespaces:
            ET.register_namespace(ns, namespaces[ns])
        return

    def insert_build_tag(self, repo):

        return

    def add_build_tag(self, repo: str):
        try:
            tree = ET.parse("%s%s/pom.xml" %
                            (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
            root = tree.getroot()
            filename = "%s%s/pom.xml" % (
                self.config.PATRONUS_DOWNLOAD_LOCATION, repo)
            namespaces = dict(
                [node for _, node in ET.iterparse(filename, events=['start-ns'])])
            for ns in namespaces:
                ET.register_namespace(ns, namespaces[ns])
            root.append(ET.fromstring(self.const.POM_BUILD_TAG))
            tree.write("%s%s/pom.xml" %
                       (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), xml_declaration=True)
        except:
            logging.debug(
                "Failed modified pom.xml for maven project %s" % (repo))
        return

    def modify_pom_for_findsecbugs(self, repo: str):
        """
        """
        try:
            tree = ET.parse("%s%s/pom.xml" %
                            (self.config.PATRONUS_DOWNLOAD_LOCATION, repo))
            root = tree.getroot()
            filename = "%s%s/pom.xml" % (
                self.config.PATRONUS_DOWNLOAD_LOCATION, repo)
            namespaces = dict(
                [node for _, node in ET.iterparse(filename, events=['start-ns'])])
            for ns in namespaces:
                ET.register_namespace(ns, namespaces[ns])
            build = root.find('{http://maven.apache.org/POM/4.0.0}build')
            if build is None:
                self.add_build_tag(repo)
            build = root.find('{http://maven.apache.org/POM/4.0.0}build')
            plugins = build.find('{http://maven.apache.org/POM/4.0.0}plugins')
            plugins.append(ET.fromstring(self.const.FINDSECBUGS_XML))
            plugins.append(ET.fromstring(self.const.DEPENDENCY_CHECK_XML))
            tree.write("%s%s/pom.xml" %
                       (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), xml_declaration=True)
            logging.info(
                "successfully modified pom.xml for maven project %s" % (repo))
        except:
            logging.debug(
                "Failed modified pom.xml for maven project %s" % (repo))
        return

    def parse_xml(self, repo: str):
        """
        """
        with open("%s%s/pom.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as xml_file:
            soup = BeautifulSoup(xml_file, "lxml")
            artifactid = soup.artifactid.string
            version = soup.version.string
            if soup.packaging is not None:
                packaging = soup.packaging.string
            else:
                packaging = "jar"
            return "%s_%s.%s" % (artifactid, version, packaging)

    def convert_xml_to_json(self, repo: str):
        """
        """
        if self.check_build(repo) is JavaBuild.maven.value:
            if os.path.exists("%s%s/target/spotbugsXml.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                with open("%s%s/target/spotbugsXml.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                    xmlString = file.read()
                    jsonString = json.dumps(
                        xmltodict.parse(xmlString), indent=4)
                    with open("%s%s/target/spotbugsXml.json" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), 'w') as f:
                        f.write(jsonString)

            if os.path.exists("%s%s/spotbugsXml.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                with open("%s%s/spotbugsXml.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                    res = xmltodict.parse(file.read())
                    result = json.dumps(res, indent=4)
                    with open("%s%s/spotbugsXml.json" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), 'w') as f:
                        f.write(jsonString)

        elif self.check_build(repo) is JavaBuild.gradle.value:
            if os.path.exists("%s%s/build/reports/findbugs/main.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                with open("%s%s/build/reports/findbugs/main.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                    xmlString = file.read()
                    jsonString = json.dumps(
                        xmltodict.parse(xmlString), indent=4)
                    with open("%s%s/build/reports/findbugs/main.json" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), 'w') as f:
                        f.write(jsonString)

            if os.path.exists("%s%s/main.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                with open("%s%s/main.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as file:
                    xmlString = file.read()
                    jsonString = json.dumps(
                        xmltodict.parse(xmlString), indent=4)
                    with open("%s%s/main.json" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), 'w') as f:
                        f.write(jsonString)
        else:
            pass
        return

    def modify_gradle_for_findsecbugs(self, repo: str):
        """
        """

        lookup_lineno = []
        lookup_2_lineno = []

        try:
            with open("%s%s/build.gradle" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as myFile:
                for num, line in enumerate(myFile, 1):
                    if self.const.FINDSECBUGS_PATTERN_1 in line:
                        lookup_lineno.append(num)

            # reading gradle file
            f = open("%s%s/build.gradle" %
                     (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "r")
            contents = f.readlines()
            f.close()

            # apply plugin
            contents.insert(
                lookup_lineno[0], self.const.FINDSECBUGS_PATTERN_VALUE_1)
            contents.insert(
                lookup_lineno[0], self.const.DEPENDENCY_CHECK_PATTERN_VALUE_2)

            # writing contents
            f = open("%s%s/build.gradle" %
                     (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "w")
            contents = "".join(contents)
            f.write(contents)
            f.close()

            with open("%s%s/build.gradle" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)) as myFile:
                for num, line in enumerate(myFile, 1):
                    if self.const.FINDSECBUGS_PATTERN_2 in line:
                        lookup_2_lineno.append(num)

            # reading gradle file
            f = open("%s%s/build.gradle" %
                     (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "r")
            contents = f.readlines()
            f.close()

            # dependencies {
            contents.insert(
                lookup_2_lineno[-1] + 2, self.const.FINDSECBUGS_PATTERN_VALUE_2)
            contents.insert(
                lookup_2_lineno[0] + 1, self.const.DEPENDENCY_CHECK_PATTERN_VALUE_1)

            # writing contents
            f = open("%s%s/build.gradle" %
                     (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "w")
            contents = "".join(contents)
            f.write(contents)
            f.close()

            f = open("%s%s/build.gradle" %
                     (self.config.PATRONUS_DOWNLOAD_LOCATION, repo), "a")
            f.write(self.const.FINDSECBUGS_PATTERN_VALUE_3)
            f.write(self.const.DEPENDENCY_CHECK_PATTERN_VALUE_3)
            f.close()
            logging.info(
                "successfully modified build.gradle for gradle project %s" % (repo))
        except:
            logging.debug(
                "Error modifying build.gradle for gradle project %s" % (repo))
        return

    def project_build(self, repo: str):
        """
        """
        maven = []
        gradle = []
        if self.check_build(repo) == JavaBuild.maven.value:
            try:
                #self.modify_pom_for_findsecbugs(repo)
                self.build_maven(repo)
                self.retry_for_failed_attempts(repo, JavaBuild.maven.value)
                self.convert_xml_to_json(repo)
                logging.info("Successfully build gradle project %s" % (repo))
            except:
                logging.debug("Failed building gradle project %s" % (repo))
        elif self.check_build(repo) == JavaBuild.gradle.value:
            try:
                #self.modify_gradle_for_findsecbugs(repo)
                self.build_gradle(repo)
                self.retry_for_failed_attempts(repo, JavaBuild.gradle.value)
                self.convert_xml_to_json(repo)
                logging.info("Successfully build gradle project %s" % (repo))
            except:
                logging.debug("Failed building gradle project %s" % (repo))
        else:
            pass
        return

    def retry_for_failed_attempts(self, repo: str, build: str):
        if build is JavaBuild.maven.value:
            if not os.path.exists("%s%s/target/spotbugsXml.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                self.fsb(repo, JavaBuild.maven.value)
        if build is JavaBuild.gradle.value:
            if not os.path.exists("%s%s/build/reports/findbugs/main.xml" % (self.config.PATRONUS_DOWNLOAD_LOCATION, repo)):
                self.fsb(repo, "/gradle")
        return

    def fsb(self, repo: str, build: str):
        """
        """
        parent_dir = dirname(
            dirname(os.path.abspath(os.path.dirname(__file__))))
        os.chdir(parent_dir + "/tools/findsecbugs")
        try:
            if build is JavaBuild.maven.value:
                self.utils.execute_cmd("./findsecbugs.sh -xml -output %s%s/spotbugsXml.xml %s%s" % (
                    self.config.PATRONUS_DOWNLOAD_LOCATION, repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo), repo)
                self.convert_xml_to_json(repo)
            if build is JavaBuild.gradle.value:
                self.utils.execute_cmd("./findsecbugs.sh -xml -output %s%s/main.xml %s%s" % (
                    self.config.PATRONUS_DOWNLOAD_LOCATION, repo, self.config.PATRONUS_DOWNLOAD_LOCATION, repo), repo)
                self.convert_xml_to_json(repo)
        except Exception as e:
            logging.debug(
                "Error running find-sec-bugs on %s. Error: %s" % (repo, e))
        return

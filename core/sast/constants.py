class Constants:
    #find-sec-bugs
    FINDSECBUGS_XML = """<plugin>
                            <groupId>com.github.spotbugs</groupId>
                            <artifactId>spotbugs-maven-plugin</artifactId>
                            <version>3.1.1</version>
                            <configuration>
                                <effort>Max</effort>
                                <threshold>Low</threshold>
                                <failOnError>false</failOnError>
                                <includeFilterFile>${user.home}/Patronus/core/sast/fsb-include.xml</includeFilterFile>
                                <!-- <includeFilterFile>core/sast/fsb-include.xml</includeFilterFile> -->
                                <plugins>
                                    <plugin>
                                        <groupId>com.h3xstream.findsecbugs</groupId>
                                        <artifactId>findsecbugs-plugin</artifactId>
                                        <version>LATEST</version>
                                    </plugin>   
                                </plugins>
                            </configuration>
                        </plugin>\n"""

    POM_BUILD_TAG = """
                    \n<build>
<plugins>
</plugins>
</build>\n"""
                      
    FINDSECBUGS_PATTERN_1 = "apply plugin"
    FINDSECBUGS_PATTERN_VALUE_1 = "apply plugin: 'findbugs'\n"

    FINDSECBUGS_PATTERN_2 = "dependencies {"
    FINDSECBUGS_PATTERN_VALUE_2 = """
    findbugs 'com.google.code.findbugs:findbugs:3.0.1'
    findbugs configurations.findbugsPlugins.dependencies
    findbugsPlugins 'com.h3xstream.findsecbugs:findsecbugs-plugin:1.4.4'\n
                     """

    FINDSECBUGS_PATTERN_VALUE_3 = """
    task findSecurityBugs(type: FindBugs) {

classes = fileTree(project.rootDir.absolutePath).include("**/*.class");
source = fileTree(project.rootDir.absolutePath).include("**/*.java");
classpath = files()
pluginClasspath = project.configurations.findbugsPlugins

findbugs {
    toolVersion = "3.0.1"
    //sourceSets = [sourceSets.java]
    ignoreFailures = true
    //reportsDir = file("$project.buildDir/findbugsReports")
    effort = "max"
    reportLevel = "low"
    includeFilter = file(project.gradle.gradleUserHomeDir.parent +"/Patronus/core/sast/fsb-include.xml")
}
}
tasks.withType(FindBugs) {
        reports {
            xml.enabled true
            html.enabled false
        }
    }\n"""

    # Dependency-checker 
    DEPENDENCY_CHECK_XML = """<plugin>
              <groupId>org.owasp</groupId>
              <artifactId>dependency-check-maven</artifactId>
              <version>5.3.0</version>
              <configuration>
                    <formats>
                        <format>JSON</format>
                    </formats>
              </configuration>
              <executions>
                  <execution>
                      <goals>
                          <goal>check</goal>
                      </goals>
                  </execution>
              </executions>
            </plugin>"""

    DEPENDENCY_CHECK_PATTERN_1 = "dependencies {"
    DEPENDENCY_CHECK_PATTERN_VALUE_1 = "classpath 'org.owasp:dependency-check-gradle:5.3.0'\n"

    DEPENDENCY_CHECK_PATTERN_2 = "apply plugin"
    DEPENDENCY_CHECK_PATTERN_VALUE_2 = "apply plugin: 'org.owasp.dependencycheck'\n"
    # DEPENDENCY_CHECK_PATTERN_VALUE_2 = "apply plugin: org.owasp.dependencycheck.gradle.DependencyCheckPlugin\n"

    DEPENDENCY_CHECK_PATTERN_VALUE_3 = """\ndependencyCheck {
    format='JSON'
}"""
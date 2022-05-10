FROM centos:centos7

#set versions
ENV TZ="Asia/Kolkata"
ENV JAVA_VERSION=1.8.0
ENV MAVEN_VERSION=3.8.5
ENV GRADLE_VERSION=7.4.2
ENV NODEJS_VERSION=16.15.0
ENV FIND_SEC_BUGS_VERSION=
ENV DEPENDENCY_CHECKER_VERSION=7.1.0

ENV LANG en_US.UTF-8  
ENV LANGUAGE en_US:en  
ENV LC_ALL en_US.UTF-8
RUN yum -y update && yum clean all
RUN yum -y install unzip
RUN yum -y install net-tools

#Install go
ENV GOLANG_VERSION 1.12.4
ENV GOLANG_DOWNLOAD_URL https://golang.org/dl/go$GOLANG_VERSION.linux-amd64.tar.gz
ENV GOLANG_DOWNLOAD_SHA256 d7d1f1f88ddfe55840712dc1747f37a790cbcaa448f6c9cf51bbe10aa65442f5
RUN curl -fsSL "$GOLANG_DOWNLOAD_URL" -o golang.tar.gz \
    && echo "$GOLANG_DOWNLOAD_SHA256  golang.tar.gz" | sha256sum -c - \
    && tar -C /usr/local -xzf golang.tar.gz \
    && rm golang.tar.gz
ENV GOPATH /go
ENV GOROOT /usr/local/go
ENV PATH $GOPATH/bin:$GOROOT/bin:$PATH


#intall Nodejs
RUN curl -sL https://rpm.nodesource.com/setup_10.x | bash -
RUN yum -y install nodejs

#install Python3
RUN yum -y install python3

#install java
RUN yum install -y java-${JAVA_VERSION}-openjdk-devel


#Install maven
ARG maven_download_url="https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/${MAVEN_VERSION}/apache-maven-${MAVEN_VERSION}-bin.tar.gz"
ENV MAVEN_DOWNLOAD_URL "${maven_download_url}"
RUN curl ${MAVEN_DOWNLOAD_URL} -o /tmp/maven.tgz && \
    su -c "tar -zxvf /tmp/maven.tgz -C /usr/local"  && \
    ln -s /usr/local/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/local/bin/mvn && \
    ln -s /usr/local/apache-maven-${MAVEN_VERSION}/bin/mvn /usr/local/bin/maven && \
    rm /tmp/maven.tgz
ENV JAVA_HOME=/usr/lib/jvm/java-1.8.0

#install Gradle
RUN \
    cd /usr/local && \
    curl -L https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -o gradle-${GRADLE_VERSION}-bin.zip && \
    unzip gradle-${GRADLE_VERSION}-bin.zip && \
    rm gradle-${GRADLE_VERSION}-bin.zip
ENV GRADLE_HOME=/usr/local/gradle-${GRADLE_VERSION}
ENV PATH=$PATH:$GRADLE_HOME/bin JAVA_HOME=/usr/lib/jvm/java-${JAVA_VERSION}-openjdk


#install gosec
SHELL ["/bin/bash", "-c"]
RUN yum -y install git
#RUN go get github.com/securego/gosec/cmd/gosec
RUN curl -sfL https://raw.githubusercontent.com/securego/gosec/master/install.sh | sh -s latest

#install gitleaks
SHELL ["/bin/bash", "-c"]
ENV GO111MODULE=on
RUN go get github.com/zricethezav/gitleaks/v4@latest

#install cloc
RUN npm install -g cloc

ADD . /root/Patronus
WORKDIR /root/Patronus

RUN mkdir tools
WORKDIR /root/Patronus/tools

#install dependency-check
RUN curl https://github.com/jeremylong/DependencyCheck/releases/download/v6.0.2/dependency-check-6.0.2-release.zip -o dependency_check.zip -L
RUN unzip dependency_check.zip
RUN rm -rf dependency_check.zip

#install find-sec-bugs
RUN curl https://github.com/find-sec-bugs/find-sec-bugs/releases/download/version-1.10.1/findsecbugs-cli-1.10.1.zip -o findsecbugs.zip -L
RUN unzip findsecbugs.zip -d findsecbugs
RUN rm -rf findsecbugs.zip
RUN chmod +x findsecbugs/findsecbugs.sh

RUN yum -y install mariadb-devel gcc python36u-devel python3-devel

WORKDIR /root/Patronus
RUN pip3 install -r requirements.txt


RUN mkdir ~/.ssh
RUN cp SSH_KEYS/id_rsa ~/.ssh/
RUN cp SSH_KEYS/id_rsa.pub ~/.ssh/
RUN ssh-keyscan bitbucket.org >> ~/.ssh/known_hosts
RUN git config --global url.ssh://git@bitbucket.org/.insteadOf https://bitbucket.org/
RUN chmod 600 ~/.ssh/id_rsa
RUN chmod 644 ~/.ssh/id_rsa.pub


#linguist
RUN yum -y install libicu-devel
RUN yum install gnupg
RUN yum install -y \
    libuuid-devel \
    libxml2-devel \
    wget \
    which
RUN yum install -y python3
RUN yum -y install yum-utils
RUN yum -y groupinstall development
RUN yum install curl

RUN gpg --keyserver keyserver.ubuntu.com --recv-key 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
RUN  curl -sSL https://get.rvm.io | bash -s stable
RUN /bin/bash -l -c "rvm requirements"
RUN /bin/bash -l -c "rvm install 3.0"
RUN /bin/bash -l -c "rvm use 3.0 --default"
RUN /bin/bash -l -c "rvm rubygems current"
RUN  mkdir -p /tmp/cmake 
RUN  pushd /tmp/cmake 
RUN  wget 'https://cmake.org/files/v3.9/cmake-3.9.1-Linux-x86_64.sh' 
RUN  bash cmake-3.9.1-Linux-x86_64.sh --prefix=/usr/local --exclude-subdir 
RUN  rm -rf /tmp/cmake 
RUN /bin/bash -l -c "gem install charlock_holmes -- --with-icu-dir=/usr/local/opt/icu4c --with-cxxflags='-Wno-reserved-user-defined-literal -std=c++11'"
RUN /bin/bash -l -c "gem install github-linguist"

RUN yum -y install cronie
COPY initialize.py /root/
COPY main.py /root/
WORKDIR /root/Patronus/
RUN chmod +x cron.sh

RUN /bin/bash -l -c "npm config set registry https://registry.npmjs.org/"

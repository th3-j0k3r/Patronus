from sqlalchemy import create_engine, Integer, String, ForeignKey, Column, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from Patronus.config.config import Config
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.pool import QueuePool, NullPool

config = Config()


Base = declarative_base()


class Scans(Base):
    __tablename__ = "scans"
    scan_id = Column('scan_id', String(36), primary_key=True)
    scan_start_time = Column('scan_start_time', DateTime())
    scan_end_time = Column('scan_end_time', DateTime())
    scan_successful = Column('scan_successful', Boolean())
    scan_invoke_id =Column('invoke_id', String(56))
    invoke_type=Column('invoke_type', String(20))
    scan_type=Column('scan_type', String(20))
    reponame=Column('reponame', String(56))
    author=Column('author', String(56))
    branch=Column('branch', String(56))

class Results(Base):
    __tablename__ = "results"
    scan_id = Column('result_id', String(36), primary_key=True)
    project_name = Column('project_name', String(60))
    issue = Column('issue', String(99999))
    language = Column('language', String(32))
    scanner = Column('scanner', String(32))
    hash = Column('hash', String(64))
    creation_date = Column('creation_date', DateTime())
    is_resolved = Column('is_resolved', Boolean())
    mark_as_fp = Column('mark_as_fp', Boolean())
    severity = Column('severity', String(15))
    bug_class = Column('bug_class', String(60))
    invoke_type=Column('invoke_type', String(56))
    invoke_id=Column('invoke_id', String(56))
    dependency_url = Column('dependency_url', String(100))
    jira_raised=Column('jira_raised', Boolean())
    secrets_scanning_tag = Column('secrets_scanning_tag', String(50))
    has_public_expoit = Column('has_public_expoit', Boolean())
    is_external_service = Column('is_external_service', Boolean())
    is_pci_service = Column('is_pci_service', Boolean())
    contains_pii = Column('contain_pii', Boolean())

class Assets(Base):
    __tablename__ = "asset_inventory"
    asset_id = Column('asset_id', String(36), primary_key=True)
    asset_name = Column('asset_name', String(60))
    image_name = Column('image_name',String(100))
    creation_date = Column('creation_date', DateTime())
    language = Column('language', String(32))
    last_commit_date = Column('last_commit_date', DateTime())
    owner = Column('owner', String(50))

class Library(Base):
    __tablename__="library"
    Id=Column('Id', Integer, primary_key=True)
    Package_Name=Column('Package_Name', String(200))
    Version=Column('Version', String(50))
    Repository=Column('Repository', String(100))
    Language=Column('Language', String(100))

class Connection:

    def __init__(self):
        self.engine = create_engine(f"mysql+mysqldb://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}/{config.DB_DATABASE}", echo=False, poolclass=NullPool)

    def connect(self):
        Base.metadata.bind = self.engine
        Base.metadata.create_all(self.engine)
        self.Session = sessionmaker(bind=self.engine)

con = Connection()


if not database_exists(con.engine.url):
    create_database(con.engine.url)
Base.metadata.create_all(bind=con.engine)

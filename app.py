from flask import Flask, request, Response,jsonify
import redis,os,time,string,json,requests,subprocess,hashlib,uuid
from redis.client import parse_client_list
from redis import connection
from rq import Queue
import datetime
from datetime import  timedelta
from requests.auth import HTTPBasicAuth

from flask_sqlalchemy import SQLAlchemy
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema
from flask_marshmallow import Marshmallow
from flask_cors import CORS



from sqlalchemy import create_engine, Integer, String, ForeignKey, Column,func, and_, or_,text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship


import requests,uuid,time,json,os

import warnings
warnings.filterwarnings("ignore")
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))
from Patronus.ondemand import dashboard
from Patronus.config.config import Config
from Patronus.models.models import Scans, Results, Assets, Library
from Patronus.core.enums.patronusenums import JavaBuild, Language, Scanner,Scantype

redis_conn = redis.Redis(
    host=os.getenv("REDIS_HOST", "127.0.0.1"),
    port=os.getenv("REDIS_PORT", "6379"),
    password=os.getenv("REDIS_PASSWORD", ""),
)

q=Queue(connection=redis_conn)

app = Flask(__name__)
CORS(app)
ma = Marshmallow(app)
config = Config()
app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+mysqldb://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}/{config.DB_DATABASE}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ECHO'] = False
app.config['JSON_SORT_KEYS'] = False

db = SQLAlchemy(app)
Base = declarative_base()
jira_url=Config.JIRA_URL
jira_token=Config.JIRA_TOKEN
jira_project=Config.JIRA_PROJECT
BITBUCKET_USERNAME = Config.BITBUCKET_USERNAME
BITBUCKET_APP_PASSWORD = Config.BITBUCKET_APP_PASSWORD
BITBUCKET_OWNER=Config.BITBUCKET_OWNER
class AssetSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Assets


class ResultSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Results


class ScanSchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Scans

class LibrarySchema(SQLAlchemyAutoSchema):

    class Meta:
        model = Library



@app.route("/getrepos",methods=['GET'])
def reposearch():
    full_repo_list = []
    if request.args.get('repo_name'):
        reponame=request.args.get('repo_name')
        next_page_url = 'https://api.bitbucket.org/2.0/repositories/{}?pagelen=100&q=%28name%20~%20%22{}%22%20OR%20description%20~%20%22{}%22%29&fields=next,values.links.clone.href,values.slug'.format(BITBUCKET_OWNER,reponame,reponame)
        while next_page_url is not None:
            response = requests.get(next_page_url, auth=HTTPBasicAuth(BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD))
            page_json = response.json()
            for repo in page_json['values']:
                reponame=repo['slug']
                full_repo_list.append(repo['slug'])
            next_page_url = page_json.get('next', None)
        if next_page_url is None:
            print('ok')
        return jsonify({"repos": full_repo_list})        
    else:
        next_page_url = 'https://api.bitbucket.org/2.0/repositories/%s?pagelen=10&sort=-updated_on&fields=next,values.links.clone.href,values.slug' %(BITBUCKET_OWNER)
        response = requests.get(next_page_url, auth=HTTPBasicAuth(BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD))
        page_json = response.json()
        for repo in page_json['values']:
            reponame=repo['slug']
            full_repo_list.append(repo['slug'])
        return jsonify({"repos": full_repo_list})         

@app.route("/getbranches",methods=['GET'])
def branchlist():
    if request.args.get('repo_name'):
        reponame=request.args.get('repo_name')
        full_branch_list = []
        next_page_url = 'https://api.bitbucket.org/2.0/repositories/%s/%s/refs/branches?pagelen=100&fields=next,values.name' %(BITBUCKET_OWNER,reponame)
        while next_page_url is not None:
            response = requests.get(next_page_url, auth=HTTPBasicAuth(BITBUCKET_USERNAME, BITBUCKET_APP_PASSWORD))
            page_json = response.json()
            for repo in page_json['values']:
                full_branch_list.append(repo['name'])
            next_page_url = page_json.get('next', None)
        if next_page_url is None:
            print('reached end')
        return jsonify({"branches": full_branch_list})


@app.route("/ondemandscan",methods=['GET', 'POST'])
def home():
    if request.method == 'GET':
        page_num = 1
        prev_page_count=0
        has_prev, has_next, next_num = False, False, None
        if request.args.get('page_num'):
            page_num = int(request.args.get('page_num'))
            if page_num==1:
                prev_page_count=0
            else:
                page_nums=page_num-1
                prev_page_count=page_nums*20


        paginate = (db.session.query(Scans).filter(Scans.invoke_type != 'Null').order_by(Scans.scan_start_time.desc()).paginate(
            page=page_num, per_page=20, error_out=True))


        if request.args.get('scan_type'):
            scan_type = request.args.get('scan_type')
            search = "%{}%".format(scan_type)
            paginate=(db.session.query(Scans).filter(and_(Scans.scan_type.ilike(search),Scans.invoke_type != 'Null')).order_by(Scans.scan_start_time.desc()).paginate(page=page_num, per_page=20, error_out=True))

        if request.args.get('invoke_type'):
            invoke_type = request.args.get('invoke_type')
            search = "%{}%".format(invoke_type)
            paginate=(db.session.query(Scans).filter(and_(Scans.invoke_type.ilike(search),Scans.invoke_type != 'Null')).order_by(Scans.scan_start_time.desc()).paginate(page=page_num, per_page=20, error_out=True))                

        if request.args.get('reponame'):
            reponame = request.args.get('reponame')
            search = "%{}%".format(reponame)
            paginate=(db.session.query(Scans).filter(and_(Scans.reponame.ilike(search),Scans.invoke_type != 'Null')).order_by(Scans.scan_start_time.desc()).paginate(page=page_num, per_page=20, error_out=True))                


        if request.args.get('author'):
            author = request.args.get('author')
            search = "%{}%".format(author)
            paginate=(db.session.query(Scans).filter(and_(Scans.author.ilike(search) ,Scans.invoke_type != 'Null')).order_by(Scans.scan_start_time.desc()).paginate(page=page_num, per_page=20, error_out=True)) 


            
        if paginate.has_prev:
            has_prev = True
        if paginate.has_next:
            has_next = True
        if paginate.next_num:
            next_num = paginate.next_num

        scan_schema = ScanSchema(many=True)
        output = scan_schema.dump(paginate.items)
        return jsonify({"results": output, 'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})                  
                  

    if request.method == 'POST':    
        if request.form is not None:
            reponame=request.form['reponame']
            branch=request.form['branch']
            scan_type=request.form['scan_type']
            author=request.form['author']
            invoke_type="WEB-API"
            tt=str(datetime.datetime.now())
            invoke_id=hashlib.sha256(str(reponame+scan_type+branch+tt).encode('utf-8')).hexdigest()
            job=q.enqueue(dashboard.initiate_scan_for_single_repo,args=(reponame,branch,scan_type,invoke_id,invoke_type,author,),job_timeout=600)
            q_len=len(q)
            return jsonify({'Queue Length':q_len,'Task_ID':invoke_id})
        else:
            return "No value given"

@app.route("/invoke_results",methods=['GET'])
def invoke_id_results():
    invoke_id  = request.args.get('invoke_id', None)
    scanner  = request.args.get('scanner', None)
    severity  = request.args.get('severity', None) 
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20
    if scanner is not None:
        paginate=(db.session.query(Results).filter(and_(Results.invoke_id == invoke_id),Results.scanner == scanner).paginate(page=page_num, per_page=20, error_out=True))        
    if severity is not None:
        paginate=(db.session.query(Results).filter(and_(Results.invoke_id == invoke_id),Results.severity == severity).paginate(page=page_num, per_page=20, error_out=True))
    if scanner is None:
        if severity is None:
            paginate=(db.session.query(Results).filter(Results.invoke_id == invoke_id).paginate(page=page_num, per_page=20, error_out=True))
        
    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)  
    return jsonify({"results": output,'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})     






@app.route("/slackscan",methods=['POST'])
def slackscan():
    if request.json is not None:
        json_data = request.json
        reponame=json_data['reponame']
        branch=json_data['branch']
        scan_type=json_data['scan_type']
        user_id=json_data['user_id']
        channel=json_data['channel']
        invoke_type="SLACK"
        author="Slack_user"
        tt=str(datetime.datetime.now())
        invoke_id=hashlib.sha256(str(reponame+scan_type+branch+tt).encode('utf-8')).hexdigest()
        job=q.enqueue(dashboard.initiate_slack_scan,args=(reponame,branch,scan_type,invoke_id,user_id,channel,invoke_type,author,),job_timeout=600)
        q_len=len(q)
        return jsonify({'Queue Length':q_len,'Task_ID':invoke_id})
    else:
        return "No value given"

@app.route('/assets', methods=['GET'])
def assets():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20

    if request.args.get('language'):
        language = request.args.get('language')
        paginate = (db.session.query(Assets).filter(Assets.language == language).paginate(
            page=page_num, per_page=20, error_out=True))
    else:
        paginate = (db.session.query(Assets).paginate(
            page=page_num, per_page=20, error_out=True))

    if request.args.get('filter'):
        if request.args.get('filter')=="creation_date":
            if request.args.get('order')=='desc':
                paginate = (db.session.query(Assets).order_by(Assets.creation_date.desc()).paginate(page=page_num, per_page=20, error_out=True))
            if request.args.get('order')=='asc':
                paginate = (db.session.query(Assets).order_by(Assets.creation_date.asc()).paginate(page=page_num, per_page=20, error_out=True))                
        if request.args.get('filter')=="last_commit_date":
            if request.args.get('order')=='desc':
                paginate = (db.session.query(Assets).order_by(Assets.last_commit_date.desc()).paginate(page=page_num, per_page=20, error_out=True))
            if request.args.get('order')=='asc':
                paginate = (db.session.query(Assets).order_by(Assets.last_commit_date.asc()).paginate(page=page_num, per_page=20, error_out=True))              



    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num



    asset_schema = AssetSchema(many=True)
    output = asset_schema.dump(paginate.items)
    langauge_count=get_top_ten_asset_languages()
    image_count=get_top_ten_image_name()
    return jsonify({"results": output, 'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num ,'top_ten_languages':langauge_count,'top_ten_images':image_count})




@app.route('/asset_search',methods=['GET'])
def asset_search():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20

    if request.args.get('search'):
        query=request.args.get('search')
        search = "%{}%".format(query)
        paginate=(db.session.query(Assets).filter(or_(Assets.asset_name.ilike(search),Assets.language.ilike(search),Assets.image_name.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True))    
    if request.args.get('asset_name'):
        asset_name=request.args.get('asset_name')
        search = "%{}%".format(asset_name)
        paginate=db.session.query(Assets).filter(Assets.asset_name.ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('image_name'):
        image_name=request.args.get('image_name')
        search = "%{}%".format(image_name)
        paginate=db.session.query(Assets).filter(Assets.image_name.ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('language'):
        language=request.args.get('language')
        search = "%{}%".format(language)
        paginate=db.session.query(Assets).filter(Assets.language.ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
        
    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num


    asset_schema = AssetSchema(many=True)    
    output = asset_schema.dump(paginate.items)    
    return jsonify({"results": output,'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})

@app.route('/results_search_sca',methods=['GET'])
def results_search_sca():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20
    if request.args.get('search'):
        query=request.args.get('search')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),or_(Results.project_name.ilike(search),Results.language.ilike(search)))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('project_name'):
        query=request.args.get('project_name')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),Results.project_name.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('language'):
        query=request.args.get('language')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),Results.language.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('title'):
        query=request.args.get('title')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),func.json_extract(Results.issue, '$.title').ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('dependency_url'):
        query=request.args.get('dependency_url')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),Results.dependency_url.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)                        
    if request.args.get('severity'):
        query=request.args.get('severity')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'),func.json_extract(Results.issue, '$.severity').ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)

    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)  
    return jsonify({"results": output,'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})

@app.route('/results_search_ss',methods=['GET'])
def results_search_ss():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20
    if request.args.get('search'):
        query=request.args.get('search')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks'),or_(Results.project_name.ilike(search),Results.language.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('project_name'):
        query=request.args.get('project_name')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks'),Results.project_name.ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('language'):
        query=request.args.get('language')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks'),Results.language.ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('secret_type'):
        query=request.args.get('secret_type')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks'),func.json_extract(Results.issue, '$.tags').ilike(search)).paginate(
            page=page_num, per_page=20, error_out=True)
    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)  
    return jsonify({"results": output,'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})


@app.route('/results_search_sast',methods=['GET'])
def results_search_sast():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20
    if request.args.get('search'):
        query=request.args.get('search')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'),or_(Results.project_name.ilike(search),Results.language.ilike(search)))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('project_name'):
        query=request.args.get('project_name')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'),Results.project_name.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('language'):
        query=request.args.get('language')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'),Results.language.ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if request.args.get('title'):
        query=request.args.get('title')
        search = "%{}%".format(query)
        paginate=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'),func.json_extract(Results.issue, '$.title').ilike(search))).paginate(
            page=page_num, per_page=20, error_out=True)
    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)  
    return jsonify({"results": output,'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})

@app.route('/results', methods=['GET'])
def allresults():
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20


    if request.args.get('scanner'):
        scanner = request.args.get('scanner')
        if scanner == Scantype.sast.value:
            paginate=(db.session.query(Results).filter(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs')).paginate(
            page=page_num, per_page=20, error_out=True))
        if scanner == Scantype.sca.value:
            paginate=(db.session.query(Results).filter(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check')).paginate(
            page=page_num, per_page=20, error_out=True))
        if scanner == Scantype.ss.value:
            paginate=(db.session.query(Results).filter(Results.scanner == 'gitleaks').paginate(
            page=page_num, per_page=20, error_out=True))
    else:
        paginate = (db.session.query(Results).paginate(
            page=page_num, per_page=20, error_out=True))

    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)
    return jsonify({"results": output, 'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})



@app.route('/results/<string:repo>', methods=['GET'])
def resultbyrepo(repo):
    page_num = 1
    prev_page_count=0
    has_prev, has_next, next_num = False, False, None
    if request.args.get('page_num'):
        page_num = int(request.args.get('page_num'))
        if page_num==1:
            prev_page_count=0
        else:
            page_nums=page_num-1
            prev_page_count=page_nums*20

    if request.args.get('is_resolved'):
        is_resolved = request.args.get('is_resolved')
        paginate = (db.session.query(Results).filter(Results.project_name == repo, Results.is_resolved == is_resolved).paginate(
            page=page_num, per_page=20, error_out=True))
    else:
        paginate = (db.session.query(Results).filter(Results.project_name == repo).paginate(
            page=page_num, per_page=20, error_out=True))

    if paginate.has_prev:
        has_prev = True
    if paginate.has_next:
        has_next = True
    if paginate.next_num:
        next_num = paginate.next_num

    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)
    return jsonify({"results": output, 'has_prev': has_prev,'prev_page_count':prev_page_count, 'has_next': has_next, 'next_num': next_num})


@app.route('/result/<string:repo>/<id>', methods=['GET'])
def resultbyid(repo, id):
    res = db.session.query(Results).get(id)
    result_schema = ResultSchema()
    output = result_schema.dump(res)
    if output['scanner']=="gitleaks":
        scan_id=output['scan_id']
        reponame=output['project_name']
        commit_id=getcommitid(scan_id)
        str = commit_id.replace("\\", "")
        fcom= str.replace('"', "")
        bitbucket_url="https://bitbucket.org/%s/%s/commits/%s" %(BITBUCKET_OWNER,reponame,fcom)
        similar_vulns=gitleakssimilar(scan_id)
        a=jsonify({"output":output,"similar_vulns":similar_vulns,"bitbucket_url":bitbucket_url})
        return a
    if output['scanner']=="dependency-check":
        scan_id=output['scan_id']
        similar_vulns=dpepndsimilar(scan_id)
        a=jsonify({"output":output,"similar_vulns":similar_vulns})
        return a
    if output['scanner']=="find-sec-bugs":
        scan_id=output['scan_id']
        similar_vulns=findsecimilar(scan_id)
        a=jsonify({"output":output,"similar_vulns":similar_vulns})
        return a
    if output['scanner']=="gosec":
        scan_id=output['scan_id']
        similar_vulns=gosecsimilar(scan_id)
        a=jsonify({"output":output,"similar_vulns":similar_vulns})
        return a
    if output['scanner']=="npm-audit":
        scan_id=output['scan_id']
        similar_vulns=npmsimilar(scan_id)
        a=jsonify({"output":output,"similar_vulns":similar_vulns})
        return a                 
    
@app.route('/check_cve_exists', methods=['POST'])
def check_cve_exists():
    if request.form.get('cve_id'):
        cves_present=[]
        cve_ids=request.form.getlist('cve_id')
        for cve in cve_ids:
            search = "%{}%".format(cve)
            vuln = db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',func.json_extract(Results.issue, '$.title').ilike(search))).count()
            if vuln > 0:
                cves_present.append(cve)
            else:
                continue    
        return jsonify({"Cves_present": cves_present})

def getcommitid(idd):
    stmta=text("select json_extract(issue,'$.commit') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for commit in res0:
        commit_id=commit[0]
    return commit_id

@app.route('/raisejira', methods=['POST'])
def raisejira():
    if request.form.get('result_id'):
        rid = request.form.get('result_id')
        vuln = db.session.query(Results).get(rid)
        jira_raiser(rid)
        vuln.jira_raised = 1
        db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('multiresolve'):
        multiresolve=request.form.getlist('multiresolve')
        for resultid in multiresolve:
            vuln = db.session.query(Results).get(resultid)
            jira_raiser(resultid)
            vuln.jira_raised = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})  

@app.route('/resolve', methods=['POST'])
def resolve():
    if request.form.get('result_id'):
        rid = request.form.get('result_id')
        vuln = db.session.query(Results).get(rid)
        vuln.is_resolved = 1
        db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('multiresolve'):
        multiresolve=request.form.getlist('multiresolve')
        for resultid in multiresolve:
            vuln = db.session.query(Results).get(resultid)
            vuln.is_resolved = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})        
    if request.form.get('bug_class'):
        bug_class = request.form.get('bug_class')
        vul_by_bug_class = db.session.query(Results).filter(
            Results.bug_class == bug_class).all()
        for vuln in vul_by_bug_class:
            vuln.is_resolved = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('dependency_url'):
        dependency_url = request.form.get('dependency_url')
        vul_by_dependency_url = db.session.query(Results).filter(
            Results.dependency_url == dependency_url).all()
        for vuln in vul_by_dependency_url:
            vuln.is_resolved = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('secrets_scanning_tag'):
        secrets_scanning_tag = request.form.get('secrets_scanning_tag')
        vul_by_ss = db.session.query(Results).filter(
            Results.secrets_scanning_tag == secrets_scanning_tag).all()
        for vuln in vul_by_ss:
            vuln.is_resolved = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    return jsonify({"Status": "Error"})








@app.route('/suppress', methods=['POST'])
def suppress():
    if request.form.get('result_id'):
        rid = request.form.get('result_id')
        vuln = db.session.query(Results).get(rid)
        vuln.mark_as_fp = 1
        db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('multiresolve'):
        multiresolve=request.form.getlist('multiresolve')
        for resultid in multiresolve:
            vuln = db.session.query(Results).get(resultid)
            vuln.mark_as_fp = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})                 
    if request.form.get('bug_class'):
        bug_class = request.form.get('bug_class')
        vul_by_bug_class = db.session.query(Results).filter(
            Results.bug_class == bug_class).all()
        for vuln in vul_by_bug_class:
            vuln.mark_as_fp = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('dependency_url'):
        dependency_url = request.form.get('dependency_url')
        vul_by_dependency_url = db.session.query(Results).filter(
            Results.dependency_url == dependency_url).all()
        for vuln in vul_by_dependency_url:
            vuln.mark_as_fp = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    if request.form.get('secrets_scanning_tag'):
        secrets_scanning_tag = request.form.get('secrets_scanning_tag')
        vul_by_ss = db.session.query(Results).filter(
            Results.secrets_scanning_tag == secrets_scanning_tag).all()
        for vuln in vul_by_ss:
            vuln.mark_as_fp = 1
            db.session.commit()
        return jsonify({"Status": "Ok"})
    return jsonify({"Status": "Error"})


@app.route('/')
def index():
    response = {}
    scan_info = get_scan_info()
    asset_info = get_assets_info()
    count_of_vuln_by_scanner = get_count_of_vuln_by_scanner()
    past_vuln_info = get_past_vuln_info()
    top_ten_vuln_dependencies = get_top_ten_vuln_dependencies()
    top_ten_vuln_class = get_top_ten_vuln_class()
    top_ten_secret_scanning_tags = get_top_ten_secret_scanning_tags()
    top_ten_repos_with_highest_vuln = get_top_ten_repos_with_highest_vuln()
    sastmp = sast_monthly_report()['sast_monthly_reports']
    scamp = sca_monthly_report()['sca_monthly_report']
    ssmp = secrets_scanning_monthly_report()['secrets_scanning_monthly_report']
    vuln_age = get_vuln_age()
    mon = {1: 'JAN', 2: 'FEB', 3: 'MAR', 4: 'APR', 5: 'MAY', 6: 'JUN', 7: 'JUL', 8: 'AUG', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DEC'}
    monthly_report = []
    for mp in mon.keys():
        try:
            monthly_report.append({
                'name': mon[mp], 
                'SAST': list(sastmp.keys())[list(sastmp.values()).index(mp)], 
                'SCA': list(scamp.keys())[list(scamp.values()).index(mp)], 
                'SS': list(ssmp.keys())[list(ssmp.values()).index(mp)]
            })
        except:
            monthly_report.append({
                'name': mon[mp], 
                'SAST': 0, 
                'SCA': 0,
                'SS': 0
            })
    monthly_report = {'vulnerability_trend': monthly_report}
    sast_sca_ss_trend=vuln_tren()
    sca_pub_exploit_trend=sca_exploit_count()
    latest_vulnerability=latest_vulns()
    #response = {**scan_info, **asset_info, **count_of_vuln_by_scanner, **past_vuln_info, **top_ten_vuln_dependencies, **top_ten_vuln_class, **top_ten_secret_scanning_tags, **top_ten_repos_with_highest_vuln, **monthly_report, **vuln_age}
    return jsonify({"sast_sca_ss_trend":sast_sca_ss_trend,"sca_pub_exploit_trend":sca_pub_exploit_trend,"scan_info":scan_info,"asset_info":asset_info,"count_of_vuln_by_scanner":count_of_vuln_by_scanner,"past_vuln_info":past_vuln_info,
                    "top_ten_vuln_dependencies":top_ten_vuln_dependencies,"top_ten_vuln_class":top_ten_vuln_class,"top_ten_secret_scanning_tags":top_ten_secret_scanning_tags,
                    "top_ten_repos_with_highest_vuln":top_ten_repos_with_highest_vuln,"monthly_report":monthly_report,"vuln_age":vuln_age,"latest_vulnerability":latest_vulnerability})

def get_scan_info():
    scan_success_count = db.session.query(Scans).filter(
        Scans.scan_successful == 1).count()
    scan_fail_count = db.session.query(Scans).filter(
        Scans.scan_successful == 0).count()
    total_scan_count = db.session.query(Scans).count()
    return {'scan_success_count': scan_success_count, 'scan_fail_count': scan_fail_count, 'total_scan_count': total_scan_count}


def get_assets_info():
    total_assets = db.session.query(Assets).count()

    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    total_assets_in_7_days = db.session.query(Assets).filter(
        Assets.creation_date > seven_days_ago).count()

    thrity_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    total_assets_in_30_days = db.session.query(Assets).filter(
        Assets.creation_date > thrity_days_ago).count()
    return {'total_assets': total_assets, 'total_assets_in_7_days': total_assets_in_7_days, 'total_assets_in_30_days': total_assets_in_30_days}


def get_count_of_vuln_by_scanner():
    total_sast_reports = db.session.query(Results).filter(and_(or_(
        Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs', Results.scanner == 'npm-audit'))).count()

    total_dependencychecker_reports = db.session.query(
        Results).filter(Results.scanner == 'dependency-check').count()

    total_gitleaks_reports = db.session.query(
        Results).filter(Results.scanner == 'gitleaks').count()
    return {'total_sast_reports': total_sast_reports, 'total_sca_reports': total_dependencychecker_reports, 'total_secrets_scanning_reports': total_gitleaks_reports}


def get_past_vuln_info():
    total_vuln = db.session.query(Results).count()
    seven_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    total_results_in_7_days = db.session.query(Results).filter(
        Results.creation_date > seven_days_ago).count()
    thrity_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    total_results_in_30_days = db.session.query(Results).filter(
        Results.creation_date > thrity_days_ago).count()
    return {'total_vuln': total_vuln, 'total_results_in_7_days': total_results_in_7_days, 'total_results_in_30_days': total_results_in_30_days}


def get_top_ten_vuln_dependencies():
    list_of_dependencices = db.session.query(Results.dependency_url, func.count(Results.dependency_url)).group_by(
        Results.dependency_url).having(Results.dependency_url != 'Null').order_by(func.count(Results.dependency_url).desc()).limit(10).all()
    all_list = []
    for dep in list_of_dependencices:
        dependencies = {}
        dependencies["dependency"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"top_ten_vuln_dependencies":
           all_list}
    return res

def get_top_ten_asset_languages():
    list_of_assets = db.session.query(Assets.language, func.count(Assets.language)).group_by(
        Assets.language).having(Assets.language != 'Null').order_by(func.count(Assets.language).desc()).limit(10).all()
    all_list = []
    for assets in list_of_assets:
        assetfinal = {}
        assetfinal["language"] = assets[0]
        assetfinal["count"] = assets[1]
        all_list.append(assetfinal)
    res = {"top_ten_asset_languages":
           all_list}    
    return res



def get_top_ten_image_name():
    list_of_images = db.session.query(Assets.image_name, func.count(Assets.image_name)).group_by(
        Assets.image_name).having(Assets.image_name != 'Null').order_by(func.count(Assets.image_name).desc()).limit(10).all()
    all_list = []
    for images in list_of_images:
        imagefinal = {}
        imagefinal["image"] = images[0]
        imagefinal["count"] = images[1]
        all_list.append(imagefinal)
    res = {"top_ten_image_name":
           all_list}    
    return res


def get_top_ten_vuln_class():
    list_of_vuln_class = db.session.query(Results.bug_class, func.count(Results.bug_class)).group_by(
        Results.bug_class).having(Results.bug_class != 'Null').order_by(func.count(Results.bug_class).desc()).limit(10).all()
    all_list = []

    for dep in list_of_vuln_class:
        dependencies = {}
        dependencies["vuln_class"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)

    res = {"top_ten_vuln_class":
           all_list}
    return res


def get_top_ten_secret_scanning_tags():
    list_of_secret_scanning_tags = db.session.query(Results.secrets_scanning_tag, func.count(Results.secrets_scanning_tag)).group_by(
        Results.secrets_scanning_tag).having(Results.secrets_scanning_tag != 'Null').order_by(func.count(Results.secrets_scanning_tag).desc()).limit(10).all()
    all_list = []

    for dep in list_of_secret_scanning_tags:
        dependencies = {}
        dependencies["secret_scan_tags"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"top_ten_secret_scanning_tags":
           all_list}
    return res


def get_top_ten_repos_with_highest_vuln():
    list_of_repos_with_highest_vuln = db.session.query(Results.project_name, func.count(Results.project_name)).group_by(
        Results.project_name).having(Results.project_name != 'Null').order_by(func.count(Results.project_name).desc()).limit(10).all()
    all_list = []
    for dep in list_of_repos_with_highest_vuln:
        dependencies = {}
        dependencies["vuln_by_repo"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"top_ten_repos_with_highest_vuln":
           all_list}
    return res


def sast_monthly_report():
    list_of_sast_monthly_report = db.session.query(func.count(), func.month(Results.creation_date)).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), func.year(
        Results.creation_date) == (datetime.datetime.now().year -1))).group_by(func.month(Results.creation_date)).order_by(func.month(Results.creation_date)).all()
    res = {"sast_monthly_reports": dict(list_of_sast_monthly_report)}
    return res


def sca_monthly_report():
    list_of_sca_monthly_report = db.session.query(func.count(), func.month(Results.creation_date)).filter(and_(or_(Results.scanner == 'dependency-check', Results.scanner == 'npm-audit'), func.year(
        Results.creation_date) == (datetime.datetime.now().year -1))).group_by(func.month(Results.creation_date)).order_by(func.month(Results.creation_date)).all()
    res = {"sca_monthly_report": dict(list_of_sca_monthly_report)}
    return res


def secrets_scanning_monthly_report():
    list_of_secrets_scanning_monthly_report = db.session.query(func.count(), func.month(Results.creation_date)).filter(and_(Results.scanner == 'gitleaks', func.year(
        Results.creation_date) == (datetime.datetime.now().year -1))).group_by(func.month(Results.creation_date)).order_by(func.month(Results.creation_date)).all()
    res = {"secrets_scanning_monthly_report": dict(
        list_of_secrets_scanning_monthly_report)}
    return res


def get_vuln_age():
    seven_days = datetime.datetime.utcnow() - datetime.timedelta(days=7)
    total_vuln_not_fixed_in_seven_days = db.session.query(Results).filter(
        and_(Results.is_resolved == 0, Results.creation_date > seven_days)).count()

    thirty_days = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    total_vuln_not_fixed_in_thirty_days = db.session.query(Results).filter(
        and_(Results.is_resolved == 0, Results.creation_date > thirty_days)).count()

    sixty_days = datetime.datetime.utcnow() - datetime.timedelta(days=60)
    total_vuln_not_fixed_in_sixty_days = db.session.query(Results).filter(
        and_(Results.is_resolved == 0, Results.creation_date > sixty_days)).count()

    ninety_days = datetime.datetime.utcnow() - datetime.timedelta(days=90)
    total_vuln_not_fixed_in_ninety_days = db.session.query(Results).filter(
        and_(Results.is_resolved == 0, Results.creation_date > ninety_days)).count()

    res = {'total_vuln_not_fixed_in_seven_days': total_vuln_not_fixed_in_seven_days, 'total_vuln_not_fixed_in_thirty_days': total_vuln_not_fixed_in_thirty_days,
           'total_vuln_not_fixed_in_sixty_days': total_vuln_not_fixed_in_sixty_days, 'total_vuln_not_fixed_in_ninety_days': total_vuln_not_fixed_in_ninety_days}
    return res

def gitleakssimilar(idd):
    stmta=text("select json_extract(issue,'$.line_no') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for secreta in res0:
        secret=secreta[0]
    all_list = []
    stmt=text("select project_name,COUNT(json_extract(issue,'$.line_no')) from results where scanner='gitleaks' AND json_extract(issue,'$.line_no')=%s GROUP BY project_name ORDER BY COUNT(json_extract(issue,'$.line_no')) DESC LIMIT 5;" %(secret)) 
    res=db.session.execute(stmt)
    for dep in res:
        dependencies = {}
        dependencies["project_name"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"similar_vuln_data":all_list}    
    return res

def gosecsimilar(idd):
    stmta=text("select json_extract(issue,'$.bug_type') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for secreta in res0:
        secret=secreta[0]
    all_list = []
    stmt=text("select project_name,COUNT(json_extract(issue,'$.bug_type')) from results where scanner='gosec' AND json_extract(issue,'$.bug_type')=%s GROUP BY project_name ORDER BY COUNT(json_extract(issue,'$.bug_type')) DESC LIMIT 5;" %(secret)) 
    res=db.session.execute(stmt)
    for dep in res:
        dependencies = {}
        dependencies["project_name"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"similar_vuln_data":all_list}    
    return res

def findsecimilar(idd):
    stmta=text("select json_extract(issue,'$.bug_type') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for secreta in res0:
        secret=secreta[0]
    all_list = []
    stmt=text("select project_name,COUNT(json_extract(issue,'$.bug_type')) from results where scanner='find-sec-bugs' AND json_extract(issue,'$.bug_type')=%s GROUP BY project_name ORDER BY COUNT(json_extract(issue,'$.bug_type')) DESC LIMIT 5;" %(secret)) 
    res=db.session.execute(stmt)
    for dep in res:
        dependencies = {}
        dependencies["project_name"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"similar_vuln_data":all_list}    
    return res

def npmsimilar(idd):
    stmta=text("select json_extract(issue,'$.title') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for secreta in res0:
        secret=secreta[0]
    all_list = []
    stmt=text("select project_name,COUNT(json_extract(issue,'$.title')) from results where scanner='npm-audit' AND json_extract(issue,'$.title')=%s GROUP BY project_name ORDER BY COUNT(json_extract(issue,'$.title')) DESC LIMIT 5;" %(secret)) 
    res=db.session.execute(stmt)
    for dep in res:
        dependencies = {}
        dependencies["project_name"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"similar_vuln_data":all_list}    
    return res

def dpepndsimilar(idd):
    stmta=text("select json_extract(issue,'$.dependency_url') from results where result_id='%s'" %(idd))
    res0=db.session.execute(stmta)
    for secreta in res0:
        secret=secreta[0]
    all_list = []
    stmt=text("select project_name,COUNT(json_extract(issue,'$.dependency_url')) from results where scanner='dependency-check' AND json_extract(issue,'$.dependency_url')=%s GROUP BY project_name ORDER BY COUNT(json_extract(issue,'$.dependency_url')) DESC LIMIT 5;" %(secret)) 
    res=db.session.execute(stmt)
    for dep in res:
        dependencies = {}
        dependencies["project_name"] = dep[0]
        dependencies["count"] = dep[1]
        all_list.append(dependencies)
    res = {"similar_vuln_data":all_list}    
    return res

def latest_vulns():
    page_num=1
    paginate = (db.session.query(Results).order_by(Results.creation_date.desc()).paginate(
            page=page_num, per_page=5, error_out=True))
    result_schema = ResultSchema(many=True)
    output = result_schema.dump(paginate.items)
    return output


def sca_exploit_count():
    today=datetime.datetime.utcnow()
    thirty_days = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    thirtyfirst_days=datetime.datetime.utcnow() - datetime.timedelta(days=31)
    ninety_days=datetime.datetime.utcnow() - datetime.timedelta(days=90)
    ninetyone_days=datetime.datetime.utcnow() - datetime.timedelta(days=90)
    oneeight_days=datetime.datetime.utcnow() - datetime.timedelta(days=180)
    oneeightyone_days=datetime.datetime.utcnow() - datetime.timedelta(days=181)

    zero_to_thirty_day_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 1, and_(Results.creation_date >= today,Results.creation_date <= thirty_days ))).count()
    thirty_to_ninety_day_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 1, and_(Results.creation_date >= thirtyfirst_days,Results.creation_date <= ninety_days))).count()
    ninety_to_oneeighty_day_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 1, and_(Results.creation_date >= ninetyone_days,Results.creation_date <= oneeight_days))).count()
    oneightyplus_day_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 1, Results.creation_date >= oneeightyone_days)).count()

    zero_to_thirty_day_no_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 0, and_(Results.creation_date >= today,Results.creation_date <= thirty_days ))).count()
    thirty_to_ninety_day_no_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 0, and_(Results.creation_date >= thirtyfirst_days,Results.creation_date <= ninety_days))).count()
    ninety_to_oneeighty_day_no_public_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 0, and_(Results.creation_date >= ninetyone_days,Results.creation_date <= oneeight_days))).count()
    oneightyplus_day_public_no_exploit=db.session.query(Results).filter(and_(Results.scanner == 'dependency-check',Results.has_public_expoit == 0, Results.creation_date >= oneeightyone_days)).count()
    
    res={"zero_to_thirty_day_public_exploit":zero_to_thirty_day_public_exploit,"thirty_to_ninety_day_public_exploit":thirty_to_ninety_day_public_exploit,
         "ninety_to_oneeighty_day_public_exploit":ninety_to_oneeighty_day_public_exploit,"oneightyplus_day_public_exploit":oneightyplus_day_public_exploit,
         "zero_to_thirty_day_no_public_exploit":zero_to_thirty_day_no_public_exploit,"thirty_to_ninety_day_no_public_exploit":thirty_to_ninety_day_no_public_exploit,
         "ninety_to_oneeighty_day_no_public_exploit":ninety_to_oneeighty_day_no_public_exploit,"oneightyplus_day_public_no_exploit":oneightyplus_day_public_no_exploit}
    return res

def vuln_tren():
    today=datetime.datetime.utcnow()
    fortenn_days = datetime.datetime.utcnow() - datetime.timedelta(days=14)
    fifteen_days= datetime.datetime.utcnow() - datetime.timedelta(days=15)
    thirty_days = datetime.datetime.utcnow() - datetime.timedelta(days=30)
    thirtyfirst_days=datetime.datetime.utcnow() - datetime.timedelta(days=31)
    sixty_days=datetime.datetime.utcnow() - datetime.timedelta(days=60)
    sixtyone_days=datetime.datetime.utcnow() - datetime.timedelta(days=61)
    ninety_days=datetime.datetime.utcnow() - datetime.timedelta(days=90)
    ninetyone_days=datetime.datetime.utcnow() - datetime.timedelta(days=91)

    sca_0_to_14_vulns=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), and_(Results.creation_date >= today,Results.creation_date <= fortenn_days ))).count()
    sca_15_to_30_vulns=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), and_(Results.creation_date >= fifteen_days,Results.creation_date <= thirty_days ))).count()
    sca_31_to_60_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), and_(Results.creation_date >= thirtyfirst_days,Results.creation_date <= sixty_days ))).count()
    sca_61_to_90_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), and_(Results.creation_date >= sixtyone_days,Results.creation_date <= ninety_days ))).count()
    sca_90plus_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'npm-audit', Results.scanner == 'dependency-check'), Results.creation_date >= ninetyone_days )).count()
    
    sast_0_to_14_vulns=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), and_(Results.creation_date >= today,Results.creation_date <= fortenn_days ))).count()
    sast_15_to_30_vulns=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), and_(Results.creation_date >= fifteen_days,Results.creation_date <= thirty_days ))).count()
    sast_31_to_60_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), and_(Results.creation_date >= thirtyfirst_days,Results.creation_date <= sixty_days ))).count()
    sast_61_to_90_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), and_(Results.creation_date >= sixtyone_days,Results.creation_date <= ninety_days ))).count()
    sast_90plus_days=db.session.query(Results).filter(and_(or_(Results.scanner == 'gosec', Results.scanner == 'find-sec-bugs'), Results.creation_date >= ninetyone_days )).count()
    
    ss_0_to_14_vulns=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks', and_(Results.creation_date >= today,Results.creation_date <= fortenn_days ))).count()
    ss_15_to_30_vulns=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks', and_(Results.creation_date >= fifteen_days,Results.creation_date <= thirty_days ))).count()
    ss_31_to_60_days=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks', and_(Results.creation_date >= thirtyfirst_days,Results.creation_date <= sixty_days ))).count()
    ss_61_to_90_days=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks', and_(Results.creation_date >= sixtyone_days,Results.creation_date <= ninety_days ))).count()
    ss_90plus_days=db.session.query(Results).filter(and_(Results.scanner == 'gitleaks', Results.creation_date >= ninetyone_days )).count()
    
    res={"sca_0_to_14_vulns":sca_0_to_14_vulns,"sca_15_to_30_vulns":sca_15_to_30_vulns,"sca_31_to_60_days":sca_31_to_60_days,"sca_61_to_90_days":sca_61_to_90_days,"sca_90plus_days":sca_90plus_days,
         "sast_0_to_14_vulns":sast_0_to_14_vulns,"sast_15_to_30_vulns":sast_15_to_30_vulns,"sast_31_to_60_days":sast_31_to_60_days,"sast_61_to_90_days":sast_61_to_90_days,"sast_90plus_days":sast_90plus_days,
         "ss_0_to_14_vulns":ss_0_to_14_vulns,"ss_15_to_30_vulns":ss_15_to_30_vulns,"ss_31_to_60_days":ss_31_to_60_days,"ss_61_to_90_days":ss_61_to_90_days,"ss_90plus_days":ss_90plus_days

    }
    return res
def get_user_accountid(username):
    headers = {'Content-Type': 'application/json', 'Authorization': 'Basic ' + jira_token}
    username.replace("-", " ")
    username.replace("_", " ")
    req = requests.get(jira_url + "/rest/api/2/user/search?query={}".format(username), headers=headers)
    data = json.loads(req.text)
    user_account_id = data[0]['accountId']
    return user_account_id

def jira_raiser(resultid):
    headers = {'Content-Type': 'application/json', 'Authorization': 'Basic ' + jira_token}
    stmta=text("select * from results where result_id='%s'" % (resultid))
    results=db.session.execute(stmta)    
    issues = []

    for result in results:
        result_id = result[0]
        issue = json.loads(result[2])
        repo = issue['repo']
        filename = issue['file_name']
        description = issue['description']
        author = issue['author']
        commit = issue['commit']
        is_resolved = result[7]
        mark_as_fp = result[8]
        tags = result[12]
        issues.append([result_id, repo, filename, description, author, commit, is_resolved, mark_as_fp, tags])

    for issue in issues:
        result_id = issue[0]
        repo = issue[1]
        repolink = "https://bitbucket.org/%s/%s/"%(BITBUCKET_OWNER,repo)
        filename = issue[2]
        filelink = repolink + "src/master/" + filename
        description = issue[3] + " token"
        author = issue[4]
        commit = issue[5]
        tags = issue[8].split("key, ")[1]
        accountid = get_user_accountid(author)

        ticket_title = "[{}] - {}".format(repo, description)
        ticket_description = "*Patronus Issue id:* {}\n".format(result_id)
        ticket_description += "*Repository:* {} \n".format(repolink)
        ticket_description += "*Issue:* {}\n".format(description)
        ticket_description += "*File Name:* {} \n".format(filename)
        ticket_description += "*File Link:* {} \n".format(filelink)
        ticket_description += "*Author:* {}\n".format(author)
        ticket_description += "*Commit Hash:* {}\n".format(commit)



        fields = {
            "project": {
                "key": jira_project
            },
            "summary": ticket_title,
            "description": ticket_description,
            "issuetype": {
                'name': "Task"
            },
            "assignee": {
                "accountId": accountid
            },
            "labels": [
                repo,
                tags   
            ]
        }

        req = requests.post(jira_url + "/rest/api/2/issue", json={"fields": fields}, headers=headers)
        if (req.status_code == 201):
            msg = "Created a new ticket {}".format(json.loads(req.text)['key'])
            print(msg)
        else:
            msg = "An Error occured while trying to create a ticket for {}".format(issue)
            print(msg)
    return "ok"        

if __name__ == "__main__":
    app.run(host='0.0.0.0')

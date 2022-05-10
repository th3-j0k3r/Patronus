class Config:
    SSH_PUB_KEY = "/root/Patronus/SSH_KEYS/id_rsa.pub"
    SSH_PRI_KEY = "/root/Patronus/SSH_KEYS/id_rsa"
    SSH_PASSWORD = ""
 
    BITBUCKET_USERNAME = ""
    BITBUCKET_APP_PASSWORD = ""
    BITBUCKET_OWNER = ""
 
    DB_HOST = ""
    DB_DATABASE = ""
    DB_USER = ""   
    DB_PASSWORD = ""
 
    
    
    #Jira
    JIRA_URL=""
    JIRA_TOKEN=""  
    JIRA_PROJECT=""

    # Patronus configurations
    PATRONUS_SLACK_WEB_HOOK_URL =""
    PATRONUS_DOWNLOAD_LOCATION = "/tmp/"
    PATRONUS_SUPPORTED_LANG = ["java", "go", "nodejs", "javascript"]
    PATRONUS_CVSS_SCORE_FILTER = 8
    PATRONUS_CVSS_URL = "https://cve.circl.lu/api/cve/"
    PATRONUS_PUBLIC_EXPLOIT_EXPLOIT_DB_URL = "https://www.exploit-db.com/search?cve="
    PATRONUS_PUBLIC_EXPLOIT_EXPLOIT_DB_URL_HEADERS = {"X-Requested-With": "XMLHttpRequest",
                                           "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:80.0) Gecko/20100101 Firefox/80.0"}
 
 
    PATRONUS_PUBLIC_EXPLOIT_SPLOITUS_URL = "https://sploitus.com:443/search"
    PATRONUS_PUBLIC_EXPLOIT_SPLOITUS_URL_HEADERS = {"authority": "sploitus.com", "sec-ch-ua": "\"Chromium\";v=\"86\", \"\"Not\\A;Brand\";v=\"99\", \"Google Chrome\";v=\"86\"",
                                        "accept": "application/json", "sec-ch-ua-mobile": "?0",
                                        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.80 Safari/537.36",
                                        "content-type": "application/json", "origin": "https://sploitus.com", "sec-fetch-site": "same-origin", "sec-fetch-mode": "cors",
                                        "sec-fetch-dest": "empty", "referer": "https://sploitus.com/?query=CVE-2020-14882", "accept-language": "en-US,en;q=0.9",
                                        "Cache-Control": "no-cache",  "Accept-Encoding": "gzip, deflate", "Connection": "close"}

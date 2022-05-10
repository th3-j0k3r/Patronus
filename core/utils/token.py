import os
import json
import boto3
import inspect
import requests
from os.path import expanduser


class Token():

    def __init__(self):
        self.matches = []
        return

    def asana(self, token):
        # Checks if a given token is a valid
        # Asana token
        url = "https://app.asana.com/api/1.0/users/me"
        headers = {"Authorization": "Bearer " + token}
        req = requests.get(url, headers=headers)

        if "errors" in json.loads(req.text).keys():
            return False
        self.matches.append("asana")
        return True

    def gitlab(self, token):
        # Checks if a given token is a valid
        # Gitlab token
        url = "https://gitlab.com/api/v4"
        req = requests.get(url + "/user?private_token=" + token)

        if "error" in json.loads(req.text).keys():
            return False

        if "message" in json.loads(req.text).keys():
            if json.loads(req.text)['message'] == "401 Unauthorized":
                return False

        self.matches.append("gitlab")
        return True

    def slack(self, token):
        # Checks if a given token is a valid
        # Slack token
        url = "https://slack.com/api/auth.test"
        req = requests.post(url + "?token=" + token)

        if "error" in json.loads(req.text).keys():
            return False

        if "user_id" in json.loads(req.text).keys():
            self.matches.append("slack")
        return True

    def github(self, token):
        # Checks if a given token is a valid
        # Github token
        url = "https://api.github.com/user"
        headers = {"Authorization": "token " + token}
        req = requests.get(url, headers=headers)

        if "message" in json.loads(req.text).keys():
            if json.loads(req.text)['message'] == "Bad credentials":
                return False

        if "email" in json.loads(req.text).keys():
            self.matches.append("github")
        return True

    def aws(self, access_key, access_token):
        # WARNING: This will overwrite the existing
        # ~/.aws/credentials incase if there is any.
        string = "[default]" + "\n"
        string += "aws_access_key_id = " + access_key + "\n"
        string += "aws_secret_access_key = " + access_token + "\n"

        file_path = expanduser("~") + "/.aws/credentials"
        file = open(file_path, 'w')
        file.write(string)
        file.close()

        try:
            data = boto3.client('sts').get_caller_identity()
        except Exception as e:
            return False

        if "Arn" in data.keys():
            self.matches.append("aws")

        os.remove(file_path)
        return True


def validate_all(key, access_key=None, access_token=None):
    # Given a token, the function will check if its a
    # valid token for any of the class's member function
    token = Token()
    attrs = (getattr(token, name) for name in dir(token))
    methods = filter(inspect.ismethod, attrs)
    for method in methods:
        if "init" in str(method):
            continue

        if "aws" in str(method):
            if access_key and access_token:
                method(access_key, access_token)
        else:
            method(key)

    return token.matches

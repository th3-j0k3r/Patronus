import type { FC } from 'react';

const HowToRemediate: FC = () => {
  return (
    <div
      className="mb-4
      bg-surface-md-dark
      border-gray-50 border border-opacity-20
    rounded-md
    text-gray-50
  p-3
    "
    >
      <h5 className="p-2">How to Remediate</h5>
      <hr className="border-opacity-30" />

      <div className="stepper flex flex-col p-4">
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              1
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 1</h5>
            <small>
            Remove or mask the sensitive credentials or information and make a push to the desired branch of the repository.
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              2
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 2</h5>
            <small>
            The top commit must be clean and must not have any sensitive data that we want to remove
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              3
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 3</h5>
            <small>
            Install BFG repo cleaner using the command: <code> brew install bfg </code>
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              4
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 4</h5>
            <small>
            Clone down a local copy of the affected repository using the command: <code> git clone --mirror reponame </code>
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              5
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 5</h5>
            <small>
            As mentioned earlier, it is highly recommended to keep a backup locally of the current repository, in case of any mistakes.
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              6
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 6</h5>
            <small>
            Create a passwords.txt file in the same working directory with each secret/password separated by a new line.
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              7
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 7</h5>
            <small>
            Run bfg tool to clean all the previous commits:<code> bfg --replace-text passwords.txt  reponame.git </code>
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              8
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 8</h5>
            <small>
            Check the logs of the repository and review the state of the local repository, and verify that all the secrets have been replaced with <code>***REMOVED***</code> placeholder.
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              9
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 9</h5>
            <small>
            Force push the changes back up to Bitbucket to overwrite the repository's existing commit history using the command: <code> git push origin --force </code>
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              10
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 10</h5>
            <small>
            Raise a support ticket to Atlassian, to remove the commit from the Bitbucket cache.
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              11
            </div>
            <Step />
          </div>
          <div>
            <h5>Step 11</h5>
            <small>
            Any users cloning or forking from this repository should be asked to git rebase any branches that contain the old repository history. It is important to rebase and not merge, as merging could result in the sensitive data being reintroduced into the now clean git history of the main repository. 
            </small>
          </div>
        </div>
        <div className="flex mb-1">
          <div className="flex flex-col pr-4 items-center">
            <div className="rounded-full py-1 px-3 bg-green-500 text-white mb-1 border border-opacity-60">
              12
            </div>
            {/*  */}
          </div>
          <div>
            <h5>Step 12</h5>
            <small>
            Lastly, be sure to force all objects in your local repository to be garbage collected using the commands
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToRemediate;

const Step: FC = () => {
  return <div className="border-l border-opacity-70 h-28" />;
};

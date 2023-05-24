# Branch comparer

This repo provides a simple script to compare two branches of a git repository.  
It can be helpful in a microservice architecture, where you have a lot of repositories,
and you want to know which of them are outdated.

For example, you have this git branch merging flow:
```text
dev -> qa -> demo -> master
```
You can use this script to compare `dev` with `qa` or `qa` with `demo` for all you repositories
to find out whether you need to update the specific environment, or changes have already been merged by someone.

## Examples of raw wrapper usage

### Request to get branch info

Call
```js
const repoName = 'spring-tcp-messaging-example';
const repoOwner = 'asidko';
const repoBranch = 'master';

githubApi.getBranchInfo(repoOwner, repoName, repoBranch).then(console.log);
```
or use REST API
```bash
 curl http://localhost:3000/api/branch/info?url=https://github.com/asidko/spring-tcp-messaging-example.git&branch=master
```

Result:
```js
{
    status: 'OK',
    branchName: 'master',
    lastCommitSha: 'a2415c4f09d2894b0e14f47131973ec5e6e5e3f3',
    lastCommitMessage: 'Init commit'
}
```
Now we know the latest commit hash and name in the selected branch.

### Request to get branch info

SDK
```js
const repoName = 'TelegramBots';
const repoOwner = 'rubenlagus';
const repoBranch = 'master';  // branch we want to compare
const repoBaseBranch = 'dev'; // base branch to compare with

githubApi.compareBranches(repoOwner, repoName, repoBaseBranch, repoBranch).then(console.log);
```
or use REST API
```bash
curl http://localhost:3000/api/branch/compare?url=https://github.com/rubenlagus/TelegramBots.git&branch=master&baseBranch=dev
```
Result:
```js
{
    status: 'OK',
    branchName: 'master',
    baseBranchName: 'dev',
    branchStatus: 'AHEAD',
    behindCommitCount: 0,
    aheadCommitCount: 2
}
```
We can tell from the result that the `master` is more recent than `dev` by 2 commits, this means if we want to make them equal, we should update `dev` merging `master` into it.
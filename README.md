# Branch comparer

This repo provides a simple script to compare two branches of a git repository.  
It can be helpful in microservice architecture, where you have a lot of repositories,
and you want to know which of them are outdated.

## Examples of raw wrapper usage

### Request to get branch info

Call
```js
const repoName = 'spring-tcp-messaging-example';
const repoOwner = 'asidko';
const repoBranch = 'master';

githubApi.getBranchInfo(repoOwner, repoName, repoBranch).then(console.log);
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

Call
```js
const repoName = 'TelegramBots';
const repoOwner = 'rubenlagus';
const repoBranch = 'master';  // branch we want to compare
const repoBaseBranch = 'dev'; // base branch to compare with

githubApi.compareBranches(repoOwner, repoName, repoBaseBranch, repoBranch).then(console.log);
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
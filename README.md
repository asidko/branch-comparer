# Branch comparer

This repo provides a simple script to compare two branches of a git repository.  
It can be helpful in a microservice architecture, where you have a lot of repositories,
and you want to know which of them are outdated.

For example, you have such branches in each of your repositories, that represent your release flow:
```text
dev -> test -> master
```
You can use this script to compare branches: `dev` with `test` or `test` with `master` for all you repositories
to find out whether you need to update the specific environment or it's already up-to-date.

Here is an example how I use it in combination with Google Sheets (calls this API from there)
![Calling branch comparer from Google Sheets](https://github.com/asidko/branch-comparer/assets/22843881/e8a1d306-c307-4cce-a20c-3a45f29c1cc6)

## Getting started

To be able to access private repositories you need to provide a GitHub token.

You can generate a new token here: https://github.com/settings/tokens?type=beta  
Set: `Repository access` to `All repositories`  
Set: `Permissions -> Repository permissions -> Contents` to `Read-only`

## Usage

To quickly test the project, try ready-to-use docker [image](https://hub.docker.com/repository/docker/windranger/branch-comparer):
```bash
docker run -e GITHUB_TOKEN=<your_token> -p 3000:3000  windranger/branch-comparer:v2.0.1
```

You can find `curl` test queries below.

## Build

Build the docker image and run it
```bash
docker build -t branch-comparer .
docker run -e GITHUB_TOKEN=<your_token> -p 3000:3000 branch-comparer
```

Using sources
```bash
npm install
node index.js --token <your_token>
```

## Examples

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

### Request to compare two branches

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

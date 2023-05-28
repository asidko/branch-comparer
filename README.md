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
![Calling branch comparer from Google Sheets](https://github.com/asidko/locins/assets/22843881/24f640aa-fadc-42c4-a0ae-6ad58b0ec923)
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

### Get branch info

Request to get info for branch `master`

```bash
 curl http://localhost:3000/api/branch/info?url=https://github.com/asidko/spring-tcp-messaging-example.git&branch=master
```

Result:
```json
{
  "status": "OK",
  "branchName": "master",
  "lastCommitSha": "a2415c4f09d2894b0e14f47131973ec5e6e5e3f3",
  "lastCommitMessage": "Init commit"
}
```
Now we know the latest commit hash and name in the selected branch.

### Compare branches

Request to compare `dev` with `master` branch to know how much `dev` is behind or ahead of `master`

```bash
curl http://localhost:3000/api/branch/compare?url=https://github.com/rubenlagus/TelegramBots.git&branch=dev&baseBranch=master
```
Result:
```json
{
   "status": "OK",
   "branchName": "dev",
   "baseBranchName": "master",
   "branchStatus": "AHEAD",
   "behindCommitCount": 0,
   "aheadCommitCount": 3
}
```
We can tell from the result that the `dev` is more recent than `master` and ahead of it commits with 3 commits, this means if we want to make them equal, we should update `master` merging `dev` into it.

### Merge branches

Request to merge `dev` into `master` branch

```bash
curl -X POST http://localhost:3000/api/branch/merge?url=https://github.com/asidko/spring-tcp-messaging-example.git&branch=dev&baseBranch=master
```

Result:
```json
{
   "status": "OK",
   "branchName": "dev",
   "baseBranchName": "master",
   "commitCount": 3
}
```
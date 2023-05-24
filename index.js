// Do not forget to set your GitHub API token in environment variable GITHUB_TOKEN or pass as --token argument
// **************************************************************
// You can generate a new token here: https://github.com/settings/tokens?type=beta
// Set: Repository access -> All repositories
// Set: Permissions -> Repository permissions -> Contents -> Read-only

/// To run from command line:
// node index.js --token <your_token>

const githubApi = require('./github_api');

const express = require('express');

const app = express();
const port = Number(process.env.port || 3000);

app.use('/api/branch', require('./branch_api'));
app.listen(port, () => {
    console.log(`⚡️REST app is listening at http://localhost:${port}`);
    demo();
});

async function demo() {
    console.log("We're going to get info about some public repositories for demo purposes\n");
    let repoName, repoOwner, repoBranch, repoBaseBranch;

    console.log("Example 1")
    repoName = 'spring-tcp-messaging-example';
    repoOwner = 'asidko';
    repoBranch = 'master';
    console.log("Repository: " + repoName + " of user/company: " + repoName);
    console.log(`curl -X GET http://localhost:${port}/api/branch/info?url=https://github.com/${repoOwner}/${repoName}.git&branch=${repoBranch}`)
    await githubApi.getBranchInfo(repoOwner, repoName, repoBranch).then(console.log);

    console.log("\nExample 2")
    repoName = 'TelegramBots';
    repoOwner = 'rubenlagus';
    repoBranch = 'master';
    repoBaseBranch = 'dev';
    console.log(`Branch diff compare: '${repoBranch}' to '${repoBaseBranch}' in repository: ${repoName} of user/company: ${repoOwner}`);
    console.log(`curl -X GET http://localhost:${port}/api/branch/compare?url=https://github.com/${repoOwner}/${repoName}.git&branch=${repoBranch}&baseBranch=${repoBaseBranch}`)
    await githubApi.compareBranches(repoOwner, repoName, repoBaseBranch, repoBranch).then(console.log);
}


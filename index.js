// Do not forget to set your GitHub API token in environment variable GITHUB_TOKEN or pass as --token argument
// **************************************************************
// You can generate a new token here: https://github.com/settings/tokens?type=beta
// Set: Repository access -> All repositories
// Set: Permissions -> Repository permissions -> Contents -> Read-only

/// To run from command line:
// node index.js --token <your_token>

const githubApi = require('./github_api');

async function demo() {
    console.log("We're going to get info about some public repositories for demo purposes\n");
    let repoName, repoOwner, repoBranch, repoBaseBranch;

    console.log("Example 1")
    repoName = 'spring-tcp-messaging-example';
    repoOwner = 'asidko';
    repoBranch = 'master';
    console.log("Repository: " + repoName + " of user/company: " + repoName);
    await githubApi.getBranchInfo(repoOwner, repoName, repoBranch).then(console.log);

    console.log("\nExample 2")
    repoName = 'TelegramBots';
    repoOwner = 'rubenlagus';
    repoBranch = 'master';
    repoBaseBranch = 'dev';
    console.log(`Branch diff compare: '${repoBranch}' to '${repoBaseBranch}' in repository: ${repoName} of user/company: ${repoOwner}`);
    await githubApi.compareBranches(repoOwner, repoName, repoBaseBranch, repoBranch).then(console.log);
}

demo();
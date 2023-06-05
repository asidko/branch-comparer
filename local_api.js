const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');

const projectRoot = path.resolve(__dirname);
const tempReposDir = path.join(projectRoot, 'temp_repos');
if (!fs.existsSync(tempReposDir)) {
    fs.mkdirSync(tempReposDir);
}

/**
 * Merge two branches
 *
 * Example response:
 * {
 *   status: 'OK,
 *   branchName: 'dev',
 *   baseBranchName: 'master',
 *   commitCount: 3
 * }
 *
 * @param gitUrl git url of the repository to clone (e.g. https://github.com/MyCompany/auth-service.git)
 * @param base_branch branch where the changes will be merged (e.g. master)
 * @param head_branch branch to merge (e.g. dev)
 * @return {Promise<{status: string, baseBranchName: string, branchName: string, commitCount: number,}>}
 */
async function mergeBranches(gitUrl, base_branch, head_branch) {
    console.log('Local Git repository. Merge branches %s/%s/%s/%s', gitUrl, base_branch, head_branch);
    try {
        gitUrl = gitUrl.includes(".git") ? gitUrl : gitUrl + ".git";
        const repoName = _extractRepoNameFromGitUrl(gitUrl);
        const pathToRepo = path.join(tempReposDir, repoName);
        if (fs.existsSync(pathToRepo))
            fs.rmSync(pathToRepo, {recursive: true});

        await simpleGit().clone(gitUrl, pathToRepo);

        const git = simpleGit({ baseDir: pathToRepo });

        await git.checkout(base_branch); // Switch to the base branch
        await git.pull(); // Pull the latest changes from the remote base branch

        if (!head_branch.includes("/")) {
            head_branch = "origin/" + head_branch;
        }

        const mergeResult = await git.mergeFromTo(head_branch, base_branch); // Merge the head branch into the base branch

        await git.push('origin', base_branch);

        fs.rmSync(pathToRepo, {recursive: true});

        if (mergeResult.failed) {
            console.error('Merge failed. Possible conflicts.');
            return {
                status: 'ERROR',
                branchName: head_branch,
                baseBranchName: base_branch,
                commitCount: 0,
            };
        }

        const commitCount = mergeResult.summary.changes.length;

        return {
            status: 'OK',
            branchName: head_branch,
            baseBranchName: base_branch,
            commitCount,
        };
    } catch (error) {
        console.error('Unexpected error', error);
        return {
            status: 'ERROR',
            branchName: head_branch,
            baseBranchName: base_branch,
            commitCount: 0,
        };
    }
}

function _extractRepoNameFromGitUrl(gitUrl) {
    return gitUrl.split('/').pop().replace('.git', '');
}

module.exports.mergeBranches = mergeBranches;
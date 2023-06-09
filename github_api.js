const {Octokit} = require("@octokit/rest");

const tokenArgIndex = process.argv.findIndex(arg => arg === '--token');
const tokenFromEnv = process.env.GITHUB_TOKEN;
const token = tokenArgIndex > -1 && process.argv.length > tokenArgIndex + 1 ? process.argv[tokenArgIndex + 1] : tokenFromEnv;

if (!token) {
    console.warn("GitHub token is not set. Private repositories will not be available to you. Please set your GitHub API token in environment variable GITHUB_TOKEN or pass as --token argument");
}

const octokit = new Octokit({
    auth: tokenFromEnv, // replace with your GitHub token or use the GITHUB_TOKEN env variable
});

const REQUEST_STATUS = {
    OK: "OK",
    ERROR: "ERROR",
    NOT_FOUND: "NOT_FOUND"
}
const BRANCH_STATUS = {
    EQUAL: "EQUAL",
    AHEAD: "AHEAD",
    BEHIND: "BEHIND",
    DIVERGED: "DIVERGED",
    UNKNOWN: "UNKNOWN"
}

const githubApiMapper = {
    mapGetBranchResponse(responseData) {
        return ({
            status: REQUEST_STATUS.OK,
            branchName: responseData.name,
            lastCommitSha: responseData.commit.sha,
            lastCommitMessage: responseData.commit.commit.message
        })
    },
    mapCompareCommitsResponse(responseData, branchName, baseBranchName) {
        return ({
            status: REQUEST_STATUS.OK,
            branchName: branchName,
            baseBranchName: baseBranchName,
            branchStatus: this._mapBranchStatus(responseData.status),
            behindCommitCount: responseData.behind_by,
            aheadCommitCount: responseData.ahead_by
        })
    },
    _mapCreatePullRequestResponse(responseData) {
        return ({
            branchName: responseData.head.ref,
            baseBranchName: responseData.base.ref,
            commitCount: responseData.commits,
            pullRequestNumber: responseData.number
        })
    },
    _mapMergeBranchesResponse(responseData) {
        return ({
            merged: responseData.merged
        })
    },
    _mapBranchStatus(githubStatus) {
        switch (githubStatus) {
            case 'identical':
                return BRANCH_STATUS.EQUAL;
            case 'ahead':
                return BRANCH_STATUS.AHEAD;
            case 'behind':
                return BRANCH_STATUS.BEHIND;
            case 'diverged':
                return BRANCH_STATUS.DIVERGED;
            default:
                return BRANCH_STATUS.UNKNOWN;
        }
    }
}
const githubApi = {
    /**
     * Get branch information
     *
     * Example response:
     * ```
     * {
     *   status: 'OK',
     *   branchName: 'master',
     *   lastCommitSha: '2a11cbc9b9a69c523dda961cc24ce544a1a7b78e',
     *   lastCommitMessage: 'Fixed bug with the login page'
     * }
     * ```
     * Example response when branch or repo not found:
     * ```
     * {
     *   status: 'NOT_FOUND',
     *   branchName: 'dev'
     * }
     * ```
     * @param owner github user or organization where the repo is located (e.g. MyCompany)
     * @param repo repository name (e.g. auth-service)
     * @param branch branch name (e.g. master)
     * @return {Promise<{lastCommitSha: string, lastCommitMessage: string, branchName: string, status: string}>}
     */
    async getBranchInfo(owner, repo, branch) {
        console.log('Github API. Getting branch info for %s/%s/%s', owner, repo, branch)
        return octokit.repos.getBranch({owner, repo, branch})
            .then(({data}) => githubApiMapper.mapGetBranchResponse(data))
            .catch(e => {
                if (e.status === 404) {
                    console.error('Repository %s or branch %s not found', repo, branch);
                    return {status: REQUEST_STATUS.NOT_FOUND, branchName: branch};
                } else {
                    console.error('Unexpected error', e);
                    return {status: REQUEST_STATUS.ERROR, branchName: branch};
                }
            })
    },

    /**
     * Compare two branches
     *
     * Example response:
     * ```
     * {
     *   status: 'OK',
     *   branchName: 'dev',
     *   baseBranchName: 'master',
     *   branchStatus: 'AHEAD', // EQUAL, AHEAD, BEHIND
     *   behindCommitCount: 3,   // number of commits behind base branch
     *   aheadCommitCount: 0     // number of commits ahead of base branch
     * }
     *  ```
     * @param owner github user or organization where the repo is located (e.g. MyCompany)
     * @param repo repository name (e.g. auth-service)
     * @param base_branch base branch name (e.g. dev)
     * @param head_branch target branch we want to compare with the base branch (e.g. master)
     * @return {Promise<{status: string, branchStatus: string, branchName: string, baseBranchName: string, behindCommitCount: number, aheadCommitCount: number}>}
     */
    async compareBranches(owner, repo, base_branch, head_branch) {
        console.log('Github API. Comparing branches %s/%s/%s/%s', owner, repo, base_branch, head_branch)
        return octokit.repos.compareCommits({owner, repo, base: base_branch, head: head_branch})
            // Get only the data we need
            .then(({data}) => ({
                // status: identical, ahead, behind, diverged
                status: data.status,
                // number of commits behind base branch
                ahead_by: data.ahead_by,
                // number of commits ahead of base branch
                behind_by: data.behind_by
            }))
            // Map the response to our own format
            .then(responseData => githubApiMapper.mapCompareCommitsResponse(responseData, head_branch, base_branch))
            .catch(e => {
                if (e.status === 404) {
                    console.error('Repository %s or branch %s not found', repo, base_branch);
                    return {status: REQUEST_STATUS.NOT_FOUND, branchName: head_branch, baseBranchName: base_branch}
                } else {
                    console.error('Unexpected error', e);
                    return {status: REQUEST_STATUS.ERROR, branchName: head_branch, baseBranchName: base_branch};
                }
            })
    },

    /**
     * Merge two branches
     *
     * Example response:
     * ```
     * {
     *   status: 'OK,
     *   branchName: 'dev',
     *   baseBranchName: 'master',
     *   commitCount: 3
     * }
     * ```
     * @param owner github user or organization where the repo is located (e.g. MyCompany)
     * @param repo repository name (e.g. auth-service)
     * @param base_branch branch where the changes will be merged (e.g. master)
     * @param head_branch branch to merge (e.g. dev)
     * @return {Promise<{status: string, baseBranchName: string, branchName: string, commitCount: number,}>}
     */
    async mergeBranches(owner, repo, base_branch, head_branch) {
        console.log('Github API. Merge branches %s/%s/%s/%s', owner, repo, base_branch, head_branch)

        async function createPullRequest() {
            console.log('Creating pull request to merge %s into %s', head_branch, base_branch)

            const title = `Merge ${head_branch} into ${base_branch}`;
            return octokit.pulls.create({owner, repo, title, head: head_branch, base: base_branch})
                .then(({data}) => githubApiMapper._mapCreatePullRequestResponse(data))
                .catch(e => {
                    if (e.status === 422) console.error('Pull request was not created. Possible conflicts or not found branches.');
                    else console.error('Unexpected error', e);
                    throw e;
                })
        }

        async function mergePullRequest(pullRequestNumber) {
            console.log('Merging pull request #%s', pullRequestNumber)

            return octokit.pulls.merge({owner, repo, pull_number: pullRequestNumber})
                .then(({data}) => githubApiMapper._mapMergeBranchesResponse(data))
                .catch(e => {
                    if (e.status === 405) console.error('Pull request #%s cannot be merged. Possible conflicts.', pullRequestNumber);
                    else console.error('Unexpected error', e);
                    throw e;
                })
        }

        return createPullRequest()
            .then(async pullRequest => {
                const merged = await mergePullRequest(pullRequest.pullRequestNumber);
                return {
                    status: merged ? REQUEST_STATUS.OK : REQUEST_STATUS.ERROR,
                    branchName: head_branch,
                    baseBranchName: base_branch,
                    commitCount: pullRequest.commitCount
                }
            })
            .catch(() => ({
                status: REQUEST_STATUS.ERROR,
                branchName: head_branch,
                baseBranchName: base_branch,
                commitCount: 0
            }))
    }
}

module.exports = githubApi;
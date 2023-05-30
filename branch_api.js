const express = require('express');
const {getOwnerAndRepoFromUrl} = require("./helper");
const githubApi = require("./github_api");
const router = express.Router();

router.get('/info', async (req, res) => {
    console.log("REST. GET /api/branch-info. Getting branch info for repository: " + req.query.url + " branch: " + req.query.branch);
    validateRequiredParams(req, res, ['url', 'branch'])
    const repoUrl = req.query.url;
    const branchName = req.query.branch;
    const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
    const branchInfo = await githubApi.getBranchInfo(repoOwner, repoName, branchName);
    res.json(branchInfo);
});
router.get('/compare', async (req, res) => {
    console.log("REST. GET /api/branch-compare. Comparing branches for repository: " + req.query.url + " branch: " + req.query.branch + " baseBranch: " + req.query.baseBranch)
    validateRequiredParams(req, res, ['url', 'branch', 'baseBranch'])
    const repoUrl = req.query.url;
    const branchName = req.query.branch;
    const baseBranchName = req.query.baseBranch;
    const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
    const branchCompareResult = await githubApi.compareBranches(repoOwner, repoName, baseBranchName, branchName);
    res.json(branchCompareResult);
});
router.get('/merge', async (req, res) => {
    console.log("REST. GET /api/merge. Merging branches for repository: " + req.query.url + " branch: " + req.query.branch + " baseBranch: " + req.query.baseBranch)
    validateRequiredParams(req, res, ['url', 'branch', 'baseBranch'])
    const repoUrl = req.query.url;
    const branchName = req.query.branch;
    const baseBranchName = req.query.baseBranch;
    const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
    const mergeResult = await githubApi.mergeBranches(repoOwner, repoName, baseBranchName, branchName);
    res.json(mergeResult);
});
function validateRequiredParams(req, res, requiredParamNames) {
    const missingParams = [];
    requiredParamNames.forEach(paramName => {
        if (!req.query[paramName]) missingParams.push(paramName);
    });
    if (missingParams.length > 0) {
        res.status(400).json({error: `Missing required query parameters: ${missingParams.join(', ')}`});
    }
}

module.exports = router;
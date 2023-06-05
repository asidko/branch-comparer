const express = require('express');
const {getOwnerAndRepoFromUrl} = require("./helper");
const githubApi = require("./github_api");
const localApi = require("./local_api");
const router = express.Router();

router.get('/info', async (req, res) => {
    console.log("REST. GET /api/branch-info. Getting branch info for repository: " + req.query.url + " branch: " + req.query.branch);
    validateRequiredParams(req, res, ['url', 'branch'])
    const {
        url: repoUrl,
        branch: branchName,
    } = req.query;
    const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
    const branchInfo = await githubApi.getBranchInfo(repoOwner, repoName, branchName);
    res.json(branchInfo);
});
router.get('/compare', async (req, res) => {
    console.log("REST. GET /api/branch-compare. Comparing branches for repository: " + req.query.url + " branch: " + req.query.branch + " baseBranch: " + req.query.baseBranch)
    validateRequiredParams(req, res, ['url', 'branch', 'baseBranch'])
    const {
        url: repoUrl,
        branch: branchName,
        baseBranch: baseBranch,
    } = req.query;
    const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
    const branchCompareResult = await githubApi.compareBranches(repoOwner, repoName, baseBranch, branchName);
    res.json(branchCompareResult);
});
router.get('/merge', async (req, res) => {
    console.log("REST. GET /api/merge. Merging branches for repository: " + req.query.url + " branch: " + req.query.branch + " baseBranch: " + req.query.baseBranch)
    validateRequiredParams(req, res, ['url', 'branch', 'baseBranch'])
    const {
        url: repoUrl,
        branch: branchName,
        baseBranch: baseBranch,
        locally = 'false',
    } = req.query;

    let mergeResult = {};

    if (locally === 'true') {
        mergeResult = await localApi.mergeBranches(repoUrl, baseBranch, branchName);
    } else {
        const {repoOwner, repoName} = getOwnerAndRepoFromUrl(repoUrl);
        mergeResult = await githubApi.mergeBranches(repoOwner, repoName, baseBranch, branchName);
    }
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
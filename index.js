// Do not forget to set your GitHub API token in environment variable GITHUB_TOKEN or pass as --token argument
// **************************************************************
// You can generate a new token here: https://github.com/settings/tokens?type=beta
// Set: Repository access -> All repositories
// Set: Permissions -> Repository permissions -> Contents -> Read-only

/// To run from command line:
// node index.js --token <your_token>

const express = require('express');

const app = express();
const port = Number(process.env.port || 3000);

app.use('/api/branch', require('./branch_api'));

app.listen(port, () => {
    console.log(`⚡️REST app is listening at http://localhost:${port}`);
});
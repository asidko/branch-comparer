module.exports = {
    getOwnerAndRepoFromUrl(url) {
        const regex = /github.com\/(.*)\/(.+?)(?:\.git)?$/;
        const match = regex.exec(url);
        if (match) {
            return {repoOwner: match[1], repoName: match[2]};
        } else {
            throw new Error('Invalid github url');
        }
    }
};
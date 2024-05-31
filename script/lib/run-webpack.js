'use strict';

const {spawnSync} = require('child_process');
const path = require('path');

const {getWebpackPath, repositoryRootPath, intermediateAppPath} = require('../config');

module.exports = function (release = true) {
    console.log('Running webpack.');
    const res = spawnSync(
        getWebpackPath(),
        ['--colors', '--config', `webpack.config.js`, '--mode', 'production'],
        {env: process.env, cwd: repositoryRootPath, stdio: 'inherit'}
    );
    if (res.status !== 0) {
        console.error('Error running webpack.')
        throw new Error('Error running webpack.');
    }
};

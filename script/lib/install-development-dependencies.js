'use strict';

const {execFileSync} = require('child_process');
const path = require('path');
const fs = require('fs');

const {getNpmBinPath, getYarnBinPath, repositoryRootPath} = require('../config');
const pkgJson = require('../../package.json');

module.exports = () => {
    console.log('Installing development dependencies.');
    execFileSync(
        getYarnBinPath(),
        ['install'],
        {env: process.env, cwd: repositoryRootPath, stdio: 'inherit'}
    );
};

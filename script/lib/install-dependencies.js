'use strict';

const {execFileSync} = require('child_process');
const path = require('path');
const fs = require('fs-plus');

const {getNpmBinPath, repositoryRootPath, intermediateAppPath} = require('../config');

module.exports = () => {
    console.log('Installing dependencies.');   
    execFileSync(
        getNpmBinPath(),
        ['--no-package-lock', 'install'],
        {env: process.env, cwd: intermediateAppPath, stdio: 'inherit'}        
    );
}; 
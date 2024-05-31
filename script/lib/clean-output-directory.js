'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getNpmBinPath, repositoryRootPath, buildOutputPath} = require('../config');

module.exports = () => {        
    if (fs.existsSync(buildOutputPath)) {
        console.log(`Cleaning ${buildOutputPath}.`);
        fs.removeSync(buildOutputPath);
    }
};
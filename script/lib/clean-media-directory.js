'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getNpmBinPath, repositoryRootPath, mediaOutputPath} = require('../config');

module.exports = () => {        
    if (fs.existsSync(mediaOutputPath)) {
        console.log(`Cleaning ${mediaOutputPath}.`);
        fs.removeSync(mediaOutputPath);
    } 
};
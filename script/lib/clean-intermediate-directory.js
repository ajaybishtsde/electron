'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getNpmBinPath, repositoryRootPath, intermediateAppPath} = require('../config');

module.exports = () => {        
    if (fs.existsSync(intermediateAppPath)) {
        console.log(`Cleaning ${intermediateAppPath}.`);
        fs.removeSync(intermediateAppPath);
    } 
};
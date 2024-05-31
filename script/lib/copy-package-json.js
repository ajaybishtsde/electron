'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getNpmBinPath, repositoryRootPath, intermediateAppPath} = require('../config');
const pkgJson = require('../../package.json');

module.exports = () => {    
    console.log('Copying package.json.');
    const pkgJsonCopy = Object.assign({}, pkgJson);
    delete pkgJsonCopy.devDependencies;
    delete pkgJsonCopy.optionalDependencies;   
    delete pkgJsonCopy.scripts;    
    fs.makeTreeSync(path.resolve(intermediateAppPath));
    fs.writeFileSync(path.resolve(intermediateAppPath, 'package.json'), JSON.stringify(pkgJsonCopy, void 0, '\t'));
};
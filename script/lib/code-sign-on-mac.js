'use strict';

const {spawnSync} = require('child_process');
const path = require('path');

const {getWebpackPath, repositoryRootPath, intermediateAppPath, getXcodeSigningIdentity} = require('../config');

module.exports = function (packagedAppPath) {
    let res;
    
    console.log(`Code-signing auto-update binary at ${packagedAppPath}.`);  
    res = spawnSync(
        'codesign',
        ['--force', '-vvvv', '--sign', getXcodeSigningIdentity(), `${packagedAppPath}/Ryver.app/Contents/Frameworks/Squirrel.framework/Versions/A/Squirrel`],
        {env: process.env, cwd: repositoryRootPath}        
    );
    if (res.status !== 0) {
        console.error('Error code-signing application.')        
        console.error('Error=', res.error);
        console.error(res.stderr.toString());
        throw new Error('Error code-signing application.');
    }  

    console.log(`Code-signing application at ${packagedAppPath}.`);  
    res = spawnSync(
        'codesign',
        ['--deep', '--force', '-vvvv', '--sign', getXcodeSigningIdentity(), `${packagedAppPath}/Ryver.app`],
        {env: process.env, cwd: repositoryRootPath}        
    );
    if (res.status !== 0) {
        console.error('Error code-signing application.')        
        console.error('Error=', res.error);
        console.error(res.stderr.toString());
        throw new Error('Error code-signing application.');
    }  

    console.log(`Checking code-signing application at ${packagedAppPath}.`);  
    res = spawnSync(
        'spctl',
        ['--verbose=4', '--assess', '--type', 'execute', `${packagedAppPath}/Ryver.app`],
        {env: process.env, cwd: repositoryRootPath}        
    );
    if (res.status !== 0) {
        console.error('Error code-signing application.')        
        console.error('Error=', res.error);
        console.error(res.stderr.toString());
        throw new Error('Error code-signing application.');
    }
};
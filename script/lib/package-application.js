const assert = require('assert');
const path = require('path');
const fs = require('fs-plus');
const electronPackager = require('@ryverapp/electron-packager');
const {productName, companyName, appVersion, electronVersion, repositoryRootPath, buildOutputPath, intermediateAppPath} = require('../config');

module.exports = (arch) => {    
    console.log(`Packaging ${intermediateAppPath}.`);
    return runPackager({
        name: productName,
        dir: intermediateAppPath,
        out: buildOutputPath,
        arch: arch,        
        electronVersion: electronVersion,
        appVersion: appVersion,           
        icon: getIcon(),
        appBundleId: 'com.ryver.desktop',
        helperBundleId: 'com.ryver.desktop.helper',
        packageManager: false,
        prune: false,
        win32metadata: {
            CompanyName: companyName,
            ProductName: productName,
            FileDescription: productName,
            LegalCopyright: `Copyright (C) ${(new Date()).getFullYear()} ${companyName} All rights reserved.`,
            ProductVersion: appVersion
        },     
        asar: {                    
            unpackDir: '**/node_modules/**'
        },
        afterCopy: [trimDependencies]
    });  
}

function trimDependencies(tempPath, electronVersion, platform, arch, cb) {
    const cldModulePath = path.resolve(tempPath, 'node_modules/@paulcbetts/cld/deps/cld');  
    if (fs.existsSync(cldModulePath)) {
        console.log(`Cleaning ${cldModulePath}.`);
        fs.removeSync(cldModulePath);
    }
    cb();
}

function getIcon() {
    switch (process.platform) {
        case 'darwin': return path.join(repositoryRootPath, 'resources/mac/app.icns');
        case 'win32': return path.join(repositoryRootPath, 'resources/win/app.ico');       
    }
}

function renamePackagedAppDir(packageOutputDirPath) {
    return packageOutputDirPath;
}

function runPackager(options) {
    return new Promise((resolve, reject) => {
        electronPackager(options, (err, packageOutputDirPaths) => {
            if (err) {
                reject(err);
                throw new Error(err);
            } else {
                assert(packageOutputDirPaths.length === 1, 'Generated more than one electron application!');
                const packagedAppPath = renamePackagedAppDir(packageOutputDirPaths[0])
                resolve(packagedAppPath)
            }
        })
    })
}
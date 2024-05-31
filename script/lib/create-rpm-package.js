'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getWebpackPath, repositoryRootPath, buildOutputPath, mediaOutputPath, productName, appVersion} = require('../config');

module.exports = function (packagedAppPath, arch) {
    return runMakeRpm({
        src: `${buildOutputPath}/Ryver-linux-${arch}`,
        dest: `${mediaOutputPath}`,
        arch: arch === 'x64' ? 'x86_64' : arch === 'ia32' ? 'i386' : '',
        bin: 'Ryver',
        icon: path.resolve(repositoryRootPath, 'resources/linux/icon.png'),
        categories: [
            'Utility',
            'Chat'
        ]
    })
}

function runMakeRpm(options) {
    const makeDeb = require('electron-installer-redhat');    
    return new Promise((resolve, reject) => {
        runMakeRpm(options, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
'use strict';

const {spawnSync} = require('child_process');
const fs = require('fs-plus');
const path = require('path');

const {getWebpackPath, repositoryRootPath, mediaOutputPath, productName, appVersion} = require('../config');

module.exports = function (packagedAppPath, arch) {
    console.log(`Creating disk image for ${packagedAppPath}.`);  
    fs.makeTreeSync(mediaOutputPath);
    const dmgPath = path.resolve(mediaOutputPath, `${productName}-${appVersion}.dmg`); 
    return runAppDmg({            
        target: dmgPath,
        basepath: packagedAppPath,            
        specification: {
            title: productName,
            icon: path.relative(packagedAppPath, path.resolve(__dirname, '../../resources/mac/app.icns')),
            background: path.relative(packagedAppPath, path.resolve(__dirname, '../../resources/mac/dmg-1.png')),
            'icon-size': 128,
            contents: [
                {x: 128, y: 288, type: 'link', path: '/Applications'},
                {x: 128, y: 128, type: 'file', path: `${productName}.app`},
            ]
        }
    });      
};

function runAppDmg(options) {
    const appdmg = require('appdmg');
    return new Promise((resolve, reject) => {
        const ee = appdmg(options);

        ee.on('progress', function (info) {
        });

        ee.on('finish', function () {
            resolve();            
        });

        ee.on('error', function (err) {
            reject(err);
            throw new Error(err);
        });
    });
}
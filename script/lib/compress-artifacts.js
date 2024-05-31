'use strict';

const {spawnSync} = require('child_process');
const fs = require('fs-plus');
const path = require('path');
const archiver = require('archiver');

const {getWebpackPath, repositoryRootPath, mediaOutputPath, productName, appVersion} = require('../config');

module.exports = function (packagedAppPath, arch) {
    console.log(`Compressing artifact at ${packagedAppPath}.`);  
    if (process.platform === 'darwin') {
        fs.makeTreeSync(mediaOutputPath);
        // NOTE: this MUST be done using the command line zip.  otherwise, library symlinks are not correct.                            
        const zipPath = path.resolve(mediaOutputPath, `${productName}-${appVersion}-mac-${arch}.zip`);
        const res = spawnSync(
            'zip',
            ['-Xyrq1', path.relative(packagedAppPath, zipPath), `${productName}.app`],
            {env: process.env, cwd: packagedAppPath}        
        );
        if (res.status !== 0) {
            console.error('Error compressing artifact.')        
            console.error('Error=', res.error);
            console.error(res.stderr.toString());
            throw new Error('Error compressing artifact.');
        }      
        return Promise.resolve();    
    } else if (process.platform === 'win32') {
        fs.makeTreeSync(mediaOutputPath);
        const zipPath = path.resolve(mediaOutputPath, `${productName}-${appVersion}-win-${arch}.zip`);
        return runArchiver(packagedAppPath, zipPath, 'zip');       
    } else {
        fs.makeTreeSync(mediaOutputPath);
        const zipPath = path.resolve(mediaOutputPath, `${productName}-${appVersion}-linux-${arch}.tar.gz`);
        return runArchiver(packagedAppPath, zipPath, 'tar', {
            gzip: true,
            gzipOptions: {
                level: 1
            }
        });     
    }
};

function runArchiver(packagedAppPath, archivePath, archiveKind, archiveOptions) {
    return new Promise((resolve, reject) => {
        const outStream = fs.createWriteStream(archivePath);
        
        outStream.on('close', resolve);
        
        const archive = archiver(archiveKind, archiveOptions);

        archive.on('error', reject);

        archive.pipe(outStream);
        archive.directory(`${packagedAppPath}/`, `/Ryver`);
        archive.finalize();    
    })
}
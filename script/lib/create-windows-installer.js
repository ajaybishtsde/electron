'use strict';

const {spawnSync} = require('child_process');
const path = require('path');
const fs = require('fs-plus');

const {getWebpackPath, repositoryRootPath, buildOutputPath, mediaOutputPath, productName, appVersion} = require('../config');

module.exports = function (packagedAppPath, arch, codeSign) {
    console.log(`Creating windows installer for ${packagedAppPath}.`);
    const {createWindowsInstaller} = require('electron-winstaller');
    const outputDirectory = `${mediaOutputPath}/${productName}-${appVersion}-win-${arch}`;
    const options = {
        // IMPORTANT: basePath is required here, otherwise `rcedit.exe` may have issues
        appDirectory: `${buildOutputPath}/Ryver-win32-${arch}`,
        outputDirectory: outputDirectory,
        setupIcon: `${repositoryRootPath}/resources/win/app.ico`,
        iconUrl: 'https://ryver-downloads.s3.amazonaws.com/images/favicon.ico',
        authors: 'Ryver, Inc.',
        exe: 'Ryver.exe',
        signWithParams: codeSign ? `/a /fd SHA256 /t http://timestamp.verisign.com/scripts/timstamp.dll /f "${process.env.RYVER_CODESIGN_PATH}" /p "${process.env.RYVER_CODESIGN_PASS}"` : void 0
    };

    return createWindowsInstaller(options).then(() => {
        fs.renameSync(`${outputDirectory}/${productName}Setup.exe`, `${outputDirectory}/${productName}Setup-${appVersion}-${arch}.exe`);
        fs.renameSync(`${outputDirectory}/${productName}Setup.msi`, `${outputDirectory}/${productName}MachineWideSetup-${appVersion}-${arch}.msi`);
    });
}

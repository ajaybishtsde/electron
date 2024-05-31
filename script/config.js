const path = require('path');
const fs = require('fs');
const pkgJson = require('../package.json');

const repositoryRootPath = path.resolve(__dirname, '..');
const nodeModulesPath = path.resolve(__dirname, '..', 'node_modules');
const scriptRootPath = path.join(repositoryRootPath, 'script');
const buildOutputPath = path.join(repositoryRootPath, 'out');
const intermediateAppPath = path.join(repositoryRootPath, 'app');
const mediaOutputPath = path.join(repositoryRootPath, 'media');
const productName = pkgJson.productName;
const companyName = pkgJson.author.name;
const appVersion = pkgJson.version;
const electronVersion = pkgJson.electronVersion;

function getNpmBinPath() {
    const npmBinName = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const localNpmBinPath = path.resolve(repositoryRootPath, 'script', 'node_modules', '.bin', npmBinName);
    return fs.existsSync(localNpmBinPath) ? localNpmBinPath : npmBinName;
}

function getYarnBinPath() {
    const yarnBinName = process.platform === 'win32' ? 'yarn.cmd' : 'yarn';
    const localYarnBinPath = path.resolve(repositoryRootPath, 'script', 'node_modules', '.bin', yarnBinName);
    return fs.existsSync(localYarnBinPath) ? localYarnBinPath : yarnBinName;
}

function getWebpackPath() {
    const webpackBinName = process.platform === 'win32' ? 'webpack.cmd' : 'webpack';
    const localWebpackBinName = path.resolve(repositoryRootPath, 'script', 'node_modules', '.bin', webpackBinName);
    return fs.existsSync(localWebpackBinName) ? localWebpackBinName : webpackBinName;
}

function getElectronPath() {
    const electronBinName = process.platform === 'win32' ? 'electron.cmd' : 'electron';
    const localElectronBinName = path.resolve(repositoryRootPath, 'script', 'node_modules', '.bin', electronBinName);
    return fs.existsSync(localElectronBinName) ? localElectronBinName : electronBinName;
}

function getXcodeSigningIdentity() {
    return process.env.XCODE_SIGNING_IDENTITY || 'Developer ID Application: Contatta, Inc (A57858N32G)';
}

module.exports = {
    productName, companyName, appVersion, electronVersion,
    repositoryRootPath, scriptRootPath, nodeModulesPath,
    buildOutputPath, intermediateAppPath,  mediaOutputPath,
    getNpmBinPath, getYarnBinPath, getWebpackPath, getElectronPath,
    getXcodeSigningIdentity
};

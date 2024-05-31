const path = require('path');
const rebuild = require('electron-rebuild').default;
const {electronVersion, intermediateAppPath} = require('../config');

module.exports = (arch) => {
    console.log(`Rebuilding dependencies for Electron ${electronVersion} ${arch} in ${intermediateAppPath}.`)    
    return rebuild({ buildPath: intermediateAppPath, electronVersion, arch })
        .then(() => {
            console.log('Rebuild successful.');
        })
        .catch((err) => {
            console.error('Rebuild error.');
            console.error(err);            
        });    
}
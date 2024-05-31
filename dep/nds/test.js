const desktopSessionStatus = require('./index');

setInterval(() => {
    console.log('isLockedOrOnScreensaver=', desktopSessionStatus.isLockedOrOnScreensaver());
}, 1000);
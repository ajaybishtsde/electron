const { MSICreator } = require('electron-wix-msi');
const path = require('path');

const APP_DIR = path.resolve(__dirname, './out/Ryver-win32-ia32');
const OUT_DIR = path.resolve(__dirname, './windows_installer');

const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    description: 'Ryver Desktop',
    exe: 'ryver',
    name: 'ryver',
    manufacturer: 'Ryver, Inc',
    version: '1.3.3',

    ui: {
        chooseDirectory: true
    },
});

msiCreator.create().then(function(){
    msiCreator.compile();
});
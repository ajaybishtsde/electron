'use strict';

const path = require('path');
const fs = require('fs-plus');

const {getWebpackPath, repositoryRootPath, buildOutputPath, mediaOutputPath, productName, appVersion} = require('../config');

module.exports = function (packagedAppPath, arch) {
    return runMakeDeb({
        src: `${buildOutputPath}/Ryver-linux-${arch}`,
        dest: `${mediaOutputPath}`,
        arch: arch === 'x64' ? 'amd64' : arch === 'ia32' ? 'i386' : '',
        bin: 'Ryver',
        icon: path.resolve(repositoryRootPath, 'resources/linux/icon.png'),
        section: 'misc',
        priority: 'optional',
        depends: [                    
            'gconf2',
            'gconf-service',
            'gvfs-bin',
            'libc6',                    
            'libgtk2.0-0',
            'libudev0 | libudev1',
            'libgcrypt11 | libgcrypt20',
            'libnotify4',
            'libnss3',
            'libxtst6',
            'python',
            'xdg-utils'
        ],

        categories: [
            'Utility',
            'Chat'
        ],
        lintianOverrides: [
            'atom: arch-dependent-file-in-usr-share',
            'atom: changelog-file-missing-in-native-package',
            'atom: copyright-file-contains-full-apache-2-license',
            'atom: copyright-should-refer-to-common-license-file-for-apache-2',
            'atom: embedded-library',
            'atom: package-installs-python-bytecode',
            'atom: unstripped-binary-or-object'
        ]
    })
}

function runMakeDeb(options) {
    const makeDeb = require('electron-installer-debian');    
    return new Promise((resolve, reject) => {
        makeDeb(options, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
/*
"grunt-electron-installer-debian": "0.3.1",
"grunt-electron-installer-redhat": "0.3.1"
'electron-installer-debian': {
    options: {
        bin: 'Ryver',
        icon: path.resolve(__dirname, '../resources/linux/icon.png'),
        section: 'misc',
        priority: 'optional',
        depends: [                    
            'gconf2',
            'gconf-service',
            'gvfs-bin',
            'libc6',                    
            'libgtk2.0-0',
            'libudev0 | libudev1',
            'libgcrypt11 | libgcrypt20',
            'libnotify4',
            'libnss3',
            'libxtst6',
            'python',
            'xdg-utils'
        ],
        categories: [
            'Utility',
            'Chat'
        ],
        lintianOverrides: [
            'atom: arch-dependent-file-in-usr-share',
            'atom: changelog-file-missing-in-native-package',
            'atom: copyright-file-contains-full-apache-2-license',
            'atom: copyright-should-refer-to-common-license-file-for-apache-2',
            'atom: embedded-library',
            'atom: package-installs-python-bytecode',
            'atom: unstripped-binary-or-object'
        ]
    },
    linux64: {
        options: {
            arch: 'amd64'
        },
        src: 'dist/Ryver-<%= platform %>-<%= arch %>',
        dest: 'media/'
    }
},
'electron-installer-redhat': {
    options: {
        bin: 'Ryver',
        icon: 'resources/linux/icon.png',                
        categories: [
            'Utility',
            'Chat'
        ]
    },
    linux64: {
        options: {
            arch: 'amd64'
        },
        src: 'dist/Ryver-<%= platform %>-<%= arch %>',
        dest: 'media/'
    }
}
*/
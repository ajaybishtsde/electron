'use strict';

const {spawn} = require('child_process');
const path = require('path');
const { intermediateAppPath} = require('../config');

const electronPath = "/home/icsl-011/.nvm/versions/node/v16.20.2/bin/electron" // TODO: Make this path dynamic 

module.exports = function () {
    const cproc = spawn(
        electronPath,
        ['-n', intermediateAppPath],
        {env: process.env, cwd: intermediateAppPath}
    );
    cproc.stdout.pipe(process.stdout);
    cproc.stderr.pipe(process.stderr);
};

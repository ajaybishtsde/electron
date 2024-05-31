/**
 * Adapted from: https://github.com/mikaelbr/node-notifier/blob/master/lib/utils.js
 * [MIT License](http://en.wikipedia.org/wiki/MIT_License)
 */

import * as os from 'os';
import { satisfies } from 'semver';

export function isLinux() {
    return os.type() === 'Linux';
}

export function isMac() {
    return os.type() === 'Darwin';
}

export function isMountainLion() {
    return os.type() === 'Darwin' && satisfies(garanteeSemverFormat(os.release()), '>=12.0.0');
}

export function isWin() {
    return os.type() === 'Windows_NT';
}

export function isWin81() {
    return os.type() === 'Windows_NT' && satisfies(garanteeSemverFormat(os.release()), '>=6.3.9200');
}

export function isWin8() {
    return os.type() === 'Windows_NT' && satisfies(garanteeSemverFormat(os.release()), '>=6.2.9200');
}

export function isLessThanWin8() {
    return os.type() === 'Windows_NT' && satisfies(garanteeSemverFormat(os.release()), '<6.2.9200');
}

function garanteeSemverFormat(version) {
    if (version.split('.').length === 2) {
        version += '.0';
    }
    return version;
}

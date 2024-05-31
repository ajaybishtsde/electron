
import * as ChildProcess from 'child_process';
import * as fs from 'fs-plus';
import * as path from 'path';
import { app } from 'electron';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:installers:win32`);

const updateDotExe = path.join(path.dirname(process.execPath), '..', 'Update.exe');
const updateDotExeExists = fs.existsSync(updateDotExe);
const exeName = path.basename(process.execPath);

export function isShortcutCreationSupported() {
    debug('isShortcutCreationSupported=', process.platform, updateDotExeExists);
    return (process.platform === 'win32') && updateDotExeExists;
}

function spawn(command: string, args: Array<string>, cb) {
    debug('spawn=', command, args);
    let stdout = '',
        process;
    try {
        process = ChildProcess.spawn(command, args);
    } catch (err) {
        console.log(err);
        /* tslint:disable-next-line no-unused-expression */
        cb && cb(err, stdout);
        return;
    }

    let error;
    process.stdout.on('data', data => stdout += data);
    process.stdout.on('data', data => debug('data=', data));
    process.on('error', err => error = error || err);
    process.on('close', (code, sig) => {
        if (code !== 0) {
            if (error === void 0) {
                error = new Error(`Command failed: ${sig || code}`);
            }
            if (error.code !== void 0) {
                error.code = code;
            }
            if (error.stdout !== void 0) {
                error.stdout = stdout;
            }
        }
        debug('err=', error, 'res=', stdout);
        /* tslint:disable-next-line no-unused-expression */
        cb && cb(error, stdout);
    });
}

function spawnUpdate(args: Array<string>, cb: Function) {
    return spawn(updateDotExe, args, cb);
}

export function createShortcut(cb?: Function) {
    LOG_INFO('creating shortcut');
    spawnUpdate(['--createShortcut', exeName], cb);
}

export function removeShortcut(cb?: Function) {
    LOG_INFO('removing shortcut');
    spawnUpdate(['--removeShortcut', exeName], cb);
}

export function createStartupShortcut(cb?) {
    LOG_INFO('creating startup shortcut');
    spawnUpdate(['--createShortcut', exeName, '--shortcut-locations', 'Startup'], cb);
}

export function removeStartupShortcut(cb?: Function) {
    LOG_INFO('removing startup shortcut');
    spawnUpdate(['--removeShortcut', exeName, '--shortcut-locations', 'Startup'], cb);
}

export function runInstallerCommand(command: string): boolean {
    switch (command) {
        case '--squirrel-install':
        case '--squirrel-updated':
            createShortcut(() => app.quit());
            return true;
        case '--squirrel-uninstall':
            removeShortcut(() => app.quit());
            return true;
        case '--squirrel-obsolete':
            // pre-update tasks on version about to be updated
            app.quit();
            return true;
        case '--squirrel-firstrun':
            // do any first-run tasks
            return false;
        default:
            return false;
    }
}

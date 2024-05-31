import { app, session, remote, dialog } from 'electron';
import * as url from 'url';
import * as path from 'path';
import * as fs from 'fs-plus';
import { Store } from 'redux';
import { createStore } from './store';
import { RootState } from '@modules/core/models/root';
import { runInstallerCommand } from './installers/win32';
import { ApplicationOptions } from './interfaces';
import { setup } from '../../extensions';
import keyboard from './extensions/keyboard';
import authentication from './extensions/authentication';
import * as commandLineArgs from 'command-line-args';
import pkgJson from '../../../package.json';
import { setPreference } from '@modules/core/actions/preference';
import { PREFERENCES, UpdateChannel } from '@modules/core/models/preference';
import { getPreference } from '@modules/core/selectors/preference';
import { prerelease } from 'semver';
import { LogLevel, setLogLevel } from '@log';

const NS = LOG_NS('browser:main');

function parseCommandLine(argv: Array<string>): ApplicationOptions {
    const args = commandLineArgs([
        { name: 'new-instance', alias: 'n', type: Boolean, defaultValue: false },
        { name: 'no-proxy', type: Boolean, defaultValue: false },
        { name: 'resource-path', alias: 'r', type: String, defaultOption: true },
        { name: 'update-channel', alias: 'u', type: String },
        { name: 'log-level', alias: 'l', type: String}
    ], <any>{
        // command-line-args ignores the first two args, which is fine in a NodeJS env, but is not correct in Electron.
        argv,
        partial: true,
        camelCase: true
    });

    if (fs.existsSync(args.resourcePath)) {
        process.resourcePath = path.resolve(args.resourcePath);
    } else {
        process.resourcePath = path.resolve(process.resourcesPath, 'app.asar');
    }

    return { ...args };
}

function isSetNoProxyServer() {
    // todo: this needs to be checked before store is available, find a more approrpiate way of storing this
    const STORAGE_PATH = path.resolve((app || remote.app).getPath('appData'), pkgJson.productName, 'Storage');
    if (fs.existsSync(STORAGE_PATH)) {
        try {
            const raw = JSON.parse(fs.readFileSync(STORAGE_PATH, 'utf8'));
            return raw.noProxyServer;
        } catch (err) {
            return false;
        }
    } else {
        return false;
    }
}

function runSingleInstanceCheck(opts: ApplicationOptions) {
    if (!opts.newInstance) {
        const isSecondary = app.makeSingleInstance((argv, workingDirectory) => {
            process.app.sendCommand('application:restore');
            return true;
        });

        if (isSecondary) {
            app.quit();
            return true;
        }
    }
    return false;
}

function setAppRuntimeCommandLine(opts: ApplicationOptions) {
    app.commandLine.appendSwitch('--js-flags', '--harmony');
    app.commandLine.appendSwitch('--enable-file-cookies');
    app.commandLine.appendSwitch('--disable-renderer-backgrounding');

    if (isSetNoProxyServer() || opts.noProxy) {
        LOG_INFO('using: --no-proxy-server');
        app.commandLine.appendSwitch('--no-proxy-server');
    }
}

async function appRuntimeSetup(opts: ApplicationOptions) {
    return new Promise(res => app.once('ready', () => {
        app.setAppUserModelId('com.squirrel.ryver.Ryver');
        session.defaultSession.allowNTLMCredentialsForDomains('*');
        res();
    }));
}

function toUpdateChannel(channel: string): UpdateChannel {
    switch (channel.toLowerCase()) {
        case 'alpha': return UpdateChannel.Alpha;
        case 'beta': return UpdateChannel.Beta;
        case 'stable': return UpdateChannel.Stable;
    }
    return null;
}

function ensureCorrectUpdateChannel(store: Store<RootState>, opts: ApplicationOptions) {
    if (opts.updateChannel) {
        LOG_INFO('setting update channel to=%s', opts.updateChannel);
        store.dispatch(setPreference(PREFERENCES.updateChannel, toUpdateChannel(opts.updateChannel)));
    } else {
        const updateChannel = getPreference(store.getState(), PREFERENCES.updateChannel);
        if (!updateChannel) {
            const preComps = prerelease(app.getVersion());
            if (preComps) {
                LOG_INFO('setting packaged update channel to=%s', toUpdateChannel(preComps[0]));
                store.dispatch(setPreference(PREFERENCES.updateChannel, toUpdateChannel(preComps[0])));
            }
        }
    }
}

function ensureLogLevel(opts: ApplicationOptions) {
    /* ensure RYVER_LOG_LEVEL is set as this will propagate to other processes */
    process.env.RYVER_LOG_LEVEL = process.env.RYVER_LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? LogLevel.Debug : LogLevel.Info);

    if (opts.logLevel) {
        setLogLevel(opts.logLevel as LogLevel);
    }
}

function setupExceptionHandler(opts: ApplicationOptions) {
    process.on('uncaughtException', ({ message, stack, name }) => {
        LOG_ERROR(`uncaught exception: ${name}: ${message} - ${stack}`);
        const msg = stack !== null ? stack : `${name}: ${message}`;
        dialog.showErrorBox(`A JavaScript error occurred in the main process`, `Uncaught Exception:\n ${msg}`);
    });
}

async function runRyverApplication(opts: ApplicationOptions) {
    try {
        const store = process.store = await createStore(opts);
        ensureCorrectUpdateChannel(store, opts);
        const { Application } = await import('./Application');
        const app = process.app = new Application();
    } catch (err) {
        LOG_ERROR('err=', err);
    }
}

async function setupGlobalExtensions(opts: ApplicationOptions) {
    setup(app, [keyboard(), authentication()]);
}

async function main(argv: string[]) {
    const startedAt = Date.now();

    const opts = parseCommandLine(process.argv.slice(1));

    ensureLogLevel(opts);
    setupExceptionHandler(opts);

    if (process.platform === 'win32' && runInstallerCommand(process.argv[1])) {
        return;
    }

    if (runSingleInstanceCheck(opts)) {
        return;
    }

    setAppRuntimeCommandLine(opts);

    try {
        await appRuntimeSetup(opts);
        await runRyverApplication(opts);
        await setupGlobalExtensions(opts);
    } catch (err) {
        LOG_ERROR('err=', err);
        process.exit(1);
    }

    const completedAt = Date.now();

    LOG_INFO(NS, 'startup time=%dms', completedAt - startedAt);
}

main(process.argv);

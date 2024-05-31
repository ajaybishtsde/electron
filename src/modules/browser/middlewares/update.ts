import { MiddlewareAPI, StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import { UpdateStateSlice, UpdateStatus, UpdateStatusOrigin } from '@modules/core/models/update';
import { autoUpdater } from 'electron';
import * as path from 'path';
import * as fs from 'fs-plus';
import { platform, arch } from 'os';
import { parse, format, Url } from 'url';
import { app } from 'electron';
import { StoreEnhancerStoreCreator } from 'redux';
import * as UpdateActions from '@modules/core/actions/update';
import { prerelease } from 'semver';
import { getPreference } from '@modules/core/selectors/preference';
import * as PreferenceActions from '@modules/core/actions/preference';
import { PREFERENCES, PreferenceStateSlice, UpdateChannel } from '@modules/core/models/preference';
import { publish } from 'yggdrasil/lib/topic';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:extensions:auto-update`);

const updateDotExe = path.join(path.dirname(process.execPath), '..', 'Update.exe');
const updateDotExeExists = fs.existsSync(updateDotExe);

const NOOP = (next) => (action) => next(action);

const getPlatform = () => {
    if (process.platform === 'win32') {
        return process.arch === 'x64' ? 'win64' : 'win32';
    } else if (process.platform === 'darwin') {
        return 'osx';
    }
};

const getVersion = () => {
    return app.getVersion();
};

export interface UpdateOptions {
    baseUrl?: string;
    checkEvery?: number;
    startAfter?: number;
}

export const update = (options: UpdateOptions = {}) => (store: MiddlewareAPI<Dispatch, UpdateStateSlice & PreferenceStateSlice>): any => {
    const {
        baseUrl = process.env.RYVER_UPDATE_HOST || `update-desktop.ryver.com`,
        checkEvery = 24 * 60 * 60 * 1000, // 24h
        startAfter = 5 * 60 * 1000 // 5m
    } = options;

    if (process.platform === 'linux') {
        return NOOP;
    }

    if (process.platform === 'win32' && !updateDotExeExists) {
        return NOOP;
    }

    let urlObj: Url;
    try {
        urlObj = parse(baseUrl);
        if (urlObj.host === null) {
            urlObj = parse(`https://${baseUrl}`);
        }
    } catch (err) {
        debug('could not parse base url=', err);
        return NOOP;
    }

    let checkTimer;

    const doUpdateCheck = () => {
        autoUpdater.checkForUpdates();
    };

    autoUpdater.on('checking-for-update', (evt) => {
        debug('check=', evt);
        store.dispatch(UpdateActions.setUpdateStatus(UpdateStatus.Check, checkTimer ? UpdateStatusOrigin.System : UpdateStatusOrigin.User));
        checkTimer = setTimeout(doUpdateCheck, checkEvery);
    });

    autoUpdater.on('update-available', (evt) => {
        debug('available=', evt);
        store.dispatch(UpdateActions.setUpdateStatus(UpdateStatus.Fetch));
    });

    autoUpdater.on('update-downloaded', (evt) => {
        debug('downloaded=', evt);
        store.dispatch(UpdateActions.setUpdateStatus(UpdateStatus.Ready, UpdateStatusOrigin.System));
    });

    autoUpdater.on('update-not-available', (evt) => {
        debug('not available=', evt);
        store.dispatch(UpdateActions.setUpdateStatus(UpdateStatus.NoUpdate));
    });

    autoUpdater.on('error', (err) => {
        debug('error=', err);
        store.dispatch(UpdateActions.setUpdateStatus(UpdateStatus.Error, UpdateStatusOrigin.System));
    });

    checkTimer = setTimeout(doUpdateCheck, startAfter);

    const setFeedURL = () => {
        const updateChannel = getPreference(store.getState(), PREFERENCES.updateChannel);
        const feedUrl = format({
            ...urlObj,
            pathname: updateChannel && updateChannel !== UpdateChannel.Stable
                ? `/update/${getPlatform()}/${getVersion()}/${updateChannel}`
                : `/update/${getPlatform()}/${getVersion()}`
        });

        debug('feed=', feedUrl);

        try {
            autoUpdater.setFeedURL({
                url: feedUrl
            });
        } catch (err) {
            debug('could not set feed url=', err);
        }
    };

    setImmediate(() => {
        setFeedURL();

        store.dispatch(UpdateActions.setUpdateSupported(true));
    });

    return (next: Dispatch) => (action: UpdateActions.ActionType | PreferenceActions.ActionType) => {
        switch (action.type) {
            case UpdateActions.CHECK_FOR_UPDATE: {
                const res = next(action);
                clearTimeout(checkTimer), checkTimer = void 0;
                doUpdateCheck();
                return res;
            }
            case UpdateActions.RESTART_FOR_UPDATE: {
                const res = next(action);
                // note: `quitAndInstall` should emit `before-quit-for-update` before closing windows, but it does not seem to.
                publish('/update/before-quit-for-update');
                setImmediate(() => autoUpdater.quitAndInstall());
                return res;
            }
            case UpdateActions.IGNORE_UPDATE: {
                const res = next(action);
                clearTimeout(checkTimer), checkTimer = void 0;
                return res;
            }
            case PreferenceActions.SET_PREFERENCE: {
                const res = next(action);
                if (action.key === PREFERENCES.updateChannel) {
                    setFeedURL();
                }
                return res;
            }
            case PreferenceActions.SET_PREFERENCES: {
                const res = next(action);
                if (PREFERENCES.updateChannel in action.values) {
                    setFeedURL();
                }
                return res;
            }
        }
        return next(action);
    };
};

export default update;

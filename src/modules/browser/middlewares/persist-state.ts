import * as path from 'path';
import * as fs from 'fs-plus';
import { clone, mixin } from 'yggdrasil/lib/lang';
import { BrowserWindow, app, remote } from 'electron';
import { RootState } from '@modules/core/models/root';
import { DEFAULT as PREFERENCES } from '@modules/core/reducers/preference';
import { ensureUpToDate } from '../upgrade/preferences';
import { MiddlewareAPI, StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import promisify from 'util.promisify';
import { sync as writeFileAtomicSync } from 'write-file-atomic';
import * as pkgJson from '../../../../package.json';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const debug: Debug.Logger = require('debug')(`ryver-desktop:modules:browser:enhancers:persist-state`);

// cannot use `app.getPath('userData')` here.  depending on when it is called, it may be `~/AppData/Roaming/Electron` vs. `~/AppData/Roaming/Ryver`.
export const STORAGE_PATH = path.resolve((app || remote.app).getPath('appData'), pkgJson.productName, 'Storage');

export async function readState(): Promise<RootState> {
    // todo: spread persistance across state slices
    debug('reading preferences from storage');
    const def = clone(PREFERENCES);
    if (fs.existsSync(STORAGE_PATH)) {
        let raw: string;
        try {
            raw = await readFile(STORAGE_PATH, 'utf8');
            const prefs = JSON.parse(raw);
            return { preference: { ...def, ...ensureUpToDate(prefs) } };
        } catch (err) {
            debug('could not read storage=', err);
            return { preference: def };
        }
    } else {
        return { preference: def };
    }
}

export async function resetState() {
    debug('resetting preferences to storage');
    const def = clone(PREFERENCES);
    try {
        writeFileAtomicSync(STORAGE_PATH, JSON.stringify(def, void 0, '\t'));
    } catch (err) {
        debug('could not save storage=', err);
        throw err;
    }
}

export async function saveState(rootState: RootState) {
    // todo: spread persistance across state slices
    debug('saving preferences to storage');
    try {
        const raw = JSON.stringify(rootState.preference, void 0, '\t');
        writeFileAtomicSync(STORAGE_PATH, raw);
    } catch (err) {
        debug('could not save storage=', err);
        throw err;
    }
}

export const persistState = () => (store: MiddlewareAPI<Dispatch, RootState>): any => {
    return (next: Dispatch) => (action: any) => {
        // todo: spread persistance across state slices
        const prevState = store.getState();
        const res = next(action);
        const nextState = store.getState();
        if (nextState.preference !== prevState.preference) {
            saveState(nextState);
        }
        return res;
    };
};

export default persistState;

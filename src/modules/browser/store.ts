import update from './middlewares/update';
import preferenceSink from './middlewares/preference-sink';
import persistState, { readState } from './middlewares/persist-state';
import { RootState } from '@modules/core/models/root';
import { createStore as createStoreBase, combineReducers, applyMiddleware, Middleware, Action, Store, Dispatch, AnyAction } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxLog, { createLogger } from 'redux-logger';
import reducer from '@modules/core/reducers';
import { notification } from '@modules/browser/middlewares/notification';
import { voice } from '@modules/browser/middlewares/voice';
import { compose } from 'redux';
import { createBridge } from '../../redux-electron-bridge';
import { ApplicationOptions } from '@modules/browser/interfaces';
import { setPreference } from '@modules/core/actions/preference';
import { PREFERENCES, UpdateChannel } from '@modules/core/models/preference';
import { getPreference } from '@modules/core/selectors/preference';
import { prerelease } from 'semver';
import { app } from 'electron';

const debug: debug.IDebugger = require('debug')('ryver-desktop:browser:store');

let store: Store<RootState>;
export async function createStore(opts: ApplicationOptions): Promise<Store<RootState>> {
    const prevState = await readState();
    store = createStoreBase<RootState, AnyAction, {}, {}>(
        reducer,
        prevState,
        compose(
            applyMiddleware(
                reduxThunk,
                notification(),
                preferenceSink(),
                update(),
                voice(),
                persistState(),
                /* reduxLog */
            ),
            createBridge({
                dispatch: action => store.dispatch(action)
            })
        )
    );
    return store;
}

export type StateType = RootState;
export type StoreType = Store<RootState>;

export const getStore: () => Store<RootState> = () => {
    return store;
};

// note: lazy dispatch only for browser process
export const dispatch: Dispatch = (action) => {
    return store ? store.dispatch(action) : void 0;
};

export const getState: () => RootState = () => {
    return store ? store.getState() : void 0;
};

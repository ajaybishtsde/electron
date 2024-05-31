import { RootState } from '@modules/core/models/root';
import { createStore as createStoreBase, combineReducers, applyMiddleware, Middleware, Action, Store, Dispatch, AnyAction } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxLog from 'redux-logger';
import reducer from '@modules/core/reducers';
import { compose } from 'redux';
import { createBridge } from '../../redux-electron-bridge';
import { AppConnector } from '@modules/interop/app-connector';
import appFeature from './middlewares/app-feature';
import notification from './middlewares/notification';
import zoom from './middlewares/zoom';
import spellCheck from './middlewares/spell-check';

const debug: debug.IDebugger = require('debug')('ryver-desktop:browser:store');

let store: Store<RootState>;
export function createStore(connector: AppConnector): Store<RootState> {
    return store = createStoreBase<RootState, AnyAction, {}, {}>(
        reducer,
        compose(
            applyMiddleware(
                reduxThunk,
                appFeature({ connector }),
                notification({ connector }),
                zoom(),
                spellCheck(),
                reduxLog
            ),
            createBridge({
                dispatch: action => store.dispatch(action)
            })
        )
    );
}

export type StateType = RootState;
export type StoreType = Store<RootState>;

export const getStore: () => Store<RootState> = () => {
    return store;
};

export const dispatch: Dispatch = (action) => {
    return store ? store.dispatch(action) : void 0;
};

export const getState: () => RootState = () => {
    return store ? store.getState() : void 0;
};

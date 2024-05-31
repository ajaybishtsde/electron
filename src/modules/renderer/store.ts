import { RootState } from '@modules/core/models/root';
import { createStore as createStoreBase, combineReducers, applyMiddleware, Middleware, Action, Store, Dispatch, AnyAction } from 'redux';
import reduxThunk from 'redux-thunk';
import reduxLog from 'redux-logger';
import { history } from './navigation';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import reducer from '@modules/core/reducers';
import notification from './middlewares/notification';
import { compose } from 'redux';
import navigationSync from './middlewares/navigation-sync';
import { createBridge } from '../../redux-electron-bridge';

const debug: debug.IDebugger = require('debug')('ryver-desktop:browser:store');

let store: Store<RootState>;
export function createStore(): Store<RootState> {
    return store = createStoreBase<RootState, AnyAction, {}, {}>(
        reducer,
        compose(
            applyMiddleware(
                reduxThunk,
                routerMiddleware(history),
                navigationSync(),
                notification(),
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

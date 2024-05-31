import { Store, AnyAction } from 'redux';
import { Dispatch } from 'redux';
import { Action } from 'redux';
import { IpcMessageEvent, WebContents, app } from 'electron';
import { StoreCreator } from 'redux';
import { Reducer } from 'redux';
import { StoreEnhancer } from 'redux';

const NS = `__REDUX_ELECTRON_BRIDGE__`;
const CHAN_DISPATCH_BROWSER = `${NS}::browser::dispatch`;
const CHAN_DISPATCH_RENDERER = `${NS}::renderer::dispatch`;
const CHAN_REGISTER = `${NS}::browser::register`;

type ReqStatePropsType = {
    [prop: string]: boolean | ReqStatePropsType;
};

interface Options {
    /**
     * A replacement `dispatch` function to be called when a forwarded action from a remote process
     * needs to be dispatched.  Can be used to ensure that remote actions pass through all other store enhancers.
     */
    dispatch?: <T extends AnyAction>(action: T) => T;
    /**
     * Only for `renderer` process.
     *
     * An object of state properties to be sync'd on store creation.  Can be nested.
     *
     * ```
     * {
     *   "one": { "two": true },
     *   "three": true
     * }
     * ```
     */
    reqStateProps?: ReqStatePropsType;
    /**
     * If defined, a function that should return true for actions that should *not* be forwarded
     * to other processes.  Otherwise, if not defined, all actions are forwarded.
     */
    doNotForward?: <T extends AnyAction>(action: T) => boolean;
}

export let createBridge: <S>(opts: Options) => (createStore: StoreCreator) => (reducer: Reducer<S>, preloadedState: S, enhancer?: StoreEnhancer) => Store<S>;

if (process.type === 'browser') {
    const { ipcMain, webContents } = require('electron');
    const debug: debug.IDebugger = require('debug')('redux-electron-bridge:browser');

    let registered: {
        [webContentsId: number]: {
            name: string;
            webContents: WebContents;
        }
    } = {};

    createBridge = <S>(opts: Options = {}) => {
        const { doNotForward, dispatch } = { ...opts };
        return (createStore: StoreCreator) => (reducer: Reducer<S>, preloadedState: S, enhancer?: StoreEnhancer) => {
            /* note: {}} type needed for https://github.com/Microsoft/TypeScript/issues/21592 */
            const store = createStore(reducer, preloadedState as {}, enhancer);
            const dispatchAction = store.dispatch;
            const dispatchRemoteAction = dispatch || store.dispatch;

            global[NS] = (reqStateProps: ReqStatePropsType) => {
                return JSON.stringify(reqStateProps ? createReqState(store.getState(), reqStateProps) : store.getState());
            };

            ipcMain.on(CHAN_REGISTER, ({ sender }: IpcMessageEvent, name: string) => {
                const webContentsId = sender.id;

                if (registered[webContentsId]) {
                    return;
                } else {
                    registered[webContentsId] =  { webContents: sender, name };

                    sender.once('destroyed', () => {
                        const { [webContentsId]: removed, ...rem } = registered;
                        debug(`removing registration for ${removed.name}`);
                        registered = rem;
                    });
                }
            });

            let inRemoteDispatchOf = null;

            ipcMain.on(CHAN_DISPATCH_BROWSER, ({ sender }: IpcMessageEvent, action: any) => {
                const senderName = registered[sender.id].name;

                debug(`dispatch action from ${registered[sender.id].name}`, action);
                inRemoteDispatchOf = action;
                dispatchRemoteAction(action);
                inRemoteDispatchOf = null;

                Object.entries(registered).forEach(([_, { webContents, name }]) => {
                    if (webContents.id !== sender.id) {
                        debug(`forwarding action from ${senderName} to ${name}`, action);
                        webContents.send(CHAN_DISPATCH_RENDERER, action);
                    }
                });
            });

            return {
                ...store as Store<S>,
                dispatch(action) {
                    const res = dispatchAction(action);

                    if (inRemoteDispatchOf === action) {
                        return res;
                    }

                    if (doNotForward && doNotForward(action)) {
                        return res;
                    }

                    Object.entries(registered).forEach(([_, { webContents, name }]) => {
                        debug(`forwarding action from browser to ${name}`, action);
                        webContents.send(CHAN_DISPATCH_RENDERER, action);
                    });

                    return res;
                }
            };
        };
    };
} else {
    const { ipcRenderer, remote } = require('electron');
    const debug: debug.IDebugger = require('debug')('redux-electron-bridge:renderer');

    createBridge =<S>(opts: Options = {}) => {
        const { doNotForward, reqStateProps, dispatch } = { ...opts };
        return (createStore: StoreCreator) => (reducer: Reducer<S>, preloadedState: S, enhancer?: StoreEnhancer) => {
            if (preloadedState) {
                console.error('DISABLED: Do not pass `preloadedState` as it needs to be replaced by the state from the store in the other process.');
                /* note: {}} type needed for https://github.com/Microsoft/TypeScript/issues/21592 */
                return createStore(reducer, preloadedState as {}, enhancer);
            }

            ipcRenderer.send(CHAN_REGISTER, process.guestInstanceId
                ? `guestWebContents/${process.guestInstanceId}`
                : `webContents/${remote.getCurrentWindow().id}`
            );

            debug(`fetching remote browser store state`);
            const browserStoreState = JSON.parse(remote.getGlobal(NS)(reqStateProps || null));

            const store = createStore(reducer, browserStoreState, enhancer);
            const dispatchAction = store.dispatch;
            const dispatchRemoteAction = dispatch || store.dispatch;

            let inRemoteDispatchOf = null;

            ipcRenderer.on(CHAN_DISPATCH_RENDERER, (evt: IpcMessageEvent, action: any) => {
                debug(`dispatch action from browser`, action);
                inRemoteDispatchOf = action;
                dispatchRemoteAction(action);
                inRemoteDispatchOf = null;
            });

            return {
                ...store as Store<S>,
                dispatch(action) {
                    const res = dispatchAction(action);

                    if (inRemoteDispatchOf === action) {
                        return res;
                    }

                    if (doNotForward && doNotForward(action)) {
                        return res;
                    }

                    debug(`sending action to browser`, action);
                    ipcRenderer.send(CHAN_DISPATCH_BROWSER, action);

                    return res;
                }
            };
        };
    };
}

export default createBridge;

const createReqState = (state: any, reqStateProps: ReqStatePropsType): any => {
    return Object.entries(reqStateProps).reduce((res, [prop, ok]) => (
        res[prop] = (typeof ok === 'boolean') && ok ? state[prop] : createReqState(state[prop], ok as ReqStatePropsType),
        res
    ), {});
};

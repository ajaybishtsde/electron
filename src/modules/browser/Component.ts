
import { EventEmitter } from 'events';
import { Removable, asRemovable } from 'yggdrasil/lib/removable';
import { assign } from 'yggdrasil/lib/lang';
import { Dispatch, AnyAction } from 'redux';
import { MiddlewareAPI } from 'redux';
import { Store } from 'redux';
import { StateType } from './store';
import { Disposable } from '@modules/browser/interfaces';
import { dispose } from './utils';

type StateUpdateFn<S> = (prevState: S) => Partial<S>;
type StateUpdate<S> = { state: Partial<S> | StateUpdateFn<S>, cb: () => void };

const debug: debug.IDebugger = require('debug')('ryver-desktop:browser:component');

export type ComponentDep = Removable | Disposable;

export class Component<S> extends EventEmitter {
    disposed: boolean = false;
    state: Readonly<S>;
    store: MiddlewareAPI<Dispatch, StateType>;

    private deps: Array<ComponentDep> = [];

    constructor() {
        super();

        this.setMaxListeners(100);

        const store = process.store as Store<StateType>;

        this.store = { getState: store.getState, dispatch: store.dispatch };

        this.own(
            asRemovable(store.subscribe(createStoreSubscription(this, store)))
        );

        enqueueMountFor(this);
    }

    dispose() {
        if (this.disposed) {
            return;
        }

        this.componentWillUnmount();

        if (this.deps) {
            this.deps = (dispose(...this.deps), null);
        }

        this.disposed = true;
    }

    own(...deps: Array<ComponentDep>) {
        if (this.deps) {
            this.deps = [...this.deps, ...deps];
        }
    }

    /* tslint:disable-next-line no-empty */
    componentWillMount(): void {

    }

    /* tslint:disable-next-line no-empty */
    componentDidMount(): void {

    }

    shouldComponentUpdate(nextState: S): boolean {
        return true;
    }

    /* tslint:disable-next-line no-empty */
    componentWillUpdate(nextState: S): void {

    }

    /* tslint:disable-next-line no-empty */
    componentDidUpdate(prevState: S): void {

    }

    /* tslint:disable-next-line no-empty */
    componentWillUnmount(): void {

    }

    mapState<RemoteState>(remoteState: RemoteState, ownState: S): Partial<S> {
        return {};
    }

    setState(state: Partial<S>, cb?: () => void) {
        enqueueStateUpdateFor(this, state, cb);
    }

    /* tslint:disable-next-line no-empty */
    update() {

    }
}

export default Component;

const SU_NEXT = Symbol('state.update.next');
const SU_LIST = Symbol('state.update.list');

const enqueueStateUpdateFor = <S>(component: Component<S>, state: Partial<S> | StateUpdateFn<S>, cb: () => void) => {
    if (component.disposed) {
        return;
    }

    (component[SU_LIST] || (component[SU_LIST] = [])).push({ state, cb });

    if (component[SU_NEXT]) {
        return;
    } else {
        component[SU_NEXT] = setImmediate(() => execStateUpdateFor(component));
    }
};

const execStateUpdateFor = <S>(component: Component<S>) => {
    if (component.disposed) {
        return;
    }
    const prevState = component.state;
    const nextState = { ...prevState as any };

    let cbQueue = [];

    component[SU_LIST].forEach(({ state: stateOrFn, cb }) => {
        if (typeof stateOrFn === 'function') {
            Object.assign(nextState, stateOrFn(prevState));
        } else {
            Object.assign(nextState, stateOrFn);
        }
        if (cb) {
            cbQueue.push(cb);
        }
    });

    const runUpdate = component.shouldComponentUpdate(nextState);

    if (runUpdate) {
        component.componentWillUpdate(nextState);
    }

    component.state = nextState;

    if (runUpdate) {
        component.update();
        component.componentDidUpdate(prevState);
    }

    cbQueue.forEach(cb => cb());
    cbQueue = null;

    component[SU_NEXT] = null;
};

const enqueueMountFor = <S>(component: Component<S>) => {
    setImmediate(() => {
        component.componentWillMount();
        component.update();
        component.componentDidMount();
    });
};

const createStoreSubscription = <S, State>(component: Component<S>, store: Store<State>) => {
    const getStateFor = (component: Component<S>, state: State): Partial<S> => {
        const ownState = component.state;
        return component.mapState(state, ownState);
    };
    const initState = getStateFor(component, store.getState());
    component.state = component.state
        ? { ...component.state as any, ...initState as any }
        : initState;
    return () => {
        component.setState(getStateFor(component, store.getState()));
    };
};

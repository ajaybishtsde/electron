export { push, replace, go, goBack, goForward } from 'react-router-redux';

import { History, Location, Path, LocationState, LocationDescriptor } from 'history';
import { push } from 'react-router-redux';

export type pushFn = (location: LocationDescriptor, state?: LocationState) => void;
export type replaceFn = (location: LocationDescriptor, state?: LocationState) => void;
export type goFn = (n: number) => void;
export type goBackFn = () => void;
export type goForwardFn = () => void;

export const pushModal = (location: LocationDescriptor, state?: LocationState) => {
    return push(location, { ...state, modal: true });
}

export type pushModalFn = pushFn;

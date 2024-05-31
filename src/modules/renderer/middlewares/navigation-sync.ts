import { StoreEnhancer, Middleware, Dispatch, Action, AnyAction } from 'redux';
import { AppStateSlice } from '@modules/core/models/app';
import { LocationChangeAction, LOCATION_CHANGE } from 'react-router-redux';
import reverseRoute from '../reverse-route';
import { matchPath } from 'react-router';
import { setPreference } from '@modules/core/actions/preference';
import { PREFERENCES } from '@modules/core/models/preference';
import { acknowledgeOrganization } from '@modules/core/actions/organization';
import { MiddlewareAPI } from 'redux';

const debug: Debug.Logger = require('debug')(`ryver-desktop:renderer:enhancers:navigation-sync`);

export const navigationSync = () => (store: MiddlewareAPI<Dispatch, AppStateSlice>): any => {
    return (next: Dispatch) => (action: LocationChangeAction) => {
        switch (action.type) {
            case LOCATION_CHANGE: {
                const prevLocation = store.getState().app.location;
                const res = next(action);
                const nextLocation = action.payload;
                const match = matchPath<{ name: string }>(nextLocation.pathname, { path: '/org/:name', strict: true });
                if (match && match.params.name) {
                    store.dispatch(setPreference(PREFERENCES.organization, match.params.name));
                    store.dispatch(acknowledgeOrganization() as any);
                }
                return res;
            }
        }
        return next(action);
    };
};

export default navigationSync;

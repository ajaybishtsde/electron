import { Reducer } from 'redux';

import * as OrganizationActions from '../actions/organization';
import { OrganizationState } from '../models/organization';

const DEFAULT: OrganizationState = Object.freeze(<OrganizationState>{
    badgeCountByName: {},
    unseenByName: {}    
});

export const reduce: Reducer<OrganizationState> = (prevState: OrganizationState = DEFAULT, action: OrganizationActions.ActionType) => {
    switch (action.type) {
        case OrganizationActions.INCREMENT_ORGANIZATION_BADGE_COUNT:
            return {
                ...prevState,
                badgeCountByName: {
                    ...prevState.badgeCountByName,
                    [action.organizationName]: (prevState.badgeCountByName[action.organizationName] || 0) + action.amount
                }
            };
        case OrganizationActions.ACKNOWLEDGE_ORGANIZATION:
            return {
                ...prevState,
                badgeCountByName: {
                    ...prevState.badgeCountByName,
                    [action.organizationName]: 0
                },
                unseenByName: {
                    ...prevState.unseenByName,
                    [action.organizationName]: false
                }
            };
        case OrganizationActions.SET_ORGANIZATION_UNSEEN_ACTIVITY:
            return {
                ...prevState,
                unseenByName: {
                    ...prevState.unseenByName,
                    [action.organizationName]: action.unseen
                }
            };
    }
    return prevState;
};

export default reduce;

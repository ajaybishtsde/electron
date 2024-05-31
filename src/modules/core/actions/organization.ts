import { Organization, OrganizationStateSlice } from '../models/organization';
import { getOrganizations, getSelectedOrganizationName } from '../selectors/organization';
import { StateFn } from '../models/root';
import { push } from '@modules/core/actions/navigation';
import { PreferenceStateSlice, PREFERENCES } from '../models/preference';
import { setPreference } from '@modules/core/actions/preference';

export type createOrganizationFn = (org: Organization) => void;
export function createOrganization(org: Organization) {
    return (dispatch, getState: StateFn<PreferenceStateSlice>) => {
        const rootState = getState();
        const organizations = getOrganizations(rootState);
        dispatch(setPreference(PREFERENCES.organizations, [
            ...organizations,
            org
        ]));
        dispatch(selectOrganization(org.name));
    };
}

export type removeOrganizationFn = (organizationName: string) => void;
export function removeOrganization(organizationName: string) {
    return (dispatch, getState: StateFn<PreferenceStateSlice>) => {
        const rootState = getState();
        const organizations = getOrganizations(rootState);
        const selectedOrganizationName = getSelectedOrganizationName(rootState);
        dispatch(setPreference(PREFERENCES.organizations, organizations.filter(org => org.name !== organizationName)));
        if (selectedOrganizationName === organizationName) {
            dispatch(selectOrganizationAt(0));
        }
    };
}

export type selectOrganizationFn = (organizationName: string) => void;
export function selectOrganization(organizationName: string) {
    return push(`/org/${organizationName}`);
}

export type updateOrganizationFn = (organizationName: string, data: Organization) => void;
export function updateOrganization(organizationName: string, data: Organization) {
    return (dispatch, getState: StateFn<PreferenceStateSlice>) => {
        const rootState = getState();
        const organizations = getOrganizations(rootState);
        const selectedOrganizationName = getSelectedOrganizationName(rootState);
        dispatch(setPreference(PREFERENCES.organizations, organizations.map(
            org => org.name === organizationName ? { ...org, ...data } : org
        )));
        if (selectedOrganizationName === organizationName && data.name && data.name !== organizationName) {
            dispatch(selectOrganizationAt(0));
        }
    };
}

export const ACKNOWLEDGE_ORGANIZATION = 'ACKNOWLEDGE_ORGANIZATION';

export interface AcknowledgeOrganization {
    type: typeof ACKNOWLEDGE_ORGANIZATION;
    organizationName: string;
}

export type AcknowledgeOrganizationType = AcknowledgeOrganization;

export type acknowledgeOrganizationFn = () => void;
export function acknowledgeOrganization() {
    return (dispatch, getState: StateFn<OrganizationStateSlice>) => {
        const organizationName = getSelectedOrganizationName(getState());
        return dispatch(<AcknowledgeOrganization>{ type: ACKNOWLEDGE_ORGANIZATION, organizationName });
    };
}

export const INCREMENT_ORGANIZATION_BADGE_COUNT = 'INCREMENT_ORGANIZATION_BADGE_COUNT';

export interface IncrementOrganizationBadgeCount {
    type: typeof INCREMENT_ORGANIZATION_BADGE_COUNT;
    organizationName: string;
    amount: number;
}

export type IncrementOrganizationBadgeCountType = IncrementOrganizationBadgeCount;

export type incrementOrganizationBadgeCountFn = (organizationName: string, amount: number) => void;
export function incrementOrganizationBadgeCount(organizationName: string, amount: number = 1) {
    return <IncrementOrganizationBadgeCount>{ type: INCREMENT_ORGANIZATION_BADGE_COUNT, organizationName, amount };
}

export type selectOrganizationByPositionFn = (position: number) => Promise<{}>;
export function selectOrganizationByPosition(position: number) {
    return (dispatch, getState: StateFn<OrganizationStateSlice>) => {
        const organizations = getOrganizations(getState());
        const idx = position < 1 ? organizations.length - position - 1 : position - 1;
        const found = organizations[idx % organizations.length];
        if (found) {
            return dispatch(selectOrganization(found.name));
        }
    };
}

export type selectOrganizationAtFn = selectOrganizationByPositionFn;
export const selectOrganizationAt = selectOrganizationByPosition;

export const DIR_NEXT = 1;
export const DIR_PREV = -1;

export type selectOrganizationByDirectionFn = (direction: number) => Promise<{}>;
export function selectOrganizationByDirection(direction: number) {
    return (dispatch, getState: StateFn<OrganizationStateSlice>) => {
        const organizations = getOrganizations(getState());
        const selected = getSelectedOrganizationName(getState());
        const idx = organizations.findIndex((org) => org.name === selected);
        return dispatch(selectOrganizationByPosition(idx + 1 + direction));
    };
}

export type selectNextOrganizationFn = () => void;
export function selectNextOrganization() {
    return selectOrganizationByDirection(DIR_NEXT);
}

export type selectPrevOrganizationFn = () => void;
export function selectPrevOrganization() {
    return selectOrganizationByDirection(DIR_PREV);
}

export const SET_ORGANIZATION_UNSEEN_ACTIVITY = 'SET_ORGANIZATION_UNSEEN_ACTIVITY';

export interface SetOrganizationUnseenActivity {
    type: typeof SET_ORGANIZATION_UNSEEN_ACTIVITY;
    organizationName: string;
    unseen: boolean;
}

export type SetOrganizationUnseenActivityType = SetOrganizationUnseenActivity;

export type setOrganizationUnseenActivityFn = (organizationName: string, unseen?: boolean) => void;
export function setOrganizationUnseenActivity(organizationName: string, unseen: boolean = true) {
    return <SetOrganizationUnseenActivity>{ type: SET_ORGANIZATION_UNSEEN_ACTIVITY, organizationName, unseen };
}

export type ActionType =
    AcknowledgeOrganizationType | IncrementOrganizationBadgeCountType | SetOrganizationUnseenActivityType;

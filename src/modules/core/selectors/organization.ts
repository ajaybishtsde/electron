import { createSelector } from 'reselect';
import { PreferenceState, PreferenceStateSlice } from '../models/preference';
import { OrganizationState, OrganizationStateSlice } from '../models/organization';

export const getOrganizations = ({ preference: { organizations } }: PreferenceStateSlice & OrganizationStateSlice) => organizations;
export const getSelectedOrganizationName = ({ preference: { organization } }: PreferenceStateSlice & OrganizationStateSlice) => organization;
export const getOrganization = ({ preference: { organizations } }: PreferenceStateSlice & OrganizationStateSlice, { name }: { name?: string }) =>
    organizations.find((organization) => organization.name === name);
export const getBadgeCounts = ({ organization: { badgeCountByName } }: PreferenceStateSlice & OrganizationStateSlice) => badgeCountByName;
export const getUnseen = ({ organization: { unseenByName } }: PreferenceStateSlice & OrganizationStateSlice) => unseenByName;
export const getBadgeCount = ({ organization: { badgeCountByName } }: PreferenceStateSlice & OrganizationStateSlice) => {
    return Object.entries(badgeCountByName).reduce((badgeCount, [name, count]) => badgeCount + count, 0);
};

import { createSelector } from 'reselect';
import { PreferenceState, PreferenceStateSlice, PreferenceStatusStateSlice } from '../models/preference';

export const getPreference = <K extends keyof PreferenceState>({ preference }: PreferenceStateSlice, key: K): PreferenceState[K] =>
    preference[key];

export const getPreferences = ({ preference }: PreferenceStateSlice) => preference;

export const getPreferencesFor = <K extends keyof PreferenceState>({ preference }: PreferenceStateSlice, keys: K[]) =>
    keys.reduce((some: Partial<PreferenceState>, key) => (some[key] = preference[key], some), {});

export const getPreferencesStatus = ({ preferenceStatus }: PreferenceStatusStateSlice) => preferenceStatus;
export const getPreferenceStatus = <K extends keyof PreferenceState>({ preferenceStatus }: PreferenceStatusStateSlice, key: K): boolean =>
    preferenceStatus[key];

// note: right now status is only a boolean
export const getIsPreferenceOk = getPreferencesStatus;

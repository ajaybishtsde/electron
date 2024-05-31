import { PreferenceState, PreferenceStateSlice, PreferenceStatusState } from '../models/preference';

export const SET_PREFERENCE = 'SET_PREFERENCE';

export interface SetPreference<K extends keyof PreferenceState> {
    type: typeof SET_PREFERENCE;
    key: K;
    value: PreferenceState[K];
}

export type SetPreferenceType = SetPreference<keyof PreferenceState>;

export type setPreferenceFn = <K extends keyof PreferenceState>(key: K, value: PreferenceState[K]) => void;
export function setPreference<K extends keyof PreferenceState>(key: K, value: PreferenceState[K]) {
    return <SetPreference<K>>{ type: SET_PREFERENCE, key, value };
}

export const SET_PREFERENCES = 'SET_PREFERENCES';

export interface SetPreferences {
    type: typeof SET_PREFERENCES;
    values: Partial<PreferenceState>;
}

export type SetPreferencesType = SetPreferences;

export type setPreferencesFn = (values: Partial<PreferenceState>) => void;
export function setPreferences(values: Partial<PreferenceState>) {
    return <SetPreferences>{ type: SET_PREFERENCES, values };
}

export const SET_PREFERENCES_STATUS = 'SET_PREFERENCES_STATUS';

export interface SetPreferencesStatus {
    type: typeof SET_PREFERENCES_STATUS;
    statuses: Partial<PreferenceStatusState>;
}

export type SetPreferencesStatusType = SetPreferencesStatus;

export type setPreferencesStatusFn = (statuses: Partial<PreferenceStatusState>) => void;
export function setPreferencesStatus(statuses: Partial<PreferenceStatusState>) {
    return <SetPreferencesStatus>{ type: SET_PREFERENCES_STATUS, statuses };
}

export type ActionType = SetPreferenceType | SetPreferencesType | SetPreferencesStatusType;

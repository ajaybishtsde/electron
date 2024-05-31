import { Organization } from './organization';
import { WindowBounds } from './window-bounds';

export const PREFERENCES: {[P in keyof Partial<PreferenceStateV1>]: P} = {
    organization: 'organization',
    organizations: 'organizations',
    minimizeOnClose: 'minimizeOnClose',
    openOnStart: 'openOnStart',
    windowBounds: 'windowBounds',
    isOrganizationBarOpen: 'isOrganizationBarOpen',
    isOrganizationBarCompact: 'isOrganizationBarCompact',
    isOrganizationBarShown: 'isOrganizationBarShown',
    isOrganizationBarInChangeMode: 'isOrganizationBarInChangeMode',
    muted: 'muted',
    noSpellCheck: 'noSpellCheck',
    noProxyServer: 'noProxyServer',
    usePhoneMode: 'usePhoneMode',
    dockBounceMode: 'dockBounceMode',
    zoomLevel: 'zoomLevel',
    updateChannel: 'updateChannel'
};

export enum DockBounceMode {
    None = 'none',
    Informational = 'informational',
    Critical = 'critical'
}

export enum UpdateChannel {
    Stable = 'stable',
    Beta = 'beta',
    Alpha = 'alpha'
}

export interface PreferenceStateV1 {
    version: number;
    organization: string;
    organizations: Organization[];
    minimizeOnClose: boolean;
    openOnStart: boolean;
    windowBounds: WindowBounds;
    isOrganizationBarOpen: boolean;
    isOrganizationBarCompact: boolean;
    isOrganizationBarShown: boolean;
    isOrganizationBarInChangeMode: boolean;
    muted: boolean;
    noSpellCheck: boolean;
    noProxyServer: boolean;
    usePhoneMode: boolean;
    dockBounceMode: DockBounceMode;
    zoomLevel: number;
    updateChannel: UpdateChannel;
}

export type PreferenceState = PreferenceStateV1;

export interface PreferenceChangeSink1V {
    openOnStart?: (value: boolean) => void;
}

export type PreferenceChangeSink = {
    [P in keyof PreferenceState]?: (value: PreferenceState[P]) => void;
};

export interface PreferenceStateSlice {
    preference?: PreferenceState;
}

export type PreferenceStatusState = {
    [P in keyof PreferenceState]?: boolean;
};

export interface PreferenceStatusStateSlice {
    preferenceStatus?: PreferenceStatusState;
}

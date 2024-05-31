import { encode, decode } from 'yggdrasil/lib/string';
import { PreferenceStateV1 } from '@modules/core/models/preference';

interface PreferenceStateV0 {
    instances?: string;
    areFavoritesOpen?: string;
    areFavoritesCompact?: string;
    areFavoritesPinned?: string;
    areFavoritesShown?: string;
    areFavoritesInEditorMode?: string;
    windowBounds?: string;
    minimizeOnClose?: string;
    muted?: string;
    spellCheck?: string;
    noProxyServer?: string;
    openOnStartup?: string;
}

export const UPGRADE_TRANSFORMS = [
    {
        from: 0, fn: (data: PreferenceStateV0): PreferenceStateV1 => {
            const out: Partial<PreferenceStateV1> = { version: 1 };
            if (data.instances) {
                interface Shape {
                    url?: string; host?: string; name?: string; short?: string; color?: string; selected?: boolean;
                }
                const instances: Shape[] = <Shape[]>decode(data.instances).results;
                out.organizations = instances.map(({ host, url, name, short, color }) => ({ host: host || url, name, short, color }));
                out.organization = instances.reduce((name, instance) => instance.selected ? instance.name : name, void 0 as string);
            }
            if (data.areFavoritesOpen) {
                out.isOrganizationBarOpen = <boolean>decode(data.areFavoritesOpen);
            }
            if (data.areFavoritesCompact) {
                out.isOrganizationBarCompact = <boolean>decode(data.areFavoritesCompact);
            }
            if (data.areFavoritesShown) {
                out.isOrganizationBarShown = <boolean>decode(data.areFavoritesShown);
            }
            if (data.areFavoritesInEditorMode) {
                out.isOrganizationBarInChangeMode = <boolean>decode(data.areFavoritesInEditorMode);
            }
            if (data.windowBounds) {
                interface Shape {
                    x?: number; y?: number; width?: number; height?: number; isMaximized?: boolean; isFullscreen?: boolean;
                }
                const { x, y, width, height, isMaximized, isFullscreen } = <Shape>decode(data.windowBounds);
                out.windowBounds = { x, y, width, height, fullscreen: isFullscreen };
            }
            if (data.noProxyServer) {
                out.noProxyServer = <boolean>decode(data.noProxyServer);
            }
            if (data.muted) {
                out.muted = <boolean>decode(data.muted);
            }
            if (data.spellCheck) {
                out.noSpellCheck = !<boolean>decode(data.spellCheck);
            }
            if (data.minimizeOnClose) {
                out.minimizeOnClose = <boolean>decode(data.minimizeOnClose);
            }
            if (data.openOnStartup) {
                out.openOnStart = <boolean>decode(data.openOnStartup);
            }
            return <PreferenceStateV1>out;
        }
    }
];

export function ensureUpToDate(data: any): PreferenceStateV1 {
    if (data) {
        let count = 0;
        while (count++ < 100) {
            const fn = UPGRADE_TRANSFORMS.reduce((found: (data: any) => any, transform) => transform.from === (data.version || 0) ? transform.fn : found, void 0);
            if (fn) {
                data = fn(data);
            } else {
                break;
            }
        }
        return data;
    } else {
        return void 0;
    }
}

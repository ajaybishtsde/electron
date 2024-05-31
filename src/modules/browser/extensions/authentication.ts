
import * as url from 'url';
import { BrowserWindow, ipcMain } from 'electron';
import { toRemovable, asRemovable, Removable } from 'yggdrasil/lib/removable';
import { on, once } from 'yggdrasil/lib/event';
import Application, { getWindowManager } from '../Application';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:extensions:authentication`);

let ignoredAuthUrls: { [url: string]: boolean } = {};

export const clearIgnoredAuthUrls = async () => {
    ignoredAuthUrls = {};
};

export function authentication() {
    return (app: Electron.App) => {
        let pendingAuthRequests: Array<{ authWindow: Electron.BrowserWindow, removable: Removable }> = [];

        return toRemovable(
            on(app, 'login', (evt: Electron.Event, webContents: Electron.WebContents, request: Electron.Request, authInfo: Electron.AuthInfo, cb: (u: string, p: string) => void) => {
                debug('auth request=', request, 'auth info=', authInfo);
                const parentWindow = BrowserWindow.fromWebContents(webContents.hostWebContents ? webContents.hostWebContents : webContents);
                if (parentWindow && !ignoredAuthUrls[request.url]) {
                    evt.preventDefault();
                    let authWindow = getWindowManager().createAuthWindow(parentWindow, request, authInfo);

                    const removable = toRemovable(
                        once(ipcMain, `authentication-ok:${authWindow.id}`, (evt, u: string, p: string) => {
                            debug('auth ok=', authWindow.id, authInfo, request);
                            cb(u, p);
                            if (authWindow) {
                                authWindow.close();
                            }
                        }),
                        once(ipcMain, `authentication-dismiss:${authWindow.id}`, () => {
                            debug('auth dismiss=', authWindow.id, authInfo, request);
                            cb(null, null);
                            if (authWindow) {
                                authWindow.close();
                            }
                        }),
                        once(ipcMain, `authentication-ignore:${authWindow.id}`, () => {
                            debug('auth ignore=', authWindow.id, authInfo, request);
                            cb(null, null);
                            ignoredAuthUrls[request.url] = true;
                            if (authWindow) {
                                authWindow.close();
                            }
                        }),
                        once(authWindow, 'ready-to-show', () => {
                            if (authWindow) {
                                authWindow.show();
                            }
                        }),
                        once(authWindow, 'close', () => {
                            debug('auth close=', authWindow.id);
                            pendingAuthRequests = pendingAuthRequests.filter(o => o.authWindow === authWindow);
                            authWindow = void 0;
                            removable.remove();
                        }),
                        asRemovable(() => {
                            if (authWindow) {
                                authWindow.close();
                            }
                        })
                    );

                    pendingAuthRequests.push({ authWindow, removable });
                }
            }),
            asRemovable(() => {
                pendingAuthRequests = pendingAuthRequests.reduce((p, o) => (o.removable.remove(), p), []);
            })
        );
    };
}

export default authentication;

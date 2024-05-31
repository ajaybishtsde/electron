import * as path from 'path';
import * as url from 'url';
import Component from './Component';
import { BrowserWindowConstructorOptions, BrowserWindow, nativeImage, ipcMain, WebContents, AuthInfo, Request ,session} from 'electron';
import { on } from 'yggdrasil/lib/event';
import { asRemovable, toRemovable, Removable, RemoveFn } from 'yggdrasil/lib/removable';
import setup from '../../extensions';
import positionTrait from './traits/position';
import closeTrait from './traits/close';
import { RootState } from '@modules/core/models/root';
import { getSelectedOrganizationName } from '@modules/core/selectors/organization';
import ApplicationMenu from './ApplicationMenu';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:window-manager`);

interface State {
    organizationId?: string;
}

export class WindowManager extends Component<State> {
    private mainWindow: BrowserWindow;

    componentDidMount() {
        this.own(
            on(this, 'window:reload', this.onWindowReload),
            on(this, 'window:toggle-dev-tools', this.onWindowToggleDevTools),
            on(ipcMain, 'window-command', this.onWindowCommand)
        );
    }

    onWindowCommand = (evt, command: string, ...args: any[]) => {
        this.sendCommand(command, ...args);
    }

    onWindowReload = () => {
        const targetWindow = this.getFocusedWindow();
        if (targetWindow) {
            targetWindow.reload();
        }
    }

    onWindowToggleDevTools = () => {
        const targetWindow = this.getFocusedWindow();
        if (targetWindow) {
            targetWindow.webContents.toggleDevTools();
        }
    }

    createMainWindow(): BrowserWindow {
        if (this.mainWindow) {
            throw new Error('Main window was already created.');
        }

        const { organizationId } = this.state;

        const opts: BrowserWindowConstructorOptions = {
            show: false,
            /* backgroundColor: '#263238', */
            backgroundColor: '#f2f5fa',
            title: organizationId ? `${organizationId}` : `Ryver`,
            webPreferences: {
                nodeIntegration: true,
                webviewTag: true
              }
        };

        if (process.platform === 'linux') {
            // the icon image MUST be named `icon.png`; see electrion issue #6205 for more details
            opts.icon = nativeImage.createFromPath(path.resolve(process.resourcePath, require('../../../resources/linux/icon.png')));
        }

        const mainWindow = new BrowserWindow(opts);

        mainWindow.once('ready-to-show', () => mainWindow.show());
        mainWindow.once('closed', toRemovable(
            on(mainWindow, 'focus', () => sendCommandToBrowserWindow(mainWindow, 'window:focus')),
            on(mainWindow.webContents, 'will-navigate', evt => {
                debug('attempted navigation to=', evt);
                evt.preventDefault();
            }),
            setup(mainWindow, [
                closeTrait(),
                positionTrait(),
                (mainWindow) => {
                    if (process.platform !== 'darwin') {
                        const mainMenuWindow = new ApplicationMenu(mainWindow);
                        return asRemovable(() => mainMenuWindow.dispose());
                    }
                }
            ]),

        ).remove);

        if (process.env.RYVER_DEVELOPER_SERVER) {
            mainWindow.loadURL(url.format({
                ...url.parse(process.env.RYVER_DEVELOPER_SERVER),
                pathname: `renderer.html`,
                hash: JSON.stringify({ resourcePath: process.resourcePath })
            }));
        } else {
            mainWindow.loadURL(url.format({
                protocol: 'file',
                pathname: `${process.resourcePath}/renderer.html`,
                slashes: true,
                hash: JSON.stringify({ resourcePath: process.resourcePath })
            }));
            const cookies=session.defaultSession.cookies
            cookies.on('changed', function(event, cookie, cause, removed) {
                if (cookie.session && !removed) {
                    var url = `${cookie.secure ? 'https' : 'http'}://${cookie.domain}${cookie.path}`;
                    cookies.set({
                        url: url,
                        name: cookie.name,
                        value: cookie.value,
                        domain: cookie.domain,
                        path: cookie.path,
                        secure: cookie.secure,
                        httpOnly: cookie.httpOnly,
                        expirationDate: Math.floor(new Date().getTime() / 1000) + 1209600
                    }, function(err) {
                        if (err) {
                            console.error('Error trying to persist cookie', err, cookie);
                        }
                    });
                }
            });
            const ses = mainWindow.webContents.session
            ses.allowNTLMCredentialsForDomains("*")
        }

        return this.mainWindow = mainWindow;
    }

    createAuthWindow(parentWindow: BrowserWindow, request: Request, authInfo: AuthInfo): BrowserWindow {
        const parentBounds = parentWindow.getBounds();
        const parentContentBounds = parentWindow.getContentBounds();

        const W = 400;
        const H = 287;

        const opts: BrowserWindowConstructorOptions = {
            show: false,
            backgroundColor: '#ffffff',
            width: W,
            height: H,
            x: (parentBounds.x + parentBounds.width / 2 - W / 2) << 0,
            y: (parentContentBounds.y) << 0, /* (consumerRect.y + consumerRect.height / 2 - H / 2) << 0, */
            title: `${authInfo.realm}`,
            parent: parentWindow,
            modal: true,
            frame: false,
            resizable: false
        };

        const authWindow = new BrowserWindow(opts);

        authWindow.once('ready-to-show', () => authWindow.show());

        const requestUrl = url.parse(request.url);

        if (process.env.RYVER_DEVELOPER_SERVER) {
            authWindow.loadURL(url.format({
                ...url.parse(process.env.RYVER_DEVELOPER_SERVER),
                pathname: `login.html`,
                hash: JSON.stringify({
                    resourcePath: process.resourcePath,
                    requestId: authWindow.id,
                    location: url.format({
                        host: requestUrl.host,
                        port: requestUrl.port,
                        protocol: requestUrl.protocol
                    })
                })
            }));
        } else {
            authWindow.loadURL(url.format({
                protocol: 'file',
                pathname: `${process.resourcePath}/login.html`,
                slashes: true,
                hash: JSON.stringify({
                    resourcePath: process.resourcePath,
                    requestId: authWindow.id,
                    location: url.format({
                        host: requestUrl.host,
                        port: requestUrl.port,
                        protocol: requestUrl.protocol
                    })
                })
            }));
        }

        //authWindow.webContents.toggleDevTools();

        return authWindow;
    }

    getMainWindow(): BrowserWindow {
        return this.mainWindow;
    }

    getFocusedWindow(): BrowserWindow {
        return BrowserWindow.getFocusedWindow();
    }

    restoreMainWindow() {
        if (this.mainWindow) {
            if (this.mainWindow.isMinimized()) {
                this.mainWindow.restore();
                this.mainWindow.focus();
            } else {
                this.mainWindow.show();
            }
        }
    }

    sendCommand(command: string, ...args: Array<any>) {
        if (this.emit(command, ...args)) {
            return;
        }
        const targetWindow = this.getFocusedWindow();
        if (targetWindow) {
            sendCommandToBrowserWindow(targetWindow, command, ...args);
        }
    }

    mapState(state: RootState, ownState: State) {
        return {
            organizationId: getSelectedOrganizationName(state)
        };
    }

    update() {
        const { organizationId } = this.state;

        if (this.mainWindow) {
            this.mainWindow.setTitle(organizationId ? `${organizationId}` : `Ryver`);
        }
    }
}

function windowForEvent({ sender }: { sender: WebContents }): BrowserWindow {
    return BrowserWindow.fromWebContents(sender);
}

function sendCommandToBrowserWindow(targetWindow: BrowserWindow, command: string, ...args: Array<any>) {
    const action = args[0] && args[0].contextCommand ? 'context-command' : 'command';
    targetWindow.webContents.send(action, command, ...args);
}

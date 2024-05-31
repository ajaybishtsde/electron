import * as path from 'path';
import * as fs from 'fs';
import { app, BrowserWindow, ipcMain, Menu, nativeImage, Tray, globalShortcut, WebContents, dialog, Session } from 'electron';
import { createNotification, createNotificationFn } from '@modules/core/actions/notification';
import ApplicationMenu from './ApplicationMenu';
import { setPreference, setPreferenceFn } from '@modules/core/actions/preference';
import { EventEmitter } from 'events';
import { ApplicationOptions } from './interfaces';
import { clamp, substitute } from 'yggdrasil/lib/string';
import { isMac, isMountainLion, isWin8, isLessThanWin8 } from '../../os-detection';
import { RootState } from '@modules/core/models/root';
import Component from './Component';
import { on, once } from 'yggdrasil/lib/event';
import { localize } from 'yggdrasil/lib/localization';
import { getBadgeCount } from '@modules/core/selectors/organization';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';
import { WindowManager } from '@modules/browser/WindowManager';
import TrayManager from '@modules/browser/TrayManager';
import { asRemovable } from 'yggdrasil/lib/removable';
import { resetState } from '@modules/browser/middlewares/persist-state';
import { clearIgnoredAuthUrls } from './extensions/authentication';
import { restartForUpdate, checkForUpdate } from '@modules/core/actions/update';
import { compositeDisposable } from '@modules/browser/utils';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:application`);

let INSTANCE: Application;

interface State {
    zoomLevel?: number;
}

export class Application extends Component<State> {
    private mainWindow: BrowserWindow;
    private menu: ApplicationMenu;

    trayManager: TrayManager;
    windowManager: WindowManager;

    constructor() {
        super();

        /* note: process app is required for single instance to work */
        INSTANCE = process.app = this;

        if (process.platform === 'darwin') {
            this.menu = new ApplicationMenu();
        }

        this.windowManager = new WindowManager();

        this.mainWindow = this.windowManager.createMainWindow();

        this.trayManager = new TrayManager();
    }

    componentDidMount() {
        this.own(
            on(this, 'application:reset', this.onReset),
            on(this, 'application:clear-auth', this.onClearAuth),
            on(this, 'application:clear-cache', this.onClearCache),
            on(this, 'application:restore', this.onRestore),
            on(this, 'application:quit', this.onQuit),
            on(this, 'application:disconnected', this.onDisconnected),
            on(this, 'application:zoomin', this.onZoomIn),
            on(this, 'application:zoomout', this.onZoomOut),
            on(this, 'application:resetzoom', this.onZoomReset),
            on(this, 'application:restart-for-update', this.onRestartForUpdate),
            on(this, 'application:check-for-update', this.onCheckForUpdate),
            on(app, 'window-all-closed', this.onWindowAllClosed),
            on(ipcMain, 'command', this.onCommand),
            this.windowManager,
            this.trayManager
        );
    }

    onCommand = (evt, command: string, ...args: any[]) => {
        this.sendCommand(command, ...args);
    }

    onRestore = (evt) => {
        this.windowManager.restoreMainWindow();
    }

    onAppMenuChange = (newMenu: Menu) => {
        Menu.setApplicationMenu(newMenu);
    }

    onRestartForUpdate = () => {
        this.store.dispatch(restartForUpdate());
    }

    onCheckForUpdate = () => {
        this.store.dispatch(checkForUpdate());
    }

    onClearCache = async () => {
        this.execClearCache();

        await this.sendCommand('window:reload');
    }

    onClearAuth = async () => {
        this.execClearAuth();

        await this.sendCommand('window:reload');
    }

    onReset = () => {
        dialog.showMessageBox(this.mainWindow, {
            type: `question`,
            title: i18n`Reset`,
            message: i18n`Are you sure you want to reset the app?`,
            detail: i18n`Resetting the app will restore it to its default state.`,
            noLink: true,
            buttons: [
                i18n`Cancel`,
                i18n`Reset`
            ]
        }, async (response) => {
            if (response === 1) {
                await this.execClearCache();
                await this.execClearAuth();
                await this.execClearStorage();
                await resetState();

                app.relaunch();
                app.exit(0);
            }
        });
    }

    execClearAuth = async (session: Session = this.mainWindow.webContents.session) => {
        await clearIgnoredAuthUrls();
        await new Promise(res => session.clearAuthCache({ type: `password` }, res));
        await new Promise(res => session.clearStorageData({
            storages: [`cookies`]
        }, res));
    }

    execClearStorage = async (session: Session = this.mainWindow.webContents.session) => {
        await new Promise(res => session.clearStorageData({
            storages: [`appcache`, `cookies`, `filesystem`, `indexdb`, `localstorage`, `shadercache`, `websql`, `serviceworkers`]
        }, res));
    }

    execClearCache = async (session: Session = this.mainWindow.webContents.session) => {
        await new Promise(res => session.clearCache(res));
    }

    onQuit = () => {
        app.quit();
    }

    onWindowAllClosed = () => {
        app.quit();
    }

    onZoomIn = () => {
        const { zoomLevel } = this.state;

        this.store.dispatch(setPreference(PREFERENCES.zoomLevel, Math.min(zoomLevel + 1, 9)));
    }

    onZoomOut = () => {
        const { zoomLevel } = this.state;

        this.store.dispatch(setPreference(PREFERENCES.zoomLevel, Math.max(zoomLevel - 1, -8)));
    }

    onZoomReset = () => {
        this.store.dispatch(setPreference(PREFERENCES.zoomLevel, 0));
    }

    onDisconnected = (org) => {
        debug('disconnected=', org);
        createNotification({
            subject: i18n`You were disconnected from one or more organizations.`,
            body: i18n`An un-recoverable connection error occurred on one or more organizations and you were disconnected.`
        });
    }

    sendCommand(command: string, ...args: Array<any>) {
        if (this.emit(command, ...args)) {
            return;
        } else if (this.windowManager) {
            this.windowManager.sendCommand(command, ...args);
        }
    }

    mapState(state: RootState, ownState: State) {
        return {
            zoomLevel: getPreference(state, PREFERENCES.zoomLevel)
        };
    }

    /* tslint:disable-next-line no-empty */
    update() {

    }
}

export default Application;

export function getTrayManager(): TrayManager {
    if (INSTANCE) {
        return INSTANCE.trayManager;
    }
}

export function getWindowManager(): WindowManager {
    if (INSTANCE) {
        return INSTANCE.windowManager;
    }
}

export function sendCommand(command: string, ...args: Array<any>) {
    if (INSTANCE) {
        INSTANCE.sendCommand(command, ...args);
    }
}

export function displayWin7Notification({ icon, subject, body }: { icon?: string, subject?: string, body?: string }, cb: () => void) {
    const trayManager = getTrayManager();
    if (trayManager) {
        trayManager.displayWin7Notification({ icon, subject, body }, cb);
    }
}

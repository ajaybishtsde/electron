
import { EventEmitter } from 'events';
import { Menu, MenuItemConstructorOptions, BrowserWindow, MenuItem } from 'electron';
import { sendCommand } from './Application';
import { restartForUpdate, checkForUpdate } from '@modules/core/actions/update';
import isEqual from 'lodash.isequal';
import Component from './Component';
import { on } from 'yggdrasil/lib/event';
import { RootState } from '@modules/core/models/root';
import { Organization } from '@modules/core/models/organization';
import { UpdateStatus } from '@modules/core/models/update';
import { getOrganizations, getSelectedOrganizationName } from '@modules/core/selectors/organization';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';
import { getUpdateStatus, getIsUpdateSupported } from '@modules/core/selectors/update';
import * as pkgJson from '../../package.json';

export interface OwnMenuItemConstructorOptions {
    selector?: string;
    command?: string;
    expand?: string;
    expandAs?: string;
}

export interface State {
    isOrganizationBarShown?: boolean;
    selectedOrganizationId?: string;
    organizations?: Organization[];
    updateStatus?: UpdateStatus;
    isUpdateSupported?: boolean;
}

const debug: debug.IDebugger = require('debug')('ryver-desktop:browser:application-menu');

export class ApplicationMenu extends Component<State> {
    private parentWindow: BrowserWindow;
    private menu: Menu;

    constructor(parentWindow?: BrowserWindow) {
        super();

        this.parentWindow = parentWindow;
    }

    shouldComponentUpdate(nextState: State) {
        return !isEqual(this.state, nextState);
    }

    mapState(rootState: RootState, ownState: State): State {
        return {
            isOrganizationBarShown: getPreference(rootState, PREFERENCES.isOrganizationBarShown),
            selectedOrganizationId: getSelectedOrganizationName(rootState),
            organizations: getOrganizations(rootState),
            updateStatus: getUpdateStatus(rootState),
            isUpdateSupported: getIsUpdateSupported(rootState)
        };
    }

    createAppMenu(): MenuItemConstructorOptions {
        return process.platform === 'darwin' ? {
            label: i18n`Ryver`,
            submenu: [
                { label: i18n`Preferences...`, ...mapCommand('window:show-settings'), accelerator: 'CommandOrControl+,' },
                { type: 'separator' },
                { label: i18n`Hide`, role: 'hide', accelerator: 'CommandOrControl+H' },
                { label: i18n`Hide Others`, role: 'hideothers', accelerator: 'CommandOrControl+Alt+H' },
                { type: 'separator' },
                { label: i18n`Quit`, ...mapCommand('application:quit'), accelerator: 'CommandOrControl+Q' }
            ]
        } : void 0;
    }

    createFileMenu(): MenuItemConstructorOptions {
        return {
            label: i18n`&File`,
            submenu: process.platform === 'darwin' ? [
                { label: i18n`Close`, role: 'close' }
            ] : [
                    { label: i18n`&Preferences`, ...mapCommand('window:show-settings'), accelerator: 'Control+P' },
                    { type: 'separator' },
                    { label: i18n`Quit`, ...mapCommand('application:quit'), accelerator: 'Control+Q' }
                ]
        };
    }

    createEditMenu(): MenuItemConstructorOptions {
        const { organizations, selectedOrganizationId } = this.state;
        const organization = organizations.find(org => org.name === selectedOrganizationId);

        return {
            label: i18n`Edit`,
            submenu: [
                { label: i18n`Undo`, role: 'undo', accelerator: 'CommandOrControl+Z' },
                { label: i18n`Redo`, role: 'redo', accelerator: 'Shift+CommandOrControl+Z' },
                { type: 'separator' },
                { label: i18n`Cut`, role: 'cut', accelerator: 'CommandOrControl+X' },
                { label: i18n`Copy`, role: 'copy', accelerator: 'CommandOrControl+C' },
                { label: i18n`Paste`, role: 'paste', accelerator: 'CommandOrControl+V' },
                { label: i18n`Select All`, role: 'selectall', accelerator: 'CommandOrControl+A' },
                ...organization ? <MenuItemConstructorOptions[]>[
                    { type: 'separator' },
                    { label: organization.name, ...mapCommand('window:edit-account'), accelerator: 'CommandOrControl+E' }
                ] : []
            ]
        };
    }

    createViewMenu(): MenuItemConstructorOptions {
        return {
            label: i18n`View`,
            submenu: [
                { label: i18n`Reload`, ...mapCommand('window:reload'), accelerator: 'CommandOrControl+R' },
                { label: i18n`Toggle Full Screen`, role: 'togglefullscreen', accelerator: 'CommandOrControl+Shift+F' },
                ...process.env.NODE_ENV !== 'production' ? <MenuItemConstructorOptions[]>[
                    {
                        label: i18n`Developer`, submenu: [
                            {
                                label: i18n`Toggle Developer Tools`,
                                ...mapCommand('window:toggle-dev-tools'),
                                accelerator: process.platform !== 'darwin' ? 'Control+Shift+I' : 'Command+Option+I'
                            }
                        ]
                    }
                ] : [],
                { type: 'separator' },
                { label: i18n`Zoom In`, ...mapCommand('application:zoomin'), accelerator: 'CommandOrControl+=' },
                { label: i18n`Zoom Out`, ...mapCommand('application:zoomout'), accelerator: 'CommandOrControl+-' },
                { label: i18n`Restore Zoom`, ...mapCommand('application:resetzoom'), accelerator: 'CommandOrControl+0' }
            ]
        };
    }

    createWindowMenu(): MenuItemConstructorOptions {
        const { organizations, isOrganizationBarShown } = this.state;

        return {
            label: i18n`Window`,
            submenu: [
                ...process.platform === 'darwin' ? <MenuItemConstructorOptions[]>[
                    { label: i18n`Minimize`, role: 'minimize', accelerator: 'CommandOrControl+M' },
                    { label: i18n`Zoom`, role: 'zoom' },
                    { type: 'separator' },
                ] : [],
                {
                    type: 'checkbox',
                    label: i18n`Hide Organization Switcher`,
                    checked: !isOrganizationBarShown,
                    ...mapCommand(`window:${isOrganizationBarShown ? 'hide' : 'show'}-org-switcher`)
                },
                { type: 'separator' },
                { label: i18n`&Next Organization`, ...mapCommand('window:next-account'), accelerator: 'Shift+CommandOrControl+]' },
                { label: i18n`&Prev Organization`, ...mapCommand('window:prev-account'), accelerator: 'Shift+CommandOrControl+[' },
                ...organizations ? <MenuItemConstructorOptions[]>organizations.slice(0, 9).map((org, idx) => ({
                    label: org.name,
                    ...mapCommand(`window:instance-${idx + 1}`),
                    accelerator: `CommandOrControl+${idx + 1}`
                })) : [],
                { type: 'separator' },
                { label: i18n`Sign in to &Organization`, ...mapCommand('window:add-account'), accelerator: 'CommandOrControl+Shift+A' }
            ]
        };
    }

    createHelpMenu(): MenuItemConstructorOptions {
        const { updateStatus, isUpdateSupported } = this.state;

        const updateStatusToLabel = {
            [UpdateStatus.Fetch]: i18n`Downloading Update`,
            [UpdateStatus.Ignore]: i18n`Restart To Update`
        };
        const updateStatusToEnable = {
            [UpdateStatus.Ignore]: true,
            [UpdateStatus.NoUpdate]: true,
            [UpdateStatus.Error]: true
        };

        return {
            label: i18n`&Help`,
            submenu: [
                ...isUpdateSupported ? <MenuItemConstructorOptions[]>[
                    {
                        label: updateStatusToLabel[updateStatus] || i18n`Check For Updates`,
                        ...mapCommand(updateStatus === UpdateStatus.Ignore ? `application:restart-for-update` : `application:check-for-update`),
                        enabled: !!updateStatusToEnable[updateStatus]
                    },
                    { type: 'separator' }
                ] : [],
                {
                    label: i18n`Troubleshooting`, submenu: [
                        { label: i18n`Clear Cache`, ...mapCommand('application:clear-cache') },
                        { label: i18n`Clear Cookies`, ...mapCommand('application:clear-auth') },
                        { label: i18n`Reset App...`, ...mapCommand('application:reset') }
                    ]
                },
                { type: 'separator' },
                { label: i18n`About`, ...mapCommand('application:about') }
            ]
        };
    }

    update() {
        this.menu = Menu.buildFromTemplate([
            this.createAppMenu(),
            this.createFileMenu(),
            this.createEditMenu(),
            this.createViewMenu(),
            this.createWindowMenu(),
            this.createHelpMenu()
        ].filter(menu => !!menu));

        if (this.parentWindow) {
            this.parentWindow.setMenu(this.menu);
        } else {
            Menu.setApplicationMenu(this.menu);
        }
    }
}

export default ApplicationMenu;

function mapCommand(command: string) {
    return { click: () => sendCommand(command) };
}

import * as path from 'path';
import * as url from 'url';
import Component from './Component';
import { nativeImage, Tray, Menu, NativeImage, MenuItemConstructorOptions, app } from 'electron';
import { on } from 'yggdrasil/lib/event';
import { asRemovable, toRemovable, Removable, RemoveFn } from 'yggdrasil/lib/removable';
import setup from '../../extensions';
import { RootState } from '@modules/core/models/root';
import isEqual from 'lodash.isequal';
import { sendCommand } from '@modules/browser/Application';
import { clamp } from 'yggdrasil/lib/string';
import { getBadgeCount } from '@modules/core/selectors/organization';
import { isMac } from '../../os-detection';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:window-manager`);

interface State {
    badgeCount?: number;
}

export class TrayManager extends Component<State> {
    private tray: Tray;
    private unreadStatusImages: NativeImage[];
    private menu: Menu;
    private win7NotificationAction: () => void;

    state = {
        badgeCount: 0
    };

    constructor() {
        super();

        if (process.platform === 'win32') {
            this.unreadStatusImages = [
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-1.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-2.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-3.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-4.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-5.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-6.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-7.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-8.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-9.png'))),
                nativeImage.createFromPath(path.join(process.resourcePath, require('../../../resources/win/tray-16-10.png')))
            ];

            this.tray = new Tray(this.unreadStatusImages[0]);
        }
    }

    componentDidMount() {
        if (this.tray) {
            this.own(
                on(this.tray, 'click', this.onRestore),
                on(this.tray, 'balloon-click', this.onBaloonClick)
            );
        }
    }

    onRestore = () => {
        sendCommand('application:restore');
    }

    onBaloonClick = () => {
        const win7NotificationAction = this.win7NotificationAction; this.win7NotificationAction = void 0;
        if (win7NotificationAction) {
            win7NotificationAction();
        }
    }

    shouldComponentUpdate(nextState: State) {
        return !isEqual(this.state, nextState);
    }

    mapState(rootState: RootState, ownState: State) {
        return {
            badgeCount: getBadgeCount(rootState)
        };
    }

    createTrayMenu(): MenuItemConstructorOptions[] {
        return [
            { label: 'Quit', ...mapCommand('application:quit') }
        ];
    }

    update() {
        const { badgeCount } = this.state;

        if (isMac()) {
            LOG_DEBUG('setting badge count to %d', badgeCount);
            app.dock.setBadge(badgeCount > 0 ? badgeCount < 10 ? badgeCount.toString() : '!' : '');
        }

        if (this.tray) {
            this.menu = Menu.buildFromTemplate(this.createTrayMenu());
            this.tray.setContextMenu(this.menu);
            this.tray.setImage(this.unreadStatusImages[badgeCount > 0 ? badgeCount < 10 ? badgeCount : 10 : 0]);
        }
    }

    displayWin7Notification({ icon, subject, body }: { icon?: string, subject?: string, body?: string }, cb: () => void) {
        if (this.tray) {
            this.tray.displayBalloon({
                icon: icon,
                title: clamp(subject, 63),
                content: clamp(body, 255)
            });
            this.win7NotificationAction = cb;
        }
    }
}

export default TrayManager;

function mapCommand(command: string) {
    return { click: () => sendCommand(command) };
}

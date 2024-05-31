import { toRemovable, asRemovable } from 'yggdrasil/lib/removable';
import { on } from 'yggdrasil/lib/event';
import { mixin } from 'yggdrasil/lib/lang';
import { debounce } from 'yggdrasil/lib/lang';
import checkBounds from '../check-bounds';
import { WindowBounds } from '@modules/core/models/window-bounds';
import { setPreferences } from '@modules/core/actions/preference';
import { getState, dispatch } from '../store';
import { getPreferences } from '@modules/core/selectors/preference';
import { screen } from 'electron';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';

const debug: Debug.Logger = require('debug')(`ryver-desktop:browser:traits:position`);

// TODO: potential issue after starting app in fullscreen and leaving fullscreen (https://github.com/electron/electron/issues/6036);
export function windowPosition() {
    return (browserWindow: Electron.BrowserWindow) => {
        const initialBounds = getPreference(getState(), PREFERENCES.windowBounds) || {};
        let rect: Electron.Rectangle = { x: initialBounds.x, y: initialBounds.y, width: initialBounds.width, height: initialBounds.height };
        let isMaximized: boolean = initialBounds.maximized;
        let isFullScreen: boolean = false; // bounds.fullscreen; // TODO: see issue above, electron #6036

        const getWindowBounds: () => WindowBounds = () => ({ ...rect, fullscreen: isFullScreen, maximized: isMaximized });

        const setWindowBounds = ({ x, y, width, height, maximized, fullscreen }: WindowBounds) => {
            debug('setWindowBounds=', x, y, width, height, maximized, fullscreen);
            browserWindow.setBounds({ x, y, width, height });
            browserWindow.setFullScreen(fullscreen);
            if (maximized) {
                browserWindow.maximize();
            }
        };

        const onPositionChange = debounce(() => {
            debug(`resize max=${browserWindow.isMaximized()}, min=${browserWindow.isMinimized()} full=${browserWindow.isFullScreen()}`);
            if (browserWindow.isMinimized()) {
                return; // do nothing
            }
            isMaximized = browserWindow.isMaximized();
            isFullScreen = browserWindow.isFullScreen();
            if (!isMaximized && !isFullScreen) {
                rect = browserWindow.getBounds();
            }
            dispatch(setPreferences({ windowBounds: getWindowBounds() }));
        }, 500);

        const onRestore = () => {
            debug(`restore rect=`, rect, `max=`, isMaximized, `full=`, isFullScreen);
        };

        const onDisplayGeometryChange = debounce(() => {
            setWindowBounds(checkBounds(getWindowBounds()));
        }, 500);

        setWindowBounds(checkBounds(getWindowBounds()));

        return toRemovable(
            on(browserWindow, 'move', onPositionChange),
            on(browserWindow, 'resize', onPositionChange),
            on(browserWindow, 'restore', onRestore),
            on(screen, 'display-added', onDisplayGeometryChange),
            on(screen, 'display-removed', onDisplayGeometryChange)
        );
    };
}

export default windowPosition;

import { BrowserWindow, Menu, screen } from 'electron';
import { WindowBounds } from '@modules/core/models/window-bounds';

// HACK: use an 8px fudge factor; find out a better way https://github.com/electron/electron/issues/8728
function hasCornerInRect(bounds: WindowBounds, rect: Electron.Rectangle) {
    LOG_DEBUG('bounds %j has corner in rect %j', bounds, rect);
    return bounds.x >= (rect.x - 0) &&
        bounds.y >= (rect.y - 0) &&
        bounds.x <= (rect.x + rect.width - rect.width / 32) &&
        bounds.y <= (rect.y + rect.height - rect.height / 32);
}

const DEFAULT_WIDTH = 1280;
const DEFAULT_HEIGHT = 1024;

export function checkBounds(bounds: WindowBounds): WindowBounds {
    const found = screen
        .getAllDisplays()
        .some(display => bounds.fullscreen ? hasCornerInRect(bounds, display.bounds) : hasCornerInRect(bounds, display.workArea));

    LOG_INFO('found display %s for bounds %j', found, bounds);

    if (found) {
        return bounds;
    } else {
        const primaryWorkArea = screen.getPrimaryDisplay().workArea;
        const w = Math.min(DEFAULT_WIDTH, primaryWorkArea.width);
        const h = Math.min(DEFAULT_HEIGHT, primaryWorkArea.height);
        return {
            x: (primaryWorkArea.x + primaryWorkArea.width / 2 - w / 2) << 0,
            y: (primaryWorkArea.y + primaryWorkArea.height / 2 - h / 2) << 0,
            width: w,
            height: h,
            fullscreen: false,
            maximized: false
        };
    }

    return bounds;
}

export default checkBounds;

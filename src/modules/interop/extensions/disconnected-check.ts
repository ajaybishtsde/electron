
import { ipcRenderer, remote } from 'electron';
import { AppConnector } from '../app-connector';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:extensions:disconnected-check`);

export function disconntected() {
    return (connector: AppConnector) => {
        debug('disconnected-check ENABLED');

        connector.subscribe('/app/xmpp/disconnected', () => {
            debug('disconnected');
            ipcRenderer.send('window-command', 'window:disconnected', window.ryverAppContext);
        });
    };
}

export default disconntected;

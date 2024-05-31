// import forceGC from '../renderer/extensions/force-gc';

import { setup } from '../../extensions';
import ryverAppConnect from './connect';





// myWindow.webContents.executeJavaScript(`localStorage.getItem('username')`).then(value => value);
// In main process

if (process.env.RYVER_LOG_LEVEL === 'debug') {
    localStorage.setItem('debug', '*,-ratatoskr:*,-ryver:xmpp:*,-sockjs-client:*,-engine.io-client:*,-socket.io-client:*,-socket.io-parser');
} else {
    localStorage.setItem('debug', '');
}

setup(window, []);

window.ryverAppConnect = ryverAppConnect;

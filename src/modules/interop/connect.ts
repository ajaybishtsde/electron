import { AppConnector } from './app-connector';
import { setup } from '../../extensions';

import userPresence from './extensions/user-presence';
import unseenActivity from './extensions/unseen-activity';
import visSync from './extensions/vis-sync';
import voice from './extensions/voice';
import disconnectedCheck from './extensions/disconnected-check';
import { createStore } from '@modules/interop/store';

const debug: Debug.Logger = require('debug')(`ryver-desktop:webviewer:connect`);

export default function(connector: AppConnector) {
    LOG_DEBUG('connecting');
    const store = createStore(connector);
    setup(connector, [userPresence(), unseenActivity(), visSync(), disconnectedCheck(), voice()]);
}

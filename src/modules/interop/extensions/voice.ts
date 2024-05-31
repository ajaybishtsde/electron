import { debounce } from 'yggdrasil/lib/lang';
import { isWin, isWin8 } from '../../../os-detection';
import { ipcRenderer, remote, IpcMessageEvent } from 'electron';
import { AppConnector } from '../app-connector';
import { asRemovable, toRemovable } from 'yggdrasil/lib/removable';
import on from 'yggdrasil/lib/event';
import { EventEmitter } from 'events';
import { generate } from 'shortid';

const debug: Debug.Logger = require('debug')(`ryver-desktop:interop:extensions:voice`);

export function voice() {
    return (connector: AppConnector) => {
        debug('voice ENABLED');

        let getSourceReqId: string;

        connector.subscribe(`/desktop/voice/send/roomChange`, (roomChange) => {
            LOG_DEBUG(`/desktop/voice/send/roomChange`);
            // todo: should remote come from inside the app?
            ipcRenderer.send(`voice-command`, `room-change`, { remote: window.ryverAppContext.name, ...roomChange });
        });

        connector.subscribe(`/desktop/voice/send/muteChange`, (muteChange) => {
            LOG_DEBUG(`/desktop/voice/send/muteChange`);
            ipcRenderer.send(`voice-command`, `mute-change`, muteChange);
        });

        connector.subscribe(`/desktop/voice/send/muteStream`, (muteStatus) => {
            LOG_DEBUG(`/desktop/voice/send/muteStream`);
            ipcRenderer.send(`voice-command`, `mute-stream`, muteStatus);
        });

        connector.subscribe(`/desktop/voice/send/leaveRoom`, () => {
            LOG_DEBUG(`/desktop/voice/send/leaveRoom`);
            ipcRenderer.send(`voice-command`, `leave-room`);
        });

        connector.subscribe(`/desktop/voice/send/getSource`, () => {
            LOG_DEBUG(`/desktop/voice/send/getSource`);
            ipcRenderer.send(`voice-command`, `get-source`, getSourceReqId = generate());
        });

        const events = new EventEmitter();

        return toRemovable(
            on(ipcRenderer, 'voice-command', (evt: IpcMessageEvent, command, ...args) => {
                debug('received voice-command from=', evt.sender.id, command, args);
                events.emit(command, ...args);
            }),
            on(events, 'room-change', (roomChange) => connector.publish(`/desktop/voice/recv/roomChange`, roomChange)),
            on(events, 'mute-change', (muteChange) => connector.publish(`/desktop/voice/recv/muteChange`, muteChange)),
            on(events, 'mute-stream', (muteStatus) => connector.publish(`/desktop/voice/recv/muteStream`, muteStatus)),
            on(events, 'leave-room', () => connector.publish(`/desktop/voice/recv/leaveRoom`)),
            on(events, 'send-source', (requestId, mediaSource, sourceId) => {
                if (requestId === getSourceReqId) {
                    LOG_DEBUG('sending source %s', sourceId);
                    connector.publish(`/desktop/voice/recv/getSource`, mediaSource, sourceId)
                }
            })
        );
    };
}

export default voice;

import { on, once } from 'yggdrasil/lib/event';
import { IpcMessageEvent, webContents, ipcMain } from 'electron';
import * as VoiceActions from '@modules/core/actions/voice';
import { MiddlewareAPI } from 'redux';
import { PreferenceStateSlice, PREFERENCES } from '@modules/core/models/preference';
import { Dispatch } from 'redux';
import { getPreference } from '@modules/core/selectors/preference';
import { EventEmitter } from 'events';
import { VoiceStateSlice } from '@modules/core/models/voice';
import { push } from '@modules/core/actions/navigation';

const debug: Debug.Logger = require('debug')(`ryver-desktop:renderer:middlewares:voice`);

export const voice = () => (store: MiddlewareAPI<Dispatch, VoiceStateSlice>): any => {
    debug('setup voice middleware');

    const events = new EventEmitter();

    on(ipcMain, 'voice-command', (evt: IpcMessageEvent, command, ...args) => {
        events.emit(command, ...args);
        sendVoiceCommand(evt, command, ...args);
    });

    on(events, 'room-change', (roomChange) => {
        store.dispatch(VoiceActions.receiveRoomChange(roomChange));
    });
    on(events, 'get-source', (transactionId) => {
        store.dispatch(VoiceActions.getSource(transactionId));
    });

    return (next: Dispatch) => (action: VoiceActions.ActionType) => {
        switch (action.type) {
            case VoiceActions.GET_SOURCE: {
                const res = next(action);
                store.dispatch(push(`/get-source/${action.transactionId}`, { modal: true }));
                return res;
            }
            case VoiceActions.SEND_SOURCE: {
                const res = next(action);
                sendVoiceCommand(null, 'send-source', action.transactionId, action.mediaSource, action.sourceId);
                return res;
            }
        }
        return next(action);
    };
};

export default voice;

const sendVoiceCommand = (evt: IpcMessageEvent, command: string, ...args: any[]) => {
    // todo: Is this 100% safe? Only the interop preload script should ever have access to electron APIs. Is there any way around that?
    webContents.getAllWebContents().forEach(webContents => {
        if (webContents.hostWebContents !== null && (!evt || evt.sender.id !== webContents.id)) {
            debug('send voice-command to=', webContents.id, command, args);
            webContents.send(`voice-command`, command, ...args);
        }
    });
}

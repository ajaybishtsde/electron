import { Reducer } from 'redux';

import * as VoiceActions from '../actions/voice';
import { VoiceState } from '@modules/core/models/voice';

const DEFAULT: VoiceState = Object.freeze(<VoiceState>{
    organization: void 0,
    room: void 0,
    roomContext: void 0
});

export const reduce: Reducer<VoiceState> = (prevState: VoiceState = DEFAULT, action: VoiceActions.ActionType) => {
    switch (action.type) {
        case VoiceActions.RECEIVE_ROOM_CHANGE: {
            return {
                ...prevState,
                organization: action.remote,
                room: action.room,
                roomContext: action.roomContext
            };
        }
        case VoiceActions.RESET_VOICE: {
            return DEFAULT;
        }
    }
    return prevState;
};

export default reduce;

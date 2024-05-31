import { User } from 'yggdrasil/lib/models/user';
import { Team } from 'yggdrasil/lib/models/team';
import { Forum } from 'yggdrasil/lib/models/forum';

export const RECEIVE_ROOM_CHANGE = 'RECEIVE_ROOM_CHANGE';

export interface ReceiveRoomChange {
    type: typeof RECEIVE_ROOM_CHANGE;
    remote: string;
    room: string;
    roomContext: User | Team | Forum;
}

export type ReceiveRoomChangeType = ReceiveRoomChange;

export type receiveRoomChangeFn = (roomChange: { remote: string, room: string, roomContext: User | Team | Forum }) => void;
export function receiveRoomChange(roomChange: { remote: string, room: string, roomContext: User | Team | Forum }) {
    return <ReceiveRoomChange>{ type: RECEIVE_ROOM_CHANGE, ...roomChange };
}

export const RESET_VOICE = 'RESET_VOICE';

export interface ResetVoice {
    type: typeof RESET_VOICE;
}

export type ResetVoiceType = ResetVoice;

export type resetVoiceFn = () => void;
export function resetVoice() {
    return <ResetVoice>{ type: RESET_VOICE };
}

export const GET_SOURCE = 'GET_SOURCE';

export interface GetSource {
    type: typeof GET_SOURCE;
    transactionId: string;
}

export type GetSourceType = GetSource;

export type getSourceFn = (transactionId: string) => void;
export function getSource(transactionId: string) {
    return <GetSource>{ type: GET_SOURCE, transactionId };
}

export const SEND_SOURCE = 'SEND_SOURCE';

export interface SendSource {
    type: typeof SEND_SOURCE;
    transactionId: string;
    mediaSource: string;
    sourceId: string;
}

export type SendSourceType = SendSource;

export type sendSourceFn = (transactionId: string, mediaSource: string, sourceId: string) => void;
export function sendSource(transactionId: string, mediaSource: string, sourceId: string) {
    return <SendSource>{ type: SEND_SOURCE, transactionId, mediaSource, sourceId };
}

export type ActionType = ReceiveRoomChangeType | ResetVoiceType | GetSourceType | SendSourceType;

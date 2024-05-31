import { User } from 'yggdrasil/lib/models/user';
import { Team } from 'yggdrasil/lib/models/team';
import { Forum } from 'yggdrasil/lib/models/forum';

export interface VoiceState {
    organization?: string;
    room?: string;
    roomContext?: User | Team | Forum;
}

export interface VoiceStateSlice {
    voice?: VoiceState;
}

import { VoiceStateSlice } from '@modules/core/models/voice';

export const getInVoiceOrganizationName = ({ voice: { organization, room } }: VoiceStateSlice) => room && organization;

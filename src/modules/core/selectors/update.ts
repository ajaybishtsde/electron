import { createSelector } from 'reselect';
import { UpdateState, UpdateStateSlice } from '@modules/core/models/update';

export const getUpdateStatus = ({ update: { status } }: UpdateStateSlice) => status;
export const getUpdateStatusOrigin = ({ update: { origin } }: UpdateStateSlice) => origin;
export const getIsUpdateSupported = ({ update: { supported } }: UpdateStateSlice) => supported;

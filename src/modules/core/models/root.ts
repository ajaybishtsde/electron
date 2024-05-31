import { OrganizationStateSlice } from './organization';
import { PreferenceStateSlice, PreferenceStatusStateSlice } from './preference';
import { UpdateStateSlice } from './update';
import { AppStateSlice } from './app';
import { VoiceStateSlice } from './voice';
import { RouterState } from 'react-router-redux';
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

export type RootState =
    AppStateSlice & OrganizationStateSlice & PreferenceStateSlice & UpdateStateSlice &
    VoiceStateSlice & PreferenceStatusStateSlice;

export type RootStateFn = () => RootState;
export type StateFn<T> = () => T;

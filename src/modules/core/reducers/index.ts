import organization from './organization';
import preference from './preference';
import update from './update';
import voice from './voice';
import app from './app';
import { routerReducer as router } from 'react-router-redux';
import { Reducer } from 'redux';
import { RootState } from '../models/root';
import { combineReducers } from 'redux';
import mergeReducers from '../../../merge-reducers';
import preferenceStatus from './preference-status';

export default combineReducers<RootState>({
    app: mergeReducers(
        router,
        app
    ),
    organization,
    preference,
    preferenceStatus,
    update,
    voice
});

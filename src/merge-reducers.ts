import { Reducer } from 'redux';

export default function mergeReducers<S>(...reducers: Array<Reducer<any>>): Reducer<S> {
    const finalReducers = [...reducers];
    const finalReducersProps = finalReducers
        .map(reducer => reducer(void 0, { type: '@@gersemi/MERGE_SHAPE' }))
        .map(state => Object.keys(state));

    return function combination(state, action) {
        let hasChanged = false;
        const nextState: S = {} as any;
        const nextStatePerReducer = finalReducers.map(reducer => reducer(state, action));
        for (let i = 0; i < nextStatePerReducer.length; i++) {
            for (let j = 0; j < finalReducersProps[i].length; j++) {
                const prevPropValue = state ? state[finalReducersProps[i][j]] : void 0;
                const nextPropValue = nextState[finalReducersProps[i][j]] = nextStatePerReducer[i][finalReducersProps[i][j]];
                hasChanged = hasChanged || nextPropValue !== prevPropValue;
            }
        }
        return hasChanged ? nextState : state;
    };
}

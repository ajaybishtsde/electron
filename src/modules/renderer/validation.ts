import { Component } from 'react';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:validation');

export interface Rule {
    prop: string;
    check?: (value: any) => boolean;
    checkAsync?: (value: any) => Promise<boolean>;
    none?: any;
    message: string;
}

export interface RunOptions {
    debounce?: number;
}

/**
# Use
Component State Declaration:
```
interface State {
    // ...
    name?: string;
    nameChanged?: boolean;
    nameError?: string;
    nameErrorPending?: number;
    // ...
}
```

Component:
```
setState(nextState: State, cb?: () => any) {
    super.setState(createValidationState(this.rules, this.state, nextState, s => super.setState(s)));
    super.setState(nextState, cb);
}
```
 */
export const createValidationState = <S>(rules: Rule[], prevState: S, nextState: Partial<S>, setState: (nextState: Partial<S>) => void, { debounce = 250 }: RunOptions = {}) => {
    const validationState = {};
    const propsSeen: Partial<{[prop in keyof S]: boolean }> = {};

    rules.forEach(rule => {
        const { prop, check, checkAsync, none, message } = rule;

        const propChanged = `${prop}Changed`;
        const propError = `${prop}Error`;
        const propErrorPending = `${prop}ErrorPending`;

        if (propsSeen[prop] && (validationState[propError] || validationState[propErrorPending] > 0)) {
            return;
        }

        propsSeen[prop] = true;

        const propChangedByUser = prevState[propChanged] || nextState[propChanged];
        const propStrictEq = prevState[prop] === (nextState[prop] !== void 0 ? nextState[prop] : prevState[prop]);

        if (propChangedByUser && !propStrictEq) {
            const value = nextState[prop] !== void 0 ? nextState[prop] : prevState[prop];

            if (check) {
                validationState[propError] = check(value) ? void 0 : message;
            } else if (checkAsync) {
                if (prevState[propErrorPending]) {
                    clearTimeout(prevState[propErrorPending]);
                }
                validationState[propError] = void 0;
                validationState[propErrorPending] = setTimeout(() => {
                    checkAsync(value).then(res => {
                        setState({
                            [propError]: res ? void 0 : message,
                            [propErrorPending]: 0
                        } as any);
                    }).catch(err => {
                        debug('err=', err);
                        throw err;
                    });
                }, debounce);
            }
        }
    });

    return validationState;
};

export const isValidationStateOk = <S>(rules: Rule[], state: S) => {
    return rules.every(({ prop }) => !state[`${prop}Error`] && !state[`${prop}ErrorPending`]);
};

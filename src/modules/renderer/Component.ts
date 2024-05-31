import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Removable } from 'yggdrasil/lib/removable';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:component');

export class Component<Props, State> extends React.Component<Props, State> {
    removeOnUnmount: Removable[] = [];

    ownOnMount(...args: Removable[]) {
        this.removeOnUnmount.push.apply(this.removeOnUnmount, args);
    }

    componentWillUnmount() {
        this.removeOnUnmount.forEach((v) => v.remove());
        this.removeOnUnmount = [];
    }
}

export default Component;

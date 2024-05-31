import * as React from 'react';
import Component from '../../Component';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
import $C from 'classnames';

const debug: debug.IDebugger = require('debug')('gersemi:screens:startup');

export interface Props {

}

const muiStyles: any = {
    content: {
        width: '300px',
        padding: '16px'
    }
};

import styles from './styles.css';
export default ({}: Props) => {
    return (
        <div className={$C(styles.root)}>
            <Paper style={muiStyles.content}>
            <h2 className={$C(styles.header)}>Initializing...</h2>
            <LinearProgress variant={`indeterminate`} />
            </Paper>
        </div>
    );
};

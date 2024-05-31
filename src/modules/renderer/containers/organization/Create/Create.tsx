import React, { SFC } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import $C from 'classnames';
import Component from '../../../Component';
import { Dialog, DialogContent, DialogTitle, TextField, Avatar, DialogActions, Button, LinearProgress, InputAdornment } from '@material-ui/core';
import { RootState } from '@modules/core/models/root';
import { goBack, goBackFn } from '@modules/core/actions/navigation';
import { createValidationState, Rule, isValidationStateOk } from '@modules/renderer/validation';
import { PRIMARY_COLORS } from '@modules/renderer/styles/colors';
import { ColorSwatchPicker } from '@modules/renderer/components/ColorSwatchPicker/ColorSwatchPicker';
import { createOrganization, createOrganizationFn } from '@modules/core/actions/organization';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:containers:organization:create');

export interface Props extends RouteComponentProps<{}> {
    open?: boolean;
    goBack?: goBackFn;
    createOrganization?: createOrganizationFn;
}

export interface State {
    name?: string;
    nameChanged?: boolean;
    nameError?: string;
    nameErrorPending?: number;
    short?: string;
    shortChanged?: boolean;
    shortError?: string;
    color?: string;
    colorChanged?: boolean;
}

const isOrganizationOk = (name: string): Promise<boolean> => {
    return fetch(`https://${name}.ryver.com/chk`, { mode: 'no-cors', redirect: 'error' })
        .then(res => true)
        .catch(err => false);
};

import styles from './styles.css';
export class Create extends Component<Props, State> {

    rules = [
        { prop: 'name', check: name => /\S/.test(name), none: '', message: i18n`Organization cannot be empty` },
        { prop: 'name', check: name => /^[\w-_]+(\.(dev|qat|int))?$/.test(name), none: '', message: i18n`Organization cannot contain non-standard characters.` },
        { prop: 'name', checkAsync: isOrganizationOk, none: '', message: i18n`Organization does not exist.` },
        { prop: 'short', check: short => /\S/.test(short), none: '', message: i18n`Initials cannot be empty` },
    ];

    state: State = {
        nameError: i18n`Organization cannot be empty`
    };

    render() {
        const { open, goBack } = this.props;
        const {
            name,
            nameChanged,
            nameError,
            nameErrorPending,
            short = '',
            shortChanged,
            shortError,
            color,
            colorChanged
        } = this.state;
        const avatarFontSize = 28 - (short.length < 5 ? short.length * 4 : 18);
        return (
            <Dialog open={open} onClose={goBack} disableEnforceFocus>
                <DialogTitle>{i18n`Add Organization`}</DialogTitle>
                <DialogContent>
                    <div className={styles.content}>
                        <div className={styles.side}>
                            <Avatar
                                className={styles.avatar}
                                style={{ fontSize: avatarFontSize, backgroundColor: color }}
                            >
                                {short || ' '}
                            </Avatar>
                        </div>
                        <div className={styles.form}>
                            <TextField
                                className={styles.row}
                                label={i18n`Organization Name`}
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">.ryver.com</InputAdornment>,
                                }}
                                error={!!(nameChanged && nameError)}
                                value={name}
                                onChange={this.onNameChange}
                                fullWidth
                                autoFocus
                            />
                            {nameChanged && (nameErrorPending > 0) ? (
                                <LinearProgress className={styles.errorPending} variant={`indeterminate`} />
                            ) : null}
                            {nameChanged && nameError && (nameErrorPending <= 0) ? (
                                <span className={styles.error}>{nameError}</span>
                            ) : null}
                            <TextField
                                className={styles.row}
                                label={i18n`Initials`}
                                error={!!(shortChanged && shortError)}
                                value={short}
                                onChange={this.onShortChange}
                                fullWidth
                            />
                            {shortChanged && shortError ? (
                                <span className={styles.error}>{shortError}</span>
                            ) : null}
                            <ColorSwatchPicker
                                className={$C(styles.row, styles.rowColor)}
                                colors={PRIMARY_COLORS}
                                value={color}
                                onChange={this.onColorChange}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={goBack}
                    >
                        {i18n`Cancel`}
                    </Button>
                    <Button
                        color={`primary`}
                        onClick={this.onSave}
                        disabled={!isValidationStateOk(this.rules, this.state)}
                    >
                        {i18n`Ok`}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onNameChange = (evt) => {
        const { short, shortChanged, color, colorChanged } = this.state;

        this.setState({
            name: evt.target.value.toLowerCase(),
            nameChanged: true,
            short: shortChanged ? short : (evt.target.value[0] || '').toUpperCase(),
            /* color: colorChanged ? color : chooseColorFor(evt.target.value) */
        });
    }

    onShortChange = (evt) => {
        const { color, colorChanged } = this.state;
        this.setState({
            short: evt.target.value.slice(0, 5).toUpperCase(),
            shortChanged: true
        });
    }

    onColorChange = (newColor) => {
        this.setState({ color: newColor, colorChanged: true });
    }

    onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
        if (evt.keyCode === 13 && isValidationStateOk(this.rules, this.state)) {
            evt.preventDefault();
            this.onSave();
        }
    }

    onSave = () => {
        const { createOrganization } = this.props;
        const { name, short, color, colorChanged } = this.state;

        if (createOrganization) {
            createOrganization({
                name,
                short,
                color: colorChanged ? color : chooseColorFor(name),
                host: name
            });
        }
    }

    setState(nextState: State, cb?: () => any) {
        super.setState(createValidationState(this.rules, this.state, nextState, s => super.setState(s)));
        super.setState(nextState, cb);
    }
}

const mapStateToProps = (state: RootState, ownProps: Props): Props => {
    return {
        ...ownProps
    };
};

const mapDispatchToProps: any = {
    goBack,
    createOrganization
};

export default connect(mapStateToProps, mapDispatchToProps)(Create);

const __reduce__ = Array.prototype.reduce;
function chooseColorFor(s: string): string {
    return PRIMARY_COLORS[__reduce__.call(s, (x, v) => { return x ^ v.charCodeAt(0); }, 0) % PRIMARY_COLORS.length];
}

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
import {
    createOrganization, createOrganizationFn, updateOrganization,
    updateOrganizationFn, removeOrganization, removeOrganizationFn
 } from '@modules/core/actions/organization';
import { Organization } from '@modules/core/models/organization';
import { getOrganization } from '@modules/core/selectors/organization';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:containers:organization:create');

export interface Params {
    name?: string;
}

export interface Props extends RouteComponentProps<Params> {
    open?: boolean;
    organization?: Organization;
    goBack?: goBackFn;
    updateOrganization?: updateOrganizationFn;
    removeOrganization?: removeOrganizationFn;
}

export interface State {
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
export class Update extends Component<Props, State> {

    rules = [
        { prop: 'short', check: short => /\S/.test(short), none: '', message: i18n`Initials cannot be empty` },
    ];

    state: State = {

    };

    render() {
        const { open, organization, goBack } = this.props;
        const {
            short = organization.short || '',
            shortChanged,
            shortError,
            color = organization.color,
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
                                value={organization.name}
                                fullWidth
                                disabled
                            />
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
                <DialogActions className={styles.actions}>
                    <Button
                        className={styles.remove}
                        onClick={this.onRemove}
                    >
                        {i18n`Remove`}
                    </Button>
                    <span className={styles.spacer} />
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

    onRemove = () => {
        const { removeOrganization, organization } = this.props;
        if (removeOrganization) {
            removeOrganization(organization.name);
        }
    }

    onSave = () => {
        const { updateOrganization, organization, goBack } = this.props;
        const {
            short = organization.short || '',
            color = organization.color
        } = this.state;
        if (updateOrganization) {
            updateOrganization(organization.name, { short, color });
            goBack();
        }
    }

    setState(nextState: State, cb?: () => any) {
        super.setState(createValidationState(this.rules, this.state, nextState, s => super.setState(s)));
        super.setState(nextState, cb);
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        organization: getOrganization(rootState, ownProps.match.params)
    };
};

const mapDispatchToProps: any = {
    goBack,
    updateOrganization,
    removeOrganization
};

export default connect(mapStateToProps, mapDispatchToProps)(Update);

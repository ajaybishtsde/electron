import * as React from 'react';
import Component from '@modules/renderer/Component';
import { Dialog, DialogContent, Divider, Switch, FormGroup, FormControlLabel, TextField, MenuItem, DialogTitle, DialogActions, Button } from '@material-ui/core';
import { PreferenceState, PreferenceStatusState, DockBounceMode } from '@modules/core/models/preference';
import { isWin } from '../../../../../os-detection';
import { RootState } from '@modules/core/models/root';
import { getPreferences, getPreferencesStatus } from '@modules/core/selectors/preference';
import { connect } from 'react-redux';
import { goBack, goBackFn } from '@modules/core/actions/navigation';
import { setPreferencesFn, setPreferences } from '@modules/core/actions/preference';

interface Props {
    open?: boolean;
    preference?: PreferenceState;
    preferenceStatus?: PreferenceStatusState;
    goBack?: goBackFn;
    setPreferences?: setPreferencesFn;
}

interface State {
    queue?: Array<() => Partial<PreferenceState>>;
}

import styles from './styles.css';
export class Standard extends Component<Props, State> {
    state = {
        queue: []
    };
    render() {
        const {
            open,
            goBack,
            preference: {
                openOnStart,
                minimizeOnClose,
                dockBounceMode,
                muted,
                noSpellCheck,
                noProxyServer
            },
            preferenceStatus: {
                openOnStart: openOnStartOk,
                minimizeOnClose: minimizeOnCloseOk,
                dockBounceMode: dockBounceModeOk,
                muted: mutedOk,
                noSpellCheck: noSpellCheckOk,
                noProxyServer: noProxyServerOk
            }
        } = this.props;
        const {
            queue
        } = this.state;
        return (
            <Dialog open={open} onClose={queue.length > 0 ? void 0 : goBack} disableEnforceFocus>
                <DialogTitle>{i18n`Settings`}</DialogTitle>
                <DialogContent className={styles.root}>
                    {openOnStartOk ? (
                        <FormGroup row>
                            <FormControlLabel
                                label={i18n`Open Ryver automatically after you login to the computer`}
                                control={
                                    <Switch
                                        checked={openOnStart}
                                        onChange={this.onOpenOnStartChange}
                                        value="openOnStart"
                                        color="primary"
                                    />
                                }
                            />
                            <Divider className={styles.divider} />
                        </FormGroup>
                    ) : null}
                    {minimizeOnCloseOk ? (
                        <FormGroup row>
                            <FormControlLabel
                                label={isWin()
                                    ? i18n`Close button should minimize Ryver to the tray`
                                    : i18n`Close button should hide Ryver`}
                                control={
                                    <Switch
                                        checked={minimizeOnClose}
                                        onChange={this.onMinimizeOnCloseChange}
                                        value="minimizeOnClose"
                                        color="primary"
                                    />
                                }
                            />
                            <Divider className={styles.divider} />
                        </FormGroup>
                    ) : null}
                    {dockBounceModeOk ? (
                        <FormGroup row>
                            <TextField
                                select
                                label={i18n`When there is a notification, bounce the dock icon`}
                                value={dockBounceMode}
                                onChange={this.onDockBounceModeChange}
                                fullWidth
                            >
                                <MenuItem value={DockBounceMode.None}>{i18n`Never`}</MenuItem>
                                <MenuItem value={DockBounceMode.Informational}>{i18n`For One Second`}</MenuItem>
                                <MenuItem value={DockBounceMode.Critical}>{i18n`Continuously`}</MenuItem>
                            </TextField>
                            <Divider className={styles.divider} />
                        </FormGroup>
                    ) : null}
                    <FormGroup row>
                        <FormControlLabel
                            label={i18n`Mute notification sounds from all organizations`}
                            control={
                                <Switch
                                    checked={muted}
                                    onChange={this.onMutedChange}
                                    value="muted"
                                    color="primary"
                                />
                            }
                        />
                        <Divider className={styles.divider} />
                    </FormGroup>
                    <FormGroup row>
                        <FormControlLabel
                            label={i18n`Disable spellcheck while typing`}
                            control={
                                <Switch
                                    checked={noSpellCheck}
                                    onChange={this.onNoSpellCheckChange}
                                    value="noSpellCheck"
                                    color="primary"
                                />
                            }
                        />
                        <Divider className={styles.divider} />
                    </FormGroup>
                    <FormGroup row>
                        <FormControlLabel
                            label={i18n`Do not use proxy server (restart required)`}
                            control={
                                <Switch
                                    checked={noProxyServer}
                                    onChange={this.onNoProxyServerChange}
                                    value="noProxyServer"
                                    color="primary"
                                />
                            }
                        />
                    </FormGroup>
                </DialogContent>
                <DialogActions>
                    {queue.length > 0 ? (
                        <Button
                            onClick={goBack}
                        >
                            {i18n`Cancel`}
                        </Button>
                        ) : null}
                    <Button
                        color={`primary`}
                        onClick={queue.length > 0 ? this.onSave : goBack}
                    >
                        {queue.length > 0 ? i18n`Save` : i18n`Ok`}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    onSave = () => {
        const { setPreferences } = this.props;
        const { queue } = this.state;

        setPreferences(queue.reduce((prefs, fn) => ({ ...prefs, ...fn() }), { }));
    }

    onOpenOnStartChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ openOnStart: checked });
    }

    onMinimizeOnCloseChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ minimizeOnClose: checked });
    }

    onDockBounceModeChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
        const { setPreferences } = this.props;
        setPreferences({ dockBounceMode: evt.target.value as DockBounceMode });
    }

    onMutedChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ muted: checked });
    }

    onNoSpellCheckChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ noSpellCheck: checked });
    }

    onNoProxyServerChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ noProxyServer: checked });
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        preference: getPreferences(rootState),
        preferenceStatus: getPreferencesStatus(rootState)
    };
};

const mapDispatchToProps: any = {
    goBack,
    setPreferences
};

export default connect(mapStateToProps, mapDispatchToProps)(Standard);

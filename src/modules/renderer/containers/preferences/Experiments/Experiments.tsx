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
export class Experiments extends Component<Props, State> {
    state = {
        queue: []
    };
    render() {
        const {
            open,
            goBack,
            preference: {
                usePhoneMode
            },
            preferenceStatus: {
                usePhoneMode: usePhoneModeOk
            }
        } = this.props;
        const {
            queue
        } = this.state;
        return (
            <Dialog open={open} onClose={queue.length > 0 ? void 0 : goBack} disableEnforceFocus>
                <DialogTitle>{i18n`Unsupported Settings`}</DialogTitle>
                <DialogContent className={styles.root}>
                    {usePhoneModeOk ? (
                        <FormGroup row>
                            <FormControlLabel
                                label={i18n`Use Phone View`}
                                control={
                                    <Switch
                                        checked={usePhoneMode}
                                        onChange={this.onUsePhoneModeChange}
                                        value="usePhoneMode"
                                        color="primary"
                                    />
                                }
                            />
                            <Divider className={styles.divider} />
                        </FormGroup>
                    ) : null}
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

    onUsePhoneModeChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        const { setPreferences } = this.props;
        setPreferences({ usePhoneMode: checked });
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

export default connect(mapStateToProps, mapDispatchToProps)(Experiments);

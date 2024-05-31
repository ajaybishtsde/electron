import * as React from 'react';
import Component from '../../Component';
import { getUpdateStatus, getUpdateStatusOrigin } from '@modules/core/selectors/update';
import { UpdateStatusOrigin, UpdateStatus } from '@modules/core/models/update';
import { RootState } from '@modules/core/models/root';
import { setUpdateStatus, restartForUpdate, ignoreUpdate, setUpdateStatusFn, restartForUpdateFn, ignoreUpdateFn } from '@modules/core/actions/update';
import { connect } from 'react-redux';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Snackbar } from '@material-ui/core';

interface Props {
    status?: UpdateStatus;
    statusOrigin?: UpdateStatusOrigin;
    setUpdateStatus?: setUpdateStatusFn;
    restartForUpdate?: restartForUpdateFn;
    ignoreUpdate?: ignoreUpdateFn;
}

interface State {

}

import styles from './styles.css';
import { Close } from '@material-ui/icons';
export class UpdateStatusComponent extends Component<Props, State> {
    renderAsSnackbar() {
        const { status, statusOrigin } = this.props;

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                open={status === UpdateStatus.Ready}
                autoHideDuration={6000}
                onClose={this.onIgnoreUpdate}
                message={<span>{i18n`An update to the application has been installed.`}</span>}
                action={[
                    <Button color={`secondary`} onClick={this.onRestartForUpdate}>
                        {i18n`RESTART`}
                    </Button>,
                    <IconButton
                        className={styles.barIcon}
                        onClick={this.onIgnoreUpdate}
                    >
                        <Close />
                    </IconButton>,
                ]}
            />
        );
    }

    renderAsDialog() {
        const { status, statusOrigin } = this.props;

        return (
            <Dialog
                open={status === UpdateStatus.NoUpdate}
            >
                <DialogTitle>{i18n`Up To Date`}</DialogTitle>
                <DialogContent
                    className={styles.dialogContent}
                >
                    {i18n`You are already running the latest version of the application.`}
                </DialogContent>
                <DialogActions>
                    <Button
                        color={`primary`}
                        onClick={this.onAckNoUpdate}
                    >
                        {i18n`Ok`}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    render() {
        const { status, statusOrigin } = this.props;

        return statusOrigin === UpdateStatusOrigin.System
            ? this.renderAsSnackbar()
            : this.renderAsDialog();
    }

    onAckNoUpdate = () => {
        const { setUpdateStatus } = this.props;

        setUpdateStatus(UpdateStatus.NoUpdate, UpdateStatusOrigin.System);
    }

    onRestartForUpdate = () => {
        const { restartForUpdate } = this.props;

        restartForUpdate();
    }

    onIgnoreUpdate = () => {
        const { ignoreUpdate } = this.props;

        ignoreUpdate();
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        status: getUpdateStatus(rootState),
        statusOrigin: getUpdateStatusOrigin(rootState)
    };
};

const mapDispatchToProps: any = {
    setUpdateStatus,
    restartForUpdate,
    ignoreUpdate
};

export default connect(mapStateToProps, mapDispatchToProps)(UpdateStatusComponent);

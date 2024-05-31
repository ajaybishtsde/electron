
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { DialogProps } from '@material-ui/core/Dialog';
import { goBack, goBackFn } from '@modules/core/actions/navigation';
import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import pkg from '../../../../../package.json';
import styles from './styles.css';

export interface Props extends RouteComponentProps<{}> {
    open?: boolean;
    goBack?: goBackFn;
}

export const About: React.SFC<Props> = ({ open, goBack }) => {
    return (
        <Dialog
            open={open}
            className={styles.root}
            onClose={goBack}
            disableEnforceFocus
        >
            <DialogTitle>
                {i18n`About`}
            </DialogTitle>
            <DialogContent className={styles.content}>
                Ryver {pkg.version} ({pkg.versionName})
            </DialogContent>
            <DialogActions>
                <Button
                    color={`primary`}
                    onClick={goBack}
                >
                    {i18n`Ok`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const mapDispatchToProps: any = {
    goBack
};

export default connect<{}, Props, Props>(ownProps => ownProps, mapDispatchToProps)(About);

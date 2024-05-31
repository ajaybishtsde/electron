import * as React from 'react';
import Component from '../../../Component';
import { DidFailLoadError, CrashError, GpuCrashError, PluginCrashError, NET_ERROR_TO_ERROR_MESSAGE } from './constants';

interface Props {
    err?: any;
    onRetry?: () => void;
}

interface State {

}

import styles from './styles.css';
import { Button } from '@material-ui/core';
export class ViewError extends Component<Props, State> {
    render() {
        const { err, onRetry } = this.props;

        let content: React.ReactNode;
        if (err instanceof DidFailLoadError) {
            const { subject, body, code } = NET_ERROR_TO_ERROR_MESSAGE[err.errorCode] || NET_ERROR_TO_ERROR_MESSAGE[0];
            content = (
                <React.Fragment>
                    {subject ? (
                        <span className={styles.errorSubject}>{subject}</span>
                    ) : null}
                    {body ? (
                        <span className={styles.errorBody}>{body}</span>
                    ) : null}
                    {code ? (
                        <span className={styles.errorCode}>{code}</span>
                    ) : null}
                </React.Fragment>
            );
        } else if (err instanceof CrashError || err instanceof GpuCrashError || err instanceof PluginCrashError) {
            content = (
                <React.Fragment>
                    <span className={styles.subject}>{i18n`Aw, Snap!`}</span>
                    <span className={styles.body}>{i18n`Something went wrong loading this organization.`}</span>
                </React.Fragment>
            );
        }

        return (
            <div className={styles.error}>
                <div className={styles.errorBox}>
                    <div className={styles.errorContent}>
                        {content}
                    </div>
                    <div className={styles.errorActions}>
                        <Button
                            onClick={onRetry}
                            color={`primary`}
                            variant={`raised`}
                        >
                            {i18n`Retry?`}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

export default ViewError;

import { DesktopCapturerSource } from 'electron';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import * as React from 'react';
import styles from './styles.css';
import $C from 'classnames';

export interface Props {
    source?: DesktopCapturerSource;
    selected?: boolean;
    onClick?: React.MouseEventHandler<HTMLElement>;
}

export const CaptureSource: React.SFC<Props> = ({ source, selected, onClick }: Props) => {
    return (
        <Card className={$C(styles.captureSource, selected && styles.selected)} onClick={onClick} raised={false}>
            <CardHeader
                classes={{
                    root: styles.captureSourceHeader,
                    content: styles.captureSourceHeaderContent,
                    title: styles.captureSourceTitle
                }}
                title={source.name}
            />
            <CardContent classes={{ root: styles.captureSourceContent }}>
                <div className={styles.captureSourceContentWrap}>
                    <img className={styles.captureSourcePreview} src={source.thumbnail.toDataURL()} />
                </div>
            </CardContent>
        </Card>
    );
}

export default CaptureSource;

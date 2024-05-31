import React from 'react';
import $C from 'classnames';
import { Dialog as MuiDialog, DialogActions, DialogTitle, DialogContent } from '@material-ui/core';
import { DialogProps } from '@material-ui/core/Dialog'

export const DIALOG_SIZE_WIDE = 'DIALOG_SIZE_WIDE';
export const DIALOG_SIZE_FULL = 'DIALOG_SIZE_FULL';
export const DIALOG_SIZE_TALL = 'DIALOG_SIZE_TALL';
export const DIALOG_SIZE_AUTO = 'DIALOG_SIZE_AUTO';

export type DialogSizeType = typeof DIALOG_SIZE_FULL | typeof DIALOG_SIZE_WIDE | typeof DIALOG_SIZE_TALL | typeof DIALOG_SIZE_AUTO;

export interface Props {
    open?: boolean;
    desktop?: boolean;
    size?: DialogSizeType;
    className?: string;
    titleClassName?: string;
    contentClassName?: string;
    paperClassName?: string;
    bodyClassName?: string;
    zeroPad?: boolean;
    actions?: any;
}

import styles from './styles.css';

const SIZE_TO_STYLE = {
    [DIALOG_SIZE_AUTO]: styles.sizeA,
    [DIALOG_SIZE_FULL]: styles.sizeF,
    [DIALOG_SIZE_TALL]: styles.sizeT,
    [DIALOG_SIZE_WIDE]: styles.sizeW
};

export const Dialog: React.StatelessComponent<Props & DialogProps> = (props: Props & DialogProps) => {
    const {
        children,
        open,
        desktop,
        size,
        className,
        titleClassName,
        contentClassName,
        paperClassName,
        bodyClassName,
        zeroPad,
        title,
        actions,
        ...rest
    } = props;

    return (
        <MuiDialog
            {...rest}
            open={open}
            className={$C(styles.root, className, SIZE_TO_STYLE[size], title && styles.hasHeader, zeroPad && styles.zeroPad)}
            {...{ PaperProps: { className: $C(styles.paper, paperClassName) } }}
            // bodyClassName={$C(styles.body, bodyClassName)}
        >
            {title && <DialogTitle className={$C(styles.header, titleClassName)}>{title}</DialogTitle>}
            <DialogContent className={$C(styles.content, contentClassName)}>{children}</DialogContent>
            <DialogActions>{actions}</DialogActions>
        </MuiDialog>
    );
};

Dialog.defaultProps = {
    open: false,
    desktop: true,
    size: DIALOG_SIZE_AUTO,
    zeroPad: false
};

export default Dialog;

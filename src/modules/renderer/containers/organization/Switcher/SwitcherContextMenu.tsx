import * as React from 'react';
import Component from '../../../Component';
import $C from 'classnames';
import styles from './styles.css';
import { Organization } from '@modules/core/models/organization';
import { ButtonBase, Avatar, Popover, Menu, MenuItem, Divider } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { ChatBubble } from '@material-ui/icons';
import { PopoverOrigin, PopoverPosition } from '@material-ui/core/Popover';
import { MenuProps } from '@material-ui/core/Menu';

interface Props {
    onEdit?: () => void;
    onRemove?: () => void;
}

export const SwitcherContextMenu: React.SFC<Props & MenuProps> = (props: Props & MenuProps) => {
    const {
        anchorPosition,
        onEdit,
        onRemove,
        ...rest
    } = props;
    return (
        <Menu
            {...rest}
            anchorReference={anchorPosition ? 'anchorPosition' : 'anchorEl'}
            anchorPosition={anchorPosition}
            MenuListProps={{ dense: true }}
            disableEnforceFocus
        >
            <MenuItem
                onClick={onEdit}
            >
                {i18n`Edit`}
            </MenuItem>
            <Divider />
            <MenuItem
                className={styles.menuRemove}
                onClick={onRemove}
            >
                {i18n`Remove`}
            </MenuItem>
        </Menu>
    );
};

export default SwitcherContextMenu;

import * as React from 'react';
import Component from '../../../Component';
import $C from 'classnames';
import styles from './styles.css';
import { Organization } from '@modules/core/models/organization';
import { ButtonBase, Avatar } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { Add } from '@material-ui/icons';
import { ButtonBaseProps } from '@material-ui/core/ButtonBase';

interface Props {

}

interface State {

}

export const SwitcherNewButton: React.SFC<Props> = (props: Props) => {
    const {  } = props;
    return (
        <ButtonBase
            component={NavLink as React.ReactType<ButtonBaseProps>}
            className={$C(styles.button, styles.buttonCreate)}
            {...{ to: { pathname: `/create`, state: { modal: true } } }}
        >
            <Avatar
                key={1}
                className={styles.buttonAvatar}
            >
                <Add className={styles.icon} />
            </Avatar>
            <span key={2} className={$C(styles.buttonName)}>{i18n`add organization...`}</span>
        </ButtonBase>
    );
};

export default SwitcherNewButton;

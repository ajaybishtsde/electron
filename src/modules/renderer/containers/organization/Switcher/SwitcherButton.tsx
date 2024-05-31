import * as React from 'react';
import Component from '../../../Component';
import $C from 'classnames';
import styles from './styles.css';
import { Organization } from '@modules/core/models/organization';
import { ButtonBase, Avatar } from '@material-ui/core';
import { NavLink } from 'react-router-dom';
import { ChatBubble } from '@material-ui/icons';
import { PopoverPosition } from '@material-ui/core/Popover';
import VolumeUp from '@material-ui/icons/VolumeUp';
import { ButtonBaseProps } from '@material-ui/core/ButtonBase';

interface Props {
    organization?: Organization;
    inVoice?: boolean;
    badgeUnseenActivity?: boolean;
    badgeCount?: number;
    onContextMenu?: (evt: React.MouseEvent<HTMLElement>, organization: Organization) => void;
}

interface State {

}

export class SwitcherButton extends Component<Props, State> {
    render() {
        const {
            organization,
            inVoice,
            badgeUnseenActivity,
            badgeCount,
        } = this.props;

        const avatarFontSize = 28 - (organization.short.length < 5 ? organization.short.length * 4 : 18);

        return (
            <ButtonBase
                component={NavLink as React.ReactType<ButtonBaseProps>}
                className={$C(styles.button)}
                onContextMenu={this.onContextMenu}
                {...{ to: `/org/${organization.name}`, activeClassName: styles.buttonActive }}
            >
                <div key={`avatar-container`} className={styles.buttonAvatarContainer}>
                    <Avatar
                        key={`avatar`}
                        className={$C(styles.buttonAvatar)}
                        style={{ fontSize: avatarFontSize, backgroundColor: organization.color }}
                    >
                        {organization.short.slice(0, 5)}
                    </Avatar>
                    {badgeCount > 0 || badgeUnseenActivity ? (
                        <span key={`badge`} className={$C(styles.buttonBadge)}>
                            {badgeCount > 0 ? (
                                <span className={styles.buttonBadgeCount}>{badgeCount >= 10 ? `!` : `${badgeCount}`}</span>
                            ) : (
                                <span className={styles.buttonBadgeAsterisk}>*</span>
                            )}
                        </span>
                    ) : null}
                    {inVoice ? (
                        <div className={styles.buttonVoiceBadge}>
                            <VolumeUp className={styles.buttonVoiceBadgeIcon} />
                        </div>
                    ) : null}
                </div>
                <span key={`name`} className={$C(styles.buttonName)}>{organization.name}</span>
            </ButtonBase>
        );
    }

    onContextMenu = (evt: React.MouseEvent<HTMLElement>) => {
        const {
            organization,
            onContextMenu
        } = this.props;

        if (onContextMenu) {
            onContextMenu(evt, organization);
        }
    }
}

export default SwitcherButton;

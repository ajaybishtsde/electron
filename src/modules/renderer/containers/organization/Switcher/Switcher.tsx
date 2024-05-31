import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { RouteComponentProps, Router, Route, NavLink, Redirect } from 'react-router-dom';
import * as command from 'yggdrasil/lib/command';
import Component from '../../../Component';
import $C from 'classnames';
import { Organization } from '@modules/core/models/organization';
import { Paper, IconButton } from '@material-ui/core';
import { ModeEdit, Add, KeyboardArrowLeft, KeyboardArrowRight } from '@material-ui/icons';
import { SwitcherButton } from '@modules/renderer/containers/organization/Switcher/SwitcherButton';
import { RootState } from '@modules/core/models/root';
import { getOrganizations, getUnseen, getBadgeCount, getBadgeCounts, getSelectedOrganizationName } from '@modules/core/selectors/organization';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';
import { setPreference, setPreferenceFn, setPreferences, setPreferencesFn } from '@modules/core/actions/preference';
import { pushFn, push } from '@modules/core/actions/navigation';
import SwitcherNewButton from './SwitcherNewButton';
import SwitcherContextMenu from './SwitcherContextMenu';
import { PopoverPosition } from '@material-ui/core/Popover';
import { matches } from 'yggdrasil/lib/query';
import on from 'yggdrasil/lib/event';
import { removeOrganization, removeOrganizationFn } from '@modules/core/actions/organization';

interface Props {
    organizations?: Organization[];
    inVoiceOrganizationName?: string;
    badgeUnseenActivities?: { [name: string]: boolean };
    badgeCounts?: { [name: string]: number };
    isOrganizationBarOpen?: boolean;
    isOrganizationBarShown?: boolean;
    isOrganizationBarCompact?: boolean;
    isOrganizationBarInChangeMode?: boolean;
    setPreference?: setPreferenceFn;
    setPreferences?: setPreferencesFn;
    removeOrganization?: removeOrganizationFn;
    push?: pushFn;
}

interface State {
    contextMenuOpen?: boolean;
    contextMenuPosition?: PopoverPosition;
    contextMenuFor?: Organization;
}

import styles from './styles.css';
import { getInVoiceOrganizationName } from '@modules/core/selectors/voice';
export class Switcher extends Component<Props, State> {
    state: State = {
        contextMenuOpen: false,
        contextMenuPosition: void 0,
        contextMenuFor: void 0
    };

    wrapper: HTMLDivElement;

    render() {
        const {
            organizations,
            inVoiceOrganizationName,
            badgeUnseenActivities,
            badgeCounts,
            isOrganizationBarOpen,
            isOrganizationBarShown,
            isOrganizationBarCompact,
            isOrganizationBarInChangeMode
        } = this.props;
        const {
            contextMenuOpen,
            contextMenuFor,
            contextMenuPosition
        } = this.state;

        return (
            <Paper
                className={$C(
                    styles.root,
                    isOrganizationBarShown && styles.isShown,
                    isOrganizationBarCompact && styles.isCompact
                )}
                elevation={2}
                square
            >
                <div ref={c => this.wrapper = c} className={styles.wrapper} data-simplebar>
                    <div className={styles.content}>
                        {organizations.map(org => {
                            return (
                                <SwitcherButton
                                    key={org.name}
                                    organization={org}
                                    badgeUnseenActivity={!!badgeUnseenActivities[org.name]}
                                    badgeCount={badgeCounts[org.name] || 0}
                                    onContextMenu={this.onContextMenu}
                                    inVoice={org.name === inVoiceOrganizationName}
                                />
                            );
                        })}
                        <SwitcherNewButton key={`create`} />
                    </div>
                </div>
                <div className={styles.footer}>
                    <IconButton
                        className={styles.action}
                        onClick={isOrganizationBarCompact ? this.onExpand : this.onContract}
                    >
                        {isOrganizationBarCompact ? (
                            <KeyboardArrowRight className={styles.icon} />
                        ) : (
                            <KeyboardArrowLeft className={styles.icon} />
                        )}
                    </IconButton>
                </div>
                <SwitcherContextMenu
                    container={document.body}
                    open={contextMenuOpen}
                    anchorPosition={contextMenuPosition}
                    anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
                    transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                    onClose={this.onContextMenuClose}
                    onEdit={this.onContextEdit}
                    onRemove={this.onContextRemove}
                />
            </Paper>
        );
    }

    componentDidMount() {
        this.ownOnMount(
            on(document.body, 'contextmenu', this.onBodyContextMenu)
        );
    }

    onBodyContextMenu = (evt: MouseEvent) => {
        /**
         * The MUI Modal does not consider `contextmenu` on the backdrop a reason to close.
         */
        if (!matches(evt.target as HTMLElement, `.${styles.wrapper} > *`)) {
            this.setState({
                contextMenuOpen: false,
                contextMenuFor: void 0
            });
        }
    }

    onContextMenu = (evt: React.MouseEvent<HTMLElement>, organization: Organization) => {
        this.setState({
            contextMenuOpen: true,
            contextMenuPosition: { top: evt.clientY, left: evt.clientX },
            contextMenuFor: organization
        });
    }

    onContextMenuClose = () => {
        this.setState({
            contextMenuOpen: false,
            contextMenuFor: void 0
        });
    }

    onContextEdit = () => {
        const { push } = this.props;
        const {
            contextMenuFor
        } = this.state;
        if (contextMenuFor) {
            push(`/org/${contextMenuFor.name}/update`, { modal: true });
        }
        this.onContextMenuClose();
    }

    onContextRemove = () => {
        const { removeOrganization } = this.props;
        const {
            contextMenuFor
        } = this.state;
        if (contextMenuFor) {
            removeOrganization(contextMenuFor.name);
        }
        this.onContextMenuClose();
    }

    onExpand = () => {
        const { setPreference } = this.props;
        setPreference(PREFERENCES.isOrganizationBarCompact, false);
    }

    onContract = () => {
        const { setPreferences } = this.props;
        setPreferences({
            isOrganizationBarCompact: true,
            isOrganizationBarInChangeMode: false
        });
    }

    onEditModeToggle = () => {
        const { setPreference, isOrganizationBarInChangeMode } = this.props;
        setPreference(PREFERENCES.isOrganizationBarInChangeMode, !isOrganizationBarInChangeMode);
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        organizations: getOrganizations(rootState),
        inVoiceOrganizationName: getInVoiceOrganizationName(rootState),
        badgeUnseenActivities: getUnseen(rootState),
        badgeCounts: getBadgeCounts(rootState),
        isOrganizationBarOpen: getPreference(rootState, PREFERENCES.isOrganizationBarOpen),
        isOrganizationBarShown: getPreference(rootState, PREFERENCES.isOrganizationBarShown),
        isOrganizationBarCompact: getPreference(rootState, PREFERENCES.isOrganizationBarCompact),
        isOrganizationBarInChangeMode: getPreference(rootState, PREFERENCES.isOrganizationBarInChangeMode)
    };
};

const mapDispatchToProps: MapDispatchToProps<Props, Props> = {
    setPreference,
    setPreferences,
    push,
    removeOrganization
};

export default connect(mapStateToProps, mapDispatchToProps)(Switcher);

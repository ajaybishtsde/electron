import * as path from 'path';
import * as topic from 'yggdrasil/lib/topic';
import * as command from 'yggdrasil/lib/command';
import { EventEmitter } from 'events';
import {
    acknowledgeOrganization, selectNextOrganization, selectPrevOrganization,
    selectOrganizationAt, incrementOrganizationBadgeCount, setOrganizationUnseenActivity,
    selectPrevOrganizationFn, selectNextOrganizationFn, selectOrganizationAtFn, acknowledgeOrganizationFn,
    setOrganizationUnseenActivityFn
} from '@modules/core/actions/organization';
import { setPreferences, setPreference, setPreferenceFn, setPreferencesFn } from '@modules/core/actions/preference';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ipcRenderer, remote, webFrame } from 'electron';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import Component from '../Component';
import { on } from 'yggdrasil/lib/event';
import { subscribe } from 'yggdrasil/lib/topic';
import { isWin, isWin8 } from '../../../os-detection';
import { clamp, substitute } from 'yggdrasil/lib/string';
import { throttle } from 'yggdrasil/lib/lang';
import Workspace from '@modules/renderer/containers/Workspace';
import Startup from '@modules/renderer/containers/Startup';
import { ConnectedRouter } from 'react-router-redux';
import { history } from '../navigation';
import { Switch, Route } from 'react-router';
import { AppStatus } from '@modules/core/models/app';
import { RootState } from '@modules/core/models/root';
import { connect } from 'react-redux';
import { push, pushFn } from '@modules/core/actions/navigation';
import { getSelectedOrganizationName } from '@modules/core/selectors/organization';
import SimpleBar from 'simplebar';
import { Organization } from '@modules/core/models/organization';
import { resetVoiceFn, resetVoice } from '@modules/core/actions/voice';

/* tslint:disable-next-line no-unused-expression */
SimpleBar;

const debug: Debug.Logger = require('debug')('ryver-desktop:renderer:app');

interface Props {
    organization?: string;
    status?: AppStatus;
    err?: any;
    push?: pushFn;
    setOrganizationUnseenActivity?: setOrganizationUnseenActivityFn;
    acknowledgeOrganization?: acknowledgeOrganizationFn;
    selectNextOrganization?: selectNextOrganizationFn;
    selectPrevOrganization?: selectPrevOrganizationFn;
    setPreference?: setPreferenceFn;
    setPreferences?: setPreferencesFn;
    selectOrganizationAt?: selectOrganizationAtFn;
    resetVoice?: resetVoiceFn;
}

interface State {

}

import 'simplebar/dist/simplebar.css';
import { PREFERENCES } from '@modules/core/models/preference';
/* tslint:disable jsx-no-lambda */
export class App extends Component<Props, State> {
    events: EventEmitter;

    state: State = {
    };

    constructor(props: Props, context: any) {
        super(props, context);

        this.events = new EventEmitter();
        this.events.setMaxListeners(0);
    }

    componentDidMount() {
        this.ownOnMount(
            // TODO: move more of this stuff to extensions
            on(ipcRenderer, 'command', this.onCommand),
            on(ipcRenderer, 'context-command', this.onContextCommand),
            on(this.events, 'application:about', this.onShowAbout),
            on(this.events, 'window:focus', this.onWindowFocus),
            on(this.events, 'window:next-account', this.onNextOrg),
            on(this.events, 'window:prev-account', this.onPrevOrg),
            on(this.events, 'window:add-account', this.onCreateOrg),
            on(this.events, 'window:show-settings', this.onShowSettings),
            on(this.events, 'window:show-experimental-settings', this.onShowSettingsEx),
            on(this.events, 'window:edit-account', this.onUpdateOrg),
            on(this.events, 'window:edit-accounts', this.onUpdateOrgs),
            on(this.events, 'window:instance-1', () => this.onOrgAt(1)),
            on(this.events, 'window:instance-2', () => this.onOrgAt(2)),
            on(this.events, 'window:instance-3', () => this.onOrgAt(3)),
            on(this.events, 'window:instance-4', () => this.onOrgAt(4)),
            on(this.events, 'window:instance-5', () => this.onOrgAt(5)),
            on(this.events, 'window:instance-6', () => this.onOrgAt(6)),
            on(this.events, 'window:instance-7', () => this.onOrgAt(7)),
            on(this.events, 'window:instance-8', () => this.onOrgAt(8)),
            on(this.events, 'window:instance-9', () => this.onOrgAt(9)),
            on(this.events, 'window:has-unseen-activity', this.onUnseenActivity),
            on(this.events, 'window:show-org-switcher', this.onShowOrgSwitcher),
            on(this.events, 'window:hide-org-switcher', this.onHideOrgSwitcher)
            /*
            on(this.events, 'window:disconnected', throttle(this.onDisconnected.bind(this), 60*1000)), // we only want one message to show up
            */
        );

        /* on window reload we need to reset the voice state */
        const { resetVoice } = this.props;
        resetVoice();
    }
    onCommand = (evt: Electron.IpcMessageEvent, command: string, ...args: Array<any>) => {
        if (this.events.emit(command, ...args)) return;
    }
    onContextCommand = (evt: Electron.IpcMessageEvent, command: string, ...args: Array<any>) => {
        if (this.events.emit(command, ...args)) return;
    }
    onShowOrgSwitcher = () => {
        const { setPreference } = this.props;
        setPreference(PREFERENCES.isOrganizationBarShown, true);
    }
    onHideOrgSwitcher = () => {
        const { setPreference } = this.props;
        setPreference(PREFERENCES.isOrganizationBarShown, false);
    }
    onWindowFocus = () => {
        const { acknowledgeOrganization } = this.props;
        acknowledgeOrganization();
    }
    onShowAbout = () => {
        const { push } = this.props;
        push(`/about`, { modal: true });
    }
    onCreateOrg = () => {
        const { push } = this.props;
        push(`/create`, { modal: true });
    }
    onUpdateOrg = () => {
        const { push, organization } = this.props;
        push(`/org/${organization}/update`, { modal: true });
    }
    onUpdateOrgs = () => {
        const { setPreferences } = this.props;
        setPreferences({
            isOrganizationBarCompact: false,
            isOrganizationBarInChangeMode: true
        });
    }
    onShowSettings = () => {
        const { push } = this.props;
        push(`/settings`, { modal: true });
    }
    onShowSettingsEx = () => {
        const { push } = this.props;
        push(`/settings-ex`, { modal: true });
    }
    onNextOrg = () => {
        const { selectNextOrganization } = this.props;
        selectNextOrganization();
    }
    onPrevOrg = () => {
        const { selectPrevOrganization } = this.props;
        selectPrevOrganization();
    }
    onOrgAt = (position: number) => {
        const { selectOrganizationAt } = this.props;
        selectOrganizationAt(position);
    }
    onUnseenActivity = (org: Organization) => {
        const { organization, setOrganizationUnseenActivity } = this.props;
        const win = remote.getCurrentWindow();
        const vis = win.isVisible() && win.isFocused() && !win.isMinimized();
        if (vis && org.name === organization) {
            // nothing
        } else {
            setOrganizationUnseenActivity(org.name);
        }
    }
    /*
    onDisconnected(org) {
        debug('disconnected=', org);
        if (isWin8() || !isWin()) {
            const native = new Notification(clamp(substitute($L('disconnected-subject',
            'You were disconnected from one or more organizations.'), [org.short]), 63), {
                body: clamp(substitute($L('disconnected-body',
                'An un-recoverable connection error occurred on one or more organizations and you were disconnected.'), [org.name]), 255),
                silent: true
            });
            native.onclick = () => ipcRenderer.send('command', 'application:restore');
        }
        ipcRenderer.send('command', 'application:disconnected', org);
    }
    */
    render() {
        const { status } = this.props;
        return (
            status >= AppStatus.Ready ? (
                <ConnectedRouter history={history}>
                    <Switch>
                        <Route path={`/`} component={Workspace} />
                    </Switch>
                </ConnectedRouter>
            ) : (
                    <Startup />
                )
        );
    }
}

const mapStateToProps = (state: RootState, ownProps: Props): Props => {
    const { status, err } = state.app;
    return {
        ...ownProps,
        organization: getSelectedOrganizationName(state),
        status,
        err
    };
};

const mapDispatchToProps: any = {
    setOrganizationUnseenActivity,
    acknowledgeOrganization,
    selectNextOrganization,
    selectPrevOrganization,
    setPreference,
    setPreferences,
    selectOrganizationAt,
    push,
    resetVoice
};

export default connect(mapStateToProps, mapDispatchToProps)(App);

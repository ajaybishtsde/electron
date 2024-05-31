import $C from 'classnames';
import { Logger } from '@log';
import { Organization } from '@modules/core/models/organization';
import { NewWindowEvent, WebviewTag, shell, DidFailLoadEvent, DidGetRedirectRequestEvent, WillNavigateEvent, DidFrameFinishLoadEvent, ConsoleMessageEvent } from 'electron';
import * as React from 'react';
import * as url from 'url';
import { on } from 'yggdrasil/lib/event';
import { toUri } from '../../../../../host';
import Component from '../../../Component';
import ViewError from './ViewError';
import { CrashError, DidFailLoadError, GpuCrashError, PluginCrashError, Status } from './constants';
import { asRemovable } from 'yggdrasil/lib/removable';
import { uncolorizeMsg } from '../../../../../log-utils';

const PROTOCOL_OPEN_EXTERNAL = ['http:', 'https:', 'mailto:', 'callto:', 'tel:', 'im:', 'sip:', 'sips:', 'skype:', 'facetime:', 'jabber:', 'sms:', 'ssh:',
    'spotify:', 'fmp:', 'gtalk:', 'facetime:', 'teamspeak:', 'ventrilo:', 'mumble:', 'feed:', 'magnet:', 'irc:', 'ircs:', 'irc6:',
    'steam:', 'airmail:'];

interface Props {
    organization?: Organization;
    selected?: boolean;
    muted?: boolean;
}

interface State {
    err?: any;
    status?: Status;
}

import styles from './styles.css';
export class View extends Component<Props, State> {

    webview: WebviewTag;
    log: Logger;

    state: State = {
        err: void 0,
        status: Status.Setup
    };

    render() {
        const {
            organization,
            selected
        } = this.props;
        const {
            status,
            err
        } = this.state;
        return (
            <div className={$C(styles.root, selected && styles.isSelected, err && styles.isErr)}>
                {err ? (
                    <ViewError key={`err`} err={err} onRetry={this.onRetry} />
                ) : null}
                <webview
                    key={`webview`}
                    ref={c => this.webview = c as WebviewTag}
                    className={styles.webview}
                    id={`webview_${sanitizeOrgName(organization.name)}`}
                    /* note: cannot just set this because of: https://github.com/electron/electron/issues/9618 */
                    /* src={toUri(organization.host)} */
                    src={url.format({ protocol: 'file', pathname: `${process.resourcePath}/interop.html` })}
                    preload={url.format({ protocol: 'file', pathname: `${process.resourcePath}/javascripts/interop.js` })}
                    {...{ autosize: 'autosize', allowpopups: 'allowpopups' } as {}}
                />
            </div>
        );
    }

    componentDidMount() {
        const { organization } = this.props;

        this.log = new Logger({ name: `interop-${organization.name}`, useConsole: false });

        this.ownOnMount(
            on(this.webview, 'did-finish-load', this.onDidFinishLoad),
            on(this.webview, 'did-fail-load', this.onDidFailLoad),
            on(this.webview, 'dom-ready', this.onDomReady),
            on(this.webview, 'new-window', this.onNewWindow),
            on(this.webview, 'crashed', this.onCrashed),
            on(this.webview, 'gpu-crashed', this.onGpuCrashed),
            on(this.webview, 'plugin-crashed', this.onPluginCrashed),
            on(this.webview, 'did-get-redirect-request', this.onDidGetRedirectRequest),
            on(this.webview, 'will-navigate', this.onWillNavigate),
            on(this.webview, 'console-message', this.onConsoleMessage),
            on(window, 'focus', this.onBrowserWindowFocus),
            asRemovable(() => this.log = null)
        );

        /**
         * one fix for: https://github.com/electron/electron/issues/9618
         */
        /*
        const { organization } = this.props;
        setTimeout(() => this.webview.setAttribute('src', toUri(organization.host)), 1000);
        */
    }

    // note: this will not include parameters: https://github.com/electron/electron/issues/8090
    onConsoleMessage = ({ level, message, line, sourceId, ...rest }: ConsoleMessageEvent) => {
        if (!this.log) {
            return;
        }

        message = uncolorizeMsg(message);

        switch (level) {
            case 0: this.log.info(message, { line, sourceId }); break;
            case 1: this.log.warn(message, { line, sourceId }); break;
            case 2: this.log.error(message, { line, sourceId }); break;
            case -1: this.log.debug(message, { line, sourceId }); break;
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { muted, selected, organization } = this.props;

        if (selected && !prevProps.selected) {
            LOG_DEBUG('setting focus on %s', organization.name);

            this.webview.focus();
        }
    }

    private onRetry = () => {
        LOG_DEBUG('retry view load');

        this.setState({
            status: Status.Loading,
            err: void 0
        }, () => this.webview.reload());
    }

    private onDidFinishLoad = (evt) => {
        LOG_DEBUG('did finish load');

        const { organization } = this.props;
        const { status } = this.state;

        /**
         * two phase load fixes https://github.com/electron/electron/issues/9618, without indeterminate timeout.
         */
        if (status === Status.Setup) {
            this.setState({
                status: Status.Loading
            }, () => {
                LOG_DEBUG('navigating to app %s', toUri(organization.host || ''));
                /* organization.host === 'develop.dev' ? `http://localhost` : toUri(organization.host || '') */
                evt.target.src = toUri(organization.host || '');
            });
        } else if (status === Status.Loading) {
            this.setState({ status: Status.Loaded });
        }
    }

    private onDidFailLoad = (evt: DidFailLoadEvent) => {
        const { status } = this.state;

        LOG_ERROR('did fail load for %s with error %d %s - show error %s', evt.validatedURL, evt.errorCode, evt.errorDescription, status < Status.Loaded);

        // todo: should this only be on the first load, or should we check for all
        // *.html *.css *.js errors on *.ryver.com domains?
        if (status < Status.Loaded) {
            this.setState({ err: DidFailLoadError.from(evt) });
        }
    }

    private onDomReady = (evt) => {
        const { organization, muted, selected } = this.props;

        LOG_DEBUG('setting webview context', organization);

        this.webview.executeJavaScript(`window.ryverAppContext = (${JSON.stringify(organization)});`, false);

        if (selected) {
            LOG_DEBUG('setting focus on %s', organization.name);

            this.webview.focus();
        }
    }

    private onNewWindow = (evt: NewWindowEvent, ...rest) => {
        console.log('onNewWindow', evt, rest);
        // from `window.open`
        if (evt.disposition === 'new-window') {
            return;
        }
        try {
            const urlObj = url.parse(evt.url);
            if (PROTOCOL_OPEN_EXTERNAL.indexOf(urlObj.protocol) > -1) {
                shell.openExternal(evt.url);
            } else {
                LOG_WARN('ignoring new window for %s', evt.url);
            }
        } catch (err) {
            LOG_ERROR('ignoring new window for %s due to: %s.', evt.url, err.message);
        }
    }

    private onCrashed = (evt) => {
        LOG_ERROR('webview crash');

        this.setState({ err: new CrashError() });
    }

    private onGpuCrashed = (evt) => {
        LOG_ERROR('gpu crash');

        this.setState({ err: new GpuCrashError() });
    }

    private onPluginCrashed = (evt) => {
        LOG_ERROR('plugin crash');

        this.setState({ err: PluginCrashError.from(evt) });
    }

    private onDidGetRedirectRequest = (evt: DidGetRedirectRequestEvent) => {
        LOG_DEBUG('did get redirect request to %s from %s', evt.newURL, evt.oldURL);
    }

    private onWillNavigate = (evt: WillNavigateEvent) => {
        LOG_DEBUG('will navigate to %s', evt.url);
    }

    private onBrowserWindowFocus = (evt: React.FocusEvent<HTMLElement>) => {
        const { selected, organization } = this.props;
        if (selected) {
            LOG_DEBUG('setting focus on %s', organization.name);

            this.webview.focus();
        }
    }
}

const sanitizeOrgName = (name: string) => {
    return name.replace(/[\.]/, '_');
};

export default View;

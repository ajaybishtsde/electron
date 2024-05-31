import Component from '@modules/renderer/Component';
import { DesktopCapturerSource, desktopCapturer } from 'electron';
import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import styles from './styles.css';
import { Dialog, DialogContent, DialogTitle, TextField, Avatar, DialogActions, Button, LinearProgress, Tab, Tabs, AppBar } from '@material-ui/core';
import { goBackFn, goBack } from '@modules/core/actions/navigation';
import { RootState } from '@modules/core/models/root';
import { connect } from 'react-redux';
import { sendSourceFn, sendSource } from '@modules/core/actions/voice';
import { CaptureSource } from '@modules/renderer/containers/ChooseCaptureSource/CaptureSource';

export interface Params {
    transactionId?: string;
}

export interface Props extends RouteComponentProps<Params> {
    open?: boolean;
    goBack?: goBackFn;
    sendSource?: sendSourceFn;
}

export interface State {
    mediaSource?: 'window' | 'screen';
    sources?: {
        window: Array<DesktopCapturerSource>;
        screen: Array<DesktopCapturerSource>;
    };
    sourceId?: string;
    err?: any;
}

export class ChooseCaptureSource extends Component<Props, State> {
    state: State = {
        mediaSource: 'screen',
        sources: { window: [], screen: [] },
        sourceId: void 0,
        err: void 0
    };

    render() {
        const { open, match: { params: { transactionId } }, goBack } = this.props;
        const { mediaSource, sources, sourceId, err } = this.state;
        return (
            <Dialog
                className={styles.root}
                open={open}
                onClose={goBack}
                maxWidth={`md`}
                disableEnforceFocus
            >
                <DialogTitle>
                    {i18n`Share Screen`}
                </DialogTitle>
                <DialogContent className={styles.content}>
                    <AppBar className={styles.bar} position={`absolute`} color={`inherit`}>
                        <Tabs
                            value={mediaSource}
                            onChange={this.onTabChange}
                            indicatorColor={'primary'}
                            textColor={'primary'}
                            centered
                        >
                            <Tab
                                label={i18n`Entire Screen`}
                                value={'screen'}
                            />
                            <Tab
                                label={i18n`Application Window`}
                                value={'window'}
                            />
                        </Tabs>
                    </AppBar>
                    {mediaSource === 'screen' ? (
                        <div key={`screen`} className={styles.wrapper} data-simplebar>
                            <div className={styles.captureSources}>
                                {sources.screen.map((source) => (
                                    <CaptureSource
                                        key={source.id}
                                        source={source}
                                        selected={source.id === sourceId}
                                        onClick={() => this.onSelect(source.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                    {mediaSource === 'window' ? (
                        <div key={`window`} className={styles.wrapper} data-simplebar>
                            <div className={styles.captureSources}>
                                {sources.window.map((source) => (
                                    <CaptureSource
                                        key={source.id}
                                        source={source}
                                        selected={source.id === sourceId}
                                        onClick={() => this.onSelect(source.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={goBack}
                    >
                        {i18n`Cancel`}
                    </Button>
                    <Button
                        color={`primary`}
                        onClick={this.onSend}
                        disabled={!sourceId || sourceId.indexOf(mediaSource) !== 0}
                    >
                        {i18n`Share`}
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }

    componentDidMount() {
        // note: this is done here because it looks as though `DesktopCapturerSource` *cannot* be sent over IPC; the `NativeImage` class
        // can potentially crash the app when serialized over IPC (according to some `electron` issues on GitHub).
        desktopCapturer.getSources({ types: ['window', 'screen'], thumbnailSize: { width: 200, height: 200 } }, (err, sources) => {
            if (err) {
                LOG_ERROR('could not get desktop capturer soruces: %s', err.message);
                this.setState({ err });
                return;
            }

            this.setState({
                sources: {
                    window: sources.filter(source => /^window:/.test(source.id)),
                    screen: sources.filter(source => /^screen:/.test(source.id))
                }
            });
        });
    }

    onTabChange = (evt, mediaSource) => {
        this.setState({ mediaSource });
    }

    onSelect = (sourceId: string) => {
        this.setState({ sourceId });
    }

    onSend = () => {
        const { sendSource, goBack, match: { params: { transactionId } } } = this.props;
        const { mediaSource, sourceId } = this.state;

        sendSource(transactionId, mediaSource, sourceId);
        goBack();
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps
    };
};

const mapDispatchToProps: any = {
    goBack,
    sendSource
};

export default connect(mapStateToProps, mapDispatchToProps)(ChooseCaptureSource);

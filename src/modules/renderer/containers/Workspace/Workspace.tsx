import * as React from 'react';
import { connect } from 'react-redux';
import { Router, Route, NavLink, Redirect, Switch, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import PropTypes from 'prop-types';
import Component from '../../Component';
import Switcher from '../../containers/organization/Switcher';
import $C from 'classnames';
import styles from './styles.css';
import { RootState } from '@modules/core/models/root';
import Stack from '../../containers/organization/Stack';
import Create from '@modules/renderer/containers/organization/Create';
import { Organization } from '@modules/core/models/organization';
import { getOrganizations, getSelectedOrganizationName } from '@modules/core/selectors/organization';
import About from '@modules/renderer/containers/About';
import ChooseCaptureSource from '@modules/renderer/containers/ChooseCaptureSource';
import Standard from '@modules/renderer/containers/preferences/Standard';
import Experiments from '@modules/renderer/containers/preferences/Experiments';
import Update from '@modules/renderer/containers/organization/Update';
import UpdateStatus from '@modules/renderer/containers/UpdateStatus';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:containers:workspace');

export interface Props extends RouteComponentProps<{}> {
    organizations?: Organization[];
    organization?: string;
    isOrganizationBarShown?: boolean;
}

/* tslint:disable jsx-no-lambda */
class Workspace extends Component<Props, {}> {
    previousLocation = this.props.location;

    componentWillUpdate(nextProps) {
        const { location } = this.props;
        // set previousLocation if props.location is not modal
        if (nextProps.history.action !== 'POP' && (!location.state || !location.state.modal)) {
            this.previousLocation = this.props.location;
        }
    }

    render() {
        const { location, organizations, organization, isOrganizationBarShown } = this.props;
        const isModal = !!(
            location.state &&
            location.state.modal &&
            this.previousLocation !== location
        );
        return (
            <div className={$C(styles.root, isOrganizationBarShown && styles.isOrgBarShown)}>
                <Route path={`/`} component={Switcher} />
                <div className={styles.content}>
                    <Switch location={isModal ? this.previousLocation : location}>
                        <Route exact path={`/org/:name`} component={Stack} />
                        {organizations.length <= 0 ? (
                            <Redirect to={{ pathname: `/create`, state: { modal: true } }} />
                        ) : null}
                        {organization ? (
                            <Redirect to={`/org/${organization}`} />
                        ) : null}
                    </Switch>
                    {isModal ? (
                        <Switch>
                            <Route path={`/about`} render={props => (<About open {...props} />)} />
                            <Route path={`/create`} render={props => (<Create open {...props} />)} />
                            <Route path={`/settings`} render={props => (<Standard open {...props} />)} />
                            <Route path={`/settings-ex`} render={props => (<Experiments open {...props} />)} />
                            <Route path={`/org/:name/update`} render={props => (<Update open {...props} />)} />
                            <Route path={`/get-source/:transactionId`} render={props => (<ChooseCaptureSource open {...props} />)} />
                        </Switch>
                    ) : null}
                </div>
                <UpdateStatus />
            </div>
        );
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        organizations: getOrganizations(rootState),
        organization: getSelectedOrganizationName(rootState),
        isOrganizationBarShown: getPreference(rootState, PREFERENCES.isOrganizationBarShown)
    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Workspace);

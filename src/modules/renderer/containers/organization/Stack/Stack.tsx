import * as React from 'react';
import { connect } from 'react-redux';
import { Router, Route, NavLink, Redirect } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import * as command from 'yggdrasil/lib/command';
import Component from '../../../Component';
import $C from 'classnames';
import { Organization } from '@modules/core/models/organization';
import { getOrganizations } from '@modules/core/selectors/organization';
import { RootState } from '@modules/core/models/root';
import View from '../../../components/organization/View';
import { getPreference } from '@modules/core/selectors/preference';
import { PREFERENCES } from '@modules/core/models/preference';

const debug: debug.IDebugger = require('debug')('ryver-desktop:renderer:containers:organization-stack');

interface Params {
    name?: string;
}

interface Props extends RouteComponentProps<Params> {
    organizations?: Organization[];
    muted?: boolean;
}

interface State {

}

import styles from './styles.css';
export class Stack extends Component<Props, State> {
    render() {
        const {
            match: { params: { name } },
            organizations,
            muted
        } = this.props;
        return (
            <div className={styles.root}>
                {organizations.map(org => (
                    <View
                        key={org.name}
                        organization={org}
                        selected={name === org.name}
                        muted={muted}
                    />
                ))}
            </div>
        );
    }
}

const mapStateToProps = (rootState: RootState, ownProps: Props): Props => {
    return {
        ...ownProps,
        organizations: getOrganizations(rootState),
        muted: getPreference(rootState, PREFERENCES.muted)
    };
};

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(Stack);

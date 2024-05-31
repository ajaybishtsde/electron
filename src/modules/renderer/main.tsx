import setup from '../../extensions';
import userPresence from './extensions/user-presence';
// import forceGC from './extensions/force-gc';

import * as React from 'react';
import { render as domRender } from 'react-dom';
import { Provider as StoreProvider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { AppContainer } from 'react-hot-loader';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import { LIGHT } from './styles/mui-theme';
import { createStore } from './store';

import App from './containers/App';

const store = createStore();

const render = () => {
    domRender(
        <AppContainer>
            <MuiThemeProvider theme={LIGHT}>
                <StoreProvider store={store}>
                    <App />
                </StoreProvider>
            </MuiThemeProvider>
        </AppContainer>,
        document.getElementById('appMountPoint')
    );
};

if (module.hot) {
    module.hot.accept('./containers/App', () => render());
}

// if (module.hot) {
//     module.hot.accept('./reducers', () => {
//         store.replaceReducer(reducer);
//     });
// }

render();

setup(window, [userPresence()]);
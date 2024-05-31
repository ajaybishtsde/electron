import { History } from 'history';
import createBrowserHistory from 'history/createBrowserHistory';
import createHashHistory from 'history/createHashHistory';
import createMemoryHistory from 'history/createMemoryHistory';

export const history = createMemoryHistory();

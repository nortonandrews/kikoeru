import { render } from 'inferno';
import { Provider } from 'inferno-redux';
import { BrowserRouter, Route, Switch } from 'inferno-router';
import { createBrowserHistory } from 'history';
import { createStore } from 'redux';

import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';

import AudioElement from './components/AudioElement';
import PlayerBar from './components/PlayerBar';
import Player from './routes/Player';
import Work from './routes/Work';
import Works from './routes/Works';
import List from './routes/List';
import Reducer from './reducer';

import './static/style/uikit.stripped.less';
import './static/style/kikoeru.css';
import ErrorBoundary from './components/ErrorBoundary';
import NavBar from './components/NavBar';

// Enable UIkit icon plugin
UIkit.use(Icons);

const browserHistory = createBrowserHistory();
const store = createStore(Reducer);

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <BrowserRouter history={browserHistory}>
          <NavBar />
          <Switch>
            <Route exact path="/" component={Works} />
            <Route path="/player/" component={Player} />
            <Route path="/work/:rjcode" component={Work} />

            <Route path="/circle/:id" component={(p) => <Works restrict="circle" {...p} />} />
            <Route path="/tag/:id" component={(p) => <Works restrict="tag" {...p} />} />
            <Route path="/va/:id" component={(p) => <Works restrict="va" {...p} />} />

            <Route path="/circles/" component={(p) => <List restrict="circle" {...p} />} />
            <Route path="/tags/" component={(p) => <List restrict="tag" {...p} />} />
            <Route path="/vas/" component={(p) => <List restrict="va" {...p} />} />
          </Switch>
          <PlayerBar />
        </BrowserRouter>
      </ErrorBoundary>
      <AudioElement />
    </Provider>
  );
}

render(<App />, document.getElementById('root'));

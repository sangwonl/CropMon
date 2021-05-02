import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import store from '@presenters/redux/store';

import { BasicPreferences } from './BasicPreferences';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path="/" component={BasicPreferences} />
      </Switch>
    </Router>
  </Provider>,
  document.getElementById('root')
);

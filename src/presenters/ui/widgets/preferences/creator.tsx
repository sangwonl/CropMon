/* eslint-disable react/display-name */

import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { Preferences } from '@presenters/ui/components/stateful/Preferences';
import store from '@presenters/redux/store';

const Wrapper = () => (
  <Provider store={store}>
    <Router>
      <Switch>
        <Route path="/" component={Preferences} />
      </Switch>
    </Router>
  </Provider>
);

export default () => {
  return <Wrapper />;
};

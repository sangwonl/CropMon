import React from 'react';
import { useSelector } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import { RootState } from '@presenters/redux/store';

import './App.css';

const Hello = () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const state = useSelector((state: RootState) => state);

  return (
    <div>
      <p>{JSON.stringify(state, null, 2)}</p>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Hello} />
      </Switch>
    </Router>
  );
}

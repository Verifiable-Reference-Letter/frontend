import React from "react";
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

import WriterPage from "./components/writer/Writer";
import RequestorPage from "./components/requestor/Requestor";
import RecipientPage from "./components/recipient/Recipient";
import LandingPage from "./components/pages/landing"

import * as ROUTES from './common/routes';

class App extends React.Component {
  render() {
    return (
      <Router>
          <div>
            <Route exact path={ROUTES.LANDING} component={LandingPage} />
            
            <Route path={ROUTES.REQUESTOR} component={RequestorPage} />
            <Route path={ROUTES.RECIPIENT} component={RecipientPage} />
            <Route path={ROUTES.WRITER} component={WriterPage} />
          </div>  
      </Router>
    );
  }
}
export default App;

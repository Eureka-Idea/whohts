import React, {Component} from 'react'
import {Route, Switch} from 'react-router-dom'

import {Home, NotFound} from '../'
import Dashboard from '../Dashboard'

class App extends Component {
  render() {
    return (
      <div className="app container-fluid">
        <Switch>
          <Route exact path="/" component={Home}/>
          <Route exact path="/:country" component={Dashboard}/>
          <Route component={NotFound}/>
        </Switch>
      </div>
    )
  }
}

export default App

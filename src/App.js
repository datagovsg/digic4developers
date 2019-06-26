import React from 'react'
import './App.css'
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import Landing from './Pages/Landing'

function PrivateRoute({ component: Component, ...rest }) {
  const isAuthenticated = false
  return (
    <Route
      {...rest}
      render={ props => {
        if (!isAuthenticated && process.env.NODE_ENV === 'production') {
          return <div></div>
        }
        return <Component {...props} />
      }}
    />
  )
}

function App () {
  return (
    <Router>
      <Switch>
        <Route path='/' exact component={ Landing }/>
      </Switch>
    </Router>
  )
}

export default App

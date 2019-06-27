import React from 'react'
import './App.css'
import {
  Route,
  BrowserRouter as Router,
  Switch
} from 'react-router-dom'
import NavBar from './Components/NavBar'
// Pages
import Landing from './Pages/Landing'
import SignIn from './Pages/SignIn'
import MyApps from './Pages/MyApps'
import Guidelines from './Pages/Guidelines'
import CreateNewApp from './Pages/CreateNewApp'

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
      <div>
        <NavBar/>
        <Switch>
          <Route path='/' exact component={ Landing }/>
          <Route path='/sign-in' exact component={ SignIn }/>
          <Route path='/my-apps' exact component={ MyApps }/>
          <Route path='/create-new-app' exact component={ CreateNewApp }/>
          <Route path='/guidelines' exact component={ CreateNewApp }/>
        </Switch>
      </div>
    </Router>
  )
}

export default App

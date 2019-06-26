import React from 'react'
import { NavLink } from 'react-router-dom'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'

export default function NavBar () {
  return (
    <AppBar
      position="static"
      color="default"
    >
      <NavLink to='/sign-in'>
        SIGN IN
      </NavLink>
      <NavLink to='/my-apps'>
        MY APPS
      </NavLink>
    </AppBar>
  )
}

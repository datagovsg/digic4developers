import React from 'react'
import { NavLink } from 'react-router-dom'

const styles = {
  container: {
    backgroundColor: 'aliceblue'
  }
}

export default function NavBar () {
  return (
    <div style={ styles.container }>
      <NavLink to='/sign-in'>
        SIGN IN
      </NavLink>
      <NavLink to='/my-apps'>
        MY APPS
      </NavLink>
    </div>
  )
}

import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import Toolbar from '@material-ui/core/Toolbar'
import Link from '@material-ui/core/Link'

export default function NavBar () {
  const styles = {
    appBar: {
      borderBottom: `1px solid grey`
    },
    toolbar: {
      flexWrap: 'wrap',
      backgroundColor: 'lightGrey'
    },
    toolbarTitle: {
      flexGrow: 1,
    },
    link: {
      margin: 20,
    }
  }

  return (
    <AppBar position="static" color="default" elevation={0} style={ styles.appBar }>
      <Toolbar style={ styles.toolbar }>
        <Typography variant="h6" color="inherit" noWrap style={ styles.toolbarTitle }>
          for developers
        </Typography>
        <nav>
          <Link variant="button" color="textPrimary" href="my-apps" style={ styles.link }>
            MY APPS
          </Link>
          <Link variant="button" color="textPrimary" href="guidelines" style={ styles.link }>
            GUIDELINES
          </Link>
          <Link variant="button" color="textPrimary" href="sign-in" style={ styles.link }>
            SIGN IN
          </Link>
        </nav>
        {
        // <Button href="#" color="primary" variant="outlined" style={ styles.link }>
        //   Login
        // </Button>
        }
      </Toolbar>
    </AppBar>
  )
  // return (
  //   <AppBar
  //     position="static"
  //     color="default"
  //   >
  //     <NavLink to='/sign-in'>
  //       SIGN IN
  //     </NavLink>
  //     <NavLink to='/my-apps'>
  //       MY APPS
  //     </NavLink>
  //   </AppBar>
  // )
}

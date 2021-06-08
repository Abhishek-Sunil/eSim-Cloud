import React, { useEffect } from 'react'
import {
  Card,
  Grid,
  Button,
  Typography,
  CardActions,
  CardContent
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Link as RouterLink } from 'react-router-dom'

import SchematicCard from './SchematicCard'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchematics } from '../../redux/actions/index'
import api from '../../utils/Api'

const useStyles = makeStyles({
  mainHead: {
    width: '100%',
    backgroundColor: '#404040',
    color: '#fff'
  },
  title: {
    fontSize: 14,
    color: '#80ff80'
  }
})

// Card displaying user my schematics page header.
function MainCard() {
  const classes = useStyles()

  return (
    <Card className={classes.mainHead}>
      <CardContent>
        <Typography className={classes.title} gutterBottom>
          All schematics are Listed Below
        </Typography>
        <Typography variant="h5" component="h2">
          My Schematics
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          target="_blank"
          component={RouterLink}
          to="/editor"
          size="small"
          color="primary"
        >
          Create New
        </Button>
        <Button size="small" color="secondary">
          Load More
        </Button>
      </CardActions>
    </Card>
  )
}

export default function SchematicsList() {
  const classes = useStyles()
  const auth = useSelector(state => state.authReducer)
  const schematics = useSelector(state => state.dashboardReducer.schematics)
  const [ltiDetails, setLtiDetails] = React.useState(null)

  const dispatch = useDispatch()

  // For Fetching Saved Schematics
  useEffect(() => {
    dispatch(fetchSchematics())
  }, [dispatch])

  useEffect(() => {
    const token = localStorage.getItem('esim_token')
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    api.get('lti/exists', config)
      .then(res => {
        setLtiDetails(res.data)
      }).catch(err => console.log(err))
  }, [])

  return (
    <>
      <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        alignContent="center"
        spacing={3}
      >
        {/* User Dashboard My Schematic Header */}
        <Grid item xs={12}>
          <MainCard />
        </Grid>

        {/* List all schematics saved by user */}
        {(schematics.length !== 0 && ltiDetails !== null)
          ? <>
            {schematics.map(
              (sch) => {
                var actual = null
                var flag = null
                ltiDetails.map(
                  //eslint-disable-next-line
                  (lti) => {
                    if (lti.model_schematic === sch.save_id || lti.initial_schematic === sch.save_id) {
                      flag = 1
                      actual = lti.consumer_key
                      //eslint-disable-next-line
                      return
                    }
                  }
                )
                if (flag) {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} consKey={actual} />
                    </Grid>
                  )
                }
                else {
                  return (
                    <Grid item xs={12} sm={6} lg={3} key={sch.save_id}>
                      <SchematicCard sch={sch} />
                    </Grid>
                  )
                }
              }
            )}
          </>
          : <Grid item xs={12}>
            <Card style={{ padding: '7px 15px' }} className={classes.mainHead}>
              <Typography variant="subtitle1" gutterBottom>
                Hey {auth.user.username} , You dont have any saved schematics...
              </Typography>
            </Card>
          </Grid>
        }
      </Grid>
    </>
  )
}

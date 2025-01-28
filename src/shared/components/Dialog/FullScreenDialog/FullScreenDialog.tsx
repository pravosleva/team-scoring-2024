import { useState, forwardRef, Fragment } from  'react'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
// import ListItemText from '@mui/material/ListItemText'
// import ListItemButton from '@mui/material/ListItemButton'
// import List from '@mui/material/List'
// import Divider from '@mui/material/Divider'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'
// import baseClasses from '~/App.module.scss'
import Box from '@mui/material/Box'
// import Paper from '@mui/material/Paper'
import Grid from '@mui/material/Grid2'
import { Form } from '~/shared/components/Form/v2'
// import { TJob } from '~/shared/xstate'
import { TScheme } from '~/shared/components/Form/v2/types'
import { TJobForm } from '~/shared/xstate/topLevelMachine/v2/types'

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

type TProps = {
  // initialValues: TJob;
  scheme: TScheme;
  actions?: {
    label: string;
    onClick: () => Promise<{
      ok: boolean;
      message?: string;
    }>;
  }[];
  title: string;
  targetAction: {
    label: string;
    startIcon?: React.ReactNode;
    isEnabled: boolean;
    onClick: () => Promise<{
      ok: boolean;
      message?: string;
    }>;
  };
  onClose?: () => Promise<{
    ok: boolean;
    message?: string;
  }>;
  togglerRender: () => React.ReactNode;
  middleInfoRender?: () => React.ReactNode;
  onReady: (state: unknown) => void;
  onNotReady: (state: unknown) => void;
  onClearDates: () => void;
  __errsBeforeTouchedIgnoreList?: string[];
}

const delay = (ms = 0) => new Promise((res) => {
  setTimeout(res, ms)
})

export const FullScreenDialog = ({
  title,
  scheme,
  togglerRender,
  onClose,
  targetAction,
  middleInfoRender,
  onReady,
  onNotReady,
  // onClearDates,
  __errsBeforeTouchedIgnoreList,
}: TProps) => {
  const [open, setOpen] = useState(false)
  const handleClickOpen = () => {
    setOpen(true)
  }
  const handleClose = () => {
    setOpen(false)
    if (typeof onClose === 'function')
      delay(150)
        .then(onClose)
    
  }
  const handleSubmit = () => {
    targetAction.onClick()
      .then(({ ok }) => {
        if (ok === true) handleClose()
      })
      .catch((err: unknown) => {
        switch (true) {
          case err instanceof Error:
          case typeof (err as Error)?.message === 'string':
            alert((err as Error).message)
            break
          default:
            console.error(err)
            break
        }
        
      })
  }

  return (
    <Fragment>
      <div onClick={handleClickOpen}>
        {togglerRender()}
      </div>
      {!!middleInfoRender && middleInfoRender()}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar
          sx={{
            position: 'relative',
          }}
          color='warning'
        >
          <Toolbar
            sx={{
              // pr: 0,
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography
              sx={{ ml: 1, flex: 1 }}
              variant='subtitle1'
              component='div'
            >
              Edit {title}
            </Typography>
            <Button
              autoFocus
              color='inherit'
              variant='outlined'
              onClick={handleSubmit}
              disabled={!targetAction.isEnabled}
              startIcon={targetAction.startIcon}
            >
              {targetAction.label}
            </Button>
            {/* <Button
              autoFocus
              color='inherit'
              variant='outlined'
              onClick={onClearDates}
              // disabled={!targetAction.isEnabled}
              // startIcon={targetAction.startIcon}
            >
              Clear dates
            </Button> */}
          </Toolbar>
        </AppBar>
        {/* <List>
          <ListItemButton>
            <ListItemText primary="Phone ringtone" secondary="Titania" />
          </ListItemButton>
          <Divider />
          <ListItemButton>
            <ListItemText
              primary="Default notification ringtone"
              secondary="Tethys"
            />
          </ListItemButton>
        </List> */}
        {
          Object.keys(scheme).length > 0 && (
            <Box sx={{ padding: 2 }}>
              <Grid container spacing={2}>
                <Form<TJobForm>
                  cb={{
                    onClose: () => {},
                    onError: () => {},
                    onSuccess: () => Promise.resolve({ ok: true }),
                  }}
                  scheme={scheme}
                  // initialValues={initialValues}
                  onFormReady={({ state }) => onReady(state)}
                  onFormNotReady={({ state }) => onNotReady(state)}
                  __errsBeforeTouchedIgnoreList={__errsBeforeTouchedIgnoreList}
                />
              </Grid>
            </Box>
          )
        }
      </Dialog>
    </Fragment>
  )
}

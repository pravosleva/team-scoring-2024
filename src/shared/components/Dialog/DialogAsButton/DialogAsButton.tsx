import React, { useState, useCallback, forwardRef } from 'react'
import { TScheme, TValue } from '~/shared/components/Form/v2/types'
import { AppBar, Box, Button, Dialog, IconButton, Slide, Toolbar, Typography } from '@mui/material'
import { Close as CloseIcon } from '@mui/icons-material'
import { TransitionProps } from '@mui/material/transitions'
import Grid from '@mui/material/Grid2'
import { Form } from '~/shared/components/Form/v2'

type TProps = {
  // initialValues: TJob;
  modal: {
    title: string;
  };
  scheme: TScheme;
  btn: {
    label: string;
    startIcon?: React.ReactNode;
  };
  actions?: {
    label: string;
    onClick: () => Promise<{
      ok: boolean;
      message?: string;
    }>;
  }[];
  targetAction: {
    label: string;
    startIcon?: React.ReactNode;
    isEnabled: boolean;
    onClick: ({ form }: {
      form: {
        [key: string]: TValue;
      }
    }) => Promise<{
      ok: boolean;
      message?: string;
    }>;
  };
}

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction='up' ref={ref} {...props} />
})

export const DialogAsButton = ({ scheme, btn, modal, targetAction }: TProps) => {
  const [isOpened, setIsOpened] = useState(false)
  const handleOpen = useCallback(() => {
    setIsOpened(true)
  }, [setIsOpened])
  const handleClose = useCallback(() => {
    setIsOpened(false)
  }, [setIsOpened])

  const [isReady, setIsReady] = useState(false)
  const [formState, setFormState] = useState<{ [key: string]: TValue; }>({
    displayName: '',
  })
  const handleReady = useCallback((state: { [key: string]: TValue; }) => {
    console.log('-- handleReady CALLED')
    setFormState(state)
    setIsReady(true)
  }, [setFormState, setIsReady])
  const handleNotReady = useCallback((state: { [key: string]: TValue; }) => {
    console.log('-- handleNotReady CALLED')
    setFormState(state)
    setIsReady(false)
  }, [setFormState, setIsReady])

  return (
    <>
      <Button
        color='secondary'
        variant='contained'
        onClick={handleOpen}
        disabled={isOpened}
        startIcon={btn.startIcon}
      >
        {btn.label}
      </Button>
      <Dialog
        fullScreen
        open={isOpened}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }} color='secondary'>
          <Toolbar>
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
              {modal.title}
            </Typography>
            <Button
              // autoFocus
              color='inherit'
              variant='outlined'
              onClick={async () => {
                const res = await targetAction.onClick({ form: formState })
                if (res.ok) handleClose()
                else window.alert('Err')
              }}
              disabled={!targetAction.isEnabled || !isReady}
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
                <Form<{ [key: string]: TValue }>
                  cb={{
                    onClose: () => {},
                    onError: () => {},
                    onSuccess: () => Promise.resolve({ ok: true }),
                  }}
                  scheme={scheme}
                  // initialValues={initialValues}
                  onFormReady={({ state }) => handleReady(state)}
                  onFormNotReady={({ state }) => handleNotReady(state)}
                  // __errsBeforeTouchedIgnoreList={__errsBeforeTouchedIgnoreList}
                />
              </Grid>
            </Box>
          )
        }
      </Dialog>
      {/* <pre>{JSON.stringify(formState, null, 2)}</pre> */}
    </>
  )
}

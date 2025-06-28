/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react'
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddIcon from '@mui/icons-material/Add'
// import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
// import CommentBankIcon from '@mui/icons-material/CommentBank'
// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
// import { useStyles } from './useStyles'
import classes from './CommentManager.module.scss'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'
import { CustomizedTextField } from '~/shared/components/Input'

type TProps<T> = {
  infoLabel: string;
  initialState: T;
  onSuccess: ({ state }: { state: T, cleanup: () => void }) => void;
  onDelete: ({ cleanup }: { cleanup: () => void }) => void;
  isEditable: boolean;
}

// type TLogLink = {
//   id: number;
//   url: string;
//   title: string;
//   descr: string;
// };

export const CommentManager: React.FC<TProps<{ url: string; descr: string; title: string }>> = ({
  initialState,
  infoLabel,
  onSuccess,
  onDelete,
  isEditable,
}) => {
  // const classes = useStyles()
  const [url, setUrl] = useState<string>(initialState.url)
  const [descr, setDescr] = useState<string>(initialState.descr)
  const [title, setTitle] = useState<string>(initialState.title)

  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const handleEditToggle = useCallback(() => {
    setIsEditMode((s) => !s)
  }, [])
  const handleReset = useCallback(() => {
    setUrl(initialState.url)
    setDescr(initialState.descr)
    setTitle(initialState.title)
  }, [initialState.url, initialState.descr, initialState.title])

  const handleClose = useCallback(() => {
    setIsEditMode(false)
  }, [])
  
  const handleChangeUrl = useCallback((e: any) => {
    setUrl(e.target.value)
  }, [])
  const handleChangeDescr = useCallback((e: any) => {
    setDescr(e.target.value)
  }, [])
  const handleChangeTitle = useCallback((e: any) => {
    setTitle(e.target.value)
  }, [])

  const handleCleanup = useCallback(() => {
    setUrl('')
    setDescr('')
    setTitle('')
    handleClose()
  }, [setUrl, setDescr, setTitle, handleClose])

  const handleSubmit = useCallback(() => {
    onSuccess({ state: { url, descr, title }, cleanup: handleCleanup })
    handleClose()
  }, [url, descr, title, onSuccess, handleClose, handleCleanup])

  const handleRemove = useCallback(() => {
    const isConfirmed = window.confirm('Уверены?')
    if (isConfirmed) {
      onDelete({ cleanup: handleCleanup })
    }
  }, [handleCleanup, onDelete])

  const hasUpdated = useMemo(() => {
    return url !== initialState.url || descr !== initialState.descr || title !== initialState.title
  }, [url, descr, title, initialState.url, initialState.descr, initialState.title ])

  return (
    <>
      {
        isEditMode ? (
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={url}
                fullWidth
                variant='outlined'
                label='URL'
                type='text'
                onChange={handleChangeUrl}
                // multiline
                // maxRows={1}
                // sx={{
                //   borderRadius: '8px',
                // }}
              />
            </Grid>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={title}
                fullWidth
                variant='outlined'
                label='Title'
                type='text'
                onChange={handleChangeTitle}
                // multiline
                // maxRows={1}
                // sx={{
                //   borderRadius: '8px',
                // }}
              />
            </Grid>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={descr}
                fullWidth
                variant='outlined'
                label='Descr'
                type='text'
                onChange={handleChangeDescr}
                multiline
                maxRows={7}
                // sx={{
                //   borderRadius: '8px',
                // }}
              />
            </Grid>

            <Grid size={6}>
              <Button
                // size='small'
                fullWidth
                disabled={!hasUpdated || title.length > 500 || descr.length > 2000 || url.length > 2000}
                variant='contained'
                onClick={handleSubmit}
                color='primary'
                startIcon={<SaveIcon />}
              >Save</Button>
            </Grid>
            <Grid size={6}>
              <Button
                // size='small'
                fullWidth
                variant='outlined'
                onClick={() => {
                  handleReset()
                  handleClose()
                }}
                color='error'
                startIcon={<CloseIcon />}
                disabled={!isEditable}
              >Cancel</Button>
            </Grid>
          </Grid>
        ) : (
          <>
            {!!title && !!url ? (
              <Grid container spacing={2}>
                <Grid size={12}>
                  <div
                    className={clsx(
                      classes.commentBox,
                      {
                        [classes.editableCommentBox]: isEditable,
                      }
                    )}>
                    <div className={classes.absoluteBadgeRight}>
                      {infoLabel}
                    </div>
                    <div className={classes.commentDescription}>
                      <pre
                        style={{
                          // fontSize: '13px',
                          // maxHeight: '150px',
                          // backgroundColor: 'lightgray',
                        }}
                        className={baseClasses.preNormalized}
                      >{JSON.stringify({ url, title, descr }, null, 2)}</pre>
                    </div>
                    {
                      isEditable && (
                        <div className={classes.absoluteControls}>
                          <button className={classes.btnEdit} onClick={handleEditToggle}>Edit</button>
                          <button className={classes.btnDelete} onClick={handleRemove}>Del</button>
                        </div>
                      )
                    }
                    {/*
                      isEditable && (
                        <div className={classes.commentAction}>
                          <div>
                            <Button
                              // size='small'
                              // startIcon={<CommentBankIcon />}
                              // fullWidth
                              variant='outlined' color='primary' onClick={handleEditToggle}
                              // sx={{
                              //   borderRadius: (t) => t.spacing(1, 0, 1, 0)
                              // }}
                            >
                              <EditIcon fontSize='small' />
                            </Button>
                            <Button
                              // size='small'
                              // startIcon={<CommentBankIcon />}
                              // fullWidth
                              variant='outlined' color='error' onClick={handleRemove}
                              // sx={{
                              //   borderRadius: (t) => t.spacing(1, 0, 1, 0)
                              // }}
                            >
                              <DeleteIcon fontSize='small' />
                            </Button>
                          </div>
                        </div>
                      )
                    */}
                  </div>
                </Grid>
              </Grid>
            ) : (
              isEditable && (
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Button
                      // size='small'
                      startIcon={<AddIcon />}
                      fullWidth
                      variant='outlined' color='primary' onClick={handleEditToggle}

                    >
                      Add link
                    </Button>
                  </Grid>
                </Grid>
              )
            )}
          </>
        )
      }
    </>
  )
}

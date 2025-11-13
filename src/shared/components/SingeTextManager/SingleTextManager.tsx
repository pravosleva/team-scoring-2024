/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo } from 'react'
import {
  // Box,
  Button,
  // Stack,
  TextField,
  // Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import AddIcon from '@mui/icons-material/Add'
// import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
// import CommentBankIcon from '@mui/icons-material/CommentBank'
// import EditIcon from '@mui/icons-material/Edit'
// import DeleteIcon from '@mui/icons-material/Delete'
// import { useStyles } from './useStyles'
import classes from './SingleTextManager.module.scss'
import { styled } from '@mui/material/styles'
import clsx from 'clsx'
import baseClasses from '~/App.module.scss'

type TProps<T> = {
  initialState: T;
  infoLabel: string;
  buttonText?: string;
  onSuccess?: ({ state }: { state: T, cleanup: () => void }) => void;
  onDelete?: ({ cleanup }: { cleanup: () => void }) => void;
  isEditable: boolean;
  isDeletable: boolean;
}

const CustomizedTextField = styled(TextField)({
  // '& label.Mui-focused': {
  //   color: 'green',
  // },
  // '& .MuiInput-underline:after': {
  //   borderBottomColor: 'green',
  // },
  '& .MuiOutlinedInput-root': {
    // '& fieldset': {
    //   borderColor: 'red',
    // },
    // '&:hover fieldset': {
    //   borderColor: 'yellow',
    // },
    // '&.Mui-focused fieldset': {
    //   borderColor: 'green',
    // },
    borderRadius: '8px',
  },
});

// type TLogLink = {
//   id: number;
//   url: string;
//   title: string;
//   descr: string;
// };

export const SingleTextManager: React.FC<TProps<{ text: string }>> = ({
  initialState,
  infoLabel,
  buttonText,
  onSuccess,
  onDelete,
  isEditable,
  isDeletable,
}) => {
  const [localText, setLocalText] = useState<string>(initialState.text)

  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const handleEditToggle = useCallback(() => {
    setIsEditMode((s) => !s)
  }, [])
  const handleReset = useCallback(() => {
    setLocalText(initialState.text)
  }, [initialState.text])

  const handleClose = useCallback(() => {
    setIsEditMode(false)
  }, [])

  const handleChangeText = useCallback((e: any) => {
    setLocalText(e.target.value)
  }, [])

  const handleCleanup = useCallback(() => {
    setLocalText('')
    handleClose()
  }, [setLocalText, handleClose])

  const handleSubmit = useCallback(() => {
    onSuccess?.({ state: { text: localText }, cleanup: handleCleanup })
    handleClose()
  }, [localText, onSuccess, handleClose, handleCleanup])

  const handleRemove = useCallback(() => {
    const isConfirmed = window.confirm('Уверены?')
    if (isConfirmed) {
      onDelete?.({ cleanup: handleCleanup })
    }
  }, [handleCleanup, onDelete])

  const hasUpdated = useMemo(() => {
    return localText !== initialState.text
  }, [localText, initialState.text])

  return (
    <>
      {
        isEditMode ? (
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={localText}
                fullWidth
                variant='outlined'
                label='Text'
                type='text'
                onChange={handleChangeText}
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
                disabled={!hasUpdated || localText.length > 2000}
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
            {!!localText ? (
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
                      >{localText}</pre>
                    </div>
                    {
                      isEditable && (
                        <div className={classes.absoluteControls}>
                          <button className={classes.btnEdit} onClick={handleEditToggle}>Edit</button>
                          {
                            isDeletable && (
                              <button className={classes.btnDelete} onClick={handleRemove}>Del</button>
                            )
                          }
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
                      {buttonText || 'No buttonText'}
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

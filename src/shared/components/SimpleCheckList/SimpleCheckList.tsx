/* eslint-disable @typescript-eslint/no-explicit-any */
import { memo, useState, useCallback, useMemo } from 'react'
import classes from './SimpleCheckList.module.scss'
import { TLogChecklistItem } from '~/shared/xstate';
import { Button } from '@mui/material'
import Grid from '@mui/material/Grid2'
import { CustomizedTextField } from '~/shared/components/Input'
import AddIcon from '@mui/icons-material/Add'
import SaveIcon from '@mui/icons-material/Save'
import CloseIcon from '@mui/icons-material/Close'
import clsx from 'clsx';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
// import baseClasses from '~/App.module.scss'

type TProps<T, TAddInfo> = {
  connectedOnThe?: ('top')[];
  isMiniVariant?: boolean;
  infoLabel: string;
  createBtnLabel: string;
  isEditable: boolean;
  isCreatable: boolean;
  isDeletable: boolean;
  items: TLogChecklistItem[];
  onCreateNewChecklistItem?: (ps: {
    state: T;
    cleanup: () => void;
  }) => void;
  onDeleteChecklist?: (ps: { cleanup: () => void }) => void;
  onEditChecklistItem?: (ps: {
    _additionalInfo?: TAddInfo;
    // logTs: number;
    checklistItemId: number;
    state: Pick<TLogChecklistItem, 'title' | 'descr' | 'isDone' | 'isDisabled'>;
    cleanup: () => void;
  }) => void;
  _additionalInfo?: TAddInfo;
  onDeleteChecklistItem?: (ps: {
    _additionalInfo?: TAddInfo;
    checklistItemId: number;
    cleanup: () => void;
  }) => void;
}

const genericMemo: <T>(component: T) => T = memo
// function GenericComponent<Value>(props: PropsWithGeneric<Value>) {
//   return <div />
// }

function SimpleCheckListFn<TAddInfo>({
  connectedOnThe,
  isMiniVariant,
  items,
  infoLabel,
  createBtnLabel,
  isEditable,
  isCreatable,
  isDeletable,
  onCreateNewChecklistItem,
  onDeleteChecklist,
  onEditChecklistItem,
  onDeleteChecklistItem,
  _additionalInfo,
}: TProps<{ title: string; descr: string }, TAddInfo>) {
  // return (
  //   <div className={classes.wrapper}>
  //     <div className={classes.itemWrapper}>
  //       [ Add check list item btn ]
  //     </div>
  //     {
  //       items.length > 0 && (
  //         items.map((item) => (
  //           <div className={classes.itemWrapper}>
  //             Item {item.label}
  //           </div>
  //         ))
  //       )
  //     }
  //     {
  //       items.length === 0 && (
  //         <div>
  //           No items yet
  //         </div>
  //       )
  //     }
  //   </div>
  // )

  const [newLabel, setNewLabel] = useState<string>('')
  const [newDescr, setNewDescr] = useState<string>('')

  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const handleEditToggle = useCallback(() => {
    setIsEditMode((s) => !s)
  }, [])
  const handleReset = useCallback(() => {
    setNewLabel('')
    setNewDescr('')
  }, [])
  const handleClose = useCallback(() => {
    setIsEditMode(false)
  }, [])

  const handleChangeLabel = useCallback((e: any) => {
    setNewLabel(e.target.value)
  }, [])
  const handleChangeDescr = useCallback((e: any) => {
    setNewDescr(e.target.value)
  }, [])

  const [activeChecklistId, setActiveChecklistId] = useState<null | number>(null)
  const handleCleanup = useCallback(() => {
    setActiveChecklistId(null)
    handleReset()
    handleClose()
  }, [handleReset, handleClose])

  const normalizedTitle = useMemo(() => newLabel.trim().replace(/\s+/g,' '), [newLabel])
  const normalizedDescr = useMemo(() => newDescr.trim().replace(/\s+/g,' '), [newDescr])
  const handleSubmit = useCallback(() => {
    switch (true) {
      case !!activeChecklistId: {
        const targetChecklistItem = items.find(({ id }) => id === activeChecklistId)
        if (!!targetChecklistItem && typeof onEditChecklistItem === 'function') {
          onEditChecklistItem({
            checklistItemId: activeChecklistId,
            state: {
              title: normalizedTitle,
              descr: normalizedDescr,
              isDisabled: targetChecklistItem.isDisabled,
              isDone: targetChecklistItem.isDone,
            },
            _additionalInfo,
            cleanup: handleCleanup,
          })
        } else {
          console.log('-- case 2 NO targetChecklistItem')
        }
        break
      }
      default: {
        if (typeof onCreateNewChecklistItem === 'function') {
          onCreateNewChecklistItem({
            state: { title: normalizedTitle, descr: normalizedDescr },
            cleanup: handleCleanup,
          })
          handleCleanup()
        }
        break
      }
    }
  }, [_additionalInfo, items, activeChecklistId, normalizedTitle, normalizedDescr, onCreateNewChecklistItem, handleCleanup, onEditChecklistItem])

  const handleRemove = useCallback(() => {
    const isConfirmed = window.confirm('Уверены?')
    if (isConfirmed) {
      if (typeof onDeleteChecklist === 'function') {
        onDeleteChecklist({ cleanup: handleCleanup })
      }
    }
  }, [handleCleanup, onDeleteChecklist])

  // const hasUpdated = useMemo(() => {
  //   return url !== initialState.url || descr !== initialState.descr || title !== initialState.title
  // }, [url, descr, title, initialState.url, initialState.descr, initialState.title ])

  const handleEditItem = useCallback(({ titleForEdit, descrForEdit, checklistId }: { checklistId: number; titleForEdit: string; descrForEdit: string }) => () =>  {
    // console.log({ titleForEdit, descrForEdit })
    setNewLabel(titleForEdit)
    setNewDescr(descrForEdit)
    setActiveChecklistId(checklistId)
    setIsEditMode(true)
  }, [])

  const handleDoneToggle = useCallback(({ checklistItemId, title, descr, isDoneCurrentValue, isDisabledCurrentValue }: {
    checklistItemId: number; title: string; descr: string; isDoneCurrentValue: boolean; isDisabledCurrentValue: boolean;
  }) => () => {
    if (typeof onEditChecklistItem === 'function') {
      onEditChecklistItem({
        checklistItemId,
        state: {
          title,
          descr,
          isDisabled: isDisabledCurrentValue,
          isDone: !isDoneCurrentValue,
        },
        cleanup: handleCleanup,
        _additionalInfo,
      })
    }
  }, [handleCleanup, onEditChecklistItem, _additionalInfo])

  const handleDisabledToggle = useCallback(({ checklistItemId, title, descr, isDoneCurrentValue, isDisabledCurrentValue }: {
    checklistItemId: number; title: string; descr: string; isDoneCurrentValue: boolean; isDisabledCurrentValue: boolean;
  }) => () => {
    if (typeof onEditChecklistItem === 'function') {
      onEditChecklistItem({
        checklistItemId,
        state: {
          title,
          descr,
          isDisabled: !isDisabledCurrentValue,
          isDone: isDoneCurrentValue,
        },
        cleanup: handleCleanup,
        _additionalInfo,
      })
    }
  }, [handleCleanup, onEditChecklistItem, _additionalInfo])

  const handleDeleteChecklistItem = useCallback(({ checklistItemId }: {
    checklistItemId: number;
  }) => () => {
    if (typeof onDeleteChecklistItem === 'function') {
      onDeleteChecklistItem({
        checklistItemId,
        cleanup: handleCleanup,
        _additionalInfo,
      })
    }
  }, [handleCleanup, onDeleteChecklistItem, _additionalInfo])

  return (
    <>
      {
        isEditMode ? (
          <Grid container spacing={2}>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={newLabel}
                fullWidth
                variant='outlined'
                label='Checklist item title'
                type='text'
                onChange={handleChangeLabel}
              />
            </Grid>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={newDescr}
                fullWidth
                variant='outlined'
                label='Checklist item descr'
                type='text'
                onChange={handleChangeDescr}
                // multiline
                // maxRows={5}
                // sx={{ borderRadius: '8px' }}
              />
            </Grid>

            <Grid size={6}>
              <Button
                // size='small'
                fullWidth
                disabled={!normalizedTitle || normalizedTitle.length > 200 || normalizedDescr.length > 2000}
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
                onClick={handleCleanup}
                color='error'
                startIcon={<CloseIcon />}
                disabled={!isEditable}
              >Cancel</Button>
            </Grid>
          </Grid>
        ) : items.length > 0 && (
          <>
            <Grid container spacing={2}>
              <Grid size={12}>
                <div
                  className={clsx(
                    {
                      [classes.commentBox]: !isMiniVariant,
                      [classes.commentBoxMini]: isMiniVariant,
                      [classes.editableCommentBox]: isEditable && !isMiniVariant,
                      [classes.editableCommentBoxMini]: isEditable && isMiniVariant,
                      [classes.rounded]: !connectedOnThe,
                      [classes.connectedOnTheTop]: connectedOnThe?.includes('top'),
                    }
                  )}
                >
                  <div className={clsx({
                    [classes.absoluteBadgeTopRight]: !isMiniVariant,
                    [classes.absoluteBadgeBottomLeft]: isMiniVariant,
                  })}>
                    {infoLabel}
                  </div>
                  {/* <div className={classes.commentDescription}>
                    <pre
                      style={{
                        // fontSize: '13px',
                        // maxHeight: '150px',
                        // backgroundColor: 'lightgray',
                      }}
                      className={baseClasses.preNormalized}
                    >{JSON.stringify({ newLabel, newDescr }, null, 2)}</pre>
                  </div> */}
                  <div
                    className={clsx(classes.checklistWrapper)}
                  >
                    {
                      items.map((checklistItem) => (
                        <div
                          key={checklistItem.id}
                          className={clsx(classes.checklistItemWrapper, {
                            [classes.activeChecklistItem]: activeChecklistId === checklistItem.id,
                            [classes.disabledBox]: checklistItem.isDisabled,
                          })}
                        >
                          <div className={classes.checkerAndControls}>
                            <button
                              className={classes.actionIconWrapper}
                              onClick={handleDoneToggle({
                                checklistItemId: checklistItem.id,
                                title: checklistItem.title,
                                descr: checklistItem.descr,
                                isDoneCurrentValue: checklistItem.isDone,
                                isDisabledCurrentValue: checklistItem.isDisabled,
                              })}
                            >
                              {
                                checklistItem.isDone && <CheckBoxIcon htmlColor='#959eaa' />
                              }
                              {
                                !checklistItem.isDone && <CheckBoxOutlineBlankIcon htmlColor='#959eaa' />
                              }
                            </button>

                            <div className={classes.checklistItemControls}>
                              
                              {
                                !!onDeleteChecklistItem && (
                                  <code className={classes.inlineControlBtn}  onClick={handleDeleteChecklistItem({ checklistItemId: checklistItem.id })} style={{ color: 'red' }}>[ Del ]</code>
                                )
                              }
                              <code className={classes.inlineControlBtn} onClick={handleDisabledToggle({
                                checklistItemId: checklistItem.id,
                                title: checklistItem.title,
                                descr: checklistItem.descr,
                                isDoneCurrentValue: checklistItem.isDone,
                                isDisabledCurrentValue: checklistItem.isDisabled,
                              })}>
                                {
                                  !checklistItem.isDisabled && <>[ Off ]</>
                                }
                                {
                                  checklistItem.isDisabled && <>[ On ]</>
                                }
                              </code>
                              {
                                isEditable && (
                                  <code
                                    className={classes.inlineControlBtn} 
                                    onClick={handleEditItem({ checklistId: checklistItem.id, titleForEdit: checklistItem.title, descrForEdit: checklistItem.descr })}
                                  >[ Edit ]</code>
                                )
                              }
                              
                            </div>
                          </div>

                          <div className={classes.infoStack}>
                            <em className={clsx({ [classes.throughText]: checklistItem.isDisabled })}>{checklistItem.title}</em>
                            {!!checklistItem.descr && <code className={clsx(classes.descr, { [classes.throughText]: checklistItem.isDisabled })}>{checklistItem.descr}</code>}
                          </div>
                          
                        </div>
                      ))
                    }
                    {
                      items.length === 0 && (
                        <em>No items yet</em>
                      )
                    }
                  </div>
                  {
                    (isEditable || isDeletable) && (
                      <div className={classes.absoluteControls}>
                        {
                          isEditable && (
                            <button className={classes.btnEdit} onClick={handleEditToggle}>Add</button>
                          )
                        }
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
          </>
        )
      }
      {
        items.length === 0 && isCreatable && !isEditMode && (
          <Grid container spacing={2}>
            <Grid size={12}>
              <Button
                // size='small'
                startIcon={<AddIcon />}
                fullWidth
                variant='outlined'
                color='primary'
                onClick={handleEditToggle}
              >
                {createBtnLabel}
              </Button>
            </Grid>
          </Grid>
        )
      }
    </>
  )
}

export const SimpleCheckList = genericMemo(SimpleCheckListFn)

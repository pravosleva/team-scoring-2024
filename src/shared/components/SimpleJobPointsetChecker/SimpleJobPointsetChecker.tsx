import clsx from 'clsx';
import { memo, useMemo, useState, useCallback, useRef } from 'react'
import baseClasses from '~/App.module.scss'
import { TJob, TopLevelContext, TPointsetItem } from '~/shared/xstate'
import { CustomizedTextField } from '~/shared/components/Input'
import { Button, Grid2 as Grid } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import classes from './SimpleJobPointsetChecker.module.scss'
import { useLocalStorageState } from '~/shared/hooks';
import { getDefaultPointsetStatusListSpaceState } from '~/pages/local-settings/utils/getDefaultPointsetStatusListSpaceState';
import { TLocalSettingsStatusOption } from '~/pages/local-settings/types';
import { Autocomplete } from '~/shared/components/Autocomplete'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops';

type TProps = {
  jobId: TJob['id'];
  isEditable: boolean;
  isCreatable: boolean;
}

const specialScrollForExternalBox = scrollToIdFactory({
  timeout: 0,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const SimpleJobPointsetChecker = memo(({ jobId, isEditable, isCreatable }: TProps) => {
  const jobsActorRef = TopLevelContext.useActorRef()
  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const targetJob = useMemo(() => jobs.find((j) => j.id === jobId), [jobs, jobId])

  const [activeStatusPackKey] = useLocalStorageState<string>({
    key: 'teamScoring2024:localSettings:pointset-active-statuspack',
    initialValue: 'default',
  })
  const [localStatusPacksSettings] = useLocalStorageState<{
    [key: string]: {
      [key: string]: TLocalSettingsStatusOption;
    };
  }>({
    key: 'teamScoring2024:localSettings:pointset-statuslist',
    initialValue: {
      default: getDefaultPointsetStatusListSpaceState(),
    },
  })
  // const activeStatusPack = useMemo(() => localStatusPacksSettings[activeStatusPackKey] || null, [activeStatusPackKey, localStatusPacksSettings])

  // -- EXP: Create new
  // const editFormRef = useRef<HTMLDivElement>(null)
  // const pointsetBoxRef = useRef<HTMLDivElement>(null)
  const scrollFormIntoViewFnRef = useRef(() => {
    // if (!!editFormRef?.current) editFormRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    specialScrollForExternalBox({
      id: 'checker-form-box'
    })
  })
  const scrollBoxIntoViewFnRef = useRef(() => {
    // if (!!pointsetBoxRef?.current) {
    //   console.log(pointsetBoxRef?.current)
    //   pointsetBoxRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    // } else console.warn('Box not found')
    specialScrollForExternalBox({
      id: 'checker-main-box'
    })
  })
  const [newLabel, setNewLabel] = useState<string>('')
  const [newDescr, setNewDescr] = useState<string>('')
  const [newStatusCode, setNewStatusCode] = useState<string | null>(!!activeStatusPackKey ? Object.keys(localStatusPacksSettings?.[activeStatusPackKey])[0] : null)
  const [newParentId, setNewParentId] = useState<number | ''>('')
  const [activeChecklistId, setActiveChecklistId] = useState<null | number>(null)

  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  // useEffect(() => {
  //   if (isEditMode)
  //     setTimeout(scrollFormIntoViewFnRef.current, 200)
  // }, [isEditMode])
  const handleEditToggle = useCallback(({ id }: { id?: number }) => () => {
    const isNew = typeof id === 'undefined'
    try {
      switch (isNew) {
        case true: {
          // NOTE: New
          const ts = new Date().getTime()
          setActiveChecklistId(ts)
          break
        }
        default: {
          // NOTE: Exists?
          if (!targetJob?.pointset) throw new Error('ERR1')
          const targetPointData = targetJob?.pointset.find((p) => p.id === id)
          if (!targetPointData) throw new Error('ERR2')

          setActiveChecklistId(targetPointData.id)
          setNewLabel(targetPointData.title)
          setNewDescr(targetPointData.descr || '')
          setNewParentId(targetPointData.relations.parent || '')
          break
        }
      }
      setIsEditMode((s) => {
        if (!s) {
          setTimeout(scrollFormIntoViewFnRef.current, 200)
        }
        return !s
      })
    } catch (err) {
      console.warn(err)
    }
  }, [targetJob?.pointset])
  const handleReset = useCallback(() => {
    setNewLabel('')
    setNewDescr('')
    setNewParentId('')
  }, [])
  const handleClose = useCallback(() => {
    setIsEditMode(false)
  }, [])
  const handleChangeLabel = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewLabel(e.target.value)
  }, [])
  const handleChangeDescr = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDescr(e.target.value)
  }, [])

  const normalizedTitle = useMemo(() => newLabel.trim().replace(/\s+/g, ' '), [newLabel])
  const normalizedDescr = useMemo(() => newDescr.trim().replace(/\s+/g, ' '), [newDescr])
  // --

  const handleCleanup = useCallback(() => {
    setActiveChecklistId(null)
    handleReset()
    handleClose()
    setTimeout(scrollBoxIntoViewFnRef.current, 300)
  }, [handleReset, handleClose])

  const handleSubmit = useCallback(() => {
    switch (true) {
      case !!activeChecklistId: {
        const targetChecklistItem = targetJob?.pointset?.find(({ id }) => id === activeChecklistId)
        switch (true) {
          case !!targetChecklistItem:
            // NOTE: Send event to fsm (exists)
            console.log('- TODO: case 1: Send event to fsm')
            console.log({ normalizedTitle, normalizedDescr, newStatusCode })

            if (!!newStatusCode) {
              jobsActorRef.send({
                type: 'todo.pointset:update-item',
                value: {
                  title: normalizedTitle,
                  descr: normalizedDescr || undefined,
                  statusCode: newStatusCode,
                  jobId,
                  relations: {
                    parent: newParentId || undefined,
                  },
                  pointId: activeChecklistId,
                },
              })
              handleCleanup()
              // NOTE: END
            } else throw new Error(`FRONT ERR1: newStatusCode is (${typeof newStatusCode})`)
            break
          default:
            // NOTE: Send event to fsm (create new)
            console.log('-- TODO: case 2: NO targetChecklistItem')
            if (!!newStatusCode) {
              jobsActorRef.send({
                type: 'todo.pointset:create-item',
                value: {
                  title: normalizedTitle,
                  descr: normalizedDescr || undefined,
                  initialStatusCode: newStatusCode,
                  jobId,
                  relations: {
                    parent: newParentId || undefined,
                  },
                },
              })
              handleCleanup()
              // NOTE: END
            } else throw new Error(`FRONT ERR2: newStatusCode is (${typeof newStatusCode})`)
            break
        }
        break
      }
      default: {
        // if (typeof onCreateNewChecklistItem === 'function') {
        //   onCreateNewChecklistItem({
        //     state: { title: normalizedTitle, descr: normalizedDescr },
        //     cleanup: handleCleanup,
        //   })
        //   handleCleanup()
        // }
        handleCleanup()
        break
      }
    }
  }, [jobsActorRef, targetJob?.pointset, activeChecklistId, normalizedTitle, normalizedDescr, newStatusCode, handleCleanup, jobId, newParentId])

  // const handleEditPoint = useCallback(({ pointId }: { pointId: number }) => () => {}, [])
  const pointsMapping = useMemo(
    () => !!targetJob?.pointset
      ? targetJob?.pointset.reduce((acc: { [key: string]: TPointsetItem }, cur) => {
        acc[String(cur.id)] = cur
        return acc
      }, {})
      : {},
    [targetJob?.pointset, targetJob?.pointset?.length]
  )

  const pointsOptionsWoActive = useMemo(
    () => Object.keys(pointsMapping)
      .filter((pidStr) => Number(pidStr) !== activeChecklistId)
      .map((pidStr) => ({ label: pointsMapping[pidStr].title, value: pidStr })),
    [activeChecklistId, pointsMapping]
  )

  const handleDeletePoint = useCallback(({ id }: { id: number }) => () => {
    try {
      const isConfirmed = window.confirm(`⚡️ The point "${id}" Will be removed. Yes?`)
      if (!isConfirmed) {
        return
      }
      jobsActorRef.send({
        type: 'todo.pointset:delete-item',
        value: {
          jobId,
          pointId: id,
        },
      })
    } catch (err) {
      console.warn(err)
    }
  }, [jobId])

  return (
    <div
      className={clsx(classes.externalWrapper, classes.default, classes.rounded, baseClasses.stack2)}
      // ref={pointsetBoxRef}
      id='checker-main-box'
    >
      <div
        className={clsx(baseClasses.truncate, classes.absoluteBadgeTopRight)}
        style={{
          maxWidth: 'calc(100% - 130px)',
          display: 'flex',
          flexDirection: 'row',
          gap: '6px',
        }}
      >
        Pointset
      </div>
      {
        !targetJob && (
          <em>Target job not found</em>
        )
      }
      {
        !!targetJob && !targetJob?.pointset && (
          <em>TODO: Target job ({jobId}) hasnt pointset</em>
        )
      }
      {
        !!targetJob?.pointset && !isEditMode && (
          <>
            <div
              className={clsx(baseClasses.truncate, baseClasses.stack1)}
            >
              <pre className={baseClasses.preNormalized}>
                {JSON.stringify({ pointset: targetJob?.pointset }, null, 2)}
              </pre>
              {
                targetJob?.pointset.map((p) => (
                  <div
                    key={p.id}
                    className={clsx(baseClasses.truncate, baseClasses.stack1)}
                  >
                    <div
                      style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}
                    >
                      {
                        p.relations.children.length > 0
                          ? (
                            <div className={clsx(baseClasses.truncate)} style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                              <span>&#x272D;</span>
                              <span>[{p.relations.children.length}]</span>
                              <span className={clsx(baseClasses.truncate)}>{clsx(localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.emoji, p.title)}</span>
                            </div>
                          )
                          : (
                            <div className={clsx(baseClasses.truncate)}>{clsx(localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.emoji, p.title)}</div>
                          )
                      }
                      <div
                        // className={clsx(classes.controlsBox)}
                        style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', gap: '1px', alignItems: 'center' }}
                      >
                        {/* <button
                          className={clsx(classes.btn, classes.btnGreen)}
                          onClick={handleEditToggle({ id: p.id })}
                        >Edit</button> */}
                        <code className={classes.inlineControlBtn} onClick={handleEditToggle({ id: p.id })}>
                          [ Edit ]
                        </code>
                        {/* <button
                          className={clsx(classes.btn, classes.btnRedLight)}
                          onClick={handleDeletePoint({ id: p.id })}
                        >Del</button> */}
                        <code className={classes.inlineControlBtn} onClick={handleDeletePoint({ id: p.id })} style={{ color: 'red' }}>
                          [ Del ]
                        </code>
                      </div>
                    </div>
                    {
                      !!localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.label && (
                        <div className={clsx(baseClasses.truncate)} style={{ color: '#959eaa', display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                          <span className={clsx(baseClasses.truncate)}>Status: {localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.label}</span>
                        </div>
                      )
                    }
                    {
                      !!p.relations.parent && (
                        <div className={clsx(baseClasses.truncate)} style={{ color: '#959eaa', display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                          <span>&#10551;</span>
                          <span className={clsx(baseClasses.truncate)}>{clsx(localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.emoji, pointsMapping[String(p.relations.parent)].title)}</span>
                        </div>
                      )
                    }
                  </div>
                ))
              }
            </div>
            {/* <pre className={baseClasses.preNormalized}>
              {JSON.stringify({ pointset: targetJob?.pointset }, null, 2)}
            </pre> */}
          </>
        )
      }
      {
        isEditable && isEditMode && (
          <Grid
            container
            spacing={2}
            // ref={editFormRef}
            id='checker-form-box'
          >
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={newLabel}
                fullWidth
                variant='outlined'
                label='Point title'
                type='text'
                onChange={handleChangeLabel}
                multiline
                maxRows={10}
                autoFocus
              />
            </Grid>
            <Grid size={12}>
              <CustomizedTextField
                size='small'
                disabled={!isEditable}
                value={newDescr}
                fullWidth
                variant='outlined'
                label='Point descr'
                type='text'
                onChange={handleChangeDescr}
                multiline
                maxRows={10}
              // sx={{ borderRadius: '8px' }}
              />
            </Grid>
            {
              !newStatusCode && (
                <Grid size={12}>
                  Plz check local settings of status selection for <code className={baseClasses.inlineCode}>{activeStatusPackKey}</code>
                </Grid>
              )
            }
            {
              !!newStatusCode && (
                <Grid size={12}>
                  <Autocomplete
                    size='small'
                    disableClearable
                    label={`Status | ${activeStatusPackKey}`}
                    // key={`statuses-pack-autocomplete-${activeStatusPack}`}
                    list={Object.keys(localStatusPacksSettings[activeStatusPackKey]).map((k) => ({ label: clsx(localStatusPacksSettings[activeStatusPackKey][newStatusCode].emoji, localStatusPacksSettings[activeStatusPackKey][newStatusCode].label), value: k }))}
                    onSelect={(item) => setNewStatusCode(item?.value || newStatusCode)}
                    defaultValue={{ label: clsx(localStatusPacksSettings[activeStatusPackKey][newStatusCode].emoji, localStatusPacksSettings[activeStatusPackKey][newStatusCode].label), value: newStatusCode }}
                  // isErrored={!!__errsState[key]}
                  // helperText={__errsState[key]}
                  />
                </Grid>
              )
            }

            {
              !!targetJob?.pointset && targetJob.pointset.length > 1 && (
                <Grid size={12}>
                  <Autocomplete
                    size='small'
                    // disableClearable
                    label='Parent'
                    // key={`statuses-pack-autocomplete-${activeStatusPack}`}
                    list={pointsOptionsWoActive}
                    onSelect={(item) => setNewParentId(!Number.isNaN(Number(item?.value)) ? Number(item?.value) : '')}
                    defaultValue={
                      !!pointsMapping[String(newParentId)]
                        ? { label: typeof newParentId === 'number' ? pointsMapping[String(newParentId)]?.title : '', value: '' }
                        : undefined
                    }
                  // isErrored={!!__errsState[key]}
                  // helperText={__errsState[key]}
                  />
                </Grid>
              )
            }

            <Grid size={6}>
              <Button
                // size='small'
                fullWidth
                disabled={!normalizedTitle || normalizedTitle.length > 200 || normalizedDescr.length > 2000 || !newStatusCode}
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
        )
      }
      {
        isEditable && !!targetJob && isCreatable && !isEditMode && (
          <Grid container spacing={2}>
            <Grid size={12}>
              <Button
                // size='small'
                startIcon={<AddIcon />}
                fullWidth
                variant='outlined'
                color='primary'
                onClick={handleEditToggle({})}
              >
                Create
              </Button>
            </Grid>
          </Grid>
        )
      }
    </div>
  )
})

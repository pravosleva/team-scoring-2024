import clsx from 'clsx';
import { memo, useMemo, useState, useCallback, useRef, useEffect } from 'react'
import baseClasses from '~/App.module.scss'
import { TJob, TopLevelContext, TPointsetItem } from '~/shared/xstate'
import { CustomizedTextField } from '~/shared/components/Input'
import { CopyToClipboardWrapper } from '~/shared/components'
import { Alert, Button, Grid2 as Grid } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SaveIcon from '@mui/icons-material/Save'
import classes from './SimpleJobPointsetChecker.module.scss'
import { useLocalStorageState } from '~/shared/hooks'
import { getDefaultPointsetStatusListSpaceState } from '~/pages/local-settings/utils/getDefaultPointsetStatusListSpaceState';
import { TLocalSettingsStatusOption } from '~/pages/local-settings/types'
import { Autocomplete } from '~/shared/components/Autocomplete'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { groupLog } from '~/shared/utils'
import { TreeNode } from 'ts-tree-lib'
// import DirectionsIcon from '@mui/icons-material/Directions'
import StarIcon from '@mui/icons-material/Star'
import { useElementInView } from 'use-element-in-view'
import { usePoinsetTreeCalcWorker } from './hooks'
import { TEnchancedPointByWorker } from './types'
import { FixedBackToPointsetBtn } from './components'

type TProps = {
  isDebugEnabled?: boolean;
  jobId: TJob['id'];
  isEditable: boolean;
  isCreatable: boolean;
}

const specialScrollForExternalBox = scrollToIdFactory({
  timeout: 0,
  offsetTop: 16,
  elementHeightCritery: 550,
})

export const SimpleJobPointsetChecker = memo(({ jobId, isEditable, isCreatable, isDebugEnabled }: TProps) => {
  const { inView, assignRef } = useElementInView()
  const [calcErrMsg, setCalcErrMsg] = useState<string | null>(null)
  const [calc, setCalc] = useState<TreeNode<TEnchancedPointByWorker> | null>(null)
  const [reportText, setReportText] = useState<string | null>(null)
  const _isContentReady = !!calc
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

  // -- EXP: Create new
  // const editFormRef = useRef<HTMLDivElement>(null)
  const scrollFormIntoViewFnRef = useRef(() => {
    // if (!!editFormRef?.current) editFormRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    specialScrollForExternalBox({
      id: 'checker-form-box',
    })
  })
  const scrollBoxIntoViewFnRef = useRef(() => specialScrollForExternalBox({
    id: 'checker-main-box',
  }))
  const [newLabel, setNewLabel] = useState<string>('')
  const [newDescr, setNewDescr] = useState<string>('')
  const [newStatusCode, setNewStatusCode] = useState<string | null>(!!activeStatusPackKey ? Object.keys(localStatusPacksSettings?.[activeStatusPackKey])[0] : null)

  useEffect(() => {
    console.log(`- eff:newStatusCode -> ${newStatusCode}`)
  }, [newStatusCode])
  const [newParentId, setNewParentId] = useState<number | ''>('')
  const [activeChecklistId, setActiveChecklistId] = useState<null | number>(null)
  const activePointIdRef = useRef<number | null>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(false)
  const handleEditToggle = useCallback(({ id }: { id?: number }) => () => {
    const isNew = typeof id === 'undefined'
    try {
      switch (isNew) {
        case true: {
          // NOTE: New
          console.log(`--- New`)
          const ts = new Date().getTime()
          setActiveChecklistId(ts)
          activePointIdRef.current = ts
          setNewStatusCode(Object.keys(localStatusPacksSettings[activeStatusPackKey])[0])
          break
        }
        default: {
          // NOTE: Exists?
          console.log(`--- Exists`)
          if (!targetJob?.pointset) throw new Error('ERR1')
          const targetPointData = targetJob?.pointset.find((p) => p.id === id)
          if (!targetPointData) throw new Error('ERR2')

          setActiveChecklistId(targetPointData.id)
          activePointIdRef.current = targetPointData.id
          setNewLabel(targetPointData.title)
          setNewDescr(targetPointData.descr || '')
          setNewStatusCode(targetPointData.statusCode)
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
  }, [targetJob?.pointset, targetJob?.ts.update, localStatusPacksSettings, activeStatusPackKey, setNewParentId, setNewStatusCode])
  const handleReset = useCallback(() => {
    setNewLabel('')
    setNewDescr('')
    setNewStatusCode(Object.keys(localStatusPacksSettings[activeStatusPackKey])[0])
    setNewParentId('')
  }, [localStatusPacksSettings, activeStatusPackKey])
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
    activePointIdRef.current = null
    handleReset()
    handleClose()
    setTimeout(scrollBoxIntoViewFnRef.current, 300)
  }, [handleReset, handleClose])

  const handleSubmit = () => {
    switch (true) {
      case !!activePointIdRef.current: {
        const targetChecklistItem = targetJob?.pointset?.find(({ id }) => id === activePointIdRef.current)
        switch (true) {
          case !!targetChecklistItem:
            // NOTE: Send event to fsm (exists)
            if (!!newStatusCode) {
              const value = {
                title: normalizedTitle,
                descr: normalizedDescr || undefined,
                statusCode: newStatusCode,
                jobId,
                relations: {
                  parent: newParentId || undefined,
                },
                pointId: activePointIdRef.current,
              }
              jobsActorRef.send({
                type: 'todo.pointset:update-item',
                value,
              })
              handleCleanup()
              // NOTE: END
            } else throw new Error(`FRONT ERR1: newStatusCode is (${typeof newStatusCode})`)
            break
          default:
            // NOTE: Send event to fsm (create new)
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
        handleCleanup()
        break
      }
    }
  }
  // , [jobsActorRef, targetJob?.pointset, activeChecklistId, normalizedTitle, normalizedDescr, newStatusCode, handleCleanup, jobId, newParentId])

  const pointsMapping = useMemo(
    () => !!targetJob?.pointset
      ? targetJob?.pointset.reduce((acc: { [key: string]: TPointsetItem }, cur) => {
        acc[String(cur.id)] = cur
        return acc
      }, {})
      : {},
    [targetJob?.pointset, targetJob?.pointset?.length, targetJob?.ts.update]
  )

  const pointsOptionsWoActive = useMemo(
    () => Object.keys(pointsMapping)
      .filter((pidStr) => Number(pidStr) !== activePointIdRef.current)
      .map((pidStr) => ({ label: pointsMapping[pidStr].title, value: String(pointsMapping[pidStr].id) })),
    [pointsMapping, activeChecklistId]
  )
  const statusPackOptions = useMemo(
    () => Object.keys(localStatusPacksSettings[activeStatusPackKey])
      // NOTE: Not empty label
      .filter((k) => !!localStatusPacksSettings[activeStatusPackKey][k].label)
      .map((k) => ({
        label: clsx(
          localStatusPacksSettings[activeStatusPackKey][k].emoji,
          localStatusPacksSettings[activeStatusPackKey][k].label
        ),
        value: k,
      })),
    [localStatusPacksSettings, activeStatusPackKey]
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

  usePoinsetTreeCalcWorker({
    isEnabled: true,
    isDebugEnabled: true,
    cb: {
      onEachSuccessItemData: (data) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useProjectsTreeCalcWorker:onEachNewsItemData -> data',
            items: [
              data
            ],
          })
        if (!!data.originalResponse) {
          setCalcErrMsg(null)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          setCalc(data.originalResponse.calc)
          // if (!!data.message) setCalcDebugMsg(data.message)
          if (!!data.originalResponse?.report.targetTree) {
            setReportText(data.originalResponse.report.targetTree)
          }
        }
      },
      onFinalError: ({ id, reason }) => {
        if (isDebugEnabled)
          groupLog({
            namespace: '[debug] useProjectsTreeCalcWorker:onFinalError -> id, reason',
            items: [
              id,
              reason
            ],
          })
        setCalc(null)
        setReportText(null)
        setCalcErrMsg(reason)
      },
    },
    deps: {
      rootPoint: targetJob?.pointset?.[0],
      pointset: targetJob?.pointset || [],
      jobTsUpdate: targetJob?.ts.update,
      statusPack: localStatusPacksSettings[activeStatusPackKey],
    },
  })

  return (
    <div
      className={clsx(classes.externalWrapper, classes.default, classes.rounded, baseClasses.stack2)}
      id='checker-main-box'
      ref={assignRef}
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
        Pointset | Roadmap
      </div>
      {
        !!reportText && (
          <>
            <pre className={baseClasses.preNormalized}>
              {reportText}
            </pre>
            <div>
              <CopyToClipboardWrapper
                text={reportText}
                uiText='Copy as text'
                showNotifOnCopy
              />
            </div>
          </>
        )
      }

      {
        !!targetJob?.pointset && targetJob?.pointset?.length > 0 && (
          <FixedBackToPointsetBtn
            isRequired={!inView}
            onClick={scrollBoxIntoViewFnRef.current}
          // label='Roadmap'
          />
        )
      }

      {
        !targetJob && (
          <em>Target job not found</em>
        )
      }
      {
        !!targetJob && !targetJob?.pointset && (
          <em>Target job #{jobId} hasnt pointset</em>
        )
      }
      {
        !!targetJob && Array.isArray(targetJob.pointset) && targetJob.pointset.length === 0 && (
          <em>Pointset is empty for target job #{jobId}</em>
        )
      }

      {
        isEditable && isEditMode && (
          <Grid
            container
            spacing={2}
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
                    list={statusPackOptions}
                    onSelect={(item) => setNewStatusCode(item?.value || null)}
                    defaultValue={{
                      label: clsx(
                        localStatusPacksSettings[activeStatusPackKey][newStatusCode]?.emoji,
                        localStatusPacksSettings[activeStatusPackKey][newStatusCode]?.label || 'NO LABEL'
                      ),
                      value: newStatusCode,
                    }}
                    isErrored={!localStatusPacksSettings[activeStatusPackKey][newStatusCode]}
                    helperText={!localStatusPacksSettings[activeStatusPackKey][newStatusCode] ? `Возможно, позиция была удалена. Попробуйте настроить "${newStatusCode}"` : undefined}
                  />
                </Grid>
              )
            }

            {
              !!targetJob?.pointset && targetJob.pointset.length > 1 && (
                <Grid size={12}>
                  <Autocomplete
                    size='small'
                    label='Parent'
                    list={pointsOptionsWoActive}
                    onSelect={(item) => {
                      console.log(item)
                      setNewParentId(!Number.isNaN(Number(item?.value)) ? Number(item?.value) : '')
                    }}
                    defaultValue={
                      !!pointsMapping[String(newParentId)]
                        ? {
                          label: typeof newParentId === 'number' ? pointsMapping[String(newParentId)]?.title : '',
                          value: typeof newParentId === 'number' ? String(newParentId) : '',
                        }
                        : undefined
                    }
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
      {!!calcErrMsg && (
        <Alert
          severity='error'
          variant='filled'
        >
          {calcErrMsg}
        </Alert>
      )}

      {
        !!targetJob && Array.isArray(targetJob.pointset) && targetJob.pointset.length > 0 && !isEditMode && (
          <>
            <div
              className={clsx(baseClasses.truncate, baseClasses.stack1)}
            >
              {
                targetJob?.pointset.map((p) => (
                  <div
                    key={p.id}
                    className={clsx(baseClasses.truncate, baseClasses.stack0)}
                  >
                    <div
                      style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}
                    >
                      {
                        p.relations.children.length > 0
                          ? (
                            <div className={clsx(baseClasses.truncate)} style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                              <StarIcon style={{ fontSize: '14px' }} />
                              <span>[{p.relations.children.length}]</span>
                              <span className={clsx(baseClasses.truncate)}>{clsx(localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.emoji, p.title)}</span>
                            </div>
                          )
                          : (
                            <div className={clsx(baseClasses.truncate)}>{clsx(localStatusPacksSettings[activeStatusPackKey][p.statusCode]?.emoji, p.title)}</div>
                          )
                      }
                      <div
                        style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'row', gap: '1px', alignItems: 'center' }}
                      >
                        <code className={classes.inlineControlBtn} onClick={handleEditToggle({ id: p.id })}>
                          [ Edit ]
                        </code>
                        <code className={classes.inlineControlBtn} onClick={handleDeletePoint({ id: p.id })} style={{ color: 'red' }}>
                          [ Del ]
                        </code>
                      </div>
                    </div>
                    {
                      !!p.descr && (
                        <code className={clsx(baseClasses.truncate)}>{p.descr}</code>
                      )
                    }
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
                          {/* <DirectionsIcon style={{ fontSize: '15px' }} /> */}
                          <span className={clsx(baseClasses.truncate)}>Parent: {clsx(pointsMapping[String(p.relations.parent)].title)}</span>
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
    </div>
  )
})

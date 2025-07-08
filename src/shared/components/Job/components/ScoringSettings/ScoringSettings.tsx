/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, memo, useLayoutEffect } from 'react'
import clsx from 'clsx'
import classes from './ScoringSettings.module.scss'
import { FullScreenDialog } from '~/shared/components/Dialog'
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import { TJob, TJobForm } from '~/shared/xstate'
import { Box, Grid2 as Grid } from '@mui/material'
// import { DatesStepper } from './components'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import { TScheme } from '~/shared/components/Form/v2/types'
import { TopLevelContext, TUser } from '~/shared/xstate/topLevelMachine/v2'
// import SettingsIcon from '@mui/icons-material/Settings'
import TroubleshootIcon from '@mui/icons-material/Troubleshoot'
import { useNavigate } from 'react-router-dom'
import { TOption } from '~/shared/components/Autocomplete'
import { getJobStage } from '../../utils'
import baseClasses from '~/App.module.scss'
import { TimeAgo } from '~/shared/components/TimeAgo'
// import EditIcon from '@mui/icons-material/Edit'
import EditNoteIcon from '@mui/icons-material/EditNote'
// import StopCircleIcon from '@mui/icons-material/StopCircle'
import TimerOffIcon from '@mui/icons-material/TimerOff'
import MoreTimeIcon from '@mui/icons-material/MoreTime'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
// import { ratingIcons } from '~/shared/components/RadioGroupRating/ratingIcons'
import ConstructionIcon from '@mui/icons-material/Construction'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
// import { soundManager } from '~/shared/soundManager'

type TProps = {
  isActive: boolean;
  onToggleDrawer: (isDrawlerOpened: boolean) => ({ jobId }: { jobId: number }) => void;
  job: TJob;
  onSave: (ps: {
    state: TJob | null;
  }) => Promise<{
    ok: boolean;
    message?: string;
  }>;
  onClearDates: (ps: { id: number; }) => void;
  onAddTimeToFinishDate?: (ps: {
    hours: number;
  }) => void;
  onDeleteJob: () => void;
  // onCreateUser: (ps: {
  //   option: TOption;
  // }) => Promise<{
  //   ok: boolean;
  //   message?: string;
  //   createdOption: TOption;
  // }>
}

const getUserValueOption = ({ assignedToId, users }: {
  assignedToId: number;
  users: TUser[];
}): TOption | undefined => {
  const targetUser = users.find(({ id }) => id === assignedToId)
  return !!targetUser
    ? {
      label: targetUser.displayName,
      value: String(targetUser.id),
      inputValue: targetUser.displayName,
    }
    : undefined
}
const getJobValueOption = ({ jobId, jobs }: {
  jobId: number;
  jobs: TJob[];
}): TOption | undefined => {
  const targetJob = jobs.find(({ id }) => id === jobId)
  return !!targetJob
    ? {
      label: targetJob.title,
      value: String(targetJob.id),
      inputValue: targetJob.title,
    }
    : undefined
}

// NOTE: For form initialization (not for saving)
const getNormalizedState = ({ state, jobId }: {
  state: unknown;
  jobId: number;
}): TJob => {
  const _state = state as TJobForm
  const modifiedState: (
    Pick<TJob, 'id' | 'title' | 'completed' | 'forecast' | 'descr' | 'logs' | 'ts'>
    & { relations?: { parent: number | null } }
  ) = {
    id: jobId,
    title: '',
    completed: false,
    forecast: {
      complexity: 0,
    },
    ts: {
      create: 0,
      update: 0,
    },
    logs: {
      isEnabled: false,
      limit: 100,
      items: [],
    },
  }
  for (const key in _state) {
    switch (key) {
      case 'parentJob':
        // label: "Work the WORST example", value: "1736248683210", _id: undefined
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!!_state[key] && !Number.isNaN(Number(_state[key]?.value))) {
          if (!modifiedState.relations) {
            modifiedState.relations = {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              parent: Number(_state[key]?.value),
            }
          }
        }
        break
      case 'isLogsEnabled':
        if (typeof _state[key] === 'boolean') {
          modifiedState.logs.isEnabled = _state[key]
        }
        break
      case 'title':
        modifiedState[key] = _state[key]
        break
      case 'descr':
        modifiedState[key] = _state[key]
        break
      case 'id':
        modifiedState[key] = _state[key]
        break
      case 'assignedTo':
        // console.log(_state[key])
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (!!_state[key]?._id) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          modifiedState.forecast[key] = _state[key]._id
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          modifiedState.forecast._assignedToName = _state[key].label
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        else {
          // console.log(_state[key])
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          modifiedState.forecast[key] = !!_state[key]?.value ? Number(_state[key]?.value) : undefined // NOTE: NaN if !_id!
          // console.log(modifiedState.forecast[key])
        }
        break
      case 'estimate':
        modifiedState.forecast[key] = _state[key]
        break
      case 'start':
        modifiedState.forecast[key] = _state[key]
        break
      case 'finish':
        modifiedState.forecast[key] = _state[key]
        break
      case 'complexity':
        if (typeof _state[key] === 'number') modifiedState.forecast[key] = _state[key]
        break
      case 'comment':
        modifiedState.forecast[key] = _state[key]
        break
      default:
        break
    }
  }
  return modifiedState as TJob
}

export const ScoringSettings = memo(({ job, isActive, onToggleDrawer, onSave, onClearDates, onDeleteJob, onAddTimeToFinishDate }: TProps) => {
  const [isOpened, setIsOpened] = useState(false)
  const handleToggle = useCallback(() => setIsOpened((s) => !s), [setIsOpened])

  useLayoutEffect(() => {
    if (isOpened) onToggleDrawer(false)({ jobId: job.id })
  }, [isOpened, onToggleDrawer, job.id])
  const handleCloseModal = useCallback(() => {
    setIsOpened(false)
    return Promise.resolve({ ok: true })
  }, [setIsOpened])
  const [isTargetActionEnabled, setIsTargetActionEnabled] = useState(false)
  const [formState, setFormState] = useState<TJob | null>(null)
  const navigate = useNavigate()
  // const jobsActorRef = TopLevelContext.useActorRef()
  // const [filteredTodos] = useParamsInspectorContextStore((ctx) => ctx.filteredJobs)
  // const todosActorRef = TopLevelContext.useActorRef()
  const allJobs = TopLevelContext.useSelector((s) => s.context.jobs.items)

  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  // const topLevelActorRef = TopLevelContext.useActorRef()
  const memoizedUserList = useMemo(() => users.map(({ id, displayName }) => ({
    label: displayName,
    value: String(id),
    inputValue: displayName,
  })), [users])
  const memoizedJobList = useMemo(() => allJobs.filter(({ id }) => id !== job.id).map(({ id, title }) => ({
    label: title,
    value: String(id),
    inputValue: title,
  })), [allJobs, job.id])

  const theme = useTheme()
  const upSm = useMediaQuery(theme.breakpoints.up('sm'))
  // const getRatingLabel = useCallback(({ value }: { value: number }) => ratingIcons[value].label, [])
  const memoizedScheme = useMemo<TScheme>(() => {
    return {
      // id: {
      //   initValue: job.id,
      //   label: 'ID',
      //   isReadOnly: true,
      //   type: 'number',
      //   gridSize: 12,
      //   validator: ({ value }) => {
      //     return {
      //       ok: typeof value === 'number',
      //       message: `Expected number (received ${typeof value}: "${String(value)}")`,
      //     }
      //   },
      // },
      title: {
        initValue: job.title,
        label: 'Title',
        type: 'string',
        gridSize: 12,
        isRequired: true,
        validator: ({ value }: any) => {
          return {
            ok: typeof value === 'string' && !!value && value.length <= 100,
            message: `Expected not empty string (received ${typeof value}: "${String(value)}")`,
          }
        },
      },
      complexity: {
        initValue: job.forecast.complexity || 0,
        label: 'Employee\'s assessment of complexity',
        // getLabel: getRatingLabel,
        type: 'rating',
        gridSize: 12,
        isRequired: false,
        validator: ({ value }: any) => {
          return {
            ok: typeof value === 'number' && value >= 0 && value <= 6,
            message: `Expected number from 1 to 6 (received ${typeof value}: "${String(value)}")`,
          }
        },
      },
      descr: {
        initValue: job.descr,
        label: 'Description',
        type: 'multiline-text',
        gridSize: 12,
        isRequired: false,
        validator: ({ value }: any) => {
          const res: { ok: boolean; message?: string } = { ok: true }
          const limit = 200
          switch (true) {
            case typeof value !== 'string' || !value:
              res.ok = false
              res.message = 'Expected not empty string'
              break
            case (value as string).length >= limit:
              res.ok = false
              res.message = `Should be less than ${limit} characters (now is ${(value as string).length})`
              break
            default:
              break
          }
          return res
        },
      },
      assignedTo: {
        _selectCustomOpts: {
          list: memoizedUserList,
          // _onCreate: (option: TOption) => {
          //   return onCreateUser({ option })
          // },
        },
        initValue: !!job.forecast.assignedTo
          ? getUserValueOption({ assignedToId: job.forecast.assignedTo, users })
          : undefined,
        label: 'Employee',
        type: 'creatable-autocomplete',
        gridSize: upSm ? 6 : 12,
        isRequired: false,
        validator: ({ value }: {
          value: {
            value: string;
            label: string;
            _id?: number;
          };
        }) => {
          const res: {
            ok: boolean; message?: string; _isDisabled?: {
              value: boolean;
              reason?: string;
            };
          } = { ok: true }

          switch (true) {
            case !Number.isNaN(Number(value?._id)):
              // NOTE: Ok
              break
            case typeof value === 'undefined':
              // NOTE: Removed?
              break
            // case Number.isNaN(Number(value?.value)):
            //   res.ok = false
            //   res.message = `Check value plz: "${String(value?.value)}" (${typeof value?.value})`
            //   break
            default:
              break
          }

          return res
        },
      },
      parentJob: {
        _selectCustomOpts: {
          list: memoizedJobList,
          // _onCreate: (option: TOption) => {
          //   return onCreateUser({ option })
          // },
        },
        initValue: typeof job.relations?.parent === 'number'
          ? getJobValueOption({ jobId: job.relations.parent, jobs: allJobs })
          : undefined,
        label: 'Parent job',
        type: 'autocomplete',
        gridSize: upSm ? 6 : 12,
        isRequired: false,
        validator: ({ value }: {
          value: {
            value: string;
            label: string;
            _id?: number;
          };
        }) => {
          const res: {
            ok: boolean; message?: string; _isDisabled?: {
              value: boolean;
              reason?: string;
            };
          } = { ok: true }

          switch (true) {
            case !Number.isNaN(Number(value?._id)):
              // NOTE: Ok
              break
            // case Number.isNaN(Number(value?.value)):
            //   res.ok = false
            //   res.message = `Check value plz: "${String(value?.value)}" (${typeof value?.value})`
            //   break
            default:
              break
          }

          return res
        },
      },
      isLogsEnabled: {
        initValue: job.logs.isEnabled || false,
        label: 'Enable logs (detailed or minimal)',
        type: 'checkbox',
        gridSize: 12,
        isRequired: false,
        validator: ({ value }: any) => {
          return {
            ok: typeof value === 'boolean',
            message: `Expected boolean (received ${typeof value}: "${String(value)}")`,
          }
        },
      },
      start: {
        initValue: job.forecast.start || undefined,
        label: 'Start date',
        type: 'date-ts',
        gridSize: upSm ? 4 : 12,
        isRequired: false,
        validator: ({ value }: any) => {
          return {
            ok: typeof value === 'number' && !!value,
            message: `Expected number (received ${typeof value}: "${String(value)}")`,
          }
        },
        specialKey: `start-date-${job.ts.update}`,
      },
      estimate: {
        initValue: job.forecast.estimate || undefined,
        label: 'Estimate date',
        type: 'date-ts',
        gridSize: upSm ? 4 : 12,
        isRequired: false,
        validator: ({ value, internalState }: any) => {
          const res: {
            ok: boolean;
            message?: string;
            _isDisabled?: {
              value: boolean;
              reason?: string;
            };
          } = { ok: true }
          if (!internalState.start) res._isDisabled = {
            value: true,
            reason: 'Start date should be set before',
          }

          switch (true) {
            case typeof value !== 'number':
              res.ok = false
              res.message = `Expected number (received ${typeof value}: "${String(value)}")`
              break
            case typeof value === 'number':
              if (
                typeof internalState.start === 'number'
                && !!internalState.start
                && internalState.start > value
              ) {
                res.ok = false
                res.message = `Should be more than start date (${new Date(internalState.start).toJSON()})`
              }
              // else if (
              //   typeof internalState.finish === 'number'
              //   && !!internalState.finish
              //   && internalState.finish < value
              // ) {
              //   res.ok = false
              //   res.message = `Should be less than finish date (${new Date(internalState.finish).toJSON()})`
              // }

              break
            default:
              break
          }
          return res
        },
      },
      finish: {
        specialKey: `${job.ts.update}-${job.forecast.finish}`,
        initValue: job.forecast.finish || undefined,
        label: 'Finish date',
        type: 'date-ts',
        gridSize: upSm ? 4 : 12,
        isRequired: false,
        validator: ({ value, internalState }: any) => {
          const res: {
            ok: boolean; message?: string; _isDisabled?: {
              value: boolean;
              reason?: string;
            };
          } = { ok: true }
          if (!internalState.estimate) res._isDisabled = {
            value: true,
            reason: 'Estimate date should be set before',
          }

          switch (true) {
            case typeof value !== 'number':
              res.ok = false
              res.message = `Expected number (received ${typeof value}: "${String(value)}")`
              break
            case typeof value === 'number' && (
              typeof internalState.start === 'number'
              && !!internalState.start
              && internalState.start > value
            ):
              res.ok = false
              res.message = `Should be more than start date (${new Date(internalState.start).toJSON()})`
              break
            default:
              break
          }
          return res
        },
      },
    }
  }, [upSm, job.descr, job.forecast.assignedTo, job.forecast.complexity, job.forecast.estimate, job.forecast.finish, job.forecast.start, job.logs.isEnabled, job.ts.update, job.title, memoizedUserList, users, allJobs, memoizedJobList, job.relations?.parent])

  return (
    <Box
      sx={{ display: 'flex', gap: 0, flexDirection: 'column' }}
      className={baseClasses.fadeIn}
    >
      <div
        className={clsx(
          classes.wrapper,
          classes.collapsed,
          {
            [classes.active]: isOpened,
          }
        )}
      >
        <div className={clsx(classes.toggler, classes.red)} onClick={onDeleteJob}>
          <DeleteIcon />
        </div>
        <div
          className={clsx(classes.toggler, classes.blue, { [classes.active]: isActive })}
          onClick={() => {
            // navigate(`/jobs/${job.id}`)
            onToggleDrawer(true)({ jobId: job.id })
          }}
        >
          <TroubleshootIcon />
        </div>
        <div
          className={clsx(classes.descr, baseClasses.truncate)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <b
            className={baseClasses.truncate}
            style={{ fontSize: 'small' }}
          >{getJobStage({ forecast: job.forecast }).descr}</b>
          <TimeAgo
            date={job.ts.update}
            prefix='Upd:'
            style={{ fontSize: 'x-small', fontStyle: 'italic' }}
          />
        </div>
        <div
          className={clsx(classes.toggler, classes.blue, { [classes.active]: isActive })}
          onClick={() => {
            navigate(`/jobs/${job.id}`)
          }}
        >
          {
            !!job.relations?.parent || job.relations?.children.length > 0
              ? <AccountTreeIcon />
              : <ConstructionIcon />
          }
        </div>
        <div
          className={clsx(classes.toggler, classes.warn)}
          onClick={handleToggle}
        >
          {
            isOpened
              ? <KeyboardArrowUpIcon />
              : <EditNoteIcon />
          }
        </div>
      </div>
      {isOpened && (
        <FullScreenDialog
          title={`#${job.id}`}
          __errsBeforeTouchedIgnoreList={['start', 'finish', 'estimate']}
          onReady={(state) => {
            // console.info(state)
            const modifiedState = getNormalizedState({ state, jobId: job.id })
            // console.log('-- modifiedState')
            // console.log(modifiedState)
            // console.log('--')
            setFormState(modifiedState)
            setIsTargetActionEnabled(true)
          }}
          onNotReady={(state) => {
            // console.warn(state)
            setFormState(getNormalizedState({ state, jobId: job.id }))
            setIsTargetActionEnabled(false)
          }}
          scheme={memoizedScheme}
          onClose={handleCloseModal}
          targetAction={{
            label: 'Save',
            startIcon: <SaveIcon />,
            isEnabled: isTargetActionEnabled,
            onClick: () => {
              // soundManager.playDelayedSound({
              //   soundCode: 'load-24',
              //   _debug: {
              //     msg: [
              //       'EXP',
              //     ].join(' // ')
              //   },
              // })
              // console.log(formState)
              return onSave({ state: formState })
            },
          }}
          optionalActions={
            !!job.forecast.estimate || !!job.forecast.start || !!job.forecast.finish
              ? [
                {
                  label: 'Clear dates & Close',
                  color: 'error',
                  variant: 'contained',
                  startIcon: <TimerOffIcon />,
                  isEnabled: true,
                  onClick: async () => {
                    const isConfirmed = window.confirm('⚡ Sure? All dates will be removed!')
                    if (isConfirmed) {
                      onClearDates({ id: job.id });
                      return Promise.resolve({ ok: true });
                    } else {
                      return Promise.reject({ ok: false, message: 'Canceled by user' });
                    }
                  },
                  gridItemSize: 12,
                },
                {
                  label: '+2h to finish',
                  color: 'error',
                  variant: 'outlined',
                  startIcon: <MoreTimeIcon />,
                  isEnabled: !!job.forecast.finish,
                  onClick: async () => {
                    try {
                      if (typeof onAddTimeToFinishDate === 'function') {
                        const isConfirmed = window.confirm('⚡ Sure? +2h to finish date')
                        if (isConfirmed) {
                          onAddTimeToFinishDate({ hours: 2 });
                          return Promise.resolve({ ok: true });
                        }
                        else throw new Error('Canceled by user')
                      } else throw new Error('ERR1')
                    } catch (err: any) {
                      return Promise.reject({ ok: false, message: `Decline: ${err.message || 'No err.message'}` });
                    }
                  },
                  gridItemSize: 6,
                },
                {
                  label: '+4h to finish',
                  color: 'error',
                  variant: 'outlined',
                  startIcon: <MoreTimeIcon />,
                  isEnabled: !!job.forecast.finish,
                  onClick: async () => {
                    try {
                      if (typeof onAddTimeToFinishDate === 'function') {
                        const isConfirmed = window.confirm('⚡ Sure? +4h to finish date')
                        if (isConfirmed) {
                          onAddTimeToFinishDate({ hours: 4 });
                          return Promise.resolve({ ok: true });
                        }
                        else throw new Error('Canceled by user')
                      } else throw new Error('ERR2')
                    } catch (err: any) {
                      return Promise.reject({ ok: false, message: `Decline: ${err.message || 'No err.message'}` });
                    }
                  },
                  gridItemSize: 6,
                },
              ] : undefined
          }
          togglerRender={() => (
            <div className={classes.detailsPreviewWrapper}>
              <div className={classes.internalContent}>
                {/* <div>{JSON.stringify(job.forecast)}</div>
                <pre>{JSON.stringify(formState, null, 2)}</pre> */}
                <div
                  style={{
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >[ Edit ]</div>
              </div>
            </div>
          )}
          middleInfoRender={() => (
            <Box sx={{ pt: 1 }}>
              <Grid container spacing={1}>
                {/* <Grid size={12}>
                <DatesStepper />
              </Grid> */}
                <Grid size={12}>
                  <pre className={baseClasses.preNormalized}>{JSON.stringify(job.relations, null, 2)}</pre>
                </Grid>
              </Grid>
            </Box>
          )}
        />
      )}
    </Box>
  )
}, (prevPs, nextPs) => prevPs.job.ts.update !== nextPs.job.ts.update)

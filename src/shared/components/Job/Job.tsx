import { memo, useCallback, useState, useMemo } from 'react'
// import {
//   useActorRef,
//   // useSelector,
// } from '@xstate/react'
import { styled } from '@mui/material/styles'
import { TopLevelContext, TJob } from '~/shared/xstate'
// import { jobEditorMachine } from '~/shared/xstate'
import { ScoringSettings } from './components'
import { Box, Checkbox, List, ListItem, ListItemAvatar, ListItemText, ListItemButton, Rating } from '@mui/material'
import { AutoRefreshedJobMuiAva } from './utils'
import classes from './Job.module.scss'
import clsx from 'clsx'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'

type TProps = {
  isLastSeen?: boolean;
  isActive?: boolean;
  job: TJob;
  onToggleDrawer: (isDrawlerOpened: boolean) => ({ job }: { job: TJob }) => void;
}

const FireNav = styled(List)<{ component?: React.ElementType }>({
  '& .MuiList-root': {
    paddingTop: 0,
  },
})

export const Job = memo(({ job, onToggleDrawer, isLastSeen, isActive }: TProps) => {
  // const inputRef = useRef<HTMLInputElement>(null)
  const jobsActorRef = TopLevelContext.useActorRef()
  // const handleCreateUser = useCallback(({ option }: {
  //   option: TOption;
  // }) => {
  //   const getCreatedOption = (option: TOption): { label: string; value: number } => {
  //     return {
  //       value: new Date().getTime(),
  //       label: option.label,
  //     }
  //   }
  //   const createdOption = getCreatedOption(option)
  //   jobsActorRef.send({
  //     type: 'user.commit',
  //     value: { displayName: option.label, value: createdOption.value },
  //   })
  //   return Promise.resolve({ ok: true, createdOption: { ...createdOption, value: String(createdOption.value) } })
  // }, [jobsActorRef])

  // -- TODO: Разобраться
  // const jobActorRef = useActorRef(
  //   jobEditorMachine.provide({
  //     actions: {
  //       onCommit: ({ context }) => {
  //         jobsActorRef.send({
  //           type: 'todo.commit',
  //           job: {
  //             ...job,
  //             title: context.title
  //           }
  //         });
  //       },
  //       focusInput: () => {
  //         setTimeout(() => {
  //           if (!!inputRef?.current) inputRef.current.select()
  //         })
  //       }
  //     }
  //   }),
  //   {
  //     input: { job }
  //   }
  // )
  // const { send } = jobActorRef
  // --
  const { id, completed } = job
  // const title = useSelector(jobActorRef, (s) => s.context.title)
  // const isEditing = useSelector(jobActorRef, (s) => s.matches('editing'))
  const [isProjectOpened, setIsProjectOpened] = useState(false)
  const handleToggleOpenProject = useCallback(() => {
    setIsProjectOpened((s) => !s)
  }, [setIsProjectOpened])
  // const stage = useMemo(() => getStage(job.forecast), [job.forecast])

  const handleDeleteJob = useCallback(({ id }: { id: number }) => () => {
    const isConfirmed = window.confirm('Sure?')
    if (isConfirmed) jobsActorRef.send({ type: 'todo.delete', id })
  }, [jobsActorRef])
  const isStartedAndEstimated = useMemo(() =>
    !!job.forecast?.start && !!job.forecast?.estimate,
  [job.forecast?.start, job.forecast?.estimate])

  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const assignedToName = useMemo<string | undefined>(() => !!job.forecast.assignedTo
    ? (users.find((u) => u.id === job.forecast.assignedTo)?.displayName || undefined)
    : undefined,
    [job.forecast.assignedTo, users]
  )

  return (
    <> 
      <Box
        sx={{
          display: 'flex',
          gap: 0,
          flexDirection: 'column',
          position: 'relative',
        }}
        id={`job_list_item_${job.id}`}
      >
        <FireNav sx={{ width: '100%' }}>
          <ListItem
            key={id}
            secondaryAction={
              isStartedAndEstimated && (
                <Checkbox
                  edge="end"
                  // onChange={handleToggle(value)}
                  onChange={(ev) => {
                    jobsActorRef.send({
                      type: 'todo.mark',
                      id: job.id,
                      mark: ev.target.checked ? 'completed' : 'active',
                    })
                  }}
                  // checked={checked.includes(value)}
                  checked={completed}
                  inputProps={{ 'aria-labelledby': String(id) }}
                />
              )
            }
            disablePadding
          >
            <ListItemButton
              onClick={handleToggleOpenProject}
              sx={{
                borderRadius: 2,
                outline: isActive
                ? '1px solid #c9d4e2'
                : isLastSeen
                  ? '1px dashed lightgray'
                  : 'none',
                backgroundColor: isActive
                  ? '#f7f5fa'
                  : 'inherit',

                // ':active': {
                //   // outline: '2px solid black',
                //   transform: 'rotate(1deg)',
                // },
                // ':focus': {
                //   // outline: '2px solid #1565c0',
                //   transform: 'rotate(1deg)',
                // },
              }}
              className={clsx({
                [classes.isLastSeen]: isLastSeen,
                [classes.isActive]: isActive,
              })}
            >
              <ListItemAvatar>
                <AutoRefreshedJobMuiAva job={job} delay={1000} />
              </ListItemAvatar>
              <ListItemText
                sx={{ my: 0 }}
                id={String(id)}
                primary={job.title}
                secondary={
                  <div
                    style={{
                      display: 'flex',
                      gap: '2px',
                      flexDirection: 'column',
                    }}
                  >
                    {
                      job.forecast.complexity > 0 && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Rating
                            size='small'
                            name='rating-view'
                            value={job.forecast.complexity}
                            readOnly
                            icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                            emptyIcon={<StarBorderIcon fontSize='inherit' />}
                          />
                          {job.logs.isEnabled && <ToggleOnIcon htmlColor='gray' />}
                        </div>
                      )
                    }
                    {assignedToName || null}
                  </div>
                }
              />
            </ListItemButton>
          </ListItem>
          
        </FireNav>

        {/* <pre>{JSON.stringify(isLastSeen, null, 2)}</pre> */}

        {
          isProjectOpened && (
            <ScoringSettings
              isActive={isActive || false}
              // onCreateUser={handleCreateUser}
              onDeleteJob={handleDeleteJob({ id: job.id })}
              onToggleDrawer={onToggleDrawer}
              key={`${job.id}-${job.ts.update}`}
              job={job}
              onClearDates={({ id }) => {
                jobsActorRef.send({ type: 'todo.clearDates', id })
              }}
              onSave={({ state }) => {
                // console.log('-state')
                // console.log(state)
                // console.log('-')
                if (!!state?.title) {
                  let comment = ''
                  if (state.logs.isEnabled) {
                    const commentByUser = window.prompt('Your comment?')

                    if (typeof commentByUser === 'string') comment = commentByUser
                    else return Promise.reject({ ok: false, message: 'Canceled' })
                  }
                  
                  // send({
                  //   type: 'change',
                  //   value: state?.title,
                  // })
                  jobsActorRef.send({
                    type: 'todo.commit',
                    job: {
                      ...state,
                    },
                    comment,
                  })
                }
                return Promise.resolve({ ok: true })
              }}
            />
          )
        }

        {/* <pre>{JSON.stringify(job, null, 2)}</pre> */}
      </Box>

      {/* <div className='view'>
        <input
          className='toggle'
          type='checkbox'
          onChange={(ev) => {
            jobsActorRef.send({
              type: 'todo.mark',
              id: job.id,
              mark: ev.target.checked ? 'completed' : 'active',
            })
          }}
          checked={completed}
          style={{
            marginTop: '13px',
          }}
        />
        <label onDoubleClick={() => send({ type: 'edit' })}>
          {title}
        </label>{' '}
        <button
          className='destroy'
          onClick={() =>
            jobsActorRef.send({
              type: 'todo.delete',
              id: job.id
            })
          }
          style={{
            marginTop: '13px',
          }}
        />
      </div>
      <input
        className='edit'
        value={title}
        onBlur={() => send({ type: 'blur' })}
        onChange={(ev) => {
          send({
            type: 'change',
            value: ev.target.value
          })
        }}
        onKeyDown={(ev) => {
          switch (ev.key) {
            case 'Escape':
              send({ type: 'cancel' })
              inputRef.current?.blur()
              break
            case 'Enter':
              send({ type: 'blur' })
              inputRef.current?.blur()
              break
            default:
              break
          }
        }}
        ref={inputRef}
      /> */}
    </>
  )
})

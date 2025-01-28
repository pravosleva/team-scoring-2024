import { memo, useState, useCallback, useMemo } from 'react'
import { JobList } from '~/shared/components/JobList'
import baseClasses from '~/App.module.scss'
import { Layout } from '~/shared/components/Layout'
import { Button, Drawer, IconButton, Rating } from '@mui/material'
import { TJob, TopLevelContext, TUser } from '~/shared/xstate'
import { ResponsiveBlock } from '~/shared/components'
import { Link } from 'react-router-dom'
import { JobStats } from '~/shared/components/Job/components'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getTruncated } from '~/shared/utils/string-ops'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { ActiveJobInfo } from './components'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'

export const JobsPage = memo(() => {
  const [isOpened, setIsOpened] = useState(false)
  const [activeJob, setActiveJob] = useState<TJob | null>()
  // const [, SetURLSearchParams] = useSearchParams()
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const activeJobEmployee = useMemo<TUser | null>(() => {
    if (!activeJob || !activeJob.forecast.assignedTo) return null
    const targetUser = users.find((u) => u.id === activeJob.forecast.assignedTo)
    return targetUser || null
  }, [activeJob, users])

  const handleToggleDrawer = useCallback((newValue?: boolean) => ({ job }: {
    job?: TJob;
  }) => {
    setIsOpened((s) => typeof newValue === 'boolean' ? newValue : !s)
    if (!!job) setActiveJob(job)
  }, [setIsOpened, setActiveJob])

  return (
    <Layout>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <JobList onToggleDrawer={handleToggleDrawer} activeJobId={activeJob?.id} />
      </div>
      <Drawer
        open={isOpened}
        onClose={handleToggleDrawer(false)}
        PaperProps={{
          sx: {
            maxWidth: '300px',
            minWidth: '300px',
          }
        }}
      >
        {
          !!activeJob
          ? (
            <div
              className={baseClasses.stack0}
              style={{
                minHeight: '100dvh',
                maxHeight: '100dvh',
              }}
            >
              <ResponsiveBlock>
                <ResponsiveBlock
                  style={{
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    gap: '16px',
                    // borderBottom: '1px solid lightgray',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 2,
                  }}
                  className={baseClasses.boxShadowBottom}
                >
                  <b>#{activeJob.id}</b>
                  <IconButton
                    color='inherit'
                    aria-label='Close drawer'
                    onClick={() => handleToggleDrawer(false)({})}
                    edge='start'
                    sx={[
                      !isOpened && { display: 'none' },
                    ]}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                </ResponsiveBlock>
              </ResponsiveBlock>

              <ResponsiveBlock>
                <ResponsiveBlock
                  style={{
                    padding: '16px 16px 16px 16px',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    borderBottom: '1px solid lightgray',
                  }}
                >
                  <h2>
                    {
                      !activeJob.forecast.finish
                      ? '[ Scenario variants ]'
                      : '[ Details ]'
                    }
                  </h2>
                </ResponsiveBlock>
              
                <ResponsiveBlock
                  style={{
                    padding: '16px 16px 16px 16px',
                  }}
                >
                  <div className={baseClasses.stack2}>
                    <div
                      className={baseClasses.stack1}
                    >
                      <div style={{ fontWeight: 'bold' }}>{activeJob.title}</div>
                      <Rating
                        size='small'
                        name='rating-view'
                        value={activeJob.forecast.complexity}
                        readOnly
                        icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                        emptyIcon={<StarBorderIcon fontSize='inherit' />}
                      />
                      {!!activeJob.descr && <div style={{ color: 'gray', fontSize: 'small' }}>{activeJob.descr}</div>}
                    </div>
                    <JobStats job={activeJob} />
                  </div>
                </ResponsiveBlock>
              </ResponsiveBlock>

              <ResponsiveBlock>
                <ResponsiveBlock
                  style={{
                    padding: '16px 16px 16px 16px',
                    position: 'sticky',
                    top: 0,
                    backgroundColor: '#fff',
                    zIndex: 1,
                    borderBottom: '1px solid lightgray',
                  }}
                >
                  <h2>[ Active job info ]</h2>
                </ResponsiveBlock>
                {
                  !!activeJob && (
                    <ResponsiveBlock
                      style={{
                        paddingBottom: '24px',
                      }}
                    >
                      <ActiveJobInfo job={activeJob} />
                    </ResponsiveBlock>
                  )
                }
              </ResponsiveBlock>
              
              <ResponsiveBlock
                className={baseClasses.specialActionsGrid}
                style={{
                  padding: '16px',
                  // border: '1px dashed red',
                  boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
                  position: 'sticky',
                  bottom: 0,
                  backgroundColor: '#fff',
                  zIndex: 1,
                  marginTop: 'auto',
                }}
              >
                {
                  !!activeJob.forecast.assignedTo && (
                    <Link
                      to={`/employees/${activeJob.forecast.assignedTo}?lastSeenJob=${activeJob.id}`}
                      target='_self'
                    >
                      <Button
                        variant='outlined'
                        startIcon={<AccountCircleIcon />}
                        fullWidth
                        // className={baseClasses.truncate}
                      >
                        {getTruncated(activeJobEmployee?.displayName || 'Employee', 10)}
                      </Button>
                    </Link>
                  )
                }
                <Link to={`/jobs/${activeJob.id}`} target='_self'>
                  <Button variant='contained' endIcon={<ArrowForwardIcon />} fullWidth>
                    Job
                  </Button>
                </Link>
              </ResponsiveBlock>
            </div>
          ) : (
            <em>No active job</em>
          )
        }
      </Drawer>
    </Layout>
  )
})

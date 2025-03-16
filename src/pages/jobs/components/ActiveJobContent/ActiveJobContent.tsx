import { memo, useCallback, useMemo, useState } from 'react'
import baseClasses from '~/App.module.scss'
import { Button, IconButton } from '@mui/material'
import { TJob, TopLevelContext, TUser } from '~/shared/xstate'
import { RadioGroupRating, ResponsiveBlock } from '~/shared/components'
import { Link } from 'react-router-dom'
import { JobStats } from '~/shared/components/Job/components'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { getTruncated } from '~/shared/utils/string-ops'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { JobAdditionalInfo } from '../../components'
// import StarBorderIcon from '@mui/icons-material/StarBorder'
import StarIcon from '@mui/icons-material/Star'

type TProps = {
  isOpened: boolean;
  job: TJob;
  onToggleDrawer: (val?: boolean) => ({ job }: {
    job?: TJob;
  }) => void;
}

export const ActiveJobContent = memo(({
  isOpened,
  job,
  onToggleDrawer,
}: TProps) => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const activeJobEmployee = useMemo<TUser | null>(() => {
    if (!job || !job.forecast.assignedTo) return null
    const targetUser = users.find((u) => u.id === job.forecast.assignedTo)
    return targetUser || null
  }, [job, users])
  const [expressAppraiserStars, setExpressAppraiserStars] = useState<number>(job.forecast.complexity)
  const resetExpressAppraiserStars = useCallback(() => {
    setExpressAppraiserStars(job.forecast.complexity)
  }, [job.forecast.complexity])
  const isNeedToReset = useMemo(() =>
    job.forecast.complexity !== expressAppraiserStars,
    [job.forecast.complexity, expressAppraiserStars]
  )

  return (
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
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <b>#{job.id}</b>
            <StarIcon fontSize='inherit' />
            {job.forecast.complexity}
          </span>
          <IconButton
            color='inherit'
            aria-label='Close drawer'
            onClick={() => onToggleDrawer(false)({})}
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
              !job.forecast.finish
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
              <div style={{ fontWeight: 'bold' }}>{job.title}</div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  minHeight: '32px',
                }}
              >
                <RadioGroupRating
                  size='large'
                  name='rating-view'
                  value={expressAppraiserStars}
                  // icon={<StarIcon htmlColor='gray' fontSize='inherit' />}
                  // emptyIcon={<StarBorderIcon fontSize='inherit' />}
                  max={job.forecast.complexity > 5 ? job.forecast.complexity : 5}
                  // disabled
                  // aria-readonly
                  // readOnly
                  onChange={(_e, value) => {
                    setExpressAppraiserStars(value || 0)
                  }}
                />
                {
                  isNeedToReset && (
                    <Button
                      variant='text'
                      size='small'
                      // startIcon={<AccountCircleIcon />}
                      // fullWidth
                      // className={baseClasses.truncate}
                      onClick={resetExpressAppraiserStars}
                    >
                      Reset
                    </Button>
                  )
                }
              </div>
              {!!job.descr && <div style={{ color: 'gray', fontSize: 'small' }}>{job.descr}</div>}
            </div>
            <JobStats
              job={{
                ...job,
                forecast: {
                  ...job.forecast,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  complexity: expressAppraiserStars,
                },
              }}
            />
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
          !!job && (
            <ResponsiveBlock
              style={{
                paddingBottom: '24px',
              }}
            >
              <JobAdditionalInfo job={job} />
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
          !!job.forecast.assignedTo && (
            <Link
              to={`/employees/${job.forecast.assignedTo}?lastSeenJob=${job.id}`}
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
        <Link to={`/jobs/${job.id}`} target='_self'>
          <Button variant='contained' endIcon={<ArrowForwardIcon />} fullWidth>
            Job
          </Button>
        </Link>
      </ResponsiveBlock>
    </div>
  )
})

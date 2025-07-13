import { memo, useState, useCallback, useMemo, useEffect } from 'react'
import { JobsPagerAbstracted } from '~/shared/components'
// import baseClasses from '~/App.module.scss'
// import { Layout } from '~/shared/components/Layout'
import { Drawer } from '@mui/material'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { ActiveJobContent } from './components'
import { useSearchParams } from 'react-router-dom'

export const JobsPage = memo(() => {
  const [isOpened, setIsOpened] = useState(false)
  const [activeJobId, setActiveJobId] = useState<number | null>(null)
  const [urlSearchParams] = useSearchParams()
  const shouldDrawerBeOpened = useMemo(() => urlSearchParams.get('openDrawer') === '1', [urlSearchParams])
  const lastSeenJobID = useMemo(() =>
    !!urlSearchParams.get('lastSeenJob') && !Number.isNaN(Number(urlSearchParams.get('lastSeenJob')))
      ? Number(urlSearchParams.get('lastSeenJob'))
      : null,
    [urlSearchParams]
  )

  const handleToggleDrawer = useCallback((newValue?: boolean) => ({ jobId }: {
    jobId?: number;
  }) => {
    setIsOpened((s) => typeof newValue === 'boolean' ? newValue : !s)
    if (!!jobId) setActiveJobId(jobId)
  }, [setIsOpened, setActiveJobId])

  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const activeJob = useMemo<TJob | undefined>(() => !!activeJobId ? jobs.find(({ id }) => id === activeJobId) : undefined, [jobs, activeJobId])

  const possibleDefaultActiveJobId = useMemo(
    () => shouldDrawerBeOpened && lastSeenJobID ? lastSeenJobID : null,
    [shouldDrawerBeOpened, lastSeenJobID]
  )
  useEffect(() => {
    handleToggleDrawer(!!possibleDefaultActiveJobId)({ jobId: possibleDefaultActiveJobId || undefined });
  }, [possibleDefaultActiveJobId, handleToggleDrawer])

  return (
    <>
      <JobsPagerAbstracted
        pagerControlsHardcodedPath='/jobs'
        _onToggleDrawer={handleToggleDrawer}
        _isCreatable={true}
        _isSortable={true}
      />
      <Drawer
        open={isOpened}
        onClose={handleToggleDrawer(false)}
        PaperProps={{
          sx: {
            maxWidth: '350px',
            minWidth: '350px',
          }
        }}
      >
        {
          !!activeJob
            ? (
              <ActiveJobContent
                job={activeJob}
                isOpened={isOpened}
                onToggleDrawer={handleToggleDrawer}
              />
            ) : (
              <em>No active job</em>
            )
        }
      </Drawer>
    </>
  )
})

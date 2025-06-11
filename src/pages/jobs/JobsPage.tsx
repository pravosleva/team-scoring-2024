import { memo, useState, useCallback, useMemo } from 'react'
import { JobList } from '~/shared/components/JobList'
import baseClasses from '~/App.module.scss'
import { Layout } from '~/shared/components/Layout'
import { Drawer } from '@mui/material'
import { TJob, TopLevelContext } from '~/shared/xstate'
import { ActiveJobContent } from './components'

export const JobsPage = memo(() => {
  const [isOpened, setIsOpened] = useState(false)
  const [activeJobId, setActiveJobId] = useState<number | null>(null)
  // const [, SetURLSearchParams] = useSearchParams()

  const handleToggleDrawer = useCallback((newValue?: boolean) => ({ jobId }: {
    jobId?: number;
  }) => {
    setIsOpened((s) => typeof newValue === 'boolean' ? newValue : !s)
    if (!!jobId) setActiveJobId(jobId)
  }, [setIsOpened, setActiveJobId])

  const jobs = TopLevelContext.useSelector((s) => s.context.jobs.items)
  const activeJob = useMemo<TJob | undefined>(() => !!activeJobId ? jobs.find(({ id }) => id === activeJobId) : undefined, [jobs, activeJobId])

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
    </Layout>
  )
})

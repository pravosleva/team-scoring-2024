import { memo, useState, useCallback } from 'react'
import { JobList } from '~/shared/components/JobList'
import baseClasses from '~/App.module.scss'
import { Layout } from '~/shared/components/Layout'
import { Drawer } from '@mui/material'
import { TJob } from '~/shared/xstate'
import { ActiveJobContent } from './components'

export const JobsPage = memo(() => {
  const [isOpened, setIsOpened] = useState(false)
  const [activeJob, setActiveJob] = useState<TJob | null>()
  // const [, SetURLSearchParams] = useSearchParams()

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

import { createHashRouter } from 'react-router-dom'
import {
  AboutPage, BusinessTime, HomePage, EmployeePage2, EmployeesPage,
  JobPage, JobsPage, LocalImages, LogPage, LastActivityPage, LastJobActivityPage,
  LocalSettings,
  OnlineExpPage, SoundCheckPage,
  TotalReport,
  WorkerExpPage,
} from '~/pages'
import { Layout, JobsPagerAbstracted } from '~/shared/components'

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/jobs',
      element: <Layout noScrollTopBtn><JobsPage /></Layout>,
    },
    {
      path: '/jobs/:job_id',
      // -- NOTE: In this useParamsInspectorContextStore could be used in <JobPage />
      // For example:
      // import { useParamsInspectorContextStore } from '~/shared/xstate/topLevelMachine/v2/context/ParamsInspectorContext'
      // const [userRouteControls] = useParamsInspectorContextStore((ctx) => ctx.userRouteControls)
      // --
      element: <Layout><JobPage /></Layout>,
    },
    {
      path: '/jobs/:job_id/logs/:log_ts',
      element: <Layout><LogPage /></Layout>,
    },
    {
      path: '/employees',
      element: <EmployeesPage />,
    },
    {
      path: '/employees/:user_id',
      element: <Layout noScrollTopBtn><EmployeePage2 /></Layout>,
    },
    {
      path: '/about',
      element: <AboutPage />,
    },
    {
      path: '/business-time',
      element: <BusinessTime />,
    },
    {
      path: '/last-activity/:job_ids',
      element: (
        <Layout noScrollTopBtn>
          <LastJobActivityPage />
        </Layout>
      ),
    },
    {
      path: '/last-activity',
      element: (
        <Layout noScrollTopBtn>
          <LastActivityPage />
        </Layout>
      ),
    },
    {
      path: '/worker-exp',
      element: <WorkerExpPage />,
    },
    {
      path: '/jobs-pager-exp',
      element: (
        <Layout noScrollTopBtn>
          <JobsPagerAbstracted pagerControlsHardcodedPath='/jobs-pager-exp' />
        </Layout>
      ),
    },
    {
      path: '/sound-check',
      element: <SoundCheckPage />,
    },
    {
      path: '/online-exp',
      element: <OnlineExpPage />,
    },
    {
      path: '/report/exp/:job_id',
      element: <TotalReport />,
    },
    {
      path: '/local-settings',
      element: <LocalSettings />
    },
    {
      path: '/local-images',
      element: <LocalImages />
    },
  ]
)

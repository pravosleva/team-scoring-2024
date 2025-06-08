import { createHashRouter } from 'react-router-dom'
import { AboutPage, BusinessTime, HomePage, EmployeePage, EmployeesPage, JobPage, JobsPage, LogPage, LastActivityPage } from '~/pages'
import { Layout } from '~/shared/components/Layout'

export const router = createHashRouter(
  [
    {
      path: '/',
      element: <HomePage />,
    },
    {
      path: '/jobs',
      element: <JobsPage />,
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
      element: <Layout><EmployeePage /></Layout>,
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
      path: '/last-activity',
      element: <Layout><LastActivityPage /></Layout>,
    },
  ]
)

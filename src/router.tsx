import { createHashRouter } from 'react-router-dom'
import { AboutPage, BusinessTime, HomePage, EmployeePage, EmployeesPage, JobPage, JobsPage } from '~/pages'
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
      path: '/jobs/:id',
      element: <JobPage />,
    },
    {
      path: '/employees',
      element: <EmployeesPage />,
    },
    {
      path: '/employees/:id',
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
  ]
)

import { useParams } from 'react-router-dom'
import { Layout, ReportPagerAbstracted } from '~/shared/components'

export const TotalReport = () => {
  const params = useParams()
  return (
    <Layout>
      <ReportPagerAbstracted
        pagerControlsHardcodedPath={`/report/exp/${params.job_id}`}
        isDebugEnabled
      />
    </Layout>
  )
}

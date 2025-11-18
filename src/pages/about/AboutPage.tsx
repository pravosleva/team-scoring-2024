import { Layout } from '~/shared/components/Layout'
import Grid from '@mui/material/Grid2'
import baseClasses from '~/App.module.scss'

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || ''
const BUILD_DATE = import.meta.env.VITE_BUILD_DATE || ''

export const AboutPage = () => {
  return (
    <Layout>
      <div
        className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <h1>About</h1>
            <p>
              This web app created for have reasonable estimation
              for predictable feature release.
            </p>
            <p>
              The calc based on previous experience of the employee.
              See also about <b><a target='_blank' href='https://www.joelonsoftware.com/2007/10/26/evidence-based-scheduling/'>Evidence Based Scheduling by Joel Spolsky</a></b>.
            </p>
            <p>
              Discuss <a target='_blank' href='https://t.me/bash_exp_ru/607'>here</a>.
            </p>
            <p>
              Bundle sizes analysis <a target='_blank' href={`${PUBLIC_URL}/stats.html`}>here</a>.
            </p>
            <p>
              Documentation (some interested) <a target='_blank' href={`${PUBLIC_URL}/jsdoc/`}>here</a>.
            </p>
            {
              !!BUILD_DATE && (
                <p>
                  Last build {BUILD_DATE}
                </p>
              )
            }
          </Grid>
        </Grid>
      </div>
    </Layout>
  )
}

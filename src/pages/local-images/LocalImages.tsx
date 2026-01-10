import { memo } from 'react'
import { Grid2 as Grid } from '@mui/material'
import { FileSteperExample, Layout } from '~/shared/components'
import ImageIcon from '@mui/icons-material/Image'
import baseClasses from '~/App.module.scss'

export const LocalImages = memo(() => {
  return (
    <Layout>
      <Grid
        container
        spacing={2}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid size={12}>
          <h1 className={baseClasses.inlineH1}>
            <ImageIcon fontSize='inherit' /><span>Local images</span>
          </h1>
        </Grid>
        <Grid size={12}>
          <FileSteperExample
            isEditable={true}
            idbKey='dev-exp'
          />
        </Grid>
      </Grid>
    </Layout>
  )
})

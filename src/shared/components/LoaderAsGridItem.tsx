import { Grid2 as Grid } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'

export const LoaderAsGridItem = ({ size }: { size: number }) => (
  <Grid size={size} sx={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 6 }}>
    <CircularProgress />
  </Grid>
)

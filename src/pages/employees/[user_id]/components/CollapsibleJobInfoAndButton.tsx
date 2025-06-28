import { memo, useState, useCallback } from 'react'
import { Button } from '@mui/material'
import { TotalJobChecklist } from '~/pages/jobs/[job_id]/components'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

type TProps = {
  jobId: number;
}

export const CollapsibleJobInfoAndButton = memo(({ jobId }: TProps) => {
  const [isOpened, setIsOpened] = useState(false)
  const handleToggle = useCallback(() => setIsOpened((s) => !s), [])

  return (
    <>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          // sx={{ borderRadius: 4 }}
          size='small'
          variant='outlined'
          endIcon={isOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={handleToggle}
          // fullWidth
        >
          Additional info
        </Button>
      </div>
      {
        isOpened && (
          <TotalJobChecklist
            job_id={jobId}
          />
        )
      }
    </>
  )
})

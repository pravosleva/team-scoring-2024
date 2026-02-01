import { memo, useCallback, useMemo } from 'react'
import { ResponsiveBlock } from '~/shared/components'
import baseClasses from '~/App.module.scss'
import { Button } from '@mui/material'
import { getExtractedValues } from '~/shared/utils/string-ops'
import { useNavigate } from 'react-router-dom'
import { getFullUrl } from '~/shared/utils/string-ops'

type TProps = {
  uniqueKey: string;
}

export const NavBtnsBlock = memo(({ uniqueKey }: TProps) => {
  const navigate = useNavigate()
  const jobId = useMemo<number | undefined>(
    () => {
      const matches = getExtractedValues({
        tested: [uniqueKey],
        expectedKey: 'JOB_ID',
        valueType: 'number',
      })
      return !Number.isNaN(Number(matches[0])) ? Number(matches[0]) : undefined
    },
    [uniqueKey]
  )
  const goJob = useCallback(() => {
    if (!!jobId)
      navigate(getFullUrl({ url: `/jobs/${jobId}` }))
    else
      console.warn('No')
  }, [jobId])
  const logTs = useMemo<number | undefined>(
    () => {
      const matches = getExtractedValues({
        tested: [uniqueKey],
        expectedKey: 'LOG_TS',
        valueType: 'number',
      })
      return !Number.isNaN(Number(matches[0])) ? Number(matches[0]) : undefined
    },
    [uniqueKey]
  )
  const goLog = useCallback(() => {
    if (!!jobId && !!logTs)
      navigate(getFullUrl({ url: `/jobs/${jobId}/logs/${logTs}` }))
    else
      console.warn('No')
  }, [jobId, logTs])

  return (
    <>
      {
        !!jobId && (
          <ResponsiveBlock
            className={baseClasses.specialActionsGrid}
            style={{
              // padding: '16px 0px 16px 0px',
              // border: '1px dashed red',
              // boxShadow: '0 -10px 7px -8px rgba(34,60,80,.2)',
              // position: 'sticky',
              // bottom: 0,
              backgroundColor: 'transparent',
              // zIndex: 3,
              marginTop: 'auto',
              // borderRadius: '16px 16px 0px 0px',
            }}
          >
            <Button
              onClick={goJob}
              color='primary'
              variant='contained'
            // disabled={}
            // startIcon={<SaveIcon />}
            >
              Job
            </Button>
            {
              !!logTs && (
                <Button
                  onClick={goLog}
                  color='primary'
                  variant='outlined'
                // disabled={}
                // startIcon={<SaveIcon />}
                >
                  Log
                </Button>
              )
            }
          </ResponsiveBlock>
        )
      }
    </>
  )
})

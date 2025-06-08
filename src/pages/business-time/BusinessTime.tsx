import { useState, useRef, useCallback } from 'react'
import { Layout } from '~/shared/components/Layout'
import baseClasses from '~/App.module.scss'
import Grid from '@mui/material/Grid2'
import { Box, Button, Tabs, Tab } from '@mui/material'
import { TabContext, TabPanel } from '@mui/lab'
import { DialogAsButton } from '~/shared/components/Dialog/DialogAsButton'
import AddIcon from '@mui/icons-material/Add'
import { useLocalStorageState } from '~/shared/hooks'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import ClearIcon from '@mui/icons-material/Clear'
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import { JsonEditor } from './components'
import { TBusinessTimeData, TWeekConfig, EDay } from './utils/types'
import { theDayValidationObject } from './utils/theDayValidationObject'
// import { getTruncated } from '~/shared/utils/string-ops'
import { getDefaultBusinessTimeConfig } from './utils/getDefaultBusinessTimeConfig'

const defaultBusinessTimeConfigItemName = '5/2 by Default'

export const BusinessTime = () => {
  const [isReadyForSave, setIsReadyForSave] = useState<boolean>(false)
  // const [notCommitedNormalizedCfg, setNotCommitedNormalizedCfg] = useState<TWeekConfig | null>(null)
  const notCommitedNormalizedCfgRef = useRef<TWeekConfig | null>(null)
  const setNotCommitedNormalizedCfg = useCallback((val: TWeekConfig | null) => {
    switch (true) {
      case !val:
        notCommitedNormalizedCfgRef.current = null
        break
      default: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const normalized: any = {}
        for (const key in val) {
          if (Object.values(EDay).includes(key as EDay)) {
            normalized[key as EDay] = val[key as EDay]
          }
          notCommitedNormalizedCfgRef.current = val
        }
        break
      }
    }
  }, [])
  const [infoMessage, setInfoMessage] = useState<string | null>()
  const removeInfoMessage = useCallback(() => {
    setInfoMessage(null)
  }, [])
  const [counter, setCounter] = useState<number>(0)
  const incCounter = useCallback(() => setCounter((c) => c + 1), [])

  const [businessTimeConfig, saveBusinessTimeConfig] = useLocalStorageState<{ [key: string]: TBusinessTimeData }>({
    key: 'teamScoring2024:businessTimeConfig',
    initialValue: {
      [defaultBusinessTimeConfigItemName]: getDefaultBusinessTimeConfig({ isReadOnly: true }),
    },
  })
  const [activeTab, setActiveTab] = useState<string>(Object.keys(businessTimeConfig)[Object.keys(businessTimeConfig).length - 1]) // NOTE: Or? || defaultBusinessTimeConfigItemName
  const handleCreateTimeConfig = useCallback(({ name }: {
    name: string;
  }) => {
    saveBusinessTimeConfig({
      ...businessTimeConfig,
      [name]: getDefaultBusinessTimeConfig({ isReadOnly: false }),
    })
    setActiveTab(name)
  }, [saveBusinessTimeConfig, businessTimeConfig])

  const handleRemoveTimeConfig = useCallback(({ name }: {
    name: string;
  }) => () => {
    const isConfirmed = window.confirm('Sure?')
    if (!isConfirmed) return

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [name]: _toRemove, ...rest } = businessTimeConfig
    saveBusinessTimeConfig(rest)
    setActiveTab(defaultBusinessTimeConfigItemName)
  }, [saveBusinessTimeConfig, businessTimeConfig])

  const topRef = useRef<HTMLDivElement>(null)
  
  const [isEditModeEnabled, setIsEditModeEnabled] = useState<boolean>(false)
  const toggleEditMode = useCallback(() => {
    setIsEditModeEnabled((s) => !s)
  }, [])

  const handleUpdateActiveTab = (_e: React.SyntheticEvent, newValue: string) => {
    setIsEditModeEnabled(false)
    setIsReadyForSave(false)
    removeInfoMessage()
    setActiveTab(newValue)
    if (!!topRef.current)
      setTimeout(() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" }), 300)
  }

  const handleSave = useCallback(() => {
    if (!!notCommitedNormalizedCfgRef.current && !!activeTab) {
      // TODO: Confirm modal?
      saveBusinessTimeConfig({
        ...businessTimeConfig,
        [activeTab]: {
          ...businessTimeConfig[activeTab],
          cfg: notCommitedNormalizedCfgRef.current,
          ts: {
            createdAt: businessTimeConfig[activeTab].ts.createdAt,
            updatedAt: new Date().getTime(),
          },
        },
      })
      removeInfoMessage()
      setIsReadyForSave(false)
      setInfoMessage(null)
      setNotCommitedNormalizedCfg(null)
      setIsEditModeEnabled(false)
    }
  }, [businessTimeConfig, activeTab, saveBusinessTimeConfig, removeInfoMessage, setIsReadyForSave, setInfoMessage, setNotCommitedNormalizedCfg])

  const handleRenameTimeConfig = useCallback(() => {
    const newName = window.prompt('New name', activeTab)
    if (!newName) return

    const limit = 200
    if (newName.length > limit) {
      setInfoMessage(`Limit is ${limit}`)
      return
    }

    const newNormalizedValue = newName.trim().replace(/\s+/g,' ')
    if (newNormalizedValue === activeTab) {
      setInfoMessage('Already named')
      return
    } else {
      const { [activeTab]: targetData, ...restData } = businessTimeConfig
      saveBusinessTimeConfig({
        ...restData,
        [newNormalizedValue]: {
          ...targetData,
          ts: {
            createdAt: targetData.ts.createdAt,
            updatedAt: new Date().getTime(),
          },
        },
      })
      setActiveTab(newNormalizedValue)
      setIsEditModeEnabled(false)
    }
  }, [activeTab, businessTimeConfig, saveBusinessTimeConfig, setActiveTab, setIsEditModeEnabled])

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
            <h1>⚙️ Business time</h1>
            <em>Local settings</em>
          </Grid>
          {/* <Grid size={12}>
            <Alert
              severity='warning'
              variant='outlined'
            >
              <em>Work in progress (unused)</em>
            </Alert>
          </Grid> */}
          <Grid size={12}>
            <DialogAsButton
              modal={{
                title: 'New Business time standard',
              }}
              btn={{
                label: 'Create',
                startIcon: <AddIcon />,
              }}
              targetAction={{
                label: 'Save',
                isEnabled: true,
                onClick: ({ form }) => {
                  // console.log(form)
                  if (typeof form.displayName === 'string' && !!form.displayName) {
                    const normalizedValue = form.displayName.trim().replace(/\s+/g,' ')
                    if (typeof normalizedValue === 'string' && !!normalizedValue) {
                      // topLevelActorRef.send({ type: 'user.commit', value: { displayName: form.displayName } })
                      
                      handleCreateTimeConfig({ name: normalizedValue })
                      return Promise.resolve({ ok: true })
                    }
                  }
                  return Promise.reject({ ok: true, message: 'Err' })
                },
              }}
              scheme={{
                displayName: {
                  initValue: '',
                  label: 'Display name',
                  type: 'string',
                  gridSize: 12,
                  isRequired: true,
                  validator: ({ value }) => {
                    const lenLimit = 200
                    const normalizedValue = value.trim().replace(/\s+/g,' ')
                    const alreadyExists = !!Object.keys(businessTimeConfig).find((key) => normalizedValue === key)
                    const res: { ok: boolean; message?: string } = { ok: true }
                    switch (true) {
                      case typeof value !== 'string':
                      case normalizedValue.length === 0:
                        res.ok = false
                        res.message = `Expected not empty string (received ${typeof value}: "${normalizedValue}")`
                        break
                      case normalizedValue.length >= lenLimit:
                        res.ok = false
                        res.message = `Limit ${lenLimit} reached (${normalizedValue.length})`
                        break
                      case alreadyExists:
                        res.ok = false
                        res.message = `Already exists: ${normalizedValue}`
                        break
                      default:
                        break
                    }
                    return res
                  },
                },
              }}
            />
          </Grid>
          <Grid size={12}>
            <TabContext value={activeTab}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid lightgray',
                }}
                // sx={{
                //   bgcolor: 'background.paper',
                //   border: '1px solid lightgray',
                //   zIndex: 100,
                // }}
                ref={topRef}
              >
                <Tabs
                  // centered
                  value={activeTab}
                  onChange={handleUpdateActiveTab}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="scrollable auto tabs example"
                  sx={{
                    position: 'sticky',
                    top: '0px',
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid lightgray',
                    zIndex: 1,
                  }}
                >
                  {
                    Object.keys(businessTimeConfig).map((key) => (
                      <Tab label={key} value={key} key={key} />
                    ))
                  }
                  {/* <Tab label="Custom" value="2" /> */}
                </Tabs>

                {
                  Object.keys(businessTimeConfig).map((key) => (
                    <TabPanel
                      value={key}
                      key={key}
                      sx={{ p: 2 }}
                    >
                      <JsonEditor<TWeekConfig>
                        key={counter}
                        initialState={businessTimeConfig[key].cfg}
                        isReadOnly={(businessTimeConfig[key]?.isReadOnly && Object.keys(businessTimeConfig).length < 2) || !isEditModeEnabled}
                        validationRules={{
                          [EDay.MON]: theDayValidationObject,
                          [EDay.THU]: theDayValidationObject,
                          [EDay.WED]: theDayValidationObject,
                          [EDay.TUE]: theDayValidationObject,
                          [EDay.FRI]: theDayValidationObject,
                          [EDay.SAT]: theDayValidationObject,
                          [EDay.SUN]: theDayValidationObject,
                        }}
                        onValidate={({ validatedResult, value }) => {
                          removeInfoMessage()
                          setIsReadyForSave(validatedResult.ok)
                          setInfoMessage(validatedResult.message || null)
                          setNotCommitedNormalizedCfg(validatedResult.ok ? value : null)
                        }}
                      />
                    </TabPanel>
                  ))
                }

                <Box
                  sx={{
                    borderTop: '1px solid lightgray',
                    position: 'sticky',
                    bottom: '0px',
                    p: 2,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  {!!infoMessage && (
                    <b style={{ fontSize: 'x-small' }}>{infoMessage}</b>
                  )}
                  <Box
                    sx={{
                      p: 0,
                      bgcolor: 'background.paper',
                      display: 'flex',
                      flexDirection: 'row',
                      gap: 1,
                    }}
                  >
                    <Button
                      color='error'
                      sx={{ borderRadius: 4 }}
                      size='small'
                      variant='outlined'
                      disabled={businessTimeConfig[activeTab]?.isReadOnly}
                      onClick={handleRemoveTimeConfig({ name: activeTab })}
                      startIcon={<DeleteIcon />}
                    >
                      DEL{/* getTruncated(activeTab, 10) */}
                    </Button>
                    {
                      isEditModeEnabled && (
                        <Button
                          color='success'
                          sx={{ borderRadius: 4 }}
                          size='small'
                          variant='contained'
                          disabled={(businessTimeConfig[activeTab]?.isReadOnly && Object.keys(businessTimeConfig).length < 2) || !isReadyForSave}
                          onClick={handleSave}
                          endIcon={<SaveIcon />}
                        >
                          Save
                        </Button>
                      )
                    }
                    {
                      isEditModeEnabled && !(businessTimeConfig[activeTab]?.isReadOnly && Object.keys(businessTimeConfig).length < 2) && (
                        <>
                          <Button
                            color='secondary'
                            sx={{ borderRadius: 4 }}
                            size='small'
                            variant='outlined'
                            // startIcon={<NewReleasesIcon />}
                            // endIcon={<ClearIcon />}
                            // disabled={!isReadyForSave}
                            onClick={() => {
                              removeInfoMessage()
                              setIsEditModeEnabled(false)
                              setIsReadyForSave(false)
                              incCounter()
                            }}
                          >
                            <ClearIcon />
                          </Button>
                          <Button
                            color='secondary'
                            sx={{ borderRadius: 4 }}
                            size='small'
                            variant='outlined'
                            disabled={businessTimeConfig[activeTab]?.isReadOnly}
                            onClick={handleRenameTimeConfig}
                          >
                            Rename
                          </Button>
                        </>
                      )
                    }
                    {
                      !isEditModeEnabled && (
                        <Button
                          color='secondary'
                          sx={{ borderRadius: 4 }}
                          size='small'
                          variant='contained'
                          startIcon={<ModeEditIcon />}
                          disabled={
                            businessTimeConfig[activeTab]?.isReadOnly
                            && Object.keys(businessTimeConfig).length < 2
                          }
                          onClick={toggleEditMode}
                        >
                          Edit mode
                        </Button>
                      )
                    }
                  </Box>
                </Box>
              </div>
            </TabContext>
          </Grid>
        </Grid>
      </div>
    </Layout>
  )
}

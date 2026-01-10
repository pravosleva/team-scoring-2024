import { memo, useState, useCallback, useRef } from 'react'
import { Layout, ResponsiveBlock } from '~/shared/components'
import baseClasses from '~/App.module.scss'
import SettingsIcon from '@mui/icons-material/Settings'
import SaveIcon from '@mui/icons-material/Save'
import DeleteIcon from '@mui/icons-material/Delete'
import ClearIcon from '@mui/icons-material/Clear'
import ModeEditIcon from '@mui/icons-material/ModeEdit'
import { Alert, Box, Button, Tabs, Tab, Grid2 as Grid } from '@mui/material'
import { Autocomplete } from '~/shared/components/Autocomplete'
import { DialogAsButton } from '~/shared/components/Dialog/DialogAsButton'
import AddIcon from '@mui/icons-material/Add'
import { TabContext, TabPanel } from '@mui/lab'
import { JsonEditor } from '~/shared/components/JsonEditor'
import slugify from 'slugify'
import { useLocalStorageState } from '~/shared/hooks/use[any]Storage/useLocalStorageState'
import { TLocalSettingsStatusOption } from '~/pages/local-settings/types'
import { getDefaultPointsetStatusListSpaceState } from './utils'
import clsx from 'clsx'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ImageIcon from '@mui/icons-material/Image'
import WorkHistoryIcon from '@mui/icons-material/WorkHistory'

slugify.extend({ '/': '_' })

const defaultPointsetStatusListSpaceName = 'default'

export const LocalSettings = memo(() => {
  const [activeStatusPack, setActiveStatusPack] = useLocalStorageState<string>({
    key: 'teamScoring2024:localSettings:pointset-active-statuspack',
    initialValue: defaultPointsetStatusListSpaceName,
  })

  const [_counter, setCounter] = useState<number>(0)
  const incCounter = useCallback(() => setCounter((c) => c + 1), [])
  const [isReadyForSave, setIsReadyForSave] = useState<boolean>(false)
  const [infoMessage, setInfoMessage] = useState<string | null>()
  const removeInfoMessage = useCallback(() => {
    setInfoMessage(null)
  }, [])
  const [localSettings, saveLocalSettings] = useLocalStorageState<{
    [key: string]: {
      [key: string]: TLocalSettingsStatusOption;
    };
  }>({
    key: 'teamScoring2024:localSettings:pointset-statuslist',
    initialValue: {
      [defaultPointsetStatusListSpaceName]: getDefaultPointsetStatusListSpaceState(),
    },
  })
  // const [activeTab, setActiveTab] = useState<string>(Object.keys(localSettings)[Object.keys(localSettings).length - 1]) // NOTE: Or? || defaultPointsetStatusListSpaceName
  const [activeTab, setActiveTab] = useState<string>(activeStatusPack)
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

  // -- NOTE: Diagrams exp
  const notCommitedDiagramListRef = useRef<{ [key: string]: { [key: string]: TLocalSettingsStatusOption } }>({})
  const setNotCommitedDiagramListRef = useCallback(({ value, namespace }: {
    value?: { [key: string]: TLocalSettingsStatusOption };
    namespace?: string;
  }) => {
    switch (true) {
      case !value || !namespace:
        notCommitedDiagramListRef.current = {}
        break
      default: {
        const normalized: { [key: string]: TLocalSettingsStatusOption } = {}
        console.log(value)
        for (const statusName in value) {
          const normalizedStatusName = slugify(statusName)
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          if (!normalized[normalizedStatusName]) normalized[normalizedStatusName] = {}
          for (const prop in value[statusName]) {
            if (['emoji', 'label'].includes(prop)) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              normalized[normalizedStatusName][prop] = value[statusName][prop]
            }
          }
        }
        notCommitedDiagramListRef.current[namespace] = normalized
        break
      }
    }
  }, [])
  // --

  const handleCreateNewConfig = useCallback(({ name }: {
    name: string;
  }) => {
    const normalizedNamespace = slugify(name.trim()).toLowerCase()
    saveLocalSettings({
      ...localSettings,
      [normalizedNamespace]: getDefaultPointsetStatusListSpaceState(),
    })
    setActiveTab(normalizedNamespace)
  }, [saveLocalSettings, localSettings])

  const handleRenameSettingsConfig = useCallback(() => {
    const newName = window.prompt('New name', activeTab)
    if (!newName) return

    const limit = 200
    if (newName.length > limit) {
      setInfoMessage(`Limit is ${limit}`)
      return
    }
    const newNormalizedValue = slugify(newName.trim().replace(/\s+/g, ' ')).toLowerCase()
    if (newNormalizedValue === activeTab) {
      setInfoMessage('Already named')
      return
    } else {
      const { [activeTab]: targetData, ...restData } = localSettings
      saveLocalSettings({
        ...restData,
        [newNormalizedValue]: {
          ...targetData,
        },
      })
      setActiveTab(newNormalizedValue)
      setIsEditModeEnabled(false)
    }
  }, [activeTab, localSettings, saveLocalSettings, setActiveTab, setIsEditModeEnabled])
  const handleRemoveSettingsConfig = useCallback(({ name }: {
    name: string;
  }) => () => {
    const isConfirmed = window.confirm(`Business time config will be removed for "${name}". Yes?`)
    if (!isConfirmed) return
    const { [name]: _toRemove, ...rest } = localSettings
    saveLocalSettings(rest)
    setActiveTab(defaultPointsetStatusListSpaceName)
  }, [saveLocalSettings, localSettings])
  const handleSave = useCallback(() => {
    if (!!notCommitedDiagramListRef.current && !!activeTab) {
      // TODO: Confirm modal?
      console.log(localSettings[activeTab]) // NOTE: Example: { initial: { emoji, label } }
      console.log(notCommitedDiagramListRef.current[activeTab])
      saveLocalSettings({
        ...localSettings,
        [activeTab]: {
          // ...localSettings[activeTab],
          ...(notCommitedDiagramListRef.current[activeTab] || {}),
        },
      })
    }
    removeInfoMessage()
    setIsReadyForSave(false)
    setInfoMessage(null)
    setNotCommitedDiagramListRef({})
    setIsEditModeEnabled(false)
  }, [
    localSettings, activeTab, saveLocalSettings, removeInfoMessage, setIsReadyForSave,
    setInfoMessage,
    setNotCommitedDiagramListRef,
  ])

  return (
    <Layout>
      <div
        // className={baseClasses.stack1}
        style={{
          marginBottom: '24px',
        }}
      >
        <Grid container spacing={2}>
          <Grid size={12}>
            <h1 className={baseClasses.inlineH1}>
              <SettingsIcon fontSize='inherit' />
              <span>Local settings</span>
            </h1>
            <ResponsiveBlock
              isPaddedMobile
              isLimited
              className={clsx(baseClasses.pagesGrid)}
            >
              <Link to='/business-time'>
                <Button
                  color='secondary'
                  variant='outlined'
                  startIcon={<WorkHistoryIcon />}
                  endIcon={<ArrowForwardIcon />}
                >
                  Business time
                </Button>
              </Link>
              <Link to='/local-images'>
                <Button
                  color='secondary'
                  variant='outlined'
                  startIcon={<ImageIcon />}
                  endIcon={<ArrowForwardIcon />}
                >
                  Local images
                </Button>
              </Link>
            </ResponsiveBlock>
          </Grid>
          <Grid size={12}>
            <ResponsiveBlock
              isPaddedMobile
              isLimited
              className={clsx(baseClasses.pagesGrid)}
            >
              <h2 style={{ color: '#959eaa' }}>Status pack</h2>
              <Autocomplete
                disableClearable
                label='Active namespace'
                // key={`statuses-pack-autocomplete-${activeStatusPack}`}
                list={Object.keys(localSettings).map((k) => ({ label: k, value: k }))}
                onSelect={(item) => setActiveStatusPack(item?.value || defaultPointsetStatusListSpaceName)}
                defaultValue={{ label: activeStatusPack, value: activeStatusPack }}
              // isErrored={!!__errsState[key]}
              // helperText={__errsState[key]}
              />
            </ResponsiveBlock>
          </Grid>
          <Grid size={12}>
            <DialogAsButton
              modal={{
                title: 'New statuses pack',
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
                    const normalizedValue = form.displayName.trim().replace(/\s+/g, ' ')
                    if (typeof normalizedValue === 'string' && !!normalizedValue) {
                      // topLevelActorRef.send({ type: 'user.commit', value: { displayName: form.displayName } })

                      handleCreateNewConfig({ name: normalizedValue })
                      return Promise.resolve({ ok: true })
                    }
                  }
                  return Promise.reject({ ok: true, message: 'Err' })
                },
              }}
              scheme={{
                displayName: {
                  initValue: '',
                  label: 'Namespace',
                  type: 'string',
                  gridSize: 12,
                  isRequired: true,
                  validator: ({ value }) => {
                    const lenLimit = 200
                    const normalizedValue = value.trim().replace(/\s+/g, ' ')
                    const alreadyExists = !!Object.keys(localSettings).find((key) => normalizedValue === key)
                    const res: { ok: boolean; message?: string } = { ok: true }
                    switch (true) {
                      case typeof value !== 'string':
                      case normalizedValue.length === 0:
                        res.ok = false
                        res.message = `Expected not empty string, received: "${normalizedValue}" (${typeof value})`
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
                    zIndex: 2,
                  }}
                >
                  {
                    Object.keys(localSettings).map((key) => (
                      <Tab label={key} value={key} key={key} />
                    ))
                  }
                </Tabs>
                {
                  Object.keys(localSettings).map((namespace) => (
                    <TabPanel
                      value={namespace}
                      key={namespace}
                      sx={{
                        p: 2,
                      }}
                    >
                      <div className={baseClasses.stack1}>
                        <JsonEditor<{ pointStatusList: { [key: string]: TLocalSettingsStatusOption } }>
                          // key={`pointStatusList-${counter}`}
                          initialState={{ pointStatusList: localSettings[namespace] || {} }}
                          // isReadOnly={(businessTimeConfig[key]?.isReadOnly && Object.keys(businessTimeConfig).length < 2) || !isEditModeEnabled}
                          isReadOnly={!isEditModeEnabled}
                          validationRules={{
                            pointStatusList: {
                              isRequired: false,
                              validate: ({ value }) => {
                                // console.log(value)
                                const res: { ok: boolean; message?: string } = { ok: true }
                                const requiredProps = ['label', 'emoji']
                                switch (true) {
                                  case typeof value !== 'object':
                                    res.ok = false
                                    res.message = 'ERR'
                                    break
                                  case !value:
                                    res.ok = false
                                    res.message = 'ERR2'
                                    break
                                  default:
                                    for (const st in value) {
                                      // console.log(`  st=${st}`)
                                      const _ps = new Set()
                                      for (const p in value[st]) {
                                        if (requiredProps.includes(p)) _ps.add(p)
                                        // console.log(`    p=${p}`)
                                        if (!requiredProps.includes(p)) {
                                          // console.log(`      Oops...`)
                                          res.ok = false
                                          res.message = [
                                            `Проверьте свойства для "${st}"`,
                                            `Ожидаются эти: ${requiredProps.join(', ')}`,
                                          ].join('; ')
                                        }
                                        // if (p === 'emoji') {
                                        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        //   // @ts-ignore
                                        //   if (value[st][p].length > 1) {
                                        //     res.ok = false
                                        //     res.message = 'One symbol plz'
                                        //   }
                                        // }
                                      }
                                      if (_ps.size !== requiredProps.length) {
                                        res.ok = false
                                        res.message = [
                                          `Ожидаемое количесиво полей ${requiredProps.length}`,
                                          `(получено корректных полей: ${_ps.size})`
                                        ].join(' ')
                                      }
                                    }
                                    break
                                }
                                return res
                              },
                            },
                          }}
                          onValidate={({ validatedResult, value }) => {
                            removeInfoMessage()
                            setIsReadyForSave(validatedResult.ok)
                            setInfoMessage(validatedResult.message || null)
                            setNotCommitedDiagramListRef({ namespace, value: value.pointStatusList })
                          }}
                        />
                      </div>
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
                    <Alert
                      severity='error'
                      variant='filled'
                    >
                      {infoMessage}
                    </Alert>
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
                      disabled={activeTab === defaultPointsetStatusListSpaceName}
                      onClick={handleRemoveSettingsConfig({ name: activeTab })}
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
                          disabled={!isReadyForSave}
                          onClick={handleSave}
                          endIcon={<SaveIcon />}
                        >
                          Save
                        </Button>
                      )
                    }
                    {
                      isEditModeEnabled && Object.keys(localSettings).length > 1 && (
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
                            // disabled={localSettings[activeTab]?.isReadOnly}
                            onClick={handleRenameSettingsConfig}
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
                          disabled={Object.keys(localSettings).length < 2}
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
})

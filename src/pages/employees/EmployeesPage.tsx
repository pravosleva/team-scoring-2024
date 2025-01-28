import { useCallback } from 'react'
import { Layout } from '~/shared/components/Layout'
import Grid from '@mui/material/Grid2'
import { List } from '@mui/material'
import { TopLevelContext } from '~/shared/xstate/topLevelMachine/v2'
import { Employee } from './components'
import AddIcon from '@mui/icons-material/Add'
import { DialogAsButton } from '~/shared/components/Dialog/DialogAsButton'

export const EmployeesPage = () => {
  const users = TopLevelContext.useSelector((s) => s.context.users.items)
  const topLevelActorRef = TopLevelContext.useActorRef()
  const handleUserDelete = useCallback(({ id }: {
    id: number;
  }) => () => {
    const isConfirmed = window.confirm(`Delete user #${id}?`)
    if (isConfirmed) topLevelActorRef.send({ type: 'user.delete', value: { id } })
  }, [topLevelActorRef])

  return (
    <Layout>
      <Grid
        container
        spacing={2}
        sx={{
          marginBottom: '24px',
        }}
      >
        <Grid size={12}>
          <h1>Employees</h1>
          <DialogAsButton
            modal={{
              title: 'New user',
            }}
            btn={{
              label: 'Create',
              startIcon: <AddIcon />,
            }}
            targetAction={{
              label: 'Save',
              isEnabled: true,
              onClick: ({ form }) => {
                console.log(form)
                if (typeof form.displayName === 'string' && !!form.displayName) {
                  topLevelActorRef.send({ type: 'user.commit', value: { displayName: form.displayName } })
                  return Promise.resolve({ ok: true })
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
                  const alreadyExists = !!users.find(({ displayName }) => value.trim().replace(/\s+/g,' ') === displayName)
                  const res: { ok: boolean; message?: string } = { ok: true }
                  switch (true) {
                    case typeof value !== 'string':
                    case value.length === 0:
                      res.ok = false
                      res.message = `Expected not empty string (received ${typeof value}: "${String(value)}")`
                      break
                    case value.length >= 100:
                      res.ok = false
                      res.message = `Limit 100 reached (${value.length})`
                      break
                    case alreadyExists:
                      res.ok = false
                      res.message = `Already exists: ${value}`
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
          {
            users.length > 0
            ? (
              <List>
                {
                  users.map((user) => (
                    <Employee
                      key={user.id}
                      user={user}
                      onDelete={handleUserDelete({ id: user.id })}
                    />
                  ))
                }
              </List>
            ) : <em>No items</em>
          }
        </Grid>
      </Grid>
    </Layout>
  )
}

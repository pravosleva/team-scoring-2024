import { useMachine } from '@xstate/react'
import { topLevelMachine } from '~/shared/xstate/topLevelMachine/v1'
import { ServiceContext } from './context'

type TProps = {
  children: React.ReactNode;
}

export const TopLevelMachineContext = ({ children }: TProps) => {
  const [state, send] = useMachine(topLevelMachine)

  return (
    <ServiceContext.Provider
      value={{
        state,
        send,
      }}
    >
      {children}
    </ServiceContext.Provider>
  )
}

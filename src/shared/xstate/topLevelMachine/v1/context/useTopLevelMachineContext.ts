import { useContext } from 'react'
import { ServiceContext } from './context'

export const useTopLevelMachineContext = () => useContext(ServiceContext)

import { useEffect } from 'react'
import { httpClient } from '~/shared/utils/httpClient'

export const useInitHttpClientExample = () => {
  useEffect(() => {
    httpClient.exampleRequest({})
      .then(console.log)
      .catch(console.warn)
  }, [])
}

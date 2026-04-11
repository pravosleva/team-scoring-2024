import { memo, useEffect, useState, useMemo } from 'react'
import { Alert, Grid2 as Grid } from '@mui/material'
import { FileSteperExample, Layout } from '~/shared/components'
import ImageIcon from '@mui/icons-material/Image'
import baseClasses from '~/App.module.scss'
import { idbInstance } from '~/shared/utils/indexed-db-ops'
import { CommonInfoContext } from '~/shared/context'
import { NavBtnsBlock } from './components'
import { getSortedStrings } from '~/shared/utils/string-ops/getSortedStrings'
import { useSearchParams } from 'react-router-dom'
import { scrollToIdFactory } from '~/shared/utils/web-api-ops'
import { getExtractedValues } from '~/shared/utils/string-ops'

const getExtractedKey = ({ idbKey }: { idbKey: string }): string => {
  let res = ''
  const jobIdMatches = getExtractedValues({
    tested: [idbKey],
    expectedKey: 'JOB_ID',
    valueType: 'number',
  })
  if (!Number.isNaN(Number(jobIdMatches[0]))) {
    res += jobIdMatches[0]
  }
  const logTsMatches = getExtractedValues({
    tested: [idbKey],
    expectedKey: 'LOG_TS',
    valueType: 'number',
  })
  if (!Number.isNaN(Number(logTsMatches[0]))) {
    res += '-'
    res += logTsMatches[0]
  }
  const checklistItemIdMatches = getExtractedValues({
    tested: [idbKey],
    expectedKey: 'CHECKLIST_ITEM_ID',
    valueType: 'number',
  })
  if (!Number.isNaN(Number(checklistItemIdMatches[0]))) {
    res += '-'
    res += checklistItemIdMatches[0]
  }
  return res
}
const specialScroll = scrollToIdFactory({
  timeout: 200,
  offsetTop: 16,
  elementHeightCritery: 550,
})

const isDev = import.meta.env.NODE_ENV === 'development'

export const LocalImages = memo(() => {
  const [idbKeys, setIdbKeys] = useState<string[]>([])
  useEffect(() => {
    idbInstance.getAllKeys()
      .then((res) => {
        setIdbKeys(res as string[] || [])
      })
      .catch((err) => {
        if (isDev) console.warn(err)
      })
  }, [])
  const [idb] = CommonInfoContext.useStore((s) => s.idb)
  const sortedIdbKeys = useMemo(
    () => getSortedStrings({ items: idbKeys || [], order: 'DESC' }),
    [idbKeys]
  )
  // const params = useParams()
  const [urlSearchParams] = useSearchParams()
  useEffect(() => {
    const activeItemEncodedKey = urlSearchParams.get('activeItem')
    if (!!activeItemEncodedKey && sortedIdbKeys.length > 0) {
      specialScroll({ id: getExtractedKey({ idbKey: decodeURIComponent(activeItemEncodedKey) }) })
    }
  }, [sortedIdbKeys, urlSearchParams])

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
            <ImageIcon fontSize='inherit' />
            <span>Local images</span>
          </h1>
        </Grid>

        {/* <Grid size={12}>
          <pre className={baseClasses.preNormalized}>{JSON.stringify({ urlSearchParams }, null, 2)}</pre>
        </Grid> */}

        {!!idb && (
          <>
            <Grid size={12}>
              <b>IndexedDB size used <code className={baseClasses.inlineCode}>{idb.used.humanized} ({idb.used.percentage.toFixed(2)}%)</code></b>
            </Grid>
            <Grid size={12}>
              <Alert
                severity='info'
                variant='outlined'
              >
                <div className={baseClasses.stack1}>
                  <div>
                    <em>Увеличение размера IndexedDB при удалении данных (включая файлы/blobs) обычно связано с особенностями работы движков баз данных браузеров (например, LevelDB в Chrome). При удалении записи место не освобождается моментально, а помечается как удаленное, а новые данные могут дописываться, увеличивая общий размер файла до момента фоновой «уборки мусора» (compaction).</em>
                  </div>
                  <div>
                    <b>Основные причины роста:</b>
                    <ul className={baseClasses.compactList}>
                      <li>Отложенная очистка: Браузер не перестраивает базу данных сразу после удаления каждого файла. Он помечает место как свободное, но файл базы данных не уменьшается, пока не произойдет автоматическая оптимизация.</li>
                      <li>Журналирование (WAL): Многие движки используют журнал предзаписи. Удаление — это запись операции удаления, что временно увеличивает размер служебных файлов.</li>
                      <li>Фрагментация: Новые данные могут записываться в новые области, пока старые «удаленные» области ждут компактизации.</li>
                    </ul>
                  </div>
                  <div>
                    <b>Что делать:</b>
                    <ol className={baseClasses.compactList}>
                      <li>Подождать: Браузер обычно выполняет очистку (compaction) в фоновом режиме через некоторое время.</li>
                      <li>Очистить данные сайта: В инструментах разработчика (DevTools) — Application 👉 Storage 👉 Clear site data, чтобы принудительно удалить всё.</li>
                      <li>Перезагрузить браузер: Иногда помогает запустить процесс оптимизации баз данных.</li>
                    </ol>
                  </div>
                </div>
              </Alert>
            </Grid>
          </>
        )}

        {
          sortedIdbKeys.length > 0 && (
            <Grid
              container
              spacing={4}
            >
              {
                sortedIdbKeys.map((k) => (
                  <Grid
                    container
                    spacing={2}
                    key={k}
                    id={getExtractedKey({ idbKey: k })}
                  >
                    <Grid size={12}>
                      <FileSteperExample
                        isEditable={true}
                        idbKey={k}
                        _hasGalleryContent
                        isRemoveable
                        isEditModeCollapsible
                      />
                    </Grid>
                    <Grid size={12}>
                      <NavBtnsBlock uniqueKey={k} />
                    </Grid>
                  </Grid>
                ))
              }
            </Grid>
          )
        }
      </Grid>
    </Layout>
  )
})

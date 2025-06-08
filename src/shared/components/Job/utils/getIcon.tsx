// import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import TaskAltIcon from '@mui/icons-material/TaskAlt'
// import SettingsIcon from '@mui/icons-material/Settings'
// import ConstructionIcon from '@mui/icons-material/Construction'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import { TJob } from '~/shared/xstate'
// import stc from 'string-to-color'
// import invert from 'invert-color'
import HiveIcon from '@mui/icons-material/Hive'
import ExtensionIcon from '@mui/icons-material/Extension'

export const getIcon = ({ job }: { job: TJob }): string | React.ReactNode => {
  const hasParent = !!job.relations?.parent
  const hasChildren = Array.isArray(job.relations?.children)
    && job.relations.children.length > 0
  const isStartedOnly = typeof job.forecast.start === 'number'
    && typeof job.forecast.estimate === 'undefined'
    && typeof job.forecast.finish === 'undefined'
  const isStartedAndEstimated = typeof job.forecast.start === 'number'
    && typeof job.forecast.estimate === 'number'
    && typeof job.forecast.finish === 'undefined'
  const isFinished = typeof job.forecast.start === 'number'
    && typeof job.forecast.estimate === 'number'
    && typeof job.forecast.finish === 'number'

  switch (true) {
    case hasParent:
      return <ExtensionIcon />
    case hasChildren:
      return <HiveIcon />
    case isStartedOnly: {
        return <ContentPasteIcon />
      // const fields: TForecastKeys[] = ['start', 'estimate', 'finish']
      // for (const key of fields) {
      //   if (!!job.forecast[key]) res += '❚'
      //   else res += '_'
      // }
      // return res
    }
    case isStartedAndEstimated: {
      return <ContentPasteSearchIcon />
    }
    case isFinished: {
      return <TaskAltIcon />
    }
    default:
      return <NewReleasesIcon />
  }
}

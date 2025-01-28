import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
// import SettingsIcon from '@mui/icons-material/Settings'
// import ConstructionIcon from '@mui/icons-material/Construction'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch'
import NewReleasesIcon from '@mui/icons-material/NewReleases'
import { TJob } from '~/shared/xstate'
// import stc from 'string-to-color'
// import invert from 'invert-color'

export const getIcon = ({ job }: { job: TJob }): string | React.ReactNode => {
  switch (true) {
    case typeof job.forecast.start === 'number'
      && typeof job.forecast.estimate === 'undefined'
      && typeof job.forecast.finish === 'undefined': {
        return <ContentPasteIcon />
      // const fields: TForecastKeys[] = ['start', 'estimate', 'finish']
      // for (const key of fields) {
      //   if (!!job.forecast[key]) res += '❚'
      //   else res += '_'
      // }
      // return res
    }
    case typeof job.forecast.start === 'number'
      && typeof job.forecast.estimate === 'number'
      && typeof job.forecast.finish === 'undefined': {
      return <ContentPasteSearchIcon />
    }
    case typeof job.forecast.start === 'number'
      && typeof job.forecast.estimate === 'number'
      && typeof job.forecast.finish === 'number': {
      return <WorkspacePremiumIcon />
    }
    default:
      return <NewReleasesIcon />
  }
}

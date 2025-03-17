import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied'
import ExploreIcon from '@mui/icons-material/Explore'
import ExploreOffIcon from '@mui/icons-material/ExploreOff'

export const ratingIcons: {
  [index: number]: {
    icon: React.ReactElement<unknown>;
    label: string;
  };
} = {
  6: {
    icon: <ExploreOffIcon color="error" fontSize='inherit' />,
    label: 'The most unpredictable',
  },
  5: {
    icon: <SentimentVeryDissatisfiedIcon color="error" fontSize='inherit' />,
    label: 'Extremely heavy',
  },
  4: {
    icon: <SentimentDissatisfiedIcon color="error" fontSize='inherit' />,
    label: 'Hard',
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" fontSize='inherit' />,
    label: 'Neutral',
  },
  2: {
    icon: <SentimentSatisfiedAltIcon color="success" fontSize='inherit' />,
    label: 'Lighter than usual',
  },
  1: {
    icon: <SentimentVerySatisfiedIcon color="success" fontSize='inherit' />,
    label: 'The easiest one',
  },
  0: {
    icon: <ExploreIcon color="success" fontSize='inherit' />,
    label: 'The most predictable',
  },
}

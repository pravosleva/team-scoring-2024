import { memo } from 'react'
import { styled } from '@mui/material/styles'
import Rating, { IconContainerProps, RatingProps } from '@mui/material/Rating'
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied'
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied'
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied'
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied'
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOffIcon from '@mui/icons-material/ExploreOff'

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

const customIcons: {
  [index: string]: {
    icon: React.ReactElement<unknown>;
    label: string;
  };
} = {
  6: {
    icon: <ExploreOffIcon color="error" fontSize='inherit' />,
    label: 'Very Dissatisfied',
  },
  5: {
    icon: <SentimentVeryDissatisfiedIcon color="error" fontSize='inherit' />,
    label: 'Very Dissatisfied',
  },
  4: {
    icon: <SentimentDissatisfiedIcon color="error" fontSize='inherit' />,
    label: 'Dissatisfied',
  },
  3: {
    icon: <SentimentSatisfiedIcon color="warning" fontSize='inherit' />,
    label: 'Neutral',
  },
  2: {
    icon: <SentimentSatisfiedAltIcon color="success" fontSize='inherit' />,
    label: 'Satisfied',
  },
  1: {
    icon: <SentimentVerySatisfiedIcon color="success" fontSize='inherit' />,
    label: 'Very Satisfied',
  },
  0: {
    icon: <ExploreIcon color="success" fontSize='inherit' />,
    label: 'Very Satisfied',
  },
}

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{customIcons[value].icon}</span>;
}

export const RadioGroupRating = memo((ps: RatingProps) => {
  return (
    <StyledRating
      name="highlight-selected-only"
      // defaultValue={2}
      {...ps}
      IconContainerComponent={IconContainer}
      // getLabelText={(value: number) => customIcons[value].label}
      highlightSelectedOnly
    />
  )
})

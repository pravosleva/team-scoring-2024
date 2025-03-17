import { memo } from 'react'
import { styled } from '@mui/material/styles'
import Rating, { IconContainerProps, RatingProps } from '@mui/material/Rating'
import { ratingIcons } from './ratingIcons'

const StyledRating = styled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

function IconContainer(props: IconContainerProps) {
  const { value, ...other } = props;
  return <span {...other}>{ratingIcons[value].icon}</span>;
}

export const RadioGroupRating = memo((ps: RatingProps) => {
  return (
    <StyledRating
      name="highlight-selected-only"
      // defaultValue={2}
      {...ps}
      IconContainerComponent={IconContainer}
      // getLabelText={(value: number) => ratingIcons[value].label}
      highlightSelectedOnly
    />
  )
})

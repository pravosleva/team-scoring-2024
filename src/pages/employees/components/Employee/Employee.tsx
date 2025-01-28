import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
} from '@mui/material'
import { TUser } from '~/shared/xstate'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { UserAva } from '~/shared/components/Job/components'
import dayjs from 'dayjs'

type TProps = {
  user: TUser;
  onDelete: () => void;
}

export const Employee = ({ user, onDelete }: TProps) => {
  const navigate = useNavigate()

  return (
    <ListItem
      secondaryAction={
        // <Checkbox
        //   edge="end"
        //   onChange={handleToggle(value)}
        //   checked={checked.includes(value)}
        //   inputProps={{ 'aria-labelledby': labelId }}
        // />
        <IconButton
          onClick={onDelete}
        >
          <DeleteIcon />
        </IconButton>
      }
      disablePadding
    >
      <ListItemButton
        onClick={() => navigate(`/employees/${user.id}`)}
      >
        <ListItemAvatar>
          {/* <Avatar
            alt={`Avatar n°${id}`}
            src={`/static/images/avatar/${value + 1}.jpg`}
          /> */}
          <UserAva
            name={user.displayName}
            size={40}
          />
        </ListItemAvatar>
        <ListItemText
          primary={user.displayName}
          sx={{
            mr: 1,
          }}
          secondary={`Created at ${dayjs(user.ts.create).format('DD.MM.YYYY')}`}
        />
      </ListItemButton>
    </ListItem>
  )
}

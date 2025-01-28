import { TUser } from '~/shared/xstate'

export const getTargetUserNameUI = ({ user }: {
  user: TUser | null;
}) => {
  return (user?.displayName || String(user?.id) || 'unknown user (incorrect user format)')
}

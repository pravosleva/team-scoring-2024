// import { TPointsetItem } from "~/shared/xstate";
import { TLocalSettingsStatusOption } from '~/pages/local-settings/types'

// export type TAuxLocalSettings = {
//   comment: string;
//   isReadOnly: boolean;
//   cfg: {
//     __poinsetStatusList: TPointsetItem[];
//   };
//   ts: {
//     createdAt: number;
//     updatedAt: number;
//   };
// };

export const getDefaultPointsetStatusListSpaceState = (): {
  [key: string]: TLocalSettingsStatusOption
} => {
  return ({
    initial: {
      label: 'Initial',
      emoji: ''
    }
  })
}

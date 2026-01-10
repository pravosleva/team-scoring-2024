import { createFastContext } from '~/shared/utils/createFastContext';

export const {
  Provider: CommonInfoProvider, useStore: useCommonInfoStore,
} = createFastContext<{
  loadedSize: number;
  requiredSize: number;
  errQuantityMessage: null | string;
  errTotalSizeMessage: null | string;
}>({
  loadedSize: 0,
  requiredSize: 0,
  errQuantityMessage: null,
  errTotalSizeMessage: null,
});

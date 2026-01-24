import { getHumanReadableSize } from '~/shared/utils/number-ops'

export type TIDBInfo = {
  used: {
    bytes: number;
    humanized: string;
    percentage: number;
    message: string;
  };
  total: {
    bytes: number;
    humanized: string;
  }
}

export async function getIndexedDbSize(): Promise<{
  ok: boolean;
  message?: string;
  result: null | TIDBInfo;
}> {
  try {
    if (!navigator.storage?.estimate)
      throw new Error('Storage Estimation API not supported in this browser')

    const quota = await navigator.storage.estimate();
    const usedSpace = quota.usage;
    const totalSpace = quota.quota;

    if (
      typeof usedSpace !== 'number'
      || typeof totalSpace !== 'number'
    )
      throw new Error('Internal error in ~/shared/utils/indexed-db-ops/getIndexedDbSize')

    // NOTE: Example
    // console.log(`Approximate used space: ${usedSpace} bytes`);
    // console.log(`Approximate total allocated space: ${totalSpace} bytes`);
    // console.log(`Percentage used: ${(usedSpace / totalSpace) * 100}%`);

    return Promise.resolve({
      ok: true,
      message: `Percentage used: ${(usedSpace / totalSpace) * 100}%`,
      result: {
        used: {
          bytes: usedSpace,
          humanized: getHumanReadableSize({ bytes: usedSpace, decimals: 2 }),
          percentage: (usedSpace / totalSpace) * 100,
          message: `Percentage used: ${(usedSpace / totalSpace) * 100}%`,
        },
        total: {
          bytes: totalSpace,
          humanized: getHumanReadableSize({ bytes: totalSpace, decimals: 2 }),
        }
      }
    })
  } catch (err) {
    return Promise.reject({
      ok: false,
      message: (err as Error)?.message || 'No err?.message',
      result: null,
    })
  }
}

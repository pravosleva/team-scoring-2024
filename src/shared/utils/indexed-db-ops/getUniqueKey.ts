type TProps = {
  jobId: number;
  logTs?: number;
  checklistItemId?: number;
}

export const getUniqueKey = ({ jobId, logTs, checklistItemId }: TProps): string => {
  let res = `[JOB_ID=${jobId}]`
  if (typeof logTs === 'number') {
    res += `[LOG_TS=${logTs}]`
    if (typeof checklistItemId === 'number')
      res += `[CHECKLIST_ITEM_ID=${checklistItemId}]`
  }
  return res
}

export const parseOldKey = (oldKey: string): TProps | null => {
  try {
    if (!oldKey.startsWith('job_id-')) return null;
    
    const parts = oldKey.split('--');
    const jobIdInfo = parts[0];
    const jobId = Number(jobIdInfo.split('-')?.[1]);
    
    if (Number.isNaN(jobId)) return null;

    const res: TProps = { jobId };

    const logTsInfo = parts[1];
    if (logTsInfo && logTsInfo.startsWith('log_ts-')) {
      const logTs = Number(logTsInfo.split('-')?.[1]);
      if (!Number.isNaN(logTs)) res.logTs = logTs;
    }

    const checklistItemIdInfo = parts[3];
    if (checklistItemIdInfo && checklistItemIdInfo.startsWith('checklist_item_id-')) {
      const checklistItemId = Number(checklistItemIdInfo.split('-')?.[1]);
      if (!Number.isNaN(checklistItemId)) res.checklistItemId = checklistItemId;
    }

    return res;
  } catch {
    return null;
  }
}

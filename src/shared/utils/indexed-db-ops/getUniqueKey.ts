type TProps = {
  jobId: number;
  logTs?: number;
  checklistItemId?: number;
}

// export const getUniqueKey = ({ jobId, logTs, checklistItemId }: TProps): string => {
//   let res = `job_id-${jobId}`
//   if (typeof logTs === 'number') {
//     res += `--log_ts-${logTs}`

//     if (typeof checklistItemId === 'number')
//       res += `--checklist--checklist_item_id--${checklistItemId}`
//   }

//   return res
// }

export const getUniqueKey = ({ jobId, logTs, checklistItemId }: TProps): string => {
  let res = `[JOB_ID=${jobId}]`
  if (typeof logTs === 'number') {
    res += `[LOG_TS=${logTs}]`

    if (typeof checklistItemId === 'number')
      res += `[CHECKLIST_ITEM_ID=${checklistItemId}]`
  }

  return res
}

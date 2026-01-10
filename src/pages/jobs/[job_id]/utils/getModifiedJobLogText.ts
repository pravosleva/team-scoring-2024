// import { getMatchedByRegExp } from '~/shared/utils'
import { getBinarySearchedValueByDotNotation2 } from '~/shared/utils/array-ops/search/getBinarySearchedValueByDotNotation2';
import { TJob, TUser } from '~/shared/xstate';

export const getModifiedJobLogText = ({ text, jobs, users }: {
  text: string;
  jobs: TJob[];
  users: TUser[];
}): string => {
  let result = text
  // const isMatched = getMatchedByRegExp({ tested: result, regexp: /(?<=\[)job=\d{13}(?=\])/g })

  const regex = /(?<=\[)(job|user)=\d{13}(?=\])/g
  const foundItems = text.match(regex)

  // console.log(foundItems)

  switch (true) {
    case Array.isArray(foundItems): {
      // TODO: Refactoring
      // const regexpGroups = foundItems
      //   .map((r) => [`(?=.*${r})`]);
      // const regexp = new RegExp(`^${regexpGroups.join('|')}.*$`, 'im');

      for (const foundItem of foundItems) {
        const [prefix, id] = foundItem.split('=')
        switch (true) {
          case prefix === 'job' && !Number.isNaN(Number(id)): {
            const targetJobId = Number(id)
            // const targetJob = jobs.find(({ id }) => id === targetJobId)
            const targetJob = getBinarySearchedValueByDotNotation2<TJob, TJob>({
              items: jobs,
              target: {
                path: '',
                critery: {
                  path: 'id',
                  value: targetJobId
                },
              },
              sorted: 'DESC',
            }).result
            if (!!targetJob)
              result = result.replace(`[${foundItem}]`, targetJob.title)
            break
          }
          case prefix === 'user' && !Number.isNaN(Number(id)): {
            const targetUserId = Number(id)
            const targetUser = users.find(({ id }) => id === targetUserId)
            if (!!targetUser)
              result = result.replace(`[${foundItem}]`, targetUser.displayName)
            break
          }
          default:
            break
        }
      }
      break
    }
    default:
      break
  }

  // if (!!foundJob && !!foundJob[0]) {
  //   const [prefix, jobId] = foundJob[0].split('=')
  //   if (prefix === 'job' && !Number.isNaN(Number(jobId))) {
  //     const targetJobId = Number(jobId)
  //     const targetJob = jobs.find(({ id }) => id === targetJobId)

  //     if (!!targetJob) {
  //       result = result.replace(regexJob, targetJob.title)
  //     }
  //   }
  // }

  return result
}

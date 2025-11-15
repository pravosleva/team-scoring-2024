## How to add Worker

1. Create new dir in `/public/workers/[your-folder]`
2. Boilerplate
3. Add new events in `/public/workers/utils/events/types.js` (See `NOTE: [EVENTS`)
4. Check compose fn in `withRootMW.js`
5. React (next steps)
6. Check `~/shared/utils/wws/types.ts` (add new events there)
7. Create your hook like `~/pages/worker-exp/hooks/useExperimentalWorker.ts`

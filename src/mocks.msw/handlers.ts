import { HttpResponse, http } from 'msw'

const exampleResolver = () => {
  console.log('-- RESOLVER for /api/example')
  return HttpResponse.json({ ok: true, message: 'Hello from ~/mocks/mswHandlers.ts' })
}

const exampleHandler = http.get('/mocks/api/example', exampleResolver)

export const handlers = [exampleHandler]

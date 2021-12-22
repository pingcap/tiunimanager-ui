import { setupWorker } from 'msw'

export function initMock() {
  const worker = setupWorker()
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

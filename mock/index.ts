import { setupWorker } from 'msw'
import platform from '@mock/platform'
import resources from '@mock/resources'
import instances from '@mock/instances'

export function initMock() {
  const worker = setupWorker(...platform, ...resources, ...instances)
  return worker.start({
    onUnhandledRequest: 'bypass',
  })
}

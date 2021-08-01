import { init as initI18n } from '@/i18n'
import { StrictMode } from 'react'
import { render } from 'react-dom'

export default async function bootstrap() {
  /*
   * Init i18n
   * */
  await initI18n()

  /*
   * Init Apps
   * */
  const Apps = prepareApps()

  /*
   * Mount Apps
   * */
  render(<StrictMode>{Apps}</StrictMode>, document.getElementById('root'))
}
import prepareApps from '@apps/index'

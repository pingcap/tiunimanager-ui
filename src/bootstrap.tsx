import { AntdI18nProvider, init as initI18n } from '@/i18n'
import { StrictMode } from 'react'
import { render } from 'react-dom'
import prepareApps from '@apps/index'
import { APIProvider } from '@/api/client'
import { wrap } from '@components-macro'

export default async function bootstrap() {
  /*
   * Init i18n
   * */
  await initI18n()

  /*
   * Init Apps
   * */
  const apps = prepareApps()

  /*
   * Mount Apps
   * */
  render(
    wrap(apps, AntdI18nProvider, APIProvider, StrictMode),
    document.getElementById('root')
  )
}

import { useCallback } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Space, Steps } from 'antd'
import { resolveRoute } from '@pages-macro'
import { useI18n } from '@i18n-macro'
import { useSystemState } from '@store/system'

import startImg from '/img/background/start.svg'
import styles from './index.module.less'

export default function () {
  const { t } = useI18n()
  const initInfo = useSystemState((state) => state.initInfo)
  const skipInit = useSystemState((state) => state.skipInit)

  const history = useHistory()

  const handleSkip = useCallback(() => {
    skipInit()
    history.push(resolveRoute('../'))
  }, [skipInit, history])

  const handleBegin = useCallback(() => {
    history.push(resolveRoute('config'))
  }, [history])

  return (
    <div className={styles.wrapper}>
      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>{t('header.title')}</div>
            <div className={styles.headerDesc}>{t('header.desc')}</div>
          </div>
          <Steps className={styles.content} direction="vertical">
            <Steps.Step
              className={styles.step}
              title={t('steps.dataCenter.title')}
              description={t('steps.dataCenter.desc')}
              status={
                initInfo.vendorZone && initInfo.vendorSpec ? 'finish' : 'wait'
              }
            />
            <Steps.Step
              title={t('steps.productComponent.title')}
              description={t('steps.productComponent.desc')}
              status={initInfo.productComponent ? 'finish' : 'wait'}
            />
            <Steps.Step
              title={t('steps.productVersion.title')}
              description={t('steps.productVersion.desc')}
              status={initInfo.productVersion ? 'finish' : 'wait'}
            />
          </Steps>
          <Space>
            <Button type="primary" onClick={handleBegin}>
              {t('actions.begin')}
            </Button>
            <Button type="link" onClick={handleSkip}>
              {t('actions.skip')}
            </Button>
          </Space>
        </div>
        <div className={styles.aside}>
          <img className={styles.bgImg} src={startImg} alt="Get Started" />
        </div>
      </div>
    </div>
  )
}

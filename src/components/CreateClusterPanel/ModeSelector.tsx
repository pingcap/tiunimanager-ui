import { Card } from 'antd'
import RadioCard from '@/components/RadioCard'
import { loadI18n, useI18n } from '@i18n-macro'
import styles from './index.module.less'

loadI18n()

export type FormMode = 'standard' | 'simple'

export type ModeSelectorProps = {
  mode: FormMode
  onChange: (newMode: FormMode) => unknown
}

export function ModeSelector({ mode, onChange }: ModeSelectorProps) {
  const { t } = useI18n()
  return (
    <div className={styles.modeSelector}>
      <Card title={t('modeSelector.title')}>
        <RadioCard
          checked={mode === 'simple'}
          title={t('modeSelector.simple.title')}
          description={t('modeSelector.simple.description')}
          onClick={() => {
            if (mode === 'simple') return
            onChange('simple')
          }}
        />
        <RadioCard
          checked={mode === 'standard'}
          disabled={true}
          title={t('modeSelector.standard.title')}
          description={t('modeSelector.standard.description')}
          onClick={() => {
            if (mode === 'standard') return
            onChange('standard')
          }}
        />
      </Card>
    </div>
  )
}

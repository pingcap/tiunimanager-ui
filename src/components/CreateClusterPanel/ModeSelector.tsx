/*
 * Copyright 2022 PingCAP
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
    <div className={styles.standardSelector}>
      <Card
        title={t('modeSelector.title')}
        bordered={false}
        bodyStyle={{
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
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

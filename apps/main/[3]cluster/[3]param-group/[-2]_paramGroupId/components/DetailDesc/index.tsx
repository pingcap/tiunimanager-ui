/*
 * Copyright 2022 PingCAP, Inc.
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

import { FC } from 'react'
import { TFunction } from 'react-i18next'
import { useI18n } from '@i18n-macro'
import {
  ParamGroupDBType,
  ParamGroupCreationType,
  ParamGroupScope,
  ParamGroupItem,
} from '@/api/model'
import { Descriptions } from 'antd'
import styles from './index.module.less'

const getTypeLabel = (t: TFunction<''>, type: ParamGroupCreationType) => {
  const mapping = {
    [ParamGroupCreationType.system]: 'system',
    [ParamGroupCreationType.custom]: 'custom',
  }
  const transKey = mapping[type]

  return transKey ? t(`model:paramGroup.type.${transKey}`) : t('label.unknown')
}

const getScopeLabel = (t: TFunction<''>, scope: ParamGroupScope) => {
  const mapping = {
    [ParamGroupScope.cluster]: 'cluster',
    [ParamGroupScope.instance]: 'instance',
  }
  const transKey = mapping[scope]

  return transKey ? t(`model:paramGroup.scope.${transKey}`) : t('label.unknown')
}

const getDBTypeLabel = (t: TFunction<''>, dbType: ParamGroupDBType) => {
  const mapping = {
    [ParamGroupDBType.tidb]: 'tidb',
    [ParamGroupDBType.dm]: 'dm',
  }
  const transKey = mapping[dbType]

  return transKey
    ? t(`model:paramGroup.dbType.${transKey}`)
    : t('label.unknown')
}

interface DetailDesc {
  data: ParamGroupItem
}

const DetailDesc: FC<DetailDesc> = ({ data }) => {
  const { t } = useI18n()

  return (
    <Descriptions
      className={styles.detailDesc}
      title={t('desc.title')}
      column={3}
    >
      <Descriptions.Item label={t('model:paramGroup.property.name')}>
        {data.name}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.type')}>
        {getTypeLabel(t, data.hasDefault!)}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.scope')}>
        {getScopeLabel(t, data.groupType!)}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.clusterSpec')}>
        {data.clusterSpec}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.dbType')}>
        {getDBTypeLabel(t, data.dbType!)}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.dbVersion')}>
        {data.clusterVersion}
      </Descriptions.Item>
      <Descriptions.Item label={t('model:paramGroup.property.desc')}>
        {data.note}
      </Descriptions.Item>
    </Descriptions>
  )
}

export default DetailDesc

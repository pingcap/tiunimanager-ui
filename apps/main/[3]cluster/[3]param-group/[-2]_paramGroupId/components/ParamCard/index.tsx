import { FC, useState, useMemo } from 'react'
import { ParamItemDetail } from '@/api/model'
import { Card } from 'antd'
import { TFunction } from 'react-i18next'
import { useI18n } from '@i18n-macro'
import type { ProColumns } from '@ant-design/pro-table'
import HeavyTable from '@/components/HeavyTable'
import { isArray } from '@/utils/types'
import styles from './index.module.less'
import { renderRange } from '../../../components/EditableParamCard/helper'

function getColumns(t: TFunction<''>) {
  const columns: ProColumns<ParamItemDetail>[] = [
    {
      title: t('model:clusterParam.property.category'),
      width: 140,
      dataIndex: 'category',
      key: 'category',
      fixed: 'left',
    },
    {
      title: t('model:clusterParam.property.name'),
      width: 220,
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
    },
    {
      title: t('model:clusterParam.property.reboot'),
      width: 80,
      dataIndex: 'hasReboot',
      key: 'reboot',
      render(_, record) {
        return record.hasReboot!
          ? t('model:clusterParam.reboot.true')
          : t('model:clusterParam.reboot.false')
      },
    },
    {
      title: t('model:clusterParam.property.range'),
      width: 200,
      key: 'range',
      renderText(_, record) {
        return isArray(record.range) && record.range.length > 0
          ? renderRange(record.range, record.rangeType!)
          : null
      },
    },
    {
      title: t('model:clusterParam.property.default'),
      width: 160,
      dataIndex: 'defaultValue',
      key: 'defaultValue',
    },
    {
      title: t('model:clusterParam.property.desc'),
      dataIndex: 'description',
      key: 'description',
    },
  ]
  return columns
}

const TableOptions = {
  density: false,
  fullScreen: false,
  setting: false,
  reload: false,
}

type ComponentParamMap = {
  [k: string]: ParamItemDetail[]
}

interface ParamCardProps {
  data: ParamItemDetail[]
}

const ParamCard: FC<ParamCardProps> = ({ data }) => {
  const componentParamMap = useMemo(() => {
    if (!Array.isArray(data)) {
      return {}
    }

    const hashmap = data.reduce((prev, item) => {
      const { instanceType: componentType = '' } = item

      if (!componentType) {
        return prev
      }

      if (!Array.isArray(prev[componentType])) {
        prev[componentType] = [item]
      } else {
        prev[componentType].push(item)
      }

      return prev
    }, {} as ComponentParamMap)

    return hashmap
  }, [data])

  const tabList = useMemo(
    () =>
      Object.keys(componentParamMap).map((name) => ({
        key: name,
        tab: name,
      })),
    [componentParamMap]
  )

  const { t, i18n } = useI18n()
  const columns = useMemo(() => getColumns(t), [i18n.language])

  const [activeTab, setActiveTab] = useState(tabList?.[0]?.key)

  if (!tabList.length) {
    // TODO
    // render Empty
    return null
  }

  return (
    <Card
      className={styles.paramCard}
      title={t('card.title')}
      size="small"
      tabList={tabList}
      tabProps={{ size: 'middle' }}
      bodyStyle={{ transform: 'translation()' }}
      onTabChange={(key) => {
        setActiveTab(key)
      }}
    >
      <HeavyTable
        dataSource={componentParamMap[activeTab]}
        tooltip={false}
        columns={columns}
        pagination={false}
        options={TableOptions}
        rowKey="paramId"
        scroll={{ x: 1200, y: 600 }}
      />
    </Card>
  )
}

export default ParamCard

import { FC } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryParamGroupDetail } from '@/api/hooks/param-group'
import DetailDesc from '../DetailDesc'
import ParamCard from '../ParamCard'
import styles from './index.module.less'

const DetailPanel: FC = () => {
  const { paramGroupId } = useParams<{ paramGroupId: string }>()
  const { data, isLoading, isError, error } = useQueryParamGroupDetail({
    id: paramGroupId,
  })
  const groupData = data?.data.data || {}
  const { params: paramData = [] } = groupData
  const isEmpty = !Object.keys(groupData).length

  if (isLoading) {
    return <>loading...</>
  }

  if (isError) {
    return <>{JSON.stringify(error)}</>
  }

  if (isEmpty) {
    return null
  }

  return (
    <div className={styles.detailPanel}>
      <DetailDesc data={groupData} />
      <ParamCard data={paramData} />
    </div>
  )
}

export default DetailPanel

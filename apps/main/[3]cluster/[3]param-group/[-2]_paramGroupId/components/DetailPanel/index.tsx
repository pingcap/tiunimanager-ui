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

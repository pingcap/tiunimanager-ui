import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import { useMemo } from 'react'
import { Desc } from './components/Desc'
import { ComponentList } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/[1]profile/components/ComponentList'

export default function () {
  const { info, topology } = useClusterContext()
  return useMemo(
    () => (
      <div>
        <Desc cluster={info!} />
        {/*TODO: display usage after monitor feature is done*/}
        <ComponentList nodes={topology!} />
      </div>
    ),
    [info]
  )
}

import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'
import { useMemo } from 'react'
import { Desc } from './components/Desc'
import { ComponentList } from '@apps/main/[3]cluster/[-2]_clusterId/[1]profile/components/ComponentList'

export default function () {
  const cluster = useClusterContext()
  return useMemo(
    () => (
      <div>
        <Desc cluster={cluster} />
        {/*TODO: display usage after monitor feature is done*/}
        {/*<Usage cluster={cluster} />*/}
        <ComponentList cluster={cluster} />
      </div>
    ),
    [cluster]
  )
}

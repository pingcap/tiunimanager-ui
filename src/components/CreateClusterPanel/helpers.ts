import {
  ClusterType,
  ClusterVersion,
  HardwareArch,
  KnowledgeOfClusterComponent,
  KnowledgeOfClusterType,
  RequestClusterCreate,
  ResourceTreeNode,
  ResourceUnitType,
} from '@/api/model'
import { useQueryKnowledge } from '@/api/hooks/knowledge'
import { useMemo } from 'react'
import { useQueryResourceHierarchy } from '@/api/hooks/resources'
import { message } from 'antd'
import { TFunction } from 'react-i18next'

export type KnowledgeMap = {
  types: ClusterType[]
  map: {
    [typeCode: string]: {
      versions: ClusterVersion[]
      map: {
        [versionCode: string]: {
          archTypes: string[]
          components: KnowledgeOfClusterComponent[]
        }
      }
    }
  }
}

const EmptyKnowledgeMap = { map: {}, types: [] }

export function transformKnowledgeMap(
  knowledge: KnowledgeOfClusterType[]
): KnowledgeMap {
  const typeMapToVersions: KnowledgeMap['map'] = Object.create(null)
  knowledge?.forEach((t) => {
    const versionMapToSpecs: KnowledgeMap['map'][string]['map'] =
      Object.create(null)
    t.versionSpecs!.forEach((s) => {
      versionMapToSpecs[s.clusterVersion!.code!] = {
        archTypes: s.archTypes!,
        components: s.componentSpecs!,
      }
    })
    typeMapToVersions[t.clusterType!.code!] = {
      versions: t.versionSpecs!.map((p) => p.clusterVersion!),
      map: versionMapToSpecs,
    }
  })
  return {
    types: knowledge?.map((t) => t.clusterType!) || [],
    map: typeMapToVersions,
  }
}

export function useKnowledgeMap() {
  const { data: knowledgeData, isLoading: isKnowledgeLoading } =
    useQueryKnowledge()

  return useMemo(() => {
    if (isKnowledgeLoading) return EmptyKnowledgeMap
    return transformKnowledgeMap(knowledgeData!.data.data!)
  }, [isKnowledgeLoading, knowledgeData])
}

export type AvailableStocksMap = {
  regions: string[]
  map: {
    [regionCode: string]: {
      name: string
      zones: string[]
      map: {
        [zoneCode: string]: {
          name: string
          racks: string[]
        }
      }
    }
  }
}

const EmptyAvailableStocksMap = { regions: [], map: {} }

export function transformAvailableStocksMap(
  tree: ResourceTreeNode
): AvailableStocksMap {
  const result: AvailableStocksMap = Object.create(null)
  result.regions = []
  result.map = Object.create(null)
  tree.SubNodes?.forEach((rs) => {
    // region layer
    result.regions.push(rs.Code!)
    const regionItem = Object.create(null)
    regionItem.name = rs.Name!
    regionItem.zones = []
    regionItem.map = Object.create(null)
    if (rs.SubNodes) {
      rs.SubNodes.forEach((zs) => {
        // zone layer
        regionItem.zones.push(zs.Code)
        regionItem.map[zs.Code!] = {
          name: zs.Name!,
          racks: zs.SubNodes?.map((ks) => ks.Code!) || [],
        }
      })
    }
    result.map[rs.Code!] = regionItem
  })
  return result
}

export function useAvailableStocks(arch: HardwareArch) {
  const { data: available, isLoading: isDomainsLoading } =
    useQueryResourceHierarchy({
      type: ResourceUnitType.region,
      depth: 1,
      arch,
    })
  return useMemo(
    () =>
      isDomainsLoading
        ? EmptyAvailableStocksMap
        : transformAvailableStocksMap(available!.data.data!.root!),
    [isDomainsLoading, available]
  )
}

export function allocateNodes(targetCount: number, zoneCount: number) {
  const every = Math.floor(targetCount / zoneCount)
  const rest = targetCount - zoneCount * every
  return Array.from(
    {
      length: zoneCount,
    },
    (_, i) => (i < rest ? every + 1 : every)
  )
}

export function processCreateRequest(
  value: RequestClusterCreate,
  knowledgeMap: KnowledgeMap,
  t: TFunction<''>
) {
  {
    // remove undefined
    value.resourceParameters!.instanceResource =
      value.resourceParameters!.instanceResource?.filter((r) => !!r) || []

    value.resourceParameters!.instanceResource!.forEach((comp) => {
      // remove count=0
      comp.resource = comp.resource!.filter((item) => item && item.count! > 0)
      // calculate totalCount
      comp.totalNodeCount = comp.resource!.reduce(
        (count, item) => count + item.count!,
        0
      )
    })
  }
  {
    // validate
    const specs =
      knowledgeMap!.map[value.clusterType!].map![value.clusterVersion!]
    for (const spec of specs.components) {
      const node = value.resourceParameters!.instanceResource!.find(
        (n) => n.componentType === spec.clusterComponent!.componentType
      )!
      const required = spec.componentConstraint!.componentRequired
      const minZone = spec.componentConstraint!.minZoneQuantity
      // check exist if required
      if (required) {
        if (node.totalNodeCount! === 0) {
          message.error(
            t('create.validation.miss', {
              name: spec.clusterComponent!.componentName,
            })
          )
          return false
        }
      }
      // check min zone quantity
      if (minZone) {
        if (node.resource!.length! < minZone) {
          message.error(
            t('create.validation.zone', {
              name: spec.clusterComponent!.componentName,
              count: minZone,
            })
          )
          return false
        }
      }
    }
  }
  return true
}

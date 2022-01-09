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
  _types: ClusterType[]
  types: {
    [typeCode: string]: {
      _versions: ClusterVersion[]
      versions: {
        [versionCode: string]: {
          archTypes: string[]
          components: KnowledgeOfClusterComponent[]
        }
      }
    }
  }
}

const EmptyKnowledgeMap = { types: {}, _types: [] }

export function transformKnowledgeMap(
  knowledge: KnowledgeOfClusterType[]
): KnowledgeMap {
  const typeMapToVersions: KnowledgeMap['types'] = Object.create(null)
  knowledge?.forEach((t) => {
    const versionMapToSpecs: KnowledgeMap['types'][string]['versions'] =
      Object.create(null)
    t.versionSpecs!.forEach((s) => {
      versionMapToSpecs[s.clusterVersion!.code!] = {
        archTypes: s.archTypes!,
        components: s.componentSpecs!,
      }
    })
    typeMapToVersions[t.clusterType!.code!] = {
      _versions: t.versionSpecs!.map((p) => p.clusterVersion!),
      versions: versionMapToSpecs,
    }
  })
  return {
    _types: knowledge?.map((t) => t.clusterType!) || [],
    types: typeMapToVersions,
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
  tree.subNodes?.forEach((rs) => {
    // region layer
    result.regions.push(rs.code!)
    const regionItem = Object.create(null)
    regionItem.name = rs.name!
    regionItem.zones = []
    regionItem.map = Object.create(null)
    if (rs.subNodes) {
      rs.subNodes.forEach((zs) => {
        // zone layer
        regionItem.zones.push(zs.code)
        regionItem.map[zs.code!] = {
          name: zs.name!,
          racks: zs.subNodes?.map((ks) => ks.code!) || [],
        }
      })
    }
    result.map[rs.code!] = regionItem
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
  knowledge: Knowledge,
  t: TFunction<''>
) {
  if (!value.vendorId || !value.region) return false
  {
    // remove undefined
    value.resourceParameters!.instanceResource =
      value.resourceParameters!.instanceResource?.filter((r) => !!r) || []

    value.resourceParameters!.instanceResource!.forEach((comp) => {
      // remove count=0
      comp.resource = comp.resource!.filter((item) => item && item.count! > 0)

      // FIXME: remove hardcode
      {
        comp.resource = comp.resource.map((item) => ({
          ...item,
          diskCapacity: 0,
          diskType: 'SATA',
          specCode: '4C8G',
        }))
      }

      // calculate totalCount
      comp.totalNodeCount = comp.resource!.reduce(
        (count, item) => count + item.count!,
        0
      )
    })
  }
  {
    // validate
    const components = Object.values(
      knowledge!.vendors[value.vendorId].regions[value.region].products[
        value.clusterType!
      ].versions[value.clusterVersion!].components
    )

    for (const comp of components) {
      const node = value.resourceParameters!.instanceResource!.find(
        (n) => n.componentType === comp.id
      )!
      if (!node) continue
      // check exist if required
      if (comp.required) {
        if (node.totalNodeCount! === 0) {
          message.error(
            t('create.validation.miss', {
              name: comp.name,
            })
          )
          return false
        }
        // check min zone quantity
        if (comp.minInstance) {
          if (node.resource!.length! < comp.minInstance) {
            message.error(
              t('create.validation.minZone', {
                name: comp.name,
                count: comp.minInstance,
              })
            )
            return false
          }
        }
      }
      // check max zone quantity
      if (comp.maxInstance) {
        if (node.resource!.length! > comp.maxInstance) {
          message.error(
            t('create.validation.maxZone', {
              name: comp.name,
              count: comp.maxInstance,
            })
          )
          return false
        }
      }
    }
  }
  return true
}

/**
 * FIXME: REMOVE THIS EVIL FAKE DATA
 */

export function useKnowledge() {
  return _fake_knowledge
}

export type VendorKnowledge = {
  id: string
  name: string
  _regions: string[]
  regions: {
    [regionId: string]: RegionKnowledge
  }
}

export type RegionKnowledge = {
  id: string
  name: string
  _products: string[]
  products: {
    [productId: string]: ProductKnowledge
  }
}

export type Knowledge = {
  _vendors: string[]
  vendors: {
    [vendorId: string]: VendorKnowledge
  }
}

export type ProductKnowledge = {
  id: string
  name: string
  internal: boolean
  status: string
  _versions: string[]
  versions: {
    [version: string]: VersionKnowledge
  }
}

export type VersionKnowledge = {
  name: string
  archs: string[]
  _components: string[]
  components: {
    [componentId: string]: ComponentKnowledge
  }
}

export type ComponentKnowledge = {
  id: string
  name: string
  maxInstance: number
  minInstance: number
  purposeType: string
  required: boolean
  _zones: string[]
  zones: {
    [zoneId: string]: ZoneKnowledge
  }
}

export type ZoneKnowledge = {
  id: string
  name: string
  _specs: string[]
  specs: {
    [specId: string]: SpecKnowledge
  }
}

export type SpecKnowledge = {
  id: string
  cpu: number
  memory: number
  diskType: string
}

const _fake_tidb_product: ProductKnowledge = {
  id: 'TiDB',
  name: 'TiDB',
  internal: false,
  status: 'Online',
  _versions: ['5.2.2', '5.1.0'],
  versions: {
    '5.2.2': {
      name: '5.2.2',
      archs: ['x86_64', 'ARM64'],
      _components: ['TiDB', 'TiKV', 'TiFlash', 'PD', 'TiCDC'],
      components: {
        TiDB: {
          id: 'TiDB',
          name: 'TiDB',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Compute',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: [
                'c2.g.large',
                'c2.g.xlarge',
                'c2.g.2xlarge',
                'c3.g.large',
                'c3.g.xlarge',
              ],
              specs: {
                'c2.g.large': {
                  id: 'c2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'c2.g.xlarge': {
                  id: 'c2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
                'c2.g.2xlarge': {
                  id: 'c2.g.2xlarge',
                  cpu: 16,
                  memory: 32,
                  diskType: 'SSD',
                },
                'c3.g.large': {
                  id: 'c3.g.large',
                  cpu: 8,
                  memory: 32,
                  diskType: 'SSD',
                },
                'c3.g.xlarge': {
                  id: 'c3.g.xlarge',
                  cpu: 16,
                  memory: 64,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        PD: {
          id: 'PD',
          name: 'PD',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Schedule',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['sd2.g.large', 'sd2.g.xlarge'],
              specs: {
                'sd2.g.large': {
                  id: 'sd2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'sd2.g.xlarge': {
                  id: 'sd2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiKV: {
          id: 'TiKV',
          name: 'TiKV',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Storage',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['s2.g.large', 's2.g.xlarge'],
              specs: {
                's2.g.large': {
                  id: 's2.g.large',
                  cpu: 8,
                  memory: 64,
                  diskType: 'SSD',
                },
                's2.g.xlarge': {
                  id: 's2.g.xlarge',
                  cpu: 16,
                  memory: 128,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiFlash: {
          id: 'TiFlash',
          name: 'TiFlash',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Storage',
          required: false,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['s2.g.large', 's2.g.xlarge'],
              specs: {
                's2.g.large': {
                  id: 's2.g.large',
                  cpu: 8,
                  memory: 64,
                  diskType: 'SSD',
                },
                's2.g.xlarge': {
                  id: 's2.g.xlarge',
                  cpu: 16,
                  memory: 128,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiCDC: {
          id: 'TiCDC',
          name: 'TiCDC',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Schedule',
          required: false,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['sd2.g.large', 'sd2.g.xlarge'],
              specs: {
                'sd2.g.large': {
                  id: 'sd2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'sd2.g.xlarge': {
                  id: 'sd2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
      },
    },
    '5.1.0': {
      name: '5.1.0',
      archs: ['x86_64', 'ARM64'],
      _components: ['TiDB', 'TiKV', 'TiFlash', 'PD', 'TiCDC'],
      components: {
        TiDB: {
          id: 'TiDB',
          name: 'TiDB',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Compute',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: [
                'c2.g.large',
                'c2.g.xlarge',
                'c2.g.2xlarge',
                'c3.g.large',
                'c3.g.xlarge',
              ],
              specs: {
                'c2.g.large': {
                  id: 'c2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'c2.g.xlarge': {
                  id: 'c2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
                'c2.g.2xlarge': {
                  id: 'c2.g.2xlarge',
                  cpu: 16,
                  memory: 32,
                  diskType: 'SSD',
                },
                'c3.g.large': {
                  id: 'c3.g.large',
                  cpu: 8,
                  memory: 32,
                  diskType: 'SSD',
                },
                'c3.g.xlarge': {
                  id: 'c3.g.xlarge',
                  cpu: 16,
                  memory: 64,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        PD: {
          id: 'PD',
          name: 'PD',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Schedule',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['sd2.g.large', 'sd2.g.xlarge'],
              specs: {
                'sd2.g.large': {
                  id: 'sd2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'sd2.g.xlarge': {
                  id: 'sd2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiKV: {
          id: 'TiKV',
          name: 'TiKV',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Storage',
          required: true,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['s2.g.large', 's2.g.xlarge'],
              specs: {
                's2.g.large': {
                  id: 's2.g.large',
                  cpu: 8,
                  memory: 64,
                  diskType: 'SSD',
                },
                's2.g.xlarge': {
                  id: 's2.g.xlarge',
                  cpu: 16,
                  memory: 128,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiFlash: {
          id: 'TiFlash',
          name: 'TiFlash',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Storage',
          required: false,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['s2.g.large', 's2.g.xlarge'],
              specs: {
                's2.g.large': {
                  id: 's2.g.large',
                  cpu: 8,
                  memory: 64,
                  diskType: 'SSD',
                },
                's2.g.xlarge': {
                  id: 's2.g.xlarge',
                  cpu: 16,
                  memory: 128,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
        TiCDC: {
          id: 'TiCDC',
          name: 'TiCDC',
          minInstance: 1,
          maxInstance: 10240,
          purposeType: 'Schedule',
          required: false,
          _zones: ['us-west-2'],
          zones: {
            'us-west-2': {
              id: 'us-west-2',
              name: 'us-west-2',
              _specs: ['sd2.g.large', 'sd2.g.xlarge'],
              specs: {
                'sd2.g.large': {
                  id: 'sd2.g.large',
                  cpu: 4,
                  memory: 8,
                  diskType: 'SSD',
                },
                'sd2.g.xlarge': {
                  id: 'sd2.g.xlarge',
                  cpu: 8,
                  memory: 16,
                  diskType: 'SSD',
                },
              },
            },
          },
        },
      },
    },
  },
}

const _fake_knowledge: Knowledge = {
  _vendors: ['AWS'],
  vendors: {
    AWS: {
      id: 'AWS',
      name: 'AWS',
      _regions: ['us-west'],
      regions: {
        'us-west': {
          id: 'us-west',
          name: 'us-west',
          _products: ['TiDB'],
          products: {
            TiDB: _fake_tidb_product,
          },
        },
      },
    },
  },
}

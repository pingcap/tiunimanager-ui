import {
  ParamGroupDBType,
  ProductStatus,
  RequestClusterCreate,
} from '@/api/model'
import { useMemo } from 'react'
import { message } from 'antd'
import { TFunction } from 'react-i18next'
import {
  useQueryProductDetail,
  useQueryProducts,
  useQueryZones,
} from '@/api/hooks/platform'
import { useQueryParamGroupList } from '@/api/hooks/param-group'
import { useQueryHostsList } from '@/api/hooks/resources'
import { mapObj } from '@/utils/obj'
import { isArray, isNumber } from '@/utils/types'

export function processCreateRequest(
  value: RequestClusterCreate,
  componentsKnowledge: ComponentKnowledge[],
  t: TFunction<''>
) {
  if (!value.vendor || !value.region) return false

  if (value.resourceParameters?.requestResourceMode === 'SpecificHost') {
    value.copies = (value.resourceParameters as any).manual.replica
    value.resourceParameters = {
      requestResourceMode: value.resourceParameters.requestResourceMode,
      instanceResource: value.resourceParameters.instanceResource?.map(
        (comp) => {
          const resourceForHost: ResourceForHost[] | undefined = (comp as any)
            .resourceForHost
          const resource = resourceForHost?.flatMap((host) => {
            return host.instances.map((el) => {
              const diskHashmap = el.diskId ? { diskId: el.diskId } : {}

              return {
                count: 1,
                zoneCode: host.zoneCode,
                hostIp: host.hostIp,
                specCode: el.specCode,
                diskType: host.diskType,
                ...diskHashmap,
              }
            })
          })

          return {
            componentType: comp.componentType,
            resource: resource || [],
          }
        }
      ),
    }
  }

  {
    // remove undefined
    value.resourceParameters!.instanceResource =
      value.resourceParameters!.instanceResource?.filter((r) => !!r) || []

    value.resourceParameters!.instanceResource!.forEach((comp) => {
      // remove count=0
      comp.resource = comp.resource!.filter((item) => item && item.count! > 0)
      // FIXME: remove zone id rewrite
      {
        comp.resource = comp.resource!.map((item) => ({
          ...item,
          zoneCode: `${value.region},${item.zoneCode}`,
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
    for (const comp of componentsKnowledge) {
      const node = value.resourceParameters!.instanceResource!.find(
        (n) => n.componentType === comp.id
      )!
      if (!node) continue

      if (node.totalNodeCount! < comp.minInstance) {
        message.error(
          t('create.validation.minZone', {
            name: comp.name,
            count: comp.minInstance,
          })
        )
        return false
      }

      if (node.totalNodeCount! > comp.maxInstance) {
        message.error(
          t('create.validation.maxZone', {
            name: comp.name,
            count: comp.maxInstance,
          })
        )
        return false
      }

      // FIXME: remove hard-coded validation for TiKV
      if (
        node.componentType === 'TiKV' &&
        node.totalNodeCount! < value.copies!
      ) {
        message.error(
          t('create.validation.storage.instanceLimit', {
            name: comp.name,
          })
        )
        return false
      }
    }
  }
  return true
}

export function useVendorsAndRegions() {
  const { data } = useQueryZones()
  const rawVendors = data?.data.data?.vendors

  return useMemo<VendorsKnowledge>(() => {
    const _vendors = rawVendors && Object.keys(rawVendors)
    const vendors =
      rawVendors &&
      mapObj(rawVendors, ({ id, name, regions: rawRegions }, vendorId) => {
        const _regions = rawRegions && Object.keys(rawRegions)
        const regions =
          rawRegions &&
          mapObj(rawRegions, ({ id, name }, regionId) => ({
            key: regionId as string,
            value: {
              id,
              name,
            } as RegionKnowledge,
          }))
        return {
          key: vendorId as string,
          value: {
            id,
            name,
            _regions: _regions || [],
            regions: regions || {},
          } as VendorKnowledge,
        }
      })
    return {
      _vendors: _vendors || [],
      vendors: vendors || {},
    }
  }, [rawVendors])
}

export function useProducts(vendorId?: string, regionId?: string) {
  const { data } = useQueryProducts(
    {
      vendorId,
      internalProduct: 0,
      status: ProductStatus.online,
    },
    { enabled: !!vendorId }
  )

  const rawRegions = data?.data.data?.products // region => product => arch => version

  return useMemo<ProductsKnowledge>(() => {
    if (!rawRegions || !regionId || !rawRegions[regionId])
      return {
        _products: [],
        products: {},
      }
    const rawProducts = rawRegions[regionId] // product => arch => version
    const _products = Object.keys(rawProducts)
    const products = mapObj(rawProducts, (rawArch, productId) => {
      const _archs = Object.keys(rawArch).sort((a, b) => {
        const result = [a, b].filter((el) => el.toLowerCase().includes('x86'))

        if (!result.length || result.length > 1) {
          return 0
        }

        const [target] = result

        return target === a ? -1 : 1
      })
      const archs = mapObj(rawArch, (_, arch) => ({
        key: arch as string,
        value: {
          id: arch,
          versions: Object.keys(rawArch[arch]),
        } as ArchKnowledge,
      }))
      return {
        key: productId as string,
        value: {
          id: productId,
          _archs,
          archs,
        } as ProductKnowledge,
      }
    })
    return {
      _products,
      products,
    }
  }, [rawRegions, regionId])
}

export function useComponents(
  vendorId?: string,
  regionId?: string,
  productId?: string,
  version?: string,
  arch?: string
) {
  const { data } = useQueryProductDetail(
    {
      vendorId,
      regionId,
      productId,
      internalProduct: 0,
      status: ProductStatus.online,
    },
    { enabled: !!productId }
  )
  return useMemo<ComponentKnowledge[]>(() => {
    const rawComponents =
      data?.data?.data?.products?.[productId!]?.versions?.[version!]?.arch?.[
        arch!
      ]
    if (!productId || !version || !arch || !rawComponents) return []

    return rawComponents.map((comp) => {
      const {
        id,
        name,
        maxInstance,
        minInstance,
        purposeType,
        suggestedInstancesCount,
        availableZones,
      } = comp
      return {
        id: id!,
        name: name!,
        maxInstance: maxInstance!,
        minInstance: minInstance!,
        purposeType: purposeType!,
        suggestedInstancesCount: suggestedInstancesCount || [],
        zones:
          availableZones?.map((zone) => ({
            id: zone.zoneId!,
            name: zone.zoneName!,
            specs: (zone.specs as SpecKnowledge[]) || [],
          })) || [],
      }
    })
  }, [data, regionId, productId, version, arch])
}

/**
 * Hook for getting parameter groups for the cluster
 * @param productType database type. e.g. TiDB
 * @param productVersion database version. e.g. v5.2.2
 */
export function useParamGroups(productType?: string, productVersion?: string) {
  const dbTypeHashmap: { [k: string]: ParamGroupDBType } = {
    TiDB: ParamGroupDBType.tidb,
    DM: ParamGroupDBType.dm,
  }
  const dbType = productType ? dbTypeHashmap[productType] : undefined

  const dbVersion = productVersion?.match(/v\d+\.\d+/)?.[0]

  const { data: response, isLoading } = useQueryParamGroupList(
    {
      dbType,
      dbVersion,
    },
    {
      enabled: !!dbType && !!dbVersion,
      refetchOnWindowFocus: false,
    }
  )
  const data = response?.data.data

  const ret = useMemo(
    () =>
      data?.map((el) => ({
        id: el.paramGroupId!,
        name: el.name!,
      })) || [],
    [data]
  )

  return {
    paramGroups: ret,
    isLoading,
  }
}

export function useHostOptions(
  regionId?: string,
  arch?: string,
  purpose?: string,
  zones?: ZoneKnowledge[]
) {
  const { data, isLoading } = useQueryHostsList(
    {
      region: regionId,
      arch,
    },
    {
      enabled: !!regionId && !!arch,
      refetchOnWindowFocus: false,
    }
  )

  const rawHostList = useMemo(() => {
    const hosts = data?.data.data?.hosts

    return isArray(hosts) && hosts.length ? hosts : []
  }, [data?.data.data?.hosts])

  const validHostList = useMemo(() => {
    return rawHostList.filter(
      (host) =>
        host.status === 'Online' &&
        host.loadStat &&
        ['loadless', 'inused'].includes(host.loadStat.toLowerCase()) &&
        isNumber(host.availableDiskCount) &&
        host.availableDiskCount > 0 &&
        host.purpose?.includes(purpose || '')
    )
  }, [purpose, rawHostList])

  const { zonesWithHosts, hostsForZones } = useMemo(() => {
    const hostDiskTypes = validHostList
      .map((host) => host.diskType)
      .filter((diskType) => diskType)
    const hostDiskTypeSet = new Set(hostDiskTypes as string[])

    const zonesWithHosts = zones
      ?.map((zone) => {
        const specDiskTypes = zone.specs.map((spec) => spec.diskType)

        return {
          id: zone.id,
          name: zone.name,
          hosts: validHostList.filter(
            (host) =>
              host.az === zone.id &&
              host.diskType &&
              specDiskTypes.includes(host.diskType)
          ),
          specs: zone.specs.filter((spec) =>
            hostDiskTypeSet.has(spec.diskType)
          ),
        }
      })
      .filter((zone) => zone.hosts.length > 0 && zone.specs.length > 0)

    const hostsForZones = zonesWithHosts?.flatMap((zone) => zone.hosts)

    return {
      zonesWithHosts: zonesWithHosts || [],
      hostsForZones: hostsForZones || [],
    }
  }, [zones, validHostList])

  return {
    loading: isLoading,
    rawHostList,
    zonesWithHosts,
    hostsForZones,
  }
}

export type VendorKnowledge = {
  id: string
  name: string
} & RegionsKnowledge

export type VendorsKnowledge = {
  _vendors: string[]
  vendors: {
    [vendorId: string]: VendorKnowledge
  }
}

export type RegionKnowledge = {
  id: string
  name: string
}

export type RegionsKnowledge = {
  _regions: string[]
  regions: {
    [regionId: string]: RegionKnowledge
  }
}

export type ProductKnowledge = {
  id: string
} & ArchsKnowledge

export type ProductsKnowledge = {
  _products: string[]
  products: {
    [productId: string]: ProductKnowledge
  }
}

export type ArchKnowledge = {
  id: string
  versions: string[]
}

export type ArchsKnowledge = {
  _archs: string[]
  archs: {
    [arch: string]: ArchKnowledge
  }
}

export type ComponentKnowledge = {
  id: string
  name: string
  maxInstance: number
  minInstance: number
  purposeType: string
  suggestedInstancesCount: number[]
  zones: ZoneKnowledge[]
}

export type ZoneKnowledge = {
  id: string
  name: string
  specs: SpecKnowledge[]
}

export type SpecKnowledge = {
  id: string
  cpu: number
  memory: number
  diskType: string
  zoneId: string
  zoneName: string
}

export type ResourceForHost = {
  zoneCode: string
  zoneLabel: string
  hostId?: string
  hostIp: string
  hostLabel: string
  diskType: string
  instances: {
    specCode: string
    diskId?: string
    existing?: boolean
  }[]
}

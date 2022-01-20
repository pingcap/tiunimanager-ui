import { ProductStatus, RequestClusterCreate } from '@/api/model'
import { useMemo } from 'react'
import { message } from 'antd'
import { TFunction } from 'react-i18next'
import {
  useQueryProductDetail,
  useQueryProducts,
  useQueryZones,
} from '@/api/hooks/platform'
import { mapObj } from '@/utils/obj'

export function processCreateRequest(
  value: RequestClusterCreate,
  componentsKnowledge: ComponentKnowledge[],
  t: TFunction<''>
) {
  if (!value.vendor || !value.region) return false
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
    }
  }
  return true
}

export function useVendorsAndRegions() {
  const { data } = useQueryZones()
  return useMemo<VendorsKnowledge>(() => {
    const rawVendors = data?.data.data?.vendors
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
  }, [data])
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
  return useMemo<ProductsKnowledge>(() => {
    const rawRegions = data?.data.data?.products // region => product => arch => version
    if (!rawRegions || !regionId)
      return {
        _products: [],
        products: {},
      }
    const rawProducts = rawRegions[regionId] // product => arch => version
    const _products = Object.keys(rawProducts)
    const products = mapObj(rawProducts, (rawArch, productId) => {
      const _archs = Object.keys(rawArch)
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
  }, [data, vendorId, regionId])
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
  }, [data, vendorId, regionId])
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
}

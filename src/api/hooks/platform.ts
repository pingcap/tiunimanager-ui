import { APIS } from '@/api/client'
import { UserLoginRequest } from '@/api/model'
import { PartialUseQueryOptions } from '@/api/hooks/utils'
import { useQuery } from 'react-query'

export function doUserLogin(payload: UserLoginRequest) {
  return APIS.Platform.userLoginPost(payload, {
    skipNotifications: true,
  })
}

export function doUserLogout() {
  return APIS.Platform.userLogoutPost({
    skipNotifications: true,
  })
}

const CACHE_ZONES = 'platform-zones'

export function useQueryZones(options?: PartialUseQueryOptions) {
  return useQuery([CACHE_ZONES], () => APIS.Platform.zonesGet(), {
    cacheTime: Infinity,
    staleTime: Infinity,
    ...options,
  })
}

const CACHE_PRODUCTS = 'platform-products'

export function useQueryProducts(
  payload: {
    internalProduct?: number
    status?: string
    vendorId?: string
  },
  options?: PartialUseQueryOptions
) {
  const { internalProduct, status, vendorId } = payload
  return useQuery(
    [CACHE_PRODUCTS, vendorId, internalProduct, status],
    () => APIS.Platform.productsGet(internalProduct, status, vendorId),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    }
  )
}

const CACHE_PRODUCT_DETAIL = 'platform-product-detail'

export function useQueryProductDetail(
  payload: {
    internalProduct?: number
    productId?: string
    regionId?: string
    status?: string
    vendorId?: string
  },
  options?: PartialUseQueryOptions
) {
  const { internalProduct, status, vendorId, productId, regionId } = payload
  return useQuery(
    [
      CACHE_PRODUCT_DETAIL,
      productId,
      regionId,
      internalProduct,
      status,
      vendorId,
    ],
    () =>
      APIS.Platform.productsDetailGet(
        internalProduct,
        productId,
        regionId,
        status,
        vendorId
      ),
    {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    }
  )
}

;(window as any).useQueryZones = APIS.Platform.zonesGet.bind(APIS.Platform)
;(window as any).useQueryProducts = APIS.Platform.productsGet.bind(
  APIS.Platform
)
;(window as any).useQueryProductDetail = APIS.Platform.productsDetailGet.bind(
  APIS.Platform
)

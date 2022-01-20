import { APIS } from '@/api/client'
import { ProductStatus, UserLoginRequest } from '@/api/model'
import { PartialUseQueryOptions, withRequestId } from '@/api/hooks/utils'
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
  return withRequestId((requestId) =>
    useQuery([CACHE_ZONES], () => APIS.Platform.zonesTreeGet({ requestId }), {
      cacheTime: Infinity,
      staleTime: Infinity,
      ...options,
    })
  )
}

const CACHE_PRODUCTS = 'platform-products'

export type QueryProductsParams = {
  internalProduct?: number
  status?: ProductStatus
  vendorId?: string
}

export function useQueryProducts(
  payload: QueryProductsParams,
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

export type QueryProductDetailParams = {
  internalProduct?: number
  productId?: string
  regionId?: string
  status?: ProductStatus
  vendorId?: string
}

export function useQueryProductDetail(
  payload: QueryProductDetailParams,
  options?: PartialUseQueryOptions
) {
  const { internalProduct, status, vendorId, productId, regionId } = payload
  return withRequestId((requestId) =>
    useQuery(
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
          vendorId,
          { requestId }
        ),
      {
        cacheTime: Infinity,
        staleTime: Infinity,
        ...options,
      }
    )
  )
}

;(window as any).useQueryZones = APIS.Platform.zonesTreeGet.bind(APIS.Platform)
;(window as any).useQueryProducts = APIS.Platform.productsGet.bind(
  APIS.Platform
)
;(window as any).useQueryProductDetail = APIS.Platform.productsDetailGet.bind(
  APIS.Platform
)

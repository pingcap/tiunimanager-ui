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
    useQuery(
      [CACHE_ZONES],
      () => APIS.Vendor.vendorsAvailableGet({ requestId }),
      {
        cacheTime: Infinity,
        staleTime: Infinity,
        ...options,
      }
    )
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
    () => APIS.Product.productsAvailableGet(internalProduct, status, vendorId),
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
        APIS.Product.productsDetailGet(
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

;(window as any).useQueryZones = APIS.Vendor.vendorsAvailableGet.bind(
  APIS.Vendor
)
;(window as any).useQueryProducts = APIS.Product.productsAvailableGet.bind(
  APIS.Product
)
;(window as any).useQueryProductDetail = APIS.Product.productsDetailGet.bind(
  APIS.Product
)

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

import { QueryClient, useMutation, useQuery } from 'react-query'
import {
  PartialUseQueryOptions,
  PayloadWithOptions,
  withRequestId,
} from '@/api/hooks/utils'
import { APIS, axiosInstance } from '@/api/client'
import {
  DataCenterItemInfo,
  ProductItemInfo,
  ProductStatus,
  UserLoginRequest,
} from '@/api/model'

export function doUserLogin(payload: UserLoginRequest) {
  // return axiosInstance.get('/api/v1/test')
  return APIS.Platform.userLoginPost(payload, {
    skipNotifications: true,
  })
}

export function doUserLogout() {
  return APIS.Platform.userLogoutPost({
    skipNotifications: true,
  })
}

export function resetUserPassword(payload: {
  userId: string
  password: string
}) {
  return APIS.Platform.usersUserIdPasswordPost(
    payload.userId,
    { id: payload.userId, password: payload.password },
    { skipNotifications: true }
  )
}

/**************
 * System Info
 **************/

/**
 * The query cache key for the system info
 */
const CACHE_SYSTEM_INFO = 'system-info'

/**
 * Hook for querying the system info
 * @param options useQuery options
 */
export function useQuerySystemInfo(options?: PartialUseQueryOptions) {
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_SYSTEM_INFO],
      () => APIS.Platform.systemInfoGet(true, { requestId }),
      {
        cacheTime: Infinity,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
        ...options,
      }
    )
  )
}

export async function invalidateSystemInfo(client: QueryClient) {
  await client.invalidateQueries(CACHE_SYSTEM_INFO)
}

/**************
 * Data Center
 **************/

/**
 * The query cache key for the data center configs
 */
const CACHE_DATA_CENTER_CONFIG = 'data-center-config'

/**
 * Hook for querying the data center configs
 * @param options useQuery options
 */
export function useQueryDataCenterConfig(
  query?: { vendors: string[] },
  options?: PartialUseQueryOptions
) {
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_DATA_CENTER_CONFIG, query?.vendors],
      () => APIS.Vendor.vendorsGet(query?.vendors, { requestId }),
      {
        refetchOnWindowFocus: false,
        ...options,
      }
    )
  )
}

/**
 * Update the data center configs
 * @param payload updating payload
 */
const updateDataCenterConfig = ({
  payload,
  options,
}: PayloadWithOptions<DataCenterItemInfo[]>) =>
  APIS.Vendor.vendorsPost(
    {
      vendors: payload,
    },
    options
  )

/**
 * Hook for updating the data center configs
 */
export function useUpdateDataCenterConfig() {
  return useMutation(updateDataCenterConfig)
}

/**************
 * Products
 **************/

/**
 * The query cache key for the product configs
 */
const CACHE_PRODUCT_CONFIG = 'product-config'

/**
 * Hook for querying the product configs
 * @param options useQuery options
 */
export function useQueryProductConfig(
  query?: { products: string[] },
  options?: PartialUseQueryOptions
) {
  return withRequestId((requestId) =>
    useQuery(
      [CACHE_PRODUCT_CONFIG, query?.products],
      () => APIS.Product.productsGet(query?.products, { requestId }),
      {
        refetchOnWindowFocus: false,
        ...options,
      }
    )
  )
}

/**
 * Update the product configs
 * @param payload update payload
 */
const updateProductConfig = ({
  payload,
  options,
}: PayloadWithOptions<ProductItemInfo[]>) =>
  APIS.Product.productsPost(
    {
      products: payload,
    },
    options
  )

/**
 * Hook for updating the product configs
 */
export function useUpdateProductConfig() {
  return useMutation(updateProductConfig)
}

/******************
 * [Deprecated]
 * Zones, Products
 ******************/

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

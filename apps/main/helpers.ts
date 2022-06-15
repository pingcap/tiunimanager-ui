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

import { useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useSystemState } from '@store/system'
import { useQuerySystemInfo } from '@/api/hooks/platform'
import { resolveRoute } from '@pages-macro'

/**
 * Hook for fetching system info
 * and updating system info state
 */
export function useSystemInfo() {
  const { data, isLoading: loading } = useQuerySystemInfo()
  const info = data?.data.data?.info
  const updInitInfo = useSystemState((state) => state.updInitInfo)
  const initForced = useSystemState((state) => state.initForced)
  const updInitOptions = useSystemState((state) => state.updInitOptions)

  const { initInfo, initStatus } = useMemo(() => {
    const {
      vendorZonesInitialized,
      vendorSpecsInitialized,
      productComponentsInitialized,
      productVersionsInitialized,
    } = info || {}

    const initInfo = {
      vendorZone: !!vendorZonesInitialized,
      vendorSpec: !!vendorSpecsInitialized,
      productComponent: !!productComponentsInitialized,
      productVersion: !!productVersionsInitialized,
    }

    const initStatus = Object.values(initInfo).every((el) => el)

    return {
      initInfo,
      initStatus,
    }
  }, [
    info?.vendorZonesInitialized,
    info?.vendorSpecsInitialized,
    info?.productComponentsInitialized,
    info?.productVersionsInitialized,
  ])

  const initOptions = useMemo(() => {
    const { supportedProducts = [], supportedVendors = [] } = info || {}

    const prodVersions = supportedProducts
      ?.map((product) => product.versions)
      .flat()

    return {
      vendors: supportedVendors,
      prodVersions,
    }
  }, [info?.supportedProducts, info?.supportedVendors])

  useEffect(() => {
    if (loading) {
      return
    }

    updInitInfo(initInfo)
  }, [loading, initInfo, updInitInfo])

  useEffect(() => {
    if (loading) {
      return
    }

    updInitOptions(initOptions as any)
  }, [loading, initOptions, updInitOptions])

  return {
    loading,
    initStatus,
    initForced,
  }
}

/**
 * Hook for getting started
 */
export function useGetStarted() {
  const location = useLocation()
  const startPath = resolveRoute('start')
  const isAtStart = location.pathname.includes(startPath)
  const isWhiteRoute = location.pathname === '/login'

  const { loading, initStatus, initForced } = useSystemInfo()

  const forcedToStart =
    !loading && initForced && !initStatus && !isAtStart && !isWhiteRoute

  return {
    loading,
    isAtStart,
    startPath,
    forcedToStart,
  }
}

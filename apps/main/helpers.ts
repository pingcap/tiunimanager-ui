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

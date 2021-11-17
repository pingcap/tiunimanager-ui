import axios, { AxiosInstance } from 'axios'
import {
  ClusterApi,
  ClusterBackupApi,
  ClusterDataTransportApi,
  ClusterExportApi,
  ClusterImportApi,
  ClusterParamsApi,
  Configuration,
  KnowledgeApi,
  LogsApi,
  PlatformApi,
  ResourceApi,
  TaskApi,
} from '#/api'
import { readonly } from '@/utils/obj'
import { createElement, FC } from 'react'
import { QueryClient, QueryClientProvider, UseQueryOptions } from 'react-query'
import { initModelTranslations } from './model'
import { getEnvState, subscribeEnv } from '@store/env'

function initAxios() {
  const instance = axios.create()
  // TODO: add interceptors
  return instance
}

function buildBasePath(
  basePath: string,
  protocol: 'http' | 'https',
  tlsPort: number
) {
  return protocol === 'https'
    ? `https://${location.hostname}:${tlsPort}${basePath}`
    : basePath
}

function initApis(basePath: string, axiosInstance: AxiosInstance) {
  const { tlsPort, protocol } = getEnvState()
  const configuration = new Configuration({
    basePath: buildBasePath(basePath, protocol, tlsPort),
  })
  subscribeEnv((env) => {
    configuration.basePath = buildBasePath(basePath, env.protocol, env.tlsPort)
  })

  initModelTranslations()

  return readonly({
    Platform: new PlatformApi(configuration, undefined, axiosInstance),
    Resources: new ResourceApi(configuration, undefined, axiosInstance),
    Clusters: new ClusterApi(configuration, undefined, axiosInstance),
    ClustersImport: new ClusterImportApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClustersExport: new ClusterExportApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClusterParams: new ClusterParamsApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClusterBackups: new ClusterBackupApi(
      configuration,
      undefined,
      axiosInstance
    ),
    Knowledge: new KnowledgeApi(configuration, undefined, axiosInstance),
    Task: new TaskApi(configuration, undefined, axiosInstance),
    Logs: new LogsApi(configuration, undefined, axiosInstance),
    Transport: new ClusterDataTransportApi(
      configuration,
      undefined,
      axiosInstance
    ),
  })
}

export const basePath = import.meta.env.VITE_API_BASE_URL

export const axiosInstance = initAxios()

export const APIS = initApis(basePath, axiosInstance)

const TokenHeader = 'Authorization'

export function setRequestToken(token?: string) {
  if (!token) delete axiosInstance.defaults.headers[TokenHeader]
  axiosInstance.defaults.headers[TokenHeader] = `Bearer ${token}`
}

export const APIProvider: FC = ({ children }) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, children)

export type PartialUseQueryOptions = Pick<
  UseQueryOptions,
  | 'cacheTime'
  | 'enabled'
  | 'staleTime'
  | 'keepPreviousData'
  | 'suspense'
  | 'refetchInterval'
  | 'refetchIntervalInBackground'
  | 'refetchOnWindowFocus'
  | 'refetchOnReconnect'
  | 'refetchOnMount'
  | 'retryOnMount'
>

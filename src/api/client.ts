import { loadTranslations } from '@/i18n'
import axios, { AxiosInstance } from 'axios'
import {
  ClusterApi,
  ClusterBackupApi,
  ClusterExportApi,
  ClusterImportApi,
  ClusterParamsApi,
  Configuration,
  KnowledgeApi,
  PlatformApi,
  ResourceApi,
} from '#/api'
import { readonly } from '@/utils/obj'
import { createElement, FC } from 'react'
import { QueryClient, QueryClientProvider, UseQueryOptions } from 'react-query'

function initAxios() {
  loadTranslations(import.meta.globEager('./translations/*.yaml'), 'api')

  const instance = axios.create()
  // TODO: add interceptors
  return instance
}

function initApis(basePath: string, axiosInstance: AxiosInstance) {
  const configuration = new Configuration({
    basePath,
    // TODO: use API Key
    apiKey: '',
    baseOptions: {},
  })

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

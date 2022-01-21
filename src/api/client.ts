import axios, { AxiosInstance } from 'axios'
import { readonly } from '@/utils/obj'
import { createElement, FC } from 'react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { initModelTranslations } from './model'
import { getEnvState, subscribeEnv } from '@store/env'
import { initTaskTranslations } from './task'
import {
  ClusterApi,
  ClusterBackupApi,
  ClusterDataTransportApi,
  ClusterExportApi,
  ClusterImportApi,
  ClusterLogApi,
  ClusterParametersApi,
  ChangeFeedApi as ClusterDataReplicationApi,
  ParameterGroupApi,
  Configuration,
  KnowledgeApi,
  PlatformApi,
  ResourceApi,
  TaskApi,
} from '#/api'
import { onErrorResponse, onSuccessResponse } from '@/api/interceptors'
import { initErrorTranslations } from '#/error'

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
  axiosInstance.interceptors.response.use(onSuccessResponse, onErrorResponse)

  const { tlsPort, protocol } = getEnvState()
  const configuration = new Configuration({
    basePath: buildBasePath(basePath, protocol, tlsPort),
  })
  subscribeEnv((env) => {
    configuration.basePath = buildBasePath(basePath, env.protocol, env.tlsPort)
  })

  initModelTranslations()
  initTaskTranslations()
  initErrorTranslations()

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
    ClusterParams: new ClusterParametersApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClusterBackups: new ClusterBackupApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClusterDataReplication: new ClusterDataReplicationApi(
      configuration,
      undefined,
      axiosInstance
    ),
    Knowledge: new KnowledgeApi(configuration, undefined, axiosInstance),
    Task: new TaskApi(configuration, undefined, axiosInstance),
    Logs: new ClusterLogApi(configuration, undefined, axiosInstance),
    Transport: new ClusterDataTransportApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ParamGroup: new ParameterGroupApi(configuration, undefined, axiosInstance),
  })
}

export const apiBasePath = import.meta.env.VITE_API_BASE_URL
export const fsBasePath = import.meta.env.VITE_FS_BASE_URL

export const axiosInstance = axios.create()

export const APIS = initApis(apiBasePath, axiosInstance)

const TokenHeader = 'Authorization'

export function setRequestToken(token?: string) {
  if (!token) {
    delete axiosInstance.defaults.headers[TokenHeader]
  } else {
    axiosInstance.defaults.headers[TokenHeader] = `Bearer ${token}`
  }
}

export const APIProvider: FC = ({ children }) =>
  createElement(QueryClientProvider, { client: new QueryClient() }, children)

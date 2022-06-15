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
  ClusterUpgradeApi,
  SwitchoverApi as ClusterRoleSwitchoverApi,
  ParameterGroupApi,
  VendorApi,
  ProductApi,
  PlatformApi,
  ResourceApi,
  TaskApi,
  Configuration,
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
    Vendor: new VendorApi(configuration, undefined, axiosInstance),
    Product: new ProductApi(configuration, undefined, axiosInstance),
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
    ClusterUpgrade: new ClusterUpgradeApi(
      configuration,
      undefined,
      axiosInstance
    ),
    ClusterRoleSwitchover: new ClusterRoleSwitchoverApi(
      configuration,
      undefined,
      axiosInstance
    ),
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

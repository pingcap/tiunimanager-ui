import { loadTranslations } from '@/i18n'
import axios, { AxiosInstance } from 'axios'
import { Configuration, InstanceApi, PlatformApi, ResourceApi } from '#/api'
import { readonly } from '@/utils/obj'

function initAxios() {
  loadTranslations(import.meta.globEager('./translations/*.yaml'))

  const instance = axios.create()

  // TODO: add interceptors

  return instance
}

function initApis(basePath: string, axiosInstance: AxiosInstance) {
  const configuration = new Configuration({
    basePath,
    // TODO: add API Key
    apiKey: '',
    baseOptions: {},
  })

  return readonly({
    Platform: new PlatformApi(configuration, undefined, axiosInstance),
    Resource: new ResourceApi(configuration, undefined, axiosInstance),
    Instance: new InstanceApi(configuration, undefined, axiosInstance),
  })
}

export const basePath = import.meta.env.VITE_API_BASE_URL

export const axiosInstance = initAxios()

export const APIS = initApis(basePath, axiosInstance)

import { axiosInstance } from '../client'

export function getDbMeta(payload: { clusterId: string }) {
  return axiosInstance.get(`/api/v1/clusters/${payload.clusterId}/meta`)
}

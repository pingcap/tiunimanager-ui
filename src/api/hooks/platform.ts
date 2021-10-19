import { APIS } from '@/api/client'
import { UserLoginRequest } from '@/api/model'
import axios, { AxiosError, AxiosResponse } from 'axios'

type DoRequestResult<T> =
  | { type: 'Result'; data: T }
  | { type: 'AxiosError'; err: AxiosError<T> }
  | { type: 'Error'; err: Error }
  | { type: 'Unknown'; err: unknown }

export async function doRequestWithError<T>(
  request: () => Promise<AxiosResponse<T>>
): Promise<DoRequestResult<T>> {
  try {
    const resp = await request()
    return { type: 'Result', data: resp.data }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      // Access to config, request, and response
      return { type: 'AxiosError', err }
    } else if (err instanceof Error) {
      return { type: 'Error', err }
    } else {
      return { type: 'Unknown', err }
    }
  }
}

export async function doUserLogin(payload: UserLoginRequest) {
  return doRequestWithError(() => APIS.Platform.userLoginPost(payload))
}

export async function doUserLogout() {
  return doRequestWithError(() => APIS.Platform.userLogoutPost())
}

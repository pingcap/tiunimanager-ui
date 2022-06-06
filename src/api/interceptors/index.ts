/*
 * Copyright 2022 PingCAP, Inc.
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

import { AxiosError, AxiosResponse } from 'axios'
import { useErrorNotification } from '@/components/ErrorNotification'
import { useSuccessNotification } from '@/components/SuccessNotification'
import { getAuthState } from '@store/auth'

// for all 4xx, 5xx responses
export const onErrorResponse = (error: AxiosError) => {
  if (!error.config.skipNotifications && !error.config.skipErrorNotification) {
    useErrorNotification(error)
  }

  if (error.response?.status === 401) {
    getAuthState().logout()
  } else if (
    error.response?.status === 400 &&
    error.response?.data?.code === 70615
  ) {
    getAuthState().resetPasswordExpired()
  }

  return Promise.reject(error)
}

// for responses to non-GET requests
export const onSuccessResponse = (resp: AxiosResponse) => {
  if (
    resp.config.method !== 'get' &&
    !resp.config.skipNotifications &&
    !resp.config.skipSuccessNotification
  ) {
    useSuccessNotification(resp)
  }
  return resp
}

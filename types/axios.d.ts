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

// @ts-ignore
import { AxiosRequestConfig } from 'axios' // eslint-disable-line

declare module 'axios' {
  interface AxiosRequestConfig {
    // skip success and error notifications
    skipNotifications?: boolean
    // skip error notification
    skipErrorNotification?: boolean
    // skip success notification
    skipSuccessNotification?: boolean
    // Deprecated. the action name displayed in notification
    actionName?: string
    // the message displayed in the success notification
    successMessage?: string
    // the message displayed in the error notification
    errorMessage?: string

    // Request ID
    requestId?: number
  }
}

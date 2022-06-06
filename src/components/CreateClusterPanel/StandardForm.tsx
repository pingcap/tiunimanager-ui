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

import { ReactNode } from 'react'
import { loadI18n } from '@i18n-macro'
import { RequestClusterCreate } from '@/api/model'
import { FormInstance } from '@ant-design/pro-form'

loadI18n()

export interface StandardFormProps {
  form: FormInstance

  additionalOptions?: ReactNode
  formClassName?: string

  onSubmit: (data: RequestClusterCreate) => void
  footerClassName?: string
}

export function StandardForm(_: StandardFormProps) {
  return <>Not Implemented Yet {JSON.stringify(_)}</>
}

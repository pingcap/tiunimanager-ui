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

import { useHistory } from 'react-router-dom'
import { useCallback } from 'react'
import { resolveRoute } from '@pages-macro'
import HeaderBar from './components/HeaderBar'
import { TakeoverPanel } from './components/TakeoverPanel'

export default function () {
  const history = useHistory()

  const back = useCallback(() => history.push(resolveRoute('../')), [history])

  return (
    <>
      <HeaderBar back={back} />
      <TakeoverPanel back={back} />
    </>
  )
}

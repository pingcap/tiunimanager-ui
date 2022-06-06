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

// NOTE: stackTraceLimit is provided by V8 only
if ((window as any).chrome) {
  ;(Error as any).stackTraceLimit = 20
}

// NOTE: AntD has some components that throws `deprecated` errors
//  in strict mode, so just ignore them.
//  https://github.com/ant-design/ant-design/issues/26136
const consoleErr = window.console.error
window.console.error = (...data: any[]) => {
  if (data.some((d) => typeof d === 'string' && d.includes('findDOMNode')))
    return
  consoleErr(...data)
}

if (import.meta.env.VITE_MOCK) {
  const mock = await import('@mock/index')
  // By default, MSW will catch all requests during its initialization
  mock.initMock().then()
}

if (import.meta.env.VITE_WDYR) {
  // CJS module
  const whyDidYouRender = (
    await import('@welldone-software/why-did-you-render')
  ).default
  const React = (await import('react')).default
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  })
}

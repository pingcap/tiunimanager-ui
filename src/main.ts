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

// start dev tools
if (import.meta.env.DEV) await import('@/devtools')

// init error tracking tools
import '@/track'

// bootstrap application
import bootstrap from '@/bootstrap'
bootstrap().then()

// load required assets
import { importAssets } from '@assets-macro'
importAssets('./styles/*.{less,css}')

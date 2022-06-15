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

import create from 'zustand'

type InitInfo = {
  vendorZone: boolean
  vendorSpec: boolean
  productComponent: boolean
  productVersion: boolean
}

type InitOptions = {
  vendors: {
    id: string
    name: string
  }[]
  prodVersions: {
    productId: string
    arch: string
    version: string
  }[]
}

type SystemState = {
  initInfo: InitInfo
  initForced: boolean
  initOptions: InitOptions
  updInitInfo: (initInfo: InitInfo) => void
  getInitStatus: () => boolean
  skipInit: () => void
  updInitOptions: (initOptions: InitOptions) => void
}

export const useSystemState = create<SystemState>((set, get) => {
  return {
    initInfo: {
      vendorZone: false,
      vendorSpec: false,
      productComponent: false,
      productVersion: false,
    },
    initForced: true,
    initOptions: {
      vendors: [],
      prodVersions: [],
    },
    updInitInfo: (initInfo) => set({ initInfo }),
    getInitStatus: () => {
      const { initInfo } = get()

      return Object.values(initInfo).every((el) => el)
    },
    skipInit: () => set({ initForced: false }),
    updInitOptions: (initOptions) => set({ initOptions }),
  }
})

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

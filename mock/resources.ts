import { rest } from 'msw'
import { basePath } from '@/api/client'
import { HostapiHostInfo, HostapiDomainResource } from '#/api'

import { internet, datatype } from 'faker'

const fakeHosts: HostapiHostInfo[] = Array.from(
  {
    length: 100,
  },
  () => ({
    hostId: datatype.uuid(),
    hostIp: internet.ip(),
    hostName: internet.domainName(),
  })
)

const fakeStocks: HostapiDomainResource[] = [
  {
    count: 2,
    specCode: 'large',
    specName: '8C 64G',
    zoneName: 'Zone A',
    zoneCode: 'zoneA',
  },
  {
    count: 3,
    specCode: 'large',
    specName: '8C 64G',
    zoneName: 'Zone B',
    zoneCode: 'zoneB',
  },
  {
    count: 2,
    specCode: 'middle',
    specName: '4C 32G',
    zoneName: 'Zone B',
    zoneCode: 'zoneB',
  },
  {
    count: 2,
    specCode: 'small',
    specName: '4C 16G',
    zoneName: 'Zone C',
    zoneCode: 'zoneC',
  },
]

export default [
  rest.post(basePath + '/host/query', (req, res, ctx) => {
    const { page, pageSize } = req.body as any
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeHosts.slice(page * pageSize, (page + 1) * pageSize),
        page: {
          page,
          pageSize,
          total: fakeHosts.length,
        },
      })
    )
  }),
  rest.get(basePath + '/failuredomains', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeStocks,
      })
    )
  }),
]

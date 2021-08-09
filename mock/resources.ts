import { rest } from 'msw'
import { basePath } from '@/api/client'
import { HostapiDomainResource, HostapiHostInfo } from '#/api'
import { internet, system, datatype, name } from 'faker'

const fakeHosts: HostapiHostInfo[] = Array.from(
  {
    length: 30,
  },
  () => ({
    az: name.lastName(),
    cpuCores: 64,
    dc: name.firstName(),
    disks: Array.from(
      {
        length: datatype.number(3),
      },
      () => ({
        capacity: 0,
        diskId: datatype.uuid().slice(6),
        name: name.firstName(),
        path: system.filePath(),
        status: datatype.number(1),
      })
    ),
    hostId: datatype.uuid().slice(0, 18),
    hostName: internet.domainName(),
    ip: internet.ip(),
    kernel: '5.1',
    memory: 32,
    nic: '10GE',
    os: 'Linux',
    purpose: 'Any',
    rack: datatype.number(64).toString(),
    spec: `${datatype.number(6) * 8}C${datatype.number(8) * 16}G`,
    status: 0,
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
  rest.get(basePath + '/resources/hosts', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '0')
    const pageSize = parseInt(req.url.searchParams.get('pageSize') || '15')
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeHosts.slice(page * pageSize, (page + 1) * pageSize),
        // data: fakeHosts,
        page: {
          page,
          pageSize,
          total: fakeHosts.length,
        },
      })
    )
  }),
  rest.delete(basePath + '/resources/hosts/:hostId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
      })
    )
  }),
  rest.get(basePath + '/resources/failuredomains', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeStocks,
      })
    )
  }),
]

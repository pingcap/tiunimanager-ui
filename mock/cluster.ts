import { ClusterInfo, ResponseClusterDetail } from '@/api/model'
import { datatype, name, time } from 'faker'
import { rest } from 'msw'
import { apiBasePath } from '@/api/client'

const fakeClusters: ClusterInfo[] = Array.from(
  {
    length: 13,
  },
  (_, i) => ({
    clusterId: datatype.uuid().slice(0, 18),
    clusterName: name.firstName() + name.lastName(),
    statusCode: datatype.number(3).toString(),
    statusName: 'running',
    tags: Array.from(
      {
        length: datatype.number(3),
      },
      () => name.lastName()
    ),
    clusterType: 'tidb',
    clusterVersion: '5.1',
    dbPassword: datatype.string(10),
    createTime: new Date(time.recent()).toLocaleString('en'),
    extranetConnectAddresses: ['200.200.1.1:4000'],
    intranetConnectAddresses: ['192.168.2.2:4000'],
    port: 4000,
    backupFileUsage: {
      total: 100,
      usageRate: datatype.float({ min: 0, max: 1 }),
      used: 7 * i,
    },
    diskUsage: {
      total: 100,
      usageRate: datatype.float({ min: 0, max: 1 }),
      used: 7 * i,
    },
    cpuUsage: {
      total: 100,
      usageRate: datatype.float({ min: 0, max: 1 }),
      used: 7 * i,
    },
    memoryUsage: {
      total: 100,
      usageRate: datatype.float({ min: 0, max: 1 }),
      used: 7 * i,
    },
    storageUsage: {
      total: 100,
      usageRate: datatype.float({ min: 0, max: 1 }),
      used: 7 * i,
    },
  })
)

const fakeCluster: ResponseClusterDetail = {
  ...fakeClusters[10],
  components: ['TiDB', 'PD', 'TiKV'].map((comp) => ({
    componentName: comp,
    componentType: comp,
    nodes: [
      {
        cpuUsage: {
          total: 100,
          usageRate: datatype.float({ min: 0, max: 1 }),
          used: 50,
        },
        hostId: name.lastName(),
        ioUtil: datatype.float({ min: 0, max: 1 }),
        iops: [10, 100],
        memoryUsage: {
          total: 100,
          usageRate: datatype.float({ min: 0, max: 1 }),
          used: 50,
        },
        nodeId: name.lastName(),
        port: 4000,
        role: {
          roleCode: 'leader',
          roleName: 'Leader',
        },
        spec: {
          specCode: '4c8g',
          specName: '4C8G',
        },
        status: 'running',
        storageUsage: {
          total: 100,
          usageRate: datatype.float({ min: 0, max: 1 }),
          used: 50,
        },
        version: 'v5.0',
        zone: {
          zoneCode: 'az1',
          zoneName: 'AZ1',
        },
      },
    ],
  })),
}

export default [
  rest.post(apiBasePath + '/clusters', (req, res, ctx) => {
    const { clusterName } = req.body as any
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          clusterName,
        },
      })
    )
  }),
  rest.get(apiBasePath + '/clusters', (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '0')
    const pageSize = parseInt(req.url.searchParams.get('pageSize') || '15')
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeClusters.slice(page * pageSize, (page + 1) * pageSize),
        page: {
          page,
          pageSize,
          total: fakeClusters.length,
        },
      })
    )
  }),
  rest.delete(apiBasePath + '/clusters/:clusterId', (req, res, ctx) => {
    const { clusterId } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          clusterId,
        },
      })
    )
  }),
  rest.get(apiBasePath + '/clusters/:clusterId', (req, res, ctx) => {
    // const { clusterId } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeCluster,
      })
    )
  }),
  rest.put(apiBasePath + '/clusters/:clusterId/strategy', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {},
      })
    )
  }),
  rest.get(apiBasePath + '/clusters/:clusterId/strategy', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: [
          {
            backupDate: '',
            backupRange: '',
            backupType: '',
            clusterId: '',
            filePath: '',
            period: '',
          },
        ],
      })
    )
  }),
  rest.get(apiBasePath + '/clusters/:clusterId/dashboard', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          url: 'http://172.16.4.178:2379/dashboard/',
          token:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MzA3NTA2NjIsIm9yaWdfaWF0IjoxNjMwNjY0MjYyLCJwIjoiM3R6ZG9jVDE3Q0lLRFRsaU1oQ2wzVVFzNG53SHJIc0xBd0Q4YVFFa1lNemFPSG5EOFh1cVEzc3h5bEhwc2JyeWRwU1owcTZ0UVdLS1FuMGNmU1NVMlRRQndTN0xYSytBZGFmZlVsNk02bWpLbVBnSjhWM2l0L1FlTUtkU29wOUtNUHE1RGlXcm9qUkpBRG9GeUJhZU5wYy9IN0h0dExzUkNDbHZiUE5XWFo1dE9SVG5zck1PLzR4VHR3QTVaYzhzYTZLMDRvQmNPZ3preXZ1U3pTdml2d1VQNEd3UUNhcFl6UlEwYjNSamFQSEo5UzQzd3E2T053ZXNERVVoUjRNODZiN2p2b3UwZ3c5Mkl3Zk1pWkk9In0.V8RmIQmXif3CinJdXfeH83-fG9WVwdeFf8fF36zm8X4',
        },
      })
    )
  }),
  rest.post(apiBasePath + '/clusters/export', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          recordId: 'aaa',
        },
      })
    )
  }),
  rest.post(apiBasePath + '/clusters/import', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          recordId: 'aaa',
        },
      })
    )
  }),
]

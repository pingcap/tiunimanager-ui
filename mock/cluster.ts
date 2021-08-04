import { ClusterapiClusterDisplayInfo, KnowledgeClusterTypeSpec } from '#/api'
import { datatype, name } from 'faker'
import { rest } from 'msw'
import { basePath } from '@/api/client'

const fakeKnowledge: KnowledgeClusterTypeSpec[] = [
  {
    clusterType: {
      code: 'tidb',
      name: 'TiDB',
    },
    versionSpecs: [
      {
        clusterVersion: {
          code: '5.1',
          name: '5.1',
        },
        componentSpecs: [
          {
            clusterComponent: {
              componentName: 'TiDB',
              componentType: 'tidb',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 1,
              suggestedNodeQuantities: [],
            },
          },
          {
            clusterComponent: {
              componentName: 'TiKV',
              componentType: 'tikv',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
          {
            clusterComponent: {
              componentName: 'PD',
              componentType: 'pd',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
        ],
      },
    ],
  },
  {
    clusterType: {
      code: 'tiflash',
      name: 'TiFlash',
    },
    versionSpecs: [
      {
        clusterVersion: {
          code: '5.1',
          name: '5.1',
        },
        componentSpecs: [
          {
            clusterComponent: {
              componentName: 'TiDB',
              componentType: 'tidb',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 1,
              suggestedNodeQuantities: [],
            },
          },
          {
            clusterComponent: {
              componentName: 'TiKV',
              componentType: 'tikv',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
          {
            clusterComponent: {
              componentName: 'PD',
              componentType: 'pd',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
        ],
      },
      {
        clusterVersion: {
          code: '5.0',
          name: '5.0',
        },
        componentSpecs: [
          {
            clusterComponent: {
              componentName: 'TiDB',
              componentType: 'tidb',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 1,
              suggestedNodeQuantities: [],
            },
          },
          {
            clusterComponent: {
              componentName: 'TiKV',
              componentType: 'tikv',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
          {
            clusterComponent: {
              componentName: 'PD',
              componentType: 'pd',
            },
            componentConstraint: {
              availableSpecCodes: ['middle', 'large', 'small'],
              componentRequired: true,
              minZoneQuantity: 3,
              suggestedNodeQuantities: [3, 5],
            },
          },
        ],
      },
    ],
  },
]

const fakeClusters: ClusterapiClusterDisplayInfo[] = Array.from(
  {
    length: 13,
  },
  (_, i) => ({
    clusterId: datatype.uuid().slice(0, 18),
    clusterName: name.firstName() + name.lastName(),
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
    createTime: datatype.datetime().toLocaleString('en'),
    extranetConnectAddresses: ['200.200.1.1:4000'],
    intranetConnectAddresses: ['192.168.2.2:4000'],
    port: 4000,
    backupFileUsage: {
      total: 100,
      usageRate: 0.07 * i,
      used: 7 * i,
    },
    diskUsage: {
      total: 100,
      usageRate: 0.07 * i,
      used: 7 * i,
    },
    cpuUsage: {
      total: 100,
      usageRate: 0.07 * i,
      used: 7 * i,
    },
    memoryUsage: {
      total: 100,
      usageRate: 0.07 * i,
      used: 7 * i,
    },
    storageUsage: {
      total: 100,
      usageRate: 0.07 * i,
      used: 7 * i,
    },
  })
)

export default [
  rest.post(basePath + '/cluster', (req, res, ctx) => {
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
  rest.post(basePath + '/cluster/query', (req, res, ctx) => {
    const { page, pageSize } = req.body as any
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
  rest.delete(basePath + '/cluster/:clusterId', (req, res, ctx) => {
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
  rest.get(basePath + '/cluster/knowledge', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeKnowledge,
      })
    )
  }),
  rest.get(basePath + '/cluster/:clusterId', (req, res, ctx) => {
    const { clusterId } = req.params
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeClusters[0],
      })
    )
  }),
]

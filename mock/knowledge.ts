import { rest } from 'msw'
import { basePath } from '@/api/client'
import { KnowledgeOfClusterType } from '@/api/model'

const fakeKnowledge: KnowledgeOfClusterType[] = [
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

export default [
  rest.get(basePath + '/knowledges', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeKnowledge,
      })
    )
  }),
]

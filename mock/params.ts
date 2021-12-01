import { rest } from 'msw'
import { basePath } from '@/api/client'
import { ClusterParamItem } from '@/api/model'

const fakeParams: ClusterParamItem[] = [
  {
    paramId: 1,
    componentType: 'tidb',
    name: 'binlog_cache_size',
    realValue: {
      cluster: '1048576',
    },
    type: 1,
    hasReboot: 0,
    range: ['0', '2 * 1024 * 1024'],
    defaultValue: '1048576',
    description: '111',
    unit: 'B',
  },
  {
    paramId: 2,
    componentType: 'tidb',
    name: 'query_cache_limit',
    realValue: {
      cluster: '1048576',
    },
    type: 1,
    hasReboot: 1,
    range: ['1024 * 1024', '5 * 1024 * 1024'],
    defaultValue: '1048576',
    description: '222',
    unit: 'B',
  },
]

export default [
  rest.post(basePath + '/clusters/:clusterId/params', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          status: 'ok',
        },
      })
    )
  }),
  rest.get(basePath + '/clusters/:clusterId/params', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeParams,
      })
    )
  }),
]

import { rest } from 'msw'
import { basePath } from '@/api/client'
import { InstanceapiParamItem } from '#/api'

const fakeParams: InstanceapiParamItem[] = [
  {
    currentValue: {
      name: 'binlog_cache_size',
      value: 1048576 as any,
    },
    definition: {
      constraints: [
        { contrastValue: 0 as any },
        { contrastValue: (2 * 1024 * 1024) as any },
      ],
      defaultValue: 1048576 as any,
      desc: '111',
      name: 'binlog_cache_size',
      needRestart: false,
      unit: 'B',
    },
  },
  {
    currentValue: {
      name: 'query_cache_limit',
      value: 1048576 as any,
    },
    definition: {
      constraints: [
        { contrastValue: (1024 * 1024) as any },
        { contrastValue: (5 * 1024 * 1024) as any },
      ],
      defaultValue: 1048576 as any,
      desc: '222',
      name: 'query_cache_limit',
      needRestart: true,
      unit: 'B',
    },
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

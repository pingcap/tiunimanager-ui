import { rest } from 'msw'
import { basePath } from '@/api/client'
import { HostapiHostInfo } from '#/api'

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
]

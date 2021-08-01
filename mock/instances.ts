import { InstanceapiInstanceInfo } from '#/api'
import { datatype, name } from 'faker'
import { rest } from 'msw'
import { basePath } from '@/api/client'

const fakeInstances: InstanceapiInstanceInfo[] = Array.from(
  {
    length: 13,
  },
  () => ({
    instanceId: datatype.uuid(),
    instanceName: name.firstName() + name.lastName(),
    instanceStatus: datatype.number(7),
    instanceVersion: 5.1,
  })
)

export default [
  rest.post(basePath + '/instance/create', (req, res, ctx) => {
    const { instanceName, instanceVersion } = req.body as any
    const newInstance: InstanceapiInstanceInfo = {
      instanceId: datatype.uuid(),
      instanceName,
      instanceVersion,
      instanceStatus: 0,
    }
    fakeInstances.unshift(newInstance)
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: newInstance,
      })
    )
  }),
  rest.post(basePath + '/instance/query', (req, res, ctx) => {
    const { page, pageSize } = req.body as any
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeInstances.slice(page * pageSize, (page + 1) * pageSize),
        page: {
          page,
          pageSize,
          total: fakeInstances.length,
        },
      })
    )
  }),
]

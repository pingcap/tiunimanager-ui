import { rest } from 'msw'
import { basePath } from '@/api/client'
import { InstanceapiBackupRecord } from '#/api'
import { datatype, name, system } from 'faker'

const fakeBackups: InstanceapiBackupRecord[] = Array.from(
  {
    length: 50,
  },
  () => ({
    id: datatype.uuid().slice(0, 18),
    clusterId: datatype.uuid().slice(0, 18),
    filePath: system.filePath(),
    operator: {
      manualOperator: datatype.boolean(),
      operatorId: datatype.uuid().slice(0, 18),
      operatorName: name.lastName(),
    },
    range: 0,
    size: datatype.number(),
    startTime: datatype.datetime().toLocaleString('en'),
    endTime: datatype.datetime().toLocaleString('en'),
    status: {
      createTime: datatype.datetime().toLocaleString('en'),
      deleteTime: undefined,
      inProcessFlowId: 0,
      statusCode: 'ok',
      statusName: 'Ok',
      updateTime: datatype.datetime().toLocaleString('en'),
    },
    way: 0,
  })
)

export default [
  rest.post(basePath + '/backup/record/recover', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups[0].status,
      })
    )
  }),
  rest.post(basePath + '/backup/records/:clusterId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups,
      })
    )
  }),
  rest.post(basePath + '/backup/:clusterId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups[0].status,
      })
    )
  }),
]

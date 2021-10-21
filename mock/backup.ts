import { rest } from 'msw'
import { basePath } from '@/api/client'
import { ClusterBackupItem } from '@/api/model'
import { datatype, name, system } from 'faker'

const fakeBackups: ClusterBackupItem[] = Array.from(
  {
    length: 50,
  },
  () => ({
    id: datatype.number(100000),
    clusterId: datatype.uuid().slice(0, 18),
    filePath: system.filePath(),
    operator: {
      manualOperator: datatype.boolean(),
      operatorId: datatype.uuid().slice(0, 18),
      operatorName: name.lastName(),
    },
    backupMethod: 'logic',
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
    backupType: 'full',
  })
)

export default [
  rest.post(basePath + '/backups/:backupId/recover', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups[0].status,
      })
    )
  }),
  rest.get(basePath + '/backups', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups,
      })
    )
  }),
  rest.post(basePath + '/backups', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups[0].status,
      })
    )
  }),
  rest.delete(basePath + '/backups/:backupId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: fakeBackups[0].status,
      })
    )
  }),
]

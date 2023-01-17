import dayjs from 'dayjs'
import { rest } from 'msw'

import metaBrief from './meta-brief.json'
import metaDetail from './meta-detail.json'

const API_BASE_PATH = '/api/v1'

function fullApiPath(path: string) {
  return `${API_BASE_PATH}${path}`
}

export const handlers = [
  rest.get(fullApiPath('/test'), (req, res, ctx) => {
    return res(ctx.json({ message: 'test' }))
  }),

  rest.get(fullApiPath('/clusters/:clusterId/meta'), (req, res, ctx) => {
    return res(ctx.json(metaDetail))
  }),
]

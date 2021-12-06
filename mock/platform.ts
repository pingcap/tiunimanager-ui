import { rest } from 'msw'
import { apiBasePath } from '@/api/client'

export default [
  rest.post(apiBasePath + '/user/login', (req, res, ctx) => {
    // Persist user's authentication in the session
    sessionStorage.setItem('is-authenticated', 'true')
    const { userName, userPassword } = req.body as Record<string, string>
    if (userPassword === 'fail')
      return res(
        ctx.status(401),
        ctx.json({
          code: 1,
          message: 'login failed',
        })
      )
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
        data: {
          userName: userName,
          token: "it's fake token",
        },
      })
    )
  }),
  rest.get(apiBasePath + '/user/logout', (req, res, ctx) => {
    sessionStorage.removeItem('is-authenticated')
    return res(
      ctx.status(200),
      ctx.json({
        code: 0,
      })
    )
  }),
]

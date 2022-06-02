import { Router, Redirect, Route, RouteProps, Switch } from 'react-router-dom'
import { Location } from 'history'
import { ElementType, Suspense } from 'react'
import useProgress from '@hooks/useProgress'
import { IRoute } from '@pages-macro'
import { IPageMeta } from '@/model/page'
import { Role } from '@/model/role'
import { useAuthState } from '@store/auth'
import {
  Redirector,
  RouteState,
  useLocationWithState,
  history,
} from '@/router/helper'

function getCurrentRoutePath() {
  // if (import.meta.env.DEV) return window.location.hash.slice(1)
  // else return window.location.pathname
  return window.location.pathname
}

export interface RoleGuard {
  // has role but no permission
  noPermission: string
  // not logged in
  noSession: string
  // logged in and no safe session
  // e.g. user password expired
  noSafeSession: string
}

export default function mountRouter(
  routes: IRoute<IPageMeta>[],
  guard?: RoleGuard
) {
  return (
    <Router history={history}>
      <Switch>
        {...routes.map((def, idx) => (
          <Route {...genRouteProp(def, guard)} key={idx} />
        ))}
      </Switch>
    </Router>
  )
}

function genRouteProp(
  {
    // id,
    // defaultName,
    path,
    exact,
    sync,
    meta,
    component,
    children,
  }: IRoute<IPageMeta>,
  guard?: RoleGuard
): RouteProps {
  const { redirect, fallback } = meta
  if (redirect && typeof redirect === 'string') {
    return {
      path,
      exact,
      render: () => <Redirect to={redirect} />,
    }
  }

  const Comp: ElementType = component

  let dom = children?.length ? (
    <Comp>
      <Switch>
        {children.map((def, idx) => (
          <Route {...genRouteProp(def, guard)} key={idx} />
        ))}
      </Switch>
    </Comp>
  ) : (
    <Comp />
  )

  if (!sync) {
    const FallbackComp = () => {
      useProgress()
      return fallback || null
    }
    dom = <Suspense fallback={<FallbackComp />}>{dom}</Suspense>
  }

  const comp = () => {
    // XXX: Do we really need it?
    // setTitle(i18next.t(`${id}:name`, defaultName))
    return dom
  }

  const role = meta.role || ['user']
  const render =
    redirect && typeof redirect === 'function'
      ? guard
        ? () => {
            const { session, location } = useSessionLocation()

            return (
              checkRole(role, guard, session) ||
              checkRedirect(redirect, session.sessionId, location) ||
              comp()
            )
          }
        : () => {
            const { session, location } = useSessionLocation()

            return (
              checkRedirect(redirect, session.sessionId, location) || comp()
            )
          }
      : guard
      ? () => checkRole(role, guard, useSession()) || comp()
      : comp

  return {
    path,
    exact,
    component: render,
  }
}

function useSessionLocation() {
  const session = useSession()
  const location = useLocationWithState()

  return {
    session,
    location,
  }
}

function useSession() {
  const sessionId = useAuthState((state) => state.session)
  const safe = useAuthState((state) => !state.passwordExpired)

  return {
    sessionId,
    safe,
  }
}

function checkRole(
  role: Role[],
  guard: RoleGuard,
  session: { sessionId: string; safe: boolean }
) {
  const { sessionId, safe } = session
  const currentPath = getCurrentRoutePath()
  const isNoSafeSessionPath = currentPath === guard.noSafeSession

  if (role[0] === 'user' && !sessionId) {
    const validFromPath = isNoSafeSessionPath ? '/' : currentPath

    return (
      <Redirect
        to={{
          pathname: guard.noSession,
          state: { from: validFromPath } as RouteState,
        }}
      />
    )
  } else if (sessionId && !safe && !isNoSafeSessionPath) {
    return (
      <Redirect
        to={{
          pathname: guard.noSafeSession,
          state: { from: currentPath } as RouteState,
        }}
      />
    )
  }
}

function checkRedirect(
  redirect: Redirector,
  sessionId: string,
  location: Location<RouteState>
) {
  const res = redirect(sessionId, location)
  if (res)
    return (
      <Redirect
        to={{
          pathname: res,
          state: { from: getCurrentRoutePath() } as RouteState,
        }}
      />
    )
}

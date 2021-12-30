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
  if (import.meta.env.DEV) return window.location.hash.slice(1)
  else return window.location.pathname
}

export interface RoleGuard {
  // has role but no permission
  noPermission: string
  // not logged in
  noSession: string
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
            const [session, location] = useSessionLocation()
            return (
              checkRole(role, guard, session) ||
              checkRedirect(redirect, session, location) ||
              comp()
            )
          }
        : () => checkRedirect(redirect, ...useSessionLocation()) || comp()
      : guard
      ? () => checkRole(role, guard, useSession()) || comp()
      : comp

  return {
    path,
    exact,
    component: render,
  }
}

function useSessionLocation(): [string, Location<RouteState>] {
  return [useSession(), useLocationWithState()]
}

function useSession(): string {
  return useAuthState((state) => state.session)
}

function checkRole(role: Role[], guard: RoleGuard, session: string) {
  if (role[0] === 'user' && !session)
    return (
      <Redirect
        to={{
          pathname: guard.noSession,
          state: { from: getCurrentRoutePath() } as RouteState,
        }}
      />
    )
}

function checkRedirect(
  redirect: Redirector,
  session: string,
  location: Location<RouteState>
) {
  const res = redirect(session, location)
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

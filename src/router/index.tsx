import {
  BrowserRouter,
  HashRouter,
  Redirect,
  Route,
  RouteProps,
  Switch,
} from 'react-router-dom'
import { ComponentType, ElementType, Suspense } from 'react'
import useProgress from '@hooks/useProgress'
import { IRoute } from '@import-pages-macro'
import { IPageMeta } from '@/model/page'
import { Role } from '@/model/role'
import { Routes } from '@routes'
import { setTitle } from '@/utils/document'
import i18next from 'i18next'
import { useAuthState } from '@store/auth'

const Router: ComponentType = import.meta.env.DEV ? HashRouter : BrowserRouter

function locationToRoutePath(location: Location) {
  if (import.meta.env.DEV) {
    return location.hash.slice(1)
  } else {
    return location.pathname
  }
}

export interface RoleGuard {
  // has role but no permission
  noPermission: Routes
  // not logged in
  noSession: Routes
}

export default function mountRouter(
  routes: IRoute<IPageMeta>[],
  guard?: RoleGuard
) {
  return (
    <Router>
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
    id,
    defaultName,
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

  const withTitle = () => {
    setTitle(i18next.t(`${id}:name`, defaultName))
    return dom
  }

  const role = meta.role || ['user']
  const render =
    redirect && typeof redirect === 'function'
      ? guard
        ? () => checkRole(role, guard) || checkRedirect(redirect) || withTitle()
        : () => checkRedirect(redirect) || withTitle()
      : guard
      ? () => checkRole(role, guard) || withTitle()
      : withTitle

  return {
    path,
    exact,
    component: render,
  }
}

function checkRole(role: Role[], guard: RoleGuard) {
  // TODO: use real role model later
  const [{ session }] = useAuthState()
  if (role[0] === 'user' && !session)
    return (
      <Redirect
        to={{
          pathname: guard.noSession,
          state: { from: locationToRoutePath(location) },
        }}
      />
    )
}

function checkRedirect(redirect: () => string | false | null | undefined) {
  const res = redirect()
  if (res)
    return (
      <Redirect
        to={{
          pathname: res,
          state: { from: locationToRoutePath(location) },
        }}
      />
    )
}

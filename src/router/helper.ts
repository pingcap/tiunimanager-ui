import { History, Location, createBrowserHistory } from 'history'
import { useHistory, useLocation } from 'react-router-dom'

export type IntrinsicRouteState = {
  from: string
}

export type RouteState<S = {}> = S & IntrinsicRouteState

export type Redirector = (
  session: string,
  location: Location<RouteState>
) => string | false | null | undefined

export function useHistoryWithState<S extends object = {}>(
  defaultState = {
    from: '/',
  } as RouteState<S>
): History<RouteState<S>> {
  const history = useHistory<RouteState<S>>()
  if (!history.location.state) history.location.state = defaultState
  return history
}

export function useLocationWithState<S extends object = {}>(
  defaultState = {
    from: '/',
  } as RouteState<S>
): Location<RouteState<S>> {
  const location = useLocation<RouteState<S>>()
  if (!location.state) location.state = defaultState
  return location
}

export const history = createBrowserHistory()

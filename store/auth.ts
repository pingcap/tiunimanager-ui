import { createStore } from 'react-hooks-global-state'

const TOKEN_KEY = 'APP_TOKEN'
const SESSION_KEY = 'APP_SESSION'

type AuthState = {
  state: {
    token: string
    // username
    session: string
  }
}

type AuthStateAction =
  | { type: 'logout' }
  | { type: 'login'; token: string; session: string }

const initialState: AuthState = {
  state: {
    token: sessionStorage.getItem(TOKEN_KEY) || '',
    session: sessionStorage.getItem(SESSION_KEY) || '',
  },
}

const { dispatch, useGlobalState, getState } = createStore(
  (state, action: AuthStateAction) => {
    switch (action.type) {
      case 'logout': {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        return {
          state: {
            token: '',
            session: '',
          },
        }
      }
      case 'login': {
        const { token, session } = action
        sessionStorage.setItem(TOKEN_KEY, token)
        sessionStorage.setItem(SESSION_KEY, session)
        return {
          state: { token, session },
        }
      }
      default:
        return state
    }
  },
  initialState
)

export const dispatchAuthState = dispatch
export const useAuthState = () => useGlobalState('state')
export const getAuthState = getState

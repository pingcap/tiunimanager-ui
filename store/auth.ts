import create from 'zustand'
import { setRequestToken } from '@/api/client'

type AuthState = {
  passwordExpired: boolean
  token: string
  // currently username
  session: string
  login: (
    payload: { token: string; session: string; passwordExpired?: boolean },
    options?: { persisted: boolean }
  ) => void
  logout: () => void
  clearPersistedAuth: () => void
  resetPasswordExpired: () => void
}

const TOKEN_KEY = 'APP_TOKEN'
const SESSION_KEY = 'APP_SESSION'

export const useAuthState = create<AuthState>((set) => {
  const token = sessionStorage.getItem(TOKEN_KEY) || ''
  const session = sessionStorage.getItem(SESSION_KEY) || ''

  if (token) setRequestToken(token)

  return {
    passwordExpired: false,
    token: token,
    session: session,
    login: (
      payload: {
        token: string
        session: string
        passwordExpired?: boolean
      },
      options?: { persisted: boolean }
    ) => {
      const {
        token = '',
        session = '',
        passwordExpired = false,
      } = payload || {}
      const { persisted = true } = options || {}

      if (persisted) {
        sessionStorage.setItem(TOKEN_KEY, token)
        sessionStorage.setItem(SESSION_KEY, session)
      }

      setRequestToken(token)
      set({
        token,
        session,
        passwordExpired,
      })
    },
    logout: () => {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      setRequestToken()
      set({
        token: '',
        session: '',
        passwordExpired: false,
      })
    },
    clearPersistedAuth: () => {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(SESSION_KEY)
    },
    resetPasswordExpired: () => {
      set({
        passwordExpired: true,
      })
    },
  }
})

export const getAuthState = useAuthState.getState

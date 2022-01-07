import create from 'zustand'
import { setRequestToken } from '@/api/client'

type AuthState = {
  token: string
  // currently username
  session: string
  login: (token: string, session: string) => void
  logout: () => void
}

const TOKEN_KEY = 'APP_TOKEN'
const SESSION_KEY = 'APP_SESSION'

export const useAuthState = create<AuthState>((set) => {
  const token = sessionStorage.getItem(TOKEN_KEY) || ''
  const session = sessionStorage.getItem(SESSION_KEY) || ''
  if (token) setRequestToken(token)
  return {
    token: token,
    session: session,
    login: (token: string, session: string) => {
      sessionStorage.setItem(TOKEN_KEY, token)
      sessionStorage.setItem(SESSION_KEY, session)
      setRequestToken(token)
      set({ token, session })
    },
    logout: () => {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(SESSION_KEY)
      setRequestToken()
      set({ token: '', session: '' })
    },
  }
})

export const getAuthState = useAuthState.getState

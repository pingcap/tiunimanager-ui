import create from 'zustand'

type EnvState = {
  protocol: 'http' | 'https'
  tlsPort: number
  service: {
    grafana: string
    kibana: string
    alert: string
    tracer: string
  }
}

export const useEnvState = create<EnvState>((set) => {
  if (import.meta.env.MODE === 'release') fetchEnv().then((env) => set(env))

  return {
    protocol: 'http',
    tlsPort: 0,
    service: {
      grafana: import.meta.env.VITE_MONITOR_URL,
      kibana: import.meta.env.VITE_LOG_URL,
      alert: import.meta.env.VITE_ALERT_URL,
      tracer: import.meta.env.VITE_TRACER_URL,
    },
  }
})

export const subscribeEnv = useEnvState.subscribe
export const getEnvState = useEnvState.getState

async function fetchEnv() {
  const resp = await fetch('/env')
  return (await resp.json()) as EnvState
}

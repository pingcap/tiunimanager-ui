/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

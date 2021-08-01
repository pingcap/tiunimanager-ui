import nProgress from 'nprogress'
import { useEffect } from 'react'

nProgress.configure({ showSpinner: false })

export default function useProgress(seconds = 0.2) {
  useEffect(() => {
    nProgress.set(seconds)
    return () => {
      nProgress.done()
    }
  }, [])
}

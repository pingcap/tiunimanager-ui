import { useEffect, useRef } from 'react'

type useDocumentTitleProps = {
  title: string | ((path: string) => string)
  revertOnUnmount?: boolean
}

export default function useDocumentTitle({
  title,
  revertOnUnmount = false,
}: useDocumentTitleProps) {
  const prevPageTitleRef = useRef<string>(document.title)
  useEffect(() => {
    prevPageTitleRef.current = document.title
  }, [])

  useEffect(() => {
    document.title =
      typeof title === 'function' ? title(location.pathname) : title

    return () => {
      if (revertOnUnmount && prevPageTitleRef.current !== null) {
        document.title = prevPageTitleRef.current
      }
    }
  }, [title, revertOnUnmount])
}

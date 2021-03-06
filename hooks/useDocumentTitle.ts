/*
 * Copyright 2022 PingCAP
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

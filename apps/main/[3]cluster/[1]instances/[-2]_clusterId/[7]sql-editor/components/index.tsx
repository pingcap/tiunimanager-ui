import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'

// import useStores from 'dbaas/stores/useStores'

import { SqlEditorProvider } from './context'
import Editor from './Editor'
import styles from './index.module.less'
import MessageLogs from './MessageLogs'
import SideMenu from './SideMenu'

const SqlEditor = () => {
  const ref = useRef<HTMLDivElement>(null)
  const sqlRef = useRef<HTMLDivElement>(null)
  const sqlContentRef = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(0)
  const [maxHeight, setMaxHeight] = useState(0)
  const isMaxRef = useRef(false)
  const [isRun, setIsRun] = useState(false)

  // const {
  //   store: {
  //     config: { enableLayoutV3 }
  //   }
  // } = useStores()
  const enableLayoutV3 = true

  useEffect(() => {
    if (!ref.current) {
      return
    }

    const top = ref.current.offsetTop
    setTop(top)

    if (sqlContentRef.current) {
      const ele = sqlContentRef.current
      const maxHeight = ele.offsetHeight - top
      setMaxHeight(maxHeight)
    }

    window.addEventListener('resize', debounce(resize), false)

    return () => {
      window.removeEventListener('resize', resize, false)
    }
  }, [])

  useEffect(() => {
    if (!top) {
      return
    }

    initHeight()
  }, [top])

  const resize = () => {
    if (sqlContentRef.current) {
      const ele = sqlContentRef.current
      if (isMaxRef.current) {
        setMaxHeight(ele.offsetHeight)
      }
    }
  }

  const initHeight = () => {
    const ele = document.getElementsByClassName('sql-editor-container')[0] as HTMLDivElement
    const btmH = parseInt(ele.style.height)

    const target = sqlRef.current as HTMLDivElement
    target.style.bottom = `${btmH}px`
  }

  const runningHeight = () => {
    setIsRun(true)

    setTimeout(() => {
      setIsRun(false)
    })
  }

  return (
    <SqlEditorProvider>
      <div ref={ref}>
        <div className={`${styles.sqlEditor} ${enableLayoutV3 ? styles.newLayoutEditor : ''}`} style={{ top: '56px'}}>
          <SideMenu />

          <div className={styles.sqlEditorContent} ref={sqlContentRef}>
            <div className={styles.editorWrap} ref={sqlRef}>
              <Editor onRun={runningHeight} />
            </div>

            <MessageLogs sqlRef={sqlRef} maxHeight={maxHeight} isRun={isRun} />
          </div>
        </div>
      </div>
    </SqlEditorProvider>
  )
}

export default SqlEditor

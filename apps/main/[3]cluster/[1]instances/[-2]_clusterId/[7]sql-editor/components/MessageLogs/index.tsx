// import { Download01, Run } from '@tidb-cloud-uikit/icons/raw'
import { Download01, Run } from '../../ui-components/icons/raw'
import clsx from 'clsx'
// import { observer } from 'mobx-react'
// import React, 
import { useState, useContext, useEffect, useRef } from 'react'
import { CSVLink } from 'react-csv'
import { RightIndent01, LeftIndent01, Scale02, Scale03 } from '../../ui-components/icons/raw'

// import ResizableContainer from 'dbaas/components/ResizableContainer'
import ResizableContainer from '../../ui-components/ResizableContainer'
// import useStores from 'dbaas/stores/useStores'
// import { eventTracking } from 'dbaas/utils/tracking'

import { SqlEditorContext } from '../context'
// import { Settings } from '../Editor'
import { SqlRes, RequestStatus } from '../types'

import styles from './index.module.less'
import Results from './Results'

const Status: React.FC<{ status: RequestStatus }> = ({ status = RequestStatus.Loading }) => {
  return (
    <div className={styles.sqlStatus}>
      <span className={styles[status]}></span>
    </div>
  )
}

const MessageLogs: React.FC<{ sqlRef: React.RefObject<HTMLDivElement>; maxHeight: number; isRun: boolean }> = ({
  sqlRef,
  maxHeight,
  isRun
}) => {
  const defaultLeftWidth = 840
  const miniLeftWidth = 240
  const [leftWidth, setLeftWidth] = useState(miniLeftWidth)
  const [curIndex, setCurIndex] = useState(0)
  const [isLeftOpen, setIsLeftOpen] = useState(false)
  const runHeight = 340
  const defaultHeight = 200
  const minHeight = 40
  const headerH = 40
  const curHeightRef = useRef(defaultHeight)
  const [isMax, setIsMax] = useState(false)
  const isMaxRef = useRef(false)
  const [height, setHeight] = useState(defaultHeight)
  const { sqlResultList, editSqlTexts, sqlLimit } = useContext(SqlEditorContext)
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent)

  // const {
  //   store: {
  //     config: { enableLayoutV3 }
  //   }
  // } = useStores()
  const enableLayoutV3 = true

  useEffect(() => {
    setLeftWidth(isLeftOpen ? defaultLeftWidth : miniLeftWidth)
  }, [isLeftOpen])

  useEffect(() => {
    if (sqlResultList.length) {
      setCurIndex(0)
    }
  }, [sqlResultList.length])

  useEffect(() => {
    if (isRun && curHeightRef.current < runHeight) {
      const ele = document.getElementsByClassName('sql-editor-container')[0] as HTMLDivElement
      ele.style.height = `${runHeight}px`

      const target = sqlRef.current as HTMLDivElement
      target.style.bottom = `${runHeight}px`

      setHeight(runHeight - headerH)
    }
  }, [isRun])

  useEffect(() => {
    if (editSqlTexts.length > 5) {
      setIsLeftOpen(true)
    }
  }, [editSqlTexts])

  const messageItemClick = (index: number) => {
    setCurIndex(index)

    setIsLeftOpen(false)
  }

  const downFileSuffix = () => {
    const date = new Date()
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    const hour = `${date.getHours()}`.padStart(2, '0')
    const min = `${date.getMinutes()}`.padStart(2, '0')
    const sec = `${date.getSeconds()}`.padStart(2, '0')
    return `${year}-${month}-${day}-${hour}${min}${sec}`
  }

  const messlogResize = (
    e: MouseEvent | TouchEvent,
    direction: string,
    elementRef: HTMLElement,
    delta: { width: number; height: number }
  ) => {
    if (!sqlRef?.current) {
      return
    }
    const btmH = parseInt(elementRef.style.height || '')
    const target = sqlRef.current as HTMLDivElement
    target.style.bottom = `${btmH}px`
    curHeightRef.current = parseInt(target.style.height)

    setHeight(btmH - headerH)
  }

  const set2Max = (isMax: boolean) => {
    const ele = document.getElementsByClassName('sql-editor-container')[0] as HTMLDivElement

    if (isMax) {
      ele.style.height = `${maxHeight}px`
    } else {
      ele.style.height = `${runHeight}px`
    }

    setIsMax(isMax)
    isMaxRef.current = isMax

    const target = sqlRef.current as HTMLDivElement
    target.style.bottom = `${isMax ? maxHeight : runHeight}px`

    setHeight(isMax ? maxHeight - headerH : runHeight - headerH)
  }

  const getStatusDesc = (status: RequestStatus, time: string) => {
    if (status === RequestStatus.Waiting) {
      return '-'
    }

    if (status === RequestStatus.Loading) {
      return 'Running...'
    }

    if (status === RequestStatus.Error) {
      return 'Query failed.'
    }
    return `Duration ${time || 0} ms`
  }

  const cur = sqlResultList[curIndex] || {}
  const { columns = [], rows = [], query } = cur.res || {}

  return (
    <ResizableContainer
      as="div"
      className={`${styles.sqlEditorContainer} ${enableLayoutV3 ? styles.newLayoutContainer : ''} sql-editor-container`}
      defaultSize={{
        width: `100%`,
        height: defaultHeight
      }}
      style={{
        background: '#fff',
        position: 'fixed',
        bottom: '0',
        left: '272px',
        right: '0',
        width: 'auto',
        height: defaultHeight
      }}
      enable={{ top: true }}
      minHeight={minHeight}
      maxHeight={maxHeight}
      onResize={messlogResize}
    >
      <div className={styles.messageLogs}>
        <div className={styles.leftInfo} style={{ width: isLeftOpen ? '70%' : leftWidth }}>
          <div className={`${styles.title} ${styles.leftTitle}`}>
            <span>Query log</span>
            <span
              className={styles.scaleIcon}
              onClick={() => {
                // eventTracking('SQL Editor Query Log Expand Button Clicked', {
                //   mode: isLeftOpen ? 'scalein' : 'scaleout'
                // })

                setIsLeftOpen(!isLeftOpen)
              }}
            >
              {isLeftOpen ? <RightIndent01 /> : <LeftIndent01 />}
            </span>
          </div>

          <div className={`${styles.logs} ${isLeftOpen ? styles.open : styles.hide}`}>
            {sqlResultList?.map((item: SqlRes, index: number) => (
              <div
                className={`${styles.logItem} ${curIndex === index ? styles.active : ''} ${isLeftOpen ? styles.open : styles.hide
                  }`}
                key={index}
                onClick={() => {
                  // eventTracking('SQL Editor Query Log Item Clicked', {
                  //   index
                  // })
                  messageItemClick(index)
                }}
              >
                {isLeftOpen ? (
                  <div className={styles.openInfo}>
                    <span className={styles.logIndex}>{sqlResultList.length - index}</span>
                    <Status status={item.status} />
                    <div className={styles.sqlLog}>
                      <span className={`${styles.text} ${item.status === RequestStatus.Waiting ? styles.loading : ''}`}>
                        {item.sql}
                      </span>
                      <span className={styles.resDesc}>{getStatusDesc(item.status, item.res?.execute_time || '')}</span>
                      <span className={styles.resDesc}>Rows {item.res?.row_count || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`${styles.hideInfo}`}>
                    <div className={styles.left}>
                      <span className={styles.logIndex}>{sqlResultList.length - index}</span>
                      <Status status={item.status} />
                    </div>
                    <div className={styles.right}>
                      <span className={`${styles.text} ${item.status === RequestStatus.Waiting ? styles.loading : ''}`}>
                        {item.sql}
                      </span>
                      <span className={styles.resDesc}>{getStatusDesc(item.status, item.res?.execute_time || '')}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.rightInfo}>
          <div className={styles.title}>
            <span>Results </span>
            <span className={styles.subDesc}>
              {isLeftOpen || !sqlResultList.length ? null : (cur.res?.row_count || 0) > sqlLimit ? (
                <span>
                  {/* (Row limit reached. Showing <Settings trigger={<a>{sqlLimit}</a>} /> rows of many) */}
                  (Row limit reached. Showing {sqlLimit} rows of many)
                </span>
              ) : (
                `(showing ${cur.res?.row_count || 0} rows)`
              )}
            </span>
            <div className={styles.logBtns}>
              {!!((rows || []).length || (columns || []).length) ? (
                <CSVLink
                  data={rows || []}
                  headers={(columns || []).map((col: { col: string }) => col.col)}
                  filename={`results-${downFileSuffix()}`}
                  onClick={() => {
                    // eventTracking('SQL Editor Download Button Clicked')
                  }}
                >
                  <Download01 className={styles.download} />
                </CSVLink>
              ) : (
                <Download01 className={clsx(styles.download, styles.disabled)} />
              )}

              {isMax ? (
                <Scale03
                  className={styles.resizeImg}
                  onClick={() => {
                    // eventTracking('SQL Editor Fullscreen Button Clicked', {
                    //   mode: 'mini'
                    // })

                    set2Max(false)
                  }}
                />
              ) : (
                <Scale02
                  className={styles.resizeImg}
                  onClick={() => {
                    // eventTracking('SQL Editor Fullscreen Button Clicked', {
                    //   mode: 'max'
                    // })
                    set2Max(true)
                  }}
                />
              )}
            </div>
          </div>

          <div className={styles.resTable}>
            {!sqlResultList.length && (
              <div className={styles.empty}>
                <div>
                  Click{' '}
                  <div className={styles.emptyIcon}>
                    <Run />
                  </div>{' '}
                  or hit <span>{isMac ? '⌘' : 'Ctrl'} + Enter</span> to execute your query.
                </div>
                <div>
                  Select multiple queries then click{' '}
                  <span className={styles.emptyIcon}>
                    <Run />
                  </span>{' '}
                  or hit <span>{isMac ? '⇧ + ⌘' : 'Shift + Ctrl'} + Enter </span> to run all queries.{' '}
                </div>
                <div>
                  Type "-- your instruction" + <span>Enter</span> to try out AI-generated SQL queries.
                </div>
              </div>
            )}

            {!!(cur.status !== RequestStatus.Error && columns && columns.length) && (
              <Results sqlRef={sqlRef} columns={columns || []} list={rows || []} message={''} height={height} />
            )}

            {!!sqlResultList.length && cur.status === RequestStatus.Success && !columns?.length && (
              <div className={styles.ddlRes}>{query}</div>
            )}

            {(cur.status === RequestStatus.Error || cur.status === RequestStatus.Loading) && (
              <div className={styles.errInfo}>
                <div className={`${styles.errContent} ${cur.status === RequestStatus.Loading ? styles.running : ''}`}>
                  {cur.status === RequestStatus.Error ? (
                    <div>
                      <div className={styles.errTitle}>Query failed.</div>
                      <div>{cur.res.message}</div>
                    </div>
                  ) : (
                    <div>
                      <div className={styles.errTitle}>Query Running</div>
                      <div>The execution result is loading</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ResizableContainer>
  )
}

// export default observer(MessageLogs)
export default MessageLogs

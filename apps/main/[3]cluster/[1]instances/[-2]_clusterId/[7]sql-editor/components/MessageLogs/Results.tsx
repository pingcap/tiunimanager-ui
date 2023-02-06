/* eslint-disable */

import clsx from 'clsx'
import DOMPurify from 'dompurify'
// import { observer } from 'mobx-react'
import { useEffect, useMemo, useRef } from 'react'
import { VariableSizeGrid } from 'react-window'

import styles from './Results.module.less'

const Results: React.FC<{
  sqlRef: React.RefObject<HTMLDivElement>
  list: string[][]
  columns: { col: string }[]
  message: string
  height: number
}> = ({ sqlRef, list = [], columns = [], message = '', height }) => {
  const gridRef = useRef<any>(null)

  const baseWidth = useMemo(() => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return 7.8
    }

    ctx.font = '14px'
    return ctx.measureText('W').width
  }, [])

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterRowIndex(0, false)
    }
  }, [height])

  const resColumns = useMemo(() => {
    if (gridRef.current) {
      gridRef.current.resetAfterColumnIndex(0, false)
    }

    const cols = columns.map((item) => item.col)
    const lists = list.slice()
    lists.unshift(cols)

    return lists
  }, [list, columns])

  const w = useMemo(() => {
    let sumW = 0
    const res = []
    const cols = columns.map((item) => item.col)
    cols.unshift(' ')
    const lists = list.slice()
    lists.unshift(cols)

    for (let i = 0; i < columns.length; i++) {
      let max = 0

      const col = lists.map((item) => item[i].length)
      max = Math.ceil(Math.max(...col, columns[i].col.length) * baseWidth) + 16
      sumW += max
      res.push(max)
    }

    return {
      widths: res,
      total: sumW,
    }
  }, [list, columns])

  return (
    <div className={styles.logs}>
      {!!(list.length && resColumns.length) && (
        <VariableSizeGrid
          columnCount={columns.length}
          rowCount={resColumns.length}
          columnWidth={(index) => w.widths[index]}
          rowHeight={() => 40}
          height={height}
          width={w.total}
          ref={gridRef}
        >
          {({ rowIndex, columnIndex, style }) => {
            return (
              <div
                style={style}
                className={clsx(
                  styles.cell,
                  rowIndex === 0 ? styles.header : ''
                )}
              >
                <pre
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      resColumns[rowIndex][columnIndex].replaceAll(
                        '\n',
                        '<br />'
                      )
                    ),
                  }}
                ></pre>
              </div>
            )
          }}
        </VariableSizeGrid>
      )}
      {!list.length && (
        <div className={styles.noData}>{message || 'empty set'}</div>
      )}
    </div>
  )
}

// export default observer(Results)
export default Results

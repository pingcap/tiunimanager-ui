// import { Tree, Skeleton, Popup, Input, Dropdown } from '@tidb-cloud/ui-components'
import { Tree, Skeleton } from '../../ui-components'
import { Popup, Dropdown, Input } from 'semantic-ui-react'
import { debounce } from 'lodash'
// import { observer } from 'mobx-react'
import { useEffect, useContext, useState, useRef } from 'react'
import {
  AlertCircle,
  Numberic,
  LaygroundGrid02,
  Database01,
  Calendar,
  Brackets,
  String01,
  XClose,
  RefreshCw02,
  SystemDatabase
} from '../../ui-components/icons/raw'

// import { EllipseIcon } from 'dbaas/components/Icon'
import { EllipseIcon } from '../../ui-components/Icon'
import { LinkButton } from '../../ui-components/LinkButton'
import defaultContent, { preTips, affixTips } from '../SqlFiles/fileContent'
import { getDbMeta, getAllDbData, createSqlEditorFile } from '@/api/hooks/sql-editor'
// import useStores from 'dbaas/stores/useStores'
// import { eventTracking } from 'dbaas/utils/tracking'

import { SqlEditorContext } from '../context'
import { SqlFile } from '../types'

import styles from './index.module.less'

type DB = {
  name: string
  tables: {
    name: string
    columns: Columns[]
  }[]
}[]

type Columns = {
  col: string
  data_type: string
}

const DatabaseList = () => {
  // const {
  //   store: { activeProjectId, tenantData }
  // } = useStores()
  const {
    dbList,
    setDbList,
    clusterId,
    systemShow,
    setNewGeneSql,
    sqlFiles,
    setSqlFiles,
    setEditedSqlFile,
    setIsRunAll,
    setIsFromImport,
    getSqlFiles
  } = useContext(SqlEditorContext)
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('')
  const filterRef = useRef('')
  const [dbAllData, setDbAllData] = useState<any[]>([])
  const dbAllDataRef = useRef<any[]>([])
  const [filterDbList, setFilterDbList] = useState<any[]>([])
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([])
  const [autoExpandParent, setAutoExpandParent] = useState(true)
  const [isInit, setIsInit] = useState(true)
  const sqlFileRef = useRef([])
  const expandedKeysRef = useRef<React.Key[]>([])

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    sqlFileRef.current = sqlFiles
  }, [sqlFiles])

  useEffect(() => {
    if (!isInit) {
      init()
    }
  }, [systemShow])

  useEffect(() => {
    expandedKeysRef.current = expandedKeys
  }, [expandedKeys])

  const init = () => {
    getDbList()
    getAll()
  }

  const initDefaultKeys = () => {
    const keys = localStorage.getItem('Chat2querySelectedKeys') || '[]'
    const keyData = JSON.parse(keys)

    if (!expandedKeys.length) {
      const filterKey = keyData.filter((i: string) => {
        return !`${i}`.includes('-')
      })
      setExpandedKeys(filterKey)
    } else {
      setExpandedKeys(JSON.parse(keys))
    }
  }

  const getDbList = async () => {
    setLoading(true)
    setDbList([])

    try {
      // const res = await getAllDbData(tenantData.id, activeProjectId, clusterId, {
      //   isbrief: 'true'
      // })
      const res = await getAllDbData({ clusterId, params: { isbrief: 'true' } })
      const dbs = formatDb(res.data as DB)
      setIsInit(false)
      setLoading(false)
      if (!dbList.length) {
        setDbList(dbs)
        setFilterDbList(dbs)
      }
    } catch (e) {
      setLoading(false)
      if (!dbList.length) {
        setDbError(true)
      }
    }
  }

  const formatDb = (data: DB) => {
    const importData = JSON.parse(localStorage.getItem('chat2queryDefaultData') || '{}')
    const systemDatabse = ['INFORMATION_SCHEMA', 'PERFORMANCE_SCHEMA', 'MYSQL']
    const keys: any = new Set()
    // const localData = localStorage.getItem('Chat2querySelectedKeys') || '[]'
    // const localKeys = JSON.parse(keys)

    return data.map((db, index) => {
      if (importData.database) {
        if (db.name === importData.database) {
          keys.add(`${index}`)
        }
      }

      return {
        title: (
          <div className="db-name">
            <span onDoubleClick={() => schemaClick(db.name)} onClick={() => toggleExpand(`${index}`)}>
              {db.name}
            </span>
            <Dropdown
              icon={null}
              closeOnBlur
              direction="left"
              trigger={
                <LinkButton className="ellipse-btn">
                  <EllipseIcon />
                </LinkButton>
              }
            >
              <Dropdown.Menu>
                <Dropdown.Item>
                  <div onClick={() => exploreDataHandler(db.name, db.tables)}>Explore data</div>
                </Dropdown.Item>
                <Dropdown.Item>
                  <div onClick={() => toImportData(db.name)}>Import data</div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        ),
        name: db.name,
        isLeaf: !(db.tables || []).length,
        loaded: true,
        key: `${index}`,
        icon: systemDatabse.includes(db.name.toUpperCase()) ? <SystemDatabase /> : <Database01 />,
        children: (db.tables || []).map((table, idx) => {
          if (table.name === importData.table) {
            keys.add(`${index}-${idx}`)
          }

          if (
            importData.database &&
            idx === (db.tables || []).length - 1 &&
            index === data.length - 1 &&
            !expandedKeys.length
          ) {
            if (Array.from(keys).length) {
              setAutoExpandParent(false)
              setExpandedKeys(Array.from(keys))
              localStorage.setItem('Chat2querySelectedKeys', JSON.stringify(Array.from(keys)))
            }
          }

          localStorage.setItem('chat2queryDefaultData', '')

          return {
            title: (
              <div className="db-name table-name">
                <span
                  onDoubleClick={() => schemaClick(db.name)}
                  onClick={() => toggleExpand(`${index}`, `${index}-${idx}`)}
                >
                  {table.name}
                </span>
                <Dropdown
                  icon={null}
                  // closeOnBlur
                  direction="left"
                  trigger={
                    <LinkButton className="ellipse-btn">
                      <EllipseIcon />
                    </LinkButton>
                  }
                >
                  <Dropdown.Menu>
                    <Dropdown.Item>
                      <div onClick={() => tableClick(db.name, table.name, 100)}>Show 100 records</div>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ),
            name: table.name,
            isLeaf: false,
            loaded: false,
            key: `${index}-${idx}`,
            icon: <LaygroundGrid02 />,
            children: (table.columns || []).map((meta, metaIndex) => {
              return {
                title: <span className="db-name column-name">{meta.col}</span>,
                isLeaf: true,
                name: meta.col,
                key: `${index}-${idx}-${metaIndex}`,
                icon: getSchemaIcon(meta.data_type),
                children: []
              }
            })
          }
        })
      }
    })
  }

  const getAll = async () => {
    try {
      // const res = await getAllDbData(tenantData.id, activeProjectId, clusterId, {
      //   isbrief: 'false'
      // })
      const res = await getAllDbData({ clusterId, params: { isbrief: 'false' } })

      setIsInit(false)
      const dbs = formatDb(res.data as DB)
      setDbList(dbs)
      setDbAllData(dbs)
      dbAllDataRef.current = dbs
      setFilterDbList(dbs)
      setLoading(false)
    } catch (e) {
      if (!dbList.length) {
        setDbError(true)
      }
    }
  }

  useEffect(() => {
    const importData = localStorage.getItem('chat2queryDefaultData')
    if (!importData) {
      initDefaultKeys()
    }
  }, [dbList])

  const getMetaList = async (databaseName: string, tableName: string, databaseIndex: number, tabIndex: number) => {
    try {
      // const res = (await getDbMeta(tenantData.id, activeProjectId, clusterId, databaseName, tableName)) as any
      const res = (await getDbMeta({ clusterId, dbName: databaseName, tableName })) as any
      const data = res.data.columns as { col: string; data_type: string }[]
      const metas = data.map((meta, index) => {
        return {
          title: (
            <Popup
              size="mini"
              content={meta.col}
              position="right center"
              positionFixed
              basic
              trigger={<span className="db-name column-name">{meta.col}</span>}
            />
          ),
          isLeaf: true,
          name: meta.col,
          key: `${databaseIndex}-${tabIndex}-${index}`,
          icon: getSchemaIcon(meta.data_type),
          children: []
        }
      })
      const dbs = dbList.slice()
      dbs[databaseIndex].children[tabIndex].children = metas
      setDbList(dbs)
    } catch (e) {
      return e
    }
  }

  const schemaClick = (dbName: string) => {
    setNewGeneSql(`USE ${dbName};`)
  }

  const toggleExpand = (dbKey: string, tabKey?: string) => {
    const keys = new Set(expandedKeysRef.current)

    if (tabKey) {
      if (!keys.delete(tabKey)) {
        keys.add(tabKey)
      }
    } else {
      keys.has(dbKey) ? keys.delete(dbKey) : keys.add(dbKey)
    }

    onExpand(Array.from(keys))
  }

  const toImportData = (dbName: string) => {
    window.location.href = `/console/clusters/${clusterId}/imports/create-import?from=local&db=${dbName}`
  }

  const exploreDataHandler = (dbName: string, tables: { name: string }[]) => {
    tableClick(dbName, tables.length ? tables[0].name : '')
  }

  const tableClick = async (dbName: string, tabName: string, limit?: number) => {
    const name = 'New query'
    let sql = `USE ${dbName};`
    if (tabName) {
      sql += `\nSELECT * FROM ${dbName}.${tabName}${limit ? ' LIMIT ' + limit : ''};`
    }
    const content = `${preTips}\n${affixTips}\n${sql}`
    // const createRes = await createSqlEditorFile(tenantData.id, activeProjectId, clusterId, {
    //   name,
    //   content
    // })
    const createRes = await createSqlEditorFile({ clusterId, body: { name, content } })
    const file: SqlFile = {
      id: createRes.data || 0,
      content,
      name
    }

    const files: any = sqlFileRef.current.slice()
    files.unshift(file)

    setSqlFiles(files)
    setEditedSqlFile(file)

    setIsRunAll(true)
    localStorage.setItem('SqlEditorEditedFileId', `${createRes.data || ''}`)
  }

  const getSchemaIcon = (typeRaw: string) => {
    const type = typeRaw.toUpperCase()
    if (
      [
        'BIT',
        'BOOLEAN',
        'TINYINT',
        'SMALLINT',
        'MEDIUMINT',
        'INTEGER',
        'INT',
        'BIGINT',
        'FLOAT',
        'DOUBLE',
        'DECIMAL',
        'NUMERIC'
      ].includes(type)
    ) {
      return <Numberic />
    }

    if (
      [
        'CHAR',
        'VARCHAR',
        'TEXT',
        'TINYTEXT',
        'MEDIUMTEXT',
        'LONGTEXT',
        'BINARY',
        'VARBINARY',
        'BLOB',
        'TINYBLOB',
        'MEDIUMBLOB',
        'LONGBLOB',
        'ENUM',
        'SET'
      ].includes(type)
    ) {
      return <String01 />
    }

    if (['DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR'].includes(type)) {
      return <Calendar />
    }

    if (type === 'JSON') {
      return <Brackets />
    }
  }

  const onLoadData = (node: any) => {
    const pos = node.pos.split('-')
    const db = dbList[pos[1]]

    return new Promise<void>(async (resolve, reject) => {
      if (node.children.length) {
        resolve()
        return
      }

      if (pos.length === 3) {
        // eventTracking('SQL Editor Fetch Meta List')

        getMetaList(db.name, db.children[pos[2]].name, pos[1], pos[2]).then((res) => {
          if (res) {
            reject()
          } else {
            const keys = new Set(expandedKeys)
            keys.add(node.key)
            setAutoExpandParent(false)
            setExpandedKeys(Array.from(keys))
            resolve()
          }
        })
      }
    })
  }

  const refresh = () => {
    init()
  }

  const handleDebounceFn = (val: string) => {
    if (!val) {
      setFilterDbList(dbAllData)
      return
    }

    const newExpandedKeys: any = new Set()

    if (val !== filterRef.current) {
      return
    }

    // const dbs = (dbAllDataRef.current || []).filter((db: any) => {
    //   db.children = (db.children || []).filter((table: any) => {
    //     const metas = (table.children || []).filter((meta: any) => meta.name.toLowerCase().includes(val))
    //     table.children = metas
    //     if (metas.length) {
    //       newExpandedKeys.add(table.key)
    //     } else {
    //       newExpandedKeys.delete(table.key)
    //       if (table.name.toLowerCase().includes(val)) {
    //         newExpandedKeys.add(db.key)
    //       }
    //     }
    //     return table.name.toLowerCase().includes(val)
    //   })
    //   return db.name.toLowerCase().includes(val)
    // })

    // setFilterDbList(dbs)

    dbAllDataRef.current.forEach((item: any) => {
      item.children.map((table: any) => {
        if (table.children.some((meta: any) => meta.name.toLowerCase().indexOf(val) > -1)) {
          newExpandedKeys.add(table.key)
        } else {
          if (table.name.toLowerCase().indexOf(val) > -1 && !newExpandedKeys.has(item.key)) {
            newExpandedKeys.add(item.key)
          }
        }
      })
    })

    setAutoExpandParent(true)
    setExpandedKeys(Array.from(newExpandedKeys))
  }

  const debounceFn = debounce(handleDebounceFn, 300)

  const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const val = value.trim().toLowerCase()

    setFilter(val)
    filterRef.current = val

    if (!val) {
      setTimeout(() => {
        clearFilter()
      }, 300)
      return
    }

    debounceFn(val)
  }

  const clearFilter = () => {
    setFilter('')
    filterRef.current = ''

    const keys = localStorage.getItem('Chat2querySelectedKeys') || '[]'
    onExpand(JSON.parse(keys))
  }

  const onExpand = (keys: React.Key[]) => {
    setAutoExpandParent(false)
    const filters = keys.filter((k: string) => {
      const arrs = `${k}`.split('-')
      if (keys.includes(arrs[0])) {
        return true
      }
      return false
    })
    setExpandedKeys(filters)
    localStorage.setItem('Chat2querySelectedKeys', JSON.stringify(filters))
  }

  return (
    <div className={styles.dbListWrap}>
      <div className={styles.databaseFilter}>
        <Popup
          size="mini"
          content="Refresh"
          position="top left"
          trigger={<RefreshCw02 className={styles.refresh} onClick={refresh} />}
        />

        <div className={styles.inputWrap}>
          <Input
            maxLength={64}
            placeholder="Search"
            value={filter}
            // onFocus={() => eventTracking('SQL Editor Search File Focus')}
            onInput={filterChange}
          />
          {filter && <XClose onClick={clearFilter} />}
        </div>
      </div>

      <div className={styles.databaseList} ref={ref}>
        {!loading && (
          <Tree
            showIcon
            showLine={false}
            treeData={dbList}
            autoExpandParent={autoExpandParent}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            loadData={onLoadData}
          />
        )}

        {!!loading && (
          <div className="skeleton-wrap">
            <Skeleton count={20} />
          </div>
        )}

        {!!dbError && !dbList.length && !loading && (
          <div className={styles.dbError}>
            <AlertCircle color="#E65C5C" />
            <div className={styles.errorText}>
              Failed to fetch databases. Check{' '}
              <LinkButton eventName="Sql Editor Database List Error Link Clicked" to={`/console/clusters/${clusterId}`}>
                database status
              </LinkButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// export default observer(DatabaseList)
export default DatabaseList

// import { Dropdown, Modal, Skeleton, Input, Popup } from '@tidb-cloud/ui-components'
import { Dropdown, Modal, Input, Popup, Button } from 'semantic-ui-react'
import { Skeleton } from '../../ui-components'
// import { observer } from 'mobx-react'
import { useEffect, useRef, useState, useContext } from 'react'
// import { UseFormMethods } from 'react-hook-form'
import { Plus, XClose, File06 } from '../../ui-components/icons/raw'

// import Button from 'dbaas/components/Button'
// import { Form } from 'dbaas/components/Form'
// import { FormInput } from 'dbaas/components/Form'
import { CIcon, EllipseIcon } from '../../ui-components/Icon'
import { LinkButton } from '../../ui-components/LinkButton'
import {
  getSqlEditorFiles,
  createSqlEditorFile,
  deleteSqlEditorFile,
  updateSqlEditorFile,
  createsSqlEditorSession,
  // getIsTableExist
} from '@/api/hooks/sql-editor'
// import useStores from 'dbaas/stores/useStores'
// import { eventTracking } from 'dbaas/utils/tracking'
// import { sqlEditorFileNameRules } from 'dbaas/utils/validationRules'

import { SqlEditorContext } from '../context'
import { SqlFile } from '../types'

import defaultContent, { newFileContent, preTips, affixTips } from './fileContent'
import styles from './index.module.less'

type FormProps = {
  name: string
}

const SqlFiles = () => {
  const [open, setOpen] = useState(false)
  const [isRename, setIsRename] = useState(false)
  const [deleteOpenVisible, setDeleteOpenVisible] = useState(false)
  const operFile = useRef<SqlFile | null>(null)
  const [renameFile, setRenameFile] = useState<SqlFile | null>(null)

  // const formRef = useRef<UseFormMethods<FormProps>>()
  const [loading, setLoading] = useState(true)
  const {
    // orgId,
    // projectId,
    clusterId,
    sqlFiles,
    setSqlFiles,
    editedSqlFile,
    setEditedSqlFile,
    getSqlFiles,
    isCreatingFile,
    setIsCreatingFile,
    setSqlResultList,
    setIsFromImport
  } = useContext(SqlEditorContext)
  const [filterSqlFiles, setFilterSqlFiles] = useState<SqlFile[]>([])
  const [filter, setFilter] = useState('')

  // const {
  //   store: { preloadedSQLEditor },
  //   actions: { setPreloadedSQLEditor }
  // } = useStores()

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    const files = (sqlFiles && sqlFiles.slice()) || []
    setFilterSqlFiles(files.filter((file: SqlFile) => file.name.toLowerCase().includes(filter)))
  }, [sqlFiles])

  const initNoImport = async () => {
    // const res = await getSqlEditorFiles(orgId, projectId, clusterId)
    const res = await getSqlEditorFiles({ clusterId })

    // if (res.code !== 200) {
    if (res.code !== 0) {
      setLoading(false)
      return
    }

    const data = res.data || []

    const lastFile = localStorage.getItem('SqlEditorEditedFileId') || ''

    if (!data.length) {
      setIsCreatingFile(true)

      const initName = 'Getting Started'
      // const createRes = await createSqlEditorFile(orgId, projectId, clusterId, {
      //   name: initName,
      //   content: defaultContent
      // })
      const createRes = await createSqlEditorFile({
        clusterId, body: {
          name: initName,
          content: defaultContent
        }
      })

      const file = {
        id: createRes.data,
        content: defaultContent,
        name: initName
      } as SqlFile

      setSqlFiles([file])

      setTimeout(() => {
        setEditedSqlFile(file)
        setIsCreatingFile(false)
        setLoading(false)
      })

      if (!lastFile) {
        localStorage.setItem('SqlEditorEditedFileId', `${createRes.data || ''}`)
      }
    } else {
      setSqlFiles(data)

      let cur = data[0]
      data.forEach((file: any) => {
        if (file.id === parseInt(lastFile)) {
          cur = file
        }
      })

      setEditedSqlFile(cur)
      setLoading(false)
    }
  }

  const init = async () => {
    // const { table = '', db = '' } = preloadedSQLEditor || {}
    const table = ''
    const db = ''
    if (!table || !db) {
      initNoImport()
      return
    }

    try {
      // const res = await getIsTableExist(orgId, projectId, clusterId, db, table)
      // const { is_exist, session_id } = res.data || {}
      const is_exist = false
      const session_id = ''
      if (!is_exist) {
        initNoImport()
        return
      }

      const name = 'New query'
      const content = `${preTips}\n${affixTips}\nUSE ${db};\nSELECT * from ${db}.${table} limit 10;`
      // const createRes = await createSqlEditorFile(orgId, projectId, clusterId, {
      //   name,
      //   content
      // })
      const createRes = await createSqlEditorFile({
        clusterId, body: {
          name,
          content
        }
      })

      // if (createRes.code !== 200) {
      if (createRes.code !== 0) {
        initNoImport()
        return
      }

      setLoading(false)

      const file: SqlFile = {
        id: createRes.data || 0,
        content,
        sessionId: session_id,
        name
      }

      getSqlFiles(false, file)
      // setPreloadedSQLEditor(null)
      setIsFromImport(true)

      localStorage.setItem('SqlEditorEditedFileId', `${createRes.data || ''}`)
    } catch (e) {
      initNoImport()
    }
  }

  // const confirm = async (values: FormProps) => {
  //   if (!operFile.current) {
  //     return
  //   }
  //   await updateSqlEditorFile(orgId, projectId, clusterId, operFile.current.id, {
  //     ...operFile.current,
  //     name: values.name
  //   })

  //   setOpen(false)
  //   getSqlFiles()
  // }

  const deleteFileConfirm = async () => {
    if (!operFile.current) {
      return
    }

    // await deleteSqlEditorFile(orgId, projectId, clusterId, operFile.current?.id)
    await deleteSqlEditorFile({ clusterId, sqlFileId: operFile.current?.id })
    setDeleteOpenVisible(false)

    const files = sqlFiles.slice()
    const index = files.findIndex((item: SqlFile) => item.id === operFile.current?.id)
    if (index > -1) {
      files.splice(index, 1)
    }
    setSqlFiles(files)

    const lastFile = localStorage.getItem('SqlEditorEditedFileId') || ''
    if (lastFile && `${operFile.current?.id}` === lastFile) {
      localStorage.setItem('SqlEditorEditedFileId', files[0].id)
    }

    if (`${operFile.current?.id}` === `${editedSqlFile.id}`) {
      const index = sqlFiles.findIndex((item: SqlFile) => item.id !== editedSqlFile.id)
      setEditedSqlFile(sqlFiles[index])
    }
  }

  const selectFileHandler = (file: SqlFile) => {
    setEditedSqlFile(file)
    localStorage.setItem('SqlEditorEditedFileId', `${file.id}`)
    setSqlResultList([])
  }

  const filterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    const val = value.toLowerCase()
    setFilter(val)

    if (!val) {
      setFilterSqlFiles(sqlFiles.slice())
      return
    }

    const list = sqlFiles.slice()
    const data = list.filter((file: SqlFile) => file.name.toLowerCase().includes(val))
    setFilterSqlFiles(data)
  }

  const clearFilter = () => {
    setFilter('')
    setFilterSqlFiles(sqlFiles.slice())
  }

  const addNewFile = async () => {
    if (isCreatingFile) {
      return
    }

    setIsCreatingFile(true)

    try {
      const fileParams = {
        name: `New query`,
        content: newFileContent
      }
      // const createRes = await createSqlEditorFile(orgId, projectId, clusterId, fileParams)
      const createRes = await createSqlEditorFile({ clusterId, body: fileParams })

      const { code, data: id } = createRes

      // if (code !== 200) {
      if (code !== 0) {
        setIsCreatingFile(false)
        return
      }

      const files = sqlFiles.slice()
      files.unshift({
        id,
        ...fileParams
      })

      setSqlFiles(files)

      // const session = await createsSqlEditorSession(orgId, projectId, clusterId, {})
      const session = await createsSqlEditorSession({ clusterId, body: {} })
      files.forEach((item: SqlFile) => {
        if (item.id === id) {
          item.sessionId = session.data

          setSqlFiles(files)
          setEditedSqlFile({
            id,
            sessionId: session.data,
            ...fileParams
          })
        }
      })

      setIsCreatingFile(false)

      localStorage.setItem('SqlEditorEditedFileId', `${id}`)
    } catch {
      setIsCreatingFile(false)
    }
  }

  const fileRenameKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!renameFile?.name?.length && e.key === '-') {
      e.preventDefault()
      return false
    }

    if (e.key === 'enter') {
    }

    if (!/[-A-Za-z0-9\s]/.test(e.key)) {
      e.preventDefault()
      return false
    }
  }

  const fileRenameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    setRenameFile({
      ...renameFile,
      name: value
    } as SqlFile)
  }

  const fileRenameBlur = async () => {
    setIsRename(false)

    let name = (renameFile?.name || '').trim()
    if (!renameFile || !name) {
      return
    }

    if (name[name.length - 1] === '-') {
      name = name.substring(0, name.length - 1)
    }

    if (name.length < 4) {
      return
    }

    // await updateSqlEditorFile(orgId, projectId, clusterId, renameFile.id, {
    //   ...renameFile,
    //   name
    // })
    await updateSqlEditorFile({
      clusterId, sqlFileId: renameFile.id, body: {
        ...renameFile,
        name
      }
    })

    getSqlFiles(true)
  }

  return (
    <div>
      <div className={styles.filterInput}>
        <Popup
          size="mini"
          content={'Create a new SQL file'}
          position="top left"
          trigger={
            <Button
              basic
              className="add-btn"
              loading={isCreatingFile}
              onClick={addNewFile}
              eventName="SQL Editor Add New SQL Editor File Button Clicked"
              eventParams={{
                position: 'Side Menu'
              }}
            >
              <Plus />
            </Button>
          }
        />

        <div className={styles.inputWrap}>
          <Input
            maxLength={64}
            placeholder="Search"
            value={filter}
            // onFocus={() => eventTracking('SQL Editor Search File Focus')}
            onChange={filterChange}
          />
          {filter && <XClose onClick={clearFilter} />}
        </div>
      </div>

      <div className={styles.fileList}>
        {!!loading && (
          <div className={styles.skeletonWrap}>
            <Skeleton count={20} />
          </div>
        )}

        {!!(!loading && sqlFiles.length) && (
          <>
            {!filterSqlFiles.length && sqlFiles.length && <div className={styles.noRes}>No query files</div>}

            {filterSqlFiles.map((file: SqlFile) => (
              <div
                key={file.id}
                className={`${styles.fileItem}
                  ${file.id === (editedSqlFile && editedSqlFile.id) ? styles.active : ''}
                `}
                onClick={() => selectFileHandler(file)}
              >
                <span className={styles.fileName}>
                  <File06 />
                  {isRename && operFile.current?.id === file.id ? (
                    <Input
                      value={renameFile?.name}
                      maxLength={64}
                      onKeyDown={fileRenameKeydown}
                      onChange={fileRenameChange}
                      onBlur={fileRenameBlur}
                    />
                  ) : (
                    <span>{file.name}</span>
                  )}
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
                      <div
                        onClick={() => {
                          // eventTracking('SQL Editor File Rename Button Clicked')

                          setIsRename(true)
                          setRenameFile(file)
                          operFile.current = file
                        }}
                      >
                        {/* <CIcon name="pencil" /> */}
                        Rename
                      </div>
                    </Dropdown.Item>

                    {sqlFiles.length > 1 && (
                      <Dropdown.Item>
                        <div
                          onClick={() => {
                            // eventTracking('SQL Editor File Delete Button Clicked')

                            setDeleteOpenVisible(true)
                            operFile.current = file
                          }}
                        >
                          {/* <CIcon name="trash" />  */}
                          Delete
                        </div>
                      </Dropdown.Item>
                    )}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            ))}
          </>
        )}

        {/* <Modal size="tiny" open={open} className={`${styles.modal} ${styles.renameModal}`}>
          <Modal.Header>Rename</Modal.Header>
          <div className={styles.content}>
            <div className={styles.title}>File Name</div>
            <Form<FormProps>
              className="config-form"
              ref={formRef}
              onSubmit={confirm}
              defaultValues={{
                name: operFile.current?.name || ''
              }}
              resetFormOnCancel
              submitContent="Confirm"
              onCancel={() => setOpen(false)}
            >
              <FormInput name="name" placeholder="New Query" maxLength={64} rules={sqlEditorFileNameRules} />
            </Form>
          </div>
        </Modal> */}

        <Modal size="tiny" open={deleteOpenVisible} className={styles.modal}>
          <Modal.Header>Delete SQL File</Modal.Header>
          <div className={styles.content}>
            <div className={styles.desc}>Are you sure you want to delete "{operFile.current?.name}"?</div>

            <div className={styles.btns}>
              <Button eventName="Delete File Cancel Button Clicked" basic onClick={() => setDeleteOpenVisible(false)}>
                Cancel
              </Button>
              <Button eventName="Delete File Confirm Button Clicked" negative onClick={deleteFileConfirm}>
                Confirm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  )
}

// export default observer(SqlFiles)
export default SqlFiles

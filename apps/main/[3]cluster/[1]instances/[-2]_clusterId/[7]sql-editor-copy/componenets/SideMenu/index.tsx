import { useContext, useEffect, useState } from 'react'

// import useStores from 'dbaas/stores/useStores'
// import { eventTracking } from 'dbaas/utils/tracking'

import { SqlEditorContext } from '../context'
import DatabaseList from '../DatabaseList'
import SqlFiles from '../SqlFiles'

import styles from './index.module.less'

const SideMenu = () => {
  // const {
  //   store: { preloadedSQLEditor }
  // } = useStores()
  const preloadedSQLEditor: any = {}

  const { sideMenuAcitveIndex, setSideMenuAcitveIndex } = useContext(SqlEditorContext)

  useEffect(() => {
    if (preloadedSQLEditor && preloadedSQLEditor.db && preloadedSQLEditor.table) {
      setSideMenuAcitveIndex(0)
      localStorage.setItem('Chat2querySideMenuActive', '0')
    } else {
      const lastIndex = parseInt(localStorage.getItem('Chat2querySideMenuActive') || '0')
      setSideMenuAcitveIndex(lastIndex)
    }
  }, [])

  const menuChange = (index: number, menuName: string) => {
    setSideMenuAcitveIndex(index)
    localStorage.setItem('Chat2querySideMenuActive', `${index}`)
    // eventTracking(`${menuName} Tab Clicked`)
  }

  return (
    <div className={styles.sideMenu}>
      <div className={styles.header}>
        {['Schemas', 'SQL Files'].map((item, index) => (
          <div
            key={index}
            className={`${index === sideMenuAcitveIndex ? 'active' : ''}`}
            onClick={() => menuChange(index, item)}
          >
            {item}
          </div>
        ))}
      </div>

      <div className={`${!sideMenuAcitveIndex ? styles.open : styles.hide}`}>
        <DatabaseList />
      </div>

      <div className={`${!!sideMenuAcitveIndex ? styles.open : styles.hide}`}>
        <SqlFiles />
      </div>
    </div>
  )
}

export default SideMenu

import { FC } from 'react'
import { Layout } from 'antd'
import styles from './index.module.less'

const BlankLayout: FC = (props) => {
  return <Layout className={styles.blankLayout}>{props.children}</Layout>
}

export default BlankLayout

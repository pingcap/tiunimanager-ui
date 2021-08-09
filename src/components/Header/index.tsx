import { PageHeader } from 'antd'
import styles from './index.module.less'

import { PageHeaderProps } from 'antd/lib/page-header'

export default function Header(props: PageHeaderProps) {
  return <PageHeader className={styles.pageHeader} ghost={false} {...props} />
}

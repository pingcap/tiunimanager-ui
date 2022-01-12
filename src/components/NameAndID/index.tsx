import { Link } from 'react-router-dom'
import styles from './index.module.less'

export interface NameAndIDProps {
  id: string
  link?: string
  name?: string
}

export function NameAndID({ id, name, link }: NameAndIDProps) {
  return (
    <div>
      {link ? (
        <Link className={styles.idLine} to={link}>
          {id}
        </Link>
      ) : (
        <a className={styles.idLine}>{id}</a>
      )}
      <div className={styles.nameLine}>{name || '-'}</div>
    </div>
  )
}

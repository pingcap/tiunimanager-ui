import { CSSProperties, ReactNode, useMemo } from 'react'
import styles from './index.module.less'
import { Tooltip } from 'antd'

interface CheckCardProps {
  onClick?: (e: Event, value?: any) => void
  checked?: boolean
  disabled?: boolean
  style?: CSSProperties
  className?: string
  title?: ReactNode
  description?: ReactNode
  cover?: string
  value?: any
  bordered?: boolean
  tooltip?: string
}

export default function (props: CheckCardProps) {
  const {
    className,
    title,
    description,
    style = {},
    checked,
    disabled = false,
    bordered = true,
    value,
    cover,
    onClick,
    tooltip,
  } = props

  let wrapperClass = styles.radioCard
  if (className) wrapperClass += ` ${className}`
  if (checked) wrapperClass += ` ${styles.checked}`
  if (disabled) wrapperClass += ` ${styles.disabled}`
  if (bordered) wrapperClass += ` ${styles.bordered}`

  const handleClick = (e: any) => {
    if (!disabled) onClick?.(e, value)
  }

  const metaDom = useMemo(() => {
    const headerDom = title && (
      <div className={styles.header}>
        <div className={styles.title}>{title}</div>
      </div>
    )

    const descriptionDom = description ? (
      <div className={styles.description}>{description}</div>
    ) : cover ? (
      <img src={cover} alt="cover" />
    ) : null

    return (
      <div
        className={cover ? `${styles.content} ${styles.cover}` : styles.content}
      >
        {headerDom || descriptionDom ? (
          <>
            {headerDom}
            {tooltip ? (
              <Tooltip title={tooltip}>{descriptionDom}</Tooltip>
            ) : (
              descriptionDom
            )}
          </>
        ) : null}
      </div>
    )
  }, [description, title])

  return (
    <div className={wrapperClass} style={style} onClick={handleClick}>
      {metaDom}
    </div>
  )
}

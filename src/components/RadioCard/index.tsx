/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

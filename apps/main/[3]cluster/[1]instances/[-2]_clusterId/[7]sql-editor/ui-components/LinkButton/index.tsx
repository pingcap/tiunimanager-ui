/* eslint-disable */

import { Button, StrictButtonProps } from 'semantic-ui-react'
import clsx from 'clsx'
// import React from 'react'
import { Link } from 'react-router-dom'

// import { eventTracking } from 'dbaas/utils/tracking'

import styles from './index.module.less'

export interface ButtonProps extends StrictButtonProps {
  className?: string
  link?: boolean
  disabled?: boolean
  to?: string
  eventName?: string
  eventParams?: { [key: string]: string }
}

export const LinkButton: React.FC<ButtonProps> = ({
  link = true,
  to,
  className,
  disabled,
  children,
  eventName,
  eventParams = {},
  onClick,
  ...rest
}) => {
  const clickHandler = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (disabled) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (eventName) {
      // eventTracking(eventName, {
      //   ...eventParams
      // })
    }

    onClick?.(e, rest)
  }

  const btn = link ? (
    <button
      className={clsx(
        className,
        link ? styles.link : '',
        disabled ? 'disabled' : ''
      )}
      onClick={clickHandler}
    >
      {children}
    </button>
  ) : (
    <Button
      className={clsx(styles.button, className)}
      disabled={disabled}
      onClick={clickHandler}
      {...rest}
    >
      {children}
    </Button>
  )
  return to && !disabled ? <Link to={to}>{btn}</Link> : btn
}

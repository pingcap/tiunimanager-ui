/*
 * Copyright 2022 PingCAP
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

import { PropsWithChildren, ReactNode, useState } from 'react'
import { Button, Input, Modal } from 'antd'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'
import { Trans } from 'react-i18next'

loadI18n()

export interface DeleteConfirmProps {
  title: ReactNode | (() => ReactNode)
  content?: ReactNode
  disabled?: boolean
  onCancel?: () => void
  onConfirm: (close: () => void) => void
  confirmInput?: {
    expect: string
  }
}

export function DeleteConfirm({
  title,
  content,
  disabled,
  onCancel,
  onConfirm,
  confirmInput,
  children,
}: PropsWithChildren<DeleteConfirmProps>) {
  const { t } = useI18n()

  const [visible, setVisible] = useState(false)
  const [input, setInput] = useState('')

  const confirmDisabled = confirmInput && input !== confirmInput.expect

  const popConfirmModal = () => {
    if (disabled) return
    setVisible(true)
  }

  const close = () => {
    setVisible(false)
    setInput('')
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }

    close()
  }

  const handleConfirm = () => {
    onConfirm(close)
  }

  const modal = (
    <Modal
      className={styles.confirmModal}
      footer={null}
      maskClosable={false}
      title={title}
      visible={visible}
      onCancel={handleCancel}
    >
      {content}
      {confirmInput && (
        <>
          <p>
            <Trans
              t={t}
              i18nKey="tip"
              values={confirmInput}
              components={{ strong: <strong /> }}
            />
          </p>
          <p>
            <Input
              className={styles.expectInput}
              onInput={(e) => setInput((e.target as HTMLInputElement).value)}
            />
          </p>
        </>
      )}
      <Button
        className={styles.confirmButton}
        onClick={handleConfirm}
        disabled={confirmDisabled}
        danger
        type="primary"
      >
        {t('confirm')}
      </Button>
    </Modal>
  )

  return (
    <>
      {visible && modal}
      <span onClick={popConfirmModal}>{children}</span>
    </>
  )
}

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
  onConfirm: (close: () => void) => void
  confirmInput?: {
    tip: string
    expect: string
  }
}

export function DeleteConfirm({
  title,
  content,
  disabled,
  onConfirm,

  confirmInput,

  children,
}: PropsWithChildren<DeleteConfirmProps>) {
  const { t } = useI18n()

  const [visible, setVisible] = useState(false)
  const [input, setInput] = useState('')
  const popConfirmModal = () => {
    if (disabled) return
    setVisible(true)
  }

  const close = () => {
    setVisible(false)
    setInput('')
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
      onCancel={close}
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
        disabled={confirmInput && input !== confirmInput.expect}
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

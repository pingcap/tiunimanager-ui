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

import { useCallback, useRef, useState } from 'react'
import { AxiosError } from 'axios'
import { Button, Card, Form, Input, Layout } from 'antd'
import {
  CheckCircleFilled,
  DownOutlined,
  FrownOutlined,
  KeyOutlined,
} from '@ant-design/icons'
import { useI18n } from '@i18n-macro'
import { useAuthState } from '@store/auth'
import { UserInfo } from '@/api/model'
import { doUserLogout, resetUserPassword } from '@/api/hooks/platform'
import LanguageDropdown from '@/components/LanguageDropdown'
import { Logo } from '@/components/Logo'
import loginBgImg from '/img/background/login.svg'

import styles from './index.module.less'

export default function ResetPassword() {
  const { t } = useI18n()

  const clearPersistedAuth = useAuthState((state) => state.clearPersistedAuth)
  const dispatchLogout = useAuthState((state) => state.logout)
  const userId = useAuthState((state) => state.session)
  const passwordExpired = useAuthState((state) => state.passwordExpired)

  const [resetAlread, setResetAlread] = useState(false)

  const [refForm] = Form.useForm()
  const refPassword = useRef<Input>(null)

  const { handleSubmit, errorMsg, clearErrorMsg, loading } = useResetPassword(
    (data) => {
      if (data) {
        clearPersistedAuth()
        setResetAlread(true)
      }
    },
    () => {
      refForm.setFieldsValue({ password: '' })
      refPassword.current?.focus()
    }
  )

  const backToLogin = useCallback(() => {
    doUserLogout().then(dispatchLogout)
  }, [dispatchLogout])

  return (
    <div className={styles.wrapper}>
      <Layout className={styles.layout}>
        <Card
          className={`${styles.container} ${styles.formContainer}`}
          bordered={false}
        >
          <Logo type="common" className={styles.logo} logoWidth={240} />
          {resetAlread ? (
            <div className={styles.resetResult}>
              <div className={styles.resetResultTitle}>
                <CheckCircleFilled className={styles.resetResultIcon} />
                {t('message.success')}
              </div>
              <Button type="primary" size="large" block onClick={backToLogin}>
                {t('result.login')}
              </Button>
            </div>
          ) : (
            <Form
              className={styles.form}
              onFinish={handleSubmit}
              layout="vertical"
              form={refForm}
            >
              {passwordExpired && (
                <div className={styles.passwordTip}>
                  <FrownOutlined className={styles.passwordTipIcon} />
                  {t('form.resetTips')}
                </div>
              )}
              <Form.Item name="userId" hidden initialValue={userId}>
                <Input disabled />
              </Form.Item>
              <Form.Item
                name="password"
                {...(errorMsg && {
                  help: t('message.error', { msg: errorMsg }),
                  validateStatus: 'error',
                })}
                rules={[
                  {
                    required: true,
                    pattern:
                      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9~!@#$%^&*]{8,16}$/,
                    message: t('rules.password'),
                  },
                ]}
              >
                <Input.Password
                  prefix={<KeyOutlined />}
                  placeholder={t('form.password')}
                  size="large"
                  minLength={8}
                  maxLength={20}
                  disabled={loading}
                  onInput={clearErrorMsg}
                  ref={refPassword}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  block
                >
                  {t('form.submit')}
                </Button>
              </Form.Item>
            </Form>
          )}
          <div className={styles.toolbar}>
            <LanguageDropdown className={styles.switchLanguage}>
              <a>
                {t('switch_language')} <DownOutlined />
              </a>
            </LanguageDropdown>
          </div>
        </Card>
        <Card className={styles.container} bordered={false}>
          <img className={styles.bgImg} src={loginBgImg} alt="Landing" />
        </Card>
      </Layout>
    </div>
  )
}

function useResetPassword(
  onSuccess: (data: UserInfo) => void,
  onFailure: () => void
) {
  const { t } = useI18n()

  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string>()

  const clearErrorMsg = () => setErrorMsg(undefined)

  const handleSubmit = async (form: { userId: string; password: string }) => {
    clearErrorMsg()
    setLoading(true)
    try {
      const result = await resetUserPassword({
        userId: form.userId,
        password: form.password,
      })
      setLoading(false)
      onSuccess(result.data.data!)
    } catch (err) {
      setErrorMsg(
        t(`error:${(err as AxiosError).response?.data?.code}`, 'unknown')
      )
      onFailure()
      // when success, this component will be unmounted immediately so no need to setLoading()
      setLoading(false)
    }
  }

  return { handleSubmit, loading, errorMsg, clearErrorMsg }
}

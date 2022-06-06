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

import { useI18n } from '@i18n-macro'
import { useAuthState } from '@store/auth'
import { Button, Card, Form, Input, Layout } from 'antd'
import { useRef, useState } from 'react'
import { useHistoryWithState } from '@/router/helper'

import styles from './index.module.less'
import { DownOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons'
import LanguageDropdown from '@/components/LanguageDropdown'
import { UserInfo } from '@/api/model'
import { doUserLogin } from '@/api/hooks/platform'
import { Logo } from '@/components/Logo'
import { AxiosError } from 'axios'

import loginBgImg from '/img/background/login.svg'

export default function Login() {
  const { t } = useI18n()
  const {
    push,
    location: {
      state: { from },
    },
  } = useHistoryWithState()
  const dispatchLogin = useAuthState((state) => state.login)

  const [refForm] = Form.useForm()
  const refPassword = useRef<Input>(null)

  const { handleSubmit, errorMsg, clearErrorMsg, loading } = useLogin(
    (data) => {
      if (data.passwordExpired) {
        dispatchLogin(
          {
            token: data.token!,
            session: data.userId!,
            passwordExpired: true,
          },
          {
            persisted: false,
          }
        )
      } else {
        dispatchLogin({
          token: data.token!,
          session: data.userId!,
          passwordExpired: false,
        })
        push(from)
      }
    },
    () => {
      refForm.setFieldsValue({ password: '' })
      refPassword.current?.focus()
    }
  )

  return (
    <div className={styles.wrapper}>
      <Layout className={styles.layout}>
        <Card
          className={`${styles.container} ${styles.formContainer}`}
          bordered={false}
        >
          <Logo type="common" className={styles.logo} logoWidth={140} />
          <Form
            className={styles.form}
            onFinish={handleSubmit}
            layout="vertical"
            form={refForm}
          >
            <Form.Item name="username" rules={[{ required: true }]}>
              <Input
                prefix={<UserOutlined />}
                size="large"
                placeholder={t('form.username')}
                disabled={loading}
              />
            </Form.Item>
            <Form.Item
              name="password"
              {...(errorMsg && {
                help: t('message.error', { msg: errorMsg }),
                validateStatus: 'error',
              })}
            >
              <Input.Password
                prefix={<KeyOutlined />}
                placeholder={t('form.password')}
                size="large"
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

function useLogin(onSuccess: (data: UserInfo) => void, onFailure: () => void) {
  const { t } = useI18n()

  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string>()

  const clearErrorMsg = () => setErrorMsg(undefined)

  const handleSubmit = async (form: { username: string; password: string }) => {
    clearErrorMsg()
    setLoading(true)
    try {
      const result = await doUserLogin({
        userName: form.username,
        userPassword: form.password,
      })
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

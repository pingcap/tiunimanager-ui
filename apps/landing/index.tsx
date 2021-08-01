import { useI18n } from '@i18n-macro'
import { dispatchAuthState } from '@store/auth'
import { useHistory } from 'react-router-dom'
import { Button, Card, Form, Input, Layout } from 'antd'
import { useRef, useState } from 'react'
import { RouteContext } from '@/router/helper'

import styles from './index.module.less'
import { GlobalOutlined, KeyOutlined, UserOutlined } from '@ant-design/icons'
import LanguageDropdown from '@/components/LanguageDropdown'
import { UserapiUserIdentity } from '#/api'
import { APIS } from '@/api/client'

export default function Login() {
  const { t } = useI18n()
  const history = useHistory<RouteContext>()

  const [refForm] = Form.useForm()
  const refPassword = useRef<Input>(null)

  const { handleSubmit, errorMsg, clearErrorMsg, loading } = useLogin(
    (data) => {
      dispatchAuthState({
        type: 'login',
        session: data.userName!,
        token: data.token,
      })
      history.push(history.location.state.from || '/')
    },
    () => {
      refForm.setFieldsValue({ password: '' })
      refPassword.current?.focus()
    }
  )

  return (
    <Layout
      style={{
        minHeight: '100vh',
      }}
    >
      <Card
        className={styles.container}
        bordered={false}
        bodyStyle={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Form
          className={styles.form}
          onFinish={handleSubmit}
          layout="vertical"
          form={refForm}
          validateMessages={{
            required: t('validation.required'),
          }}
        >
          {/*<Logo className={styles.logo} />*/}
          {/*<Form.Item>*/}
          {/*  <h2>{t('form.title')}</h2>*/}
          {/*</Form.Item>*/}
          <Form.Item
            name="username"
            label={t('form.username')}
            rules={[{ required: true }]}
          >
            <Input prefix={<UserOutlined />} disabled={loading} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('form.password')}
            {...(errorMsg && {
              help: errorMsg,
              validateStatus: 'error',
            })}
          >
            <Input
              prefix={<KeyOutlined />}
              type="password"
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
        <LanguageDropdown className={styles.switchLanguage}>
          <a>
            <GlobalOutlined /> {t('switch_language')}
          </a>
        </LanguageDropdown>
      </Card>
    </Layout>
  )
}

function useLogin(
  onSuccess: (data: UserapiUserIdentity & { token: string }) => void,
  onFailure: (msg: string) => void
) {
  const { t } = useI18n()
  const [loading, setLoading] = useState(false)
  // Error from response.
  const [error, setError] = useState(null)

  const clearErrorMsg = () => setError(null)

  const handleSubmit = async (form: { username: string; password: string }) => {
    try {
      clearErrorMsg()
      setLoading(true)
      const resp = await APIS.Platform.userLoginPost({
        userName: form.username,
        userPassword: form.password,
      })
      setLoading(false)
      if (resp.data.data)
        onSuccess({
          ...resp.data.data,
          token: resp.headers.token,
        })
      else onFailure((resp.data as any).message)
    } catch (e) {
      setLoading(false)
      if (!e.handled) {
        setError(t('message.error', { msg: e.response.data.message }))
        onFailure(e.response.data.message)
      }
    }
  }

  return { handleSubmit, loading, errorMsg: error, clearErrorMsg }
}

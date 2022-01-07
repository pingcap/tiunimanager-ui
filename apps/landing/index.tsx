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
      dispatchLogin(data.token!, data.userName!)
      push(from)
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
      <Card className={styles.container} bordered={false}>
        <Form
          className={styles.form}
          onFinish={handleSubmit}
          layout="vertical"
          form={refForm}
        >
          <Logo size="common" className={styles.logo} logoWidth={200} />
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
            <Input
              prefix={<KeyOutlined />}
              placeholder={t('form.password')}
              type="password"
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
    </Layout>
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

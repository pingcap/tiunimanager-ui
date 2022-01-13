import { FC, useCallback, useState } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import {
  message,
  Button,
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Radio,
} from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import {
  ClusterDataReplicationDownstreamDisplay,
  ClusterDataReplicationDownstreamType,
  ClusterDataReplicationKafkaProtocol,
  ClusterDownstreamKafka,
  ClusterDownstreamMySQL,
  ClusterDownstreamTiDB,
} from '@/api/model'
import {
  invalidateClusterDataReplicationList,
  useCreateClusterDataReplication,
} from '@/api/hooks/cluster'
import styles from './index.module.less'

loadI18n()

interface FooterProps {
  disabled?: boolean
  submitting?: boolean
  onSubmit: () => void
  onReset: () => void
}

const Footer: FC<FooterProps> = ({
  disabled = false,
  submitting = false,
  onSubmit,
  onReset,
}) => {
  const { t } = useI18n()

  return (
    <div className={styles.footer}>
      <IntlPopConfirm title={t('footer.reset.confirm')} onConfirm={onReset}>
        <Button size="large">{t('footer.reset.title')}</Button>
      </IntlPopConfirm>
      <Button
        className={styles.confirm}
        size="large"
        type="primary"
        loading={submitting}
        disabled={disabled}
        onClick={onSubmit}
      >
        {t('footer.submit.title')}
      </Button>
    </div>
  )
}

const BasicFormBlock: FC = () => {
  const { t } = useI18n()

  return (
    <Card className={styles.formCard} title={t('basic.title')}>
      <Form.Item
        name="name"
        label={t('basic.fields.name')}
        rules={[
          { required: true, message: t('basic.rules.name.required') },
          { min: 1, max: 20, message: t('basic.rules.name.length') },
        ]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name="tso"
        label={t('basic.fields.tso')}
        tooltip={t('basic.tips.tso')}
      >
        <InputNumber min={0} precision={0} />
      </Form.Item>
      <Form.List name="filterRuleList">
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                className={index > 0 ? styles.formItemWithoutLabel : ''}
                label={index === 0 ? t('basic.fields.filterRule') : ''}
                key={field.key}
              >
                <Space align="baseline">
                  <Form.Item
                    {...field}
                    noStyle
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        type: 'regexp',
                        message: t('basic.rules.filterRule.valid'),
                      },
                    ]}
                  >
                    <Input allowClear />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  ) : null}
                </Space>
              </Form.Item>
            ))}
            <Form.Item
              className={fields.length ? styles.formItemWithoutLabel : ''}
              label={!fields.length ? t('basic.fields.filterRule') : ''}
            >
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                {t('basic.action.filterRule.add')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </Card>
  )
}

const urlPattern =
  '^(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-*)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$'

const DBFormBlock: FC<{ db: 'mysql' | 'tidb' }> = ({ db }) => {
  const { t } = useI18n()

  return (
    <>
      <Form.Item
        name={['downstream', db, 'ip']}
        label={t(`${db}.fields.url`)}
        tooltip={t(`${db}.tips.url`)}
        rules={[
          {
            required: true,
            pattern: new RegExp(urlPattern, 'i'),
            message: t(`${db}.rules.url.required`),
          },
        ]}
      >
        <Input allowClear maxLength={2048} />
      </Form.Item>
      <Form.Item
        name={['downstream', db, 'port']}
        label={t(`${db}.fields.port`)}
        rules={[{ required: true, message: t(`${db}.rules.port.required`) }]}
      >
        <InputNumber min={0} max={65535} precision={0} />
      </Form.Item>
      <Form.Item
        name={['downstream', db, 'username']}
        label={t(`${db}.fields.user`)}
        rules={[
          { required: true, message: t(`${db}.rules.user.required`) },
          { min: 3, max: 20, message: t(`${db}.rules.user.length`) },
        ]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name={['downstream', db, 'password']}
        label={t(`${db}.fields.password`)}
        rules={[
          { required: true, message: t(`${db}.rules.password.required`) },
          { min: 6, max: 20, message: t(`${db}.rules.password.length`) },
        ]}
      >
        <Input type="password" allowClear />
      </Form.Item>
      <Form.Item
        name={['downstream', db, 'concurrentThreads']}
        label={t(`${db}.fields.thread`)}
        tooltip={t(`${db}.tips.thread`)}
      >
        <InputNumber min={1} max={128} precision={0} />
      </Form.Item>
    </>
  )
}

const MySQLFormBlock: FC = () => <DBFormBlock db="mysql" />

const TiDBFormBlock: FC = () => <DBFormBlock db="tidb" />

const KafkaFormBlock: FC = () => {
  const { t } = useI18n()

  return (
    <>
      <Form.Item
        name={['downstream', 'kafka', 'ip']}
        label={t('kafka.fields.url')}
        tooltip={t('kafka.tips.url')}
        rules={[
          {
            required: true,
            pattern: new RegExp(urlPattern, 'i'),
            message: t('kafka.rules.url.required'),
          },
        ]}
      >
        <Input allowClear maxLength={2048} />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'port']}
        label={t('kafka.fields.port')}
        rules={[{ required: true, message: t('kafka.rules.port.required') }]}
      >
        <InputNumber min={0} max={65535} precision={0} />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'version']}
        label={t('kafka.fields.version')}
        rules={[{ required: true, message: t('kafka.rules.version.required') }]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'clientId']}
        label={t('kafka.fields.clientId')}
        rules={[
          { required: true, message: t('kafka.rules.clientId.required') },
        ]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'topicName']}
        label={t('kafka.fields.topic')}
        rules={[{ required: true, message: t('kafka.rules.topic.required') }]}
      >
        <Input allowClear />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'protocol']}
        label={t('kafka.fields.protocol')}
        rules={[
          { required: true, message: t('kafka.rules.protocol.required') },
        ]}
      >
        <Select allowClear>
          {Object.entries(ClusterDataReplicationKafkaProtocol).map(
            ([key, value]) => (
              <Select.Option key={key} value={value}>
                {value}
              </Select.Option>
            )
          )}
        </Select>
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'partitions']}
        label={t('kafka.fields.partition')}
      >
        <InputNumber min={0} precision={0} />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'replicationFactor']}
        label={t('kafka.fields.replica')}
      >
        <InputNumber min={0} precision={0} />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'maxMessageBytes']}
        label={t('kafka.fields.maxMsgSize')}
      >
        <InputNumber min={0} precision={0} />
      </Form.Item>
      <Form.Item
        name={['downstream', 'kafka', 'maxBatchSize']}
        label={t('kafka.fields.maxMsgNum')}
      >
        <InputNumber min={0} precision={0} />
      </Form.Item>
      <Form.List name={['downstream', 'kafka', 'dispatchers']}>
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                className={index ? styles.formItemWithoutLabel : ''}
                label={index === 0 ? t('kafka.fields.dispatchRule') : ''}
                key={field.key}
              >
                <Space align="baseline">
                  <Form.Item
                    fieldKey={[field.fieldKey, 'dispatcher']}
                    name={[field.name, 'dispatcher']}
                    noStyle
                  >
                    <Input
                      placeholder={t('kafka.placeholder.dispatcher')}
                      allowClear
                    />
                  </Form.Item>
                  <Form.Item
                    fieldKey={[field.fieldKey, 'matcher']}
                    name={[field.name, 'matcher']}
                    noStyle
                  >
                    <Input
                      placeholder={t('kafka.placeholder.matcher')}
                      allowClear
                    />
                  </Form.Item>
                  {fields.length > 1 ? (
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  ) : null}
                </Space>
              </Form.Item>
            ))}
            <Form.Item
              className={fields.length ? styles.formItemWithoutLabel : ''}
              label={fields.length === 0 ? t('kafka.fields.dispatchRule') : ''}
            >
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add()}
              >
                {t('kafka.action.dispatchRule.add')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  )
}

const DownstreamFromBlock: FC = () => {
  const { t } = useI18n()

  return (
    <Card className={styles.formCard} title={t('downstream.title')}>
      <Form.Item
        name="downstreamType"
        label={t('downstream.fields.type')}
        rules={[
          { required: true, message: t('downstream.rules.type.required') },
        ]}
      >
        <Radio.Group>
          {Object.entries(ClusterDataReplicationDownstreamDisplay).map(
            ([key, value]) => (
              <Radio.Button key={key} value={key}>
                {value}
              </Radio.Button>
            )
          )}
        </Radio.Group>
      </Form.Item>
      <Form.Item<CreationFormFields>
        noStyle
        shouldUpdate={(prevValues, currentValues) =>
          prevValues.downstreamType !== currentValues.downstreamType
        }
      >
        {(form) => {
          switch (form.getFieldValue('downstreamType')) {
            case ClusterDataReplicationDownstreamType.mysql:
              return <MySQLFormBlock />
            case ClusterDataReplicationDownstreamType.tidb:
              return <TiDBFormBlock />
            case ClusterDataReplicationDownstreamType.kafka:
              return <KafkaFormBlock />
          }
        }}
      </Form.Item>
    </Card>
  )
}

interface CreationFormFields {
  name: string
  tso: number
  filterRuleList: string[]
  downstreamType: ClusterDataReplicationDownstreamType
  downstream: {
    mysql: ClusterDownstreamMySQL
    tidb: ClusterDownstreamTiDB
    kafka: ClusterDownstreamKafka
  }
}

interface CreationPanelProps {
  clusterId: string
  back: () => void
}

const CreationPanel: FC<CreationPanelProps> = ({ clusterId, back }) => {
  const { t, i18n } = useI18n()
  const [form] = Form.useForm<CreationFormFields>()

  const queryClient = useQueryClient()

  const createDataReplication = useCreateClusterDataReplication()

  const [submitting, setSubmitting] = useState(false)
  const onFinish = useCallback(async () => {
    setSubmitting(true)

    try {
      const fields = form.getFieldsValue()

      const kafkaDispatchers = fields.downstream?.kafka?.dispatchers?.filter(
        (el) => el.dispatcher && el.matcher
      )
      const kafkaDownstream = {
        ...(fields.downstream?.kafka || {}),
        dispatchers: kafkaDispatchers,
      }

      const downstream = {
        ...(fields.downstream || {}),
        kafka: kafkaDownstream,
      }

      await createDataReplication.mutateAsync(
        {
          payload: {
            clusterId,
            name: fields.name,
            startTS: String(fields.tso),
            rules: fields?.filterRuleList?.filter((el) => el),
            downstreamType: fields.downstreamType as any,
            downstream: downstream[fields.downstreamType],
          },
          options: {
            actionName: t('message.name'),
          },
        },
        {
          onSuccess() {
            back()
          },
          onError() {
            setSubmitting(false)
          },
          onSettled() {
            return invalidateClusterDataReplicationList(queryClient)
          },
        }
      )
    } catch (e: any) {
      message.error(
        t('message.fail', {
          msg: e?.message,
        })
      )
      setSubmitting(false)
    }
  }, [form, i18n.language, queryClient, createDataReplication, clusterId])

  const onSubmit = useCallback(() => {
    form.submit()
  }, [form])
  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  const onFormValuesChange = useCallback(
    (
      changedValues: Partial<CreationFormFields>,
      allValues: CreationFormFields
    ) => {
      if (changedValues.tso === null) {
        form.resetFields(['tso'])
      } else if (
        changedValues.downstream &&
        allValues.downstreamType !== 'kafka'
      ) {
        if (
          changedValues.downstream[allValues.downstreamType]
            ?.concurrentThreads === null
        ) {
          form.resetFields([
            'downstream',
            allValues.downstreamType,
            'concurrentThreads',
          ])
        }
      }
    },
    [form]
  )

  return (
    <>
      <Form
        className={styles.form}
        form={form}
        colon={false}
        requiredMark={false}
        scrollToFirstError={true}
        onFinish={onFinish}
        initialValues={{
          tso: 0,
          downstreamType: ClusterDataReplicationDownstreamType.tidb,
          downstream: {
            mysql: {
              concurrentThreads: 16,
            },
            tidb: {
              concurrentThreads: 16,
            },
          },
        }}
        onValuesChange={onFormValuesChange}
      >
        <BasicFormBlock />
        <DownstreamFromBlock />
      </Form>
      <Footer submitting={submitting} onSubmit={onSubmit} onReset={onReset} />
    </>
  )
}

export default CreationPanel

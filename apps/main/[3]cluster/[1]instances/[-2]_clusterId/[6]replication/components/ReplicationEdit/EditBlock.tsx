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

import { FC, useCallback, useState } from 'react'
import { Form } from 'antd'
import { useI18n } from '@i18n-macro'
import BasicInfoConfig from './BasicInfoConfig'
import DownstreamConfig from './DownstreamConfig'
import Footer from './Footer'
import {
  EditFormFields,
  EditInitialValues,
  EditMode,
  EditStaticData,
  EditSumbitValues,
} from './helper'

import styles from './index.module.less'
import { isString } from '@/utils/types'

interface EditProps {
  mode: EditMode
  staticData?: EditStaticData
  initialValues: EditInitialValues
  onEditSubmit: (values: EditSumbitValues) => Promise<unknown>
}

const EditBlock: FC<EditProps> = ({
  mode,
  staticData,
  initialValues,
  onEditSubmit,
}) => {
  const { i18n } = useI18n()
  const [form] = Form.useForm<EditFormFields>()

  const [submitting, setSubmitting] = useState(false)

  const onFormValuesChange = useCallback(
    (changedValues: Partial<EditFormFields>, allValues: EditFormFields) => {
      if (!isString(changedValues.tso) || !changedValues.tso.length) {
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

  const onFormFinish = useCallback(async () => {
    setSubmitting(true)

    const fields = form.getFieldsValue()
    let downstream = fields.downstream

    if (fields.downstreamType === 'kafka') {
      const kafkaDownstream = fields.downstream.kafka

      downstream = {
        ...downstream,
        kafka: {
          ...kafkaDownstream,
          dispatchers: kafkaDownstream.dispatchers?.filter(
            (el) => el.dispatcher && el.matcher
          ),
        },
      }
    }

    try {
      await onEditSubmit({
        ...fields,
        filterRuleList: fields.filterRuleList?.filter((el) => el),
        downstream: downstream[fields.downstreamType],
      })
    } catch (e: any) {
      setSubmitting(false)
    }
  }, [form, i18n.language, onEditSubmit])

  const onSubmit = useCallback(() => {
    form.submit()
  }, [form])
  const onReset = useCallback(() => {
    form.resetFields()
  }, [form])

  return (
    <>
      <Form
        className={styles.form}
        form={form}
        colon={false}
        requiredMark={false}
        scrollToFirstError={true}
        onFinish={onFormFinish}
        initialValues={initialValues}
        onValuesChange={onFormValuesChange}
      >
        <BasicInfoConfig mode={mode} staticData={staticData} />
        <DownstreamConfig mode={mode} />
      </Form>
      <Footer loading={submitting} onSubmit={onSubmit} onReset={onReset} />
    </>
  )
}

export default EditBlock

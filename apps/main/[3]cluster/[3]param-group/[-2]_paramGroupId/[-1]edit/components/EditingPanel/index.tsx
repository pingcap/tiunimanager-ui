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

import { FC, useCallback, useMemo, useState } from 'react'
import { loadI18n, useI18n } from '@i18n-macro'
import { useQueryClient } from 'react-query'
import { Button, Form, FormInstance, Input, message } from 'antd'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import {
  useQueryParamGroupDetail,
  invalidateParamGroupList,
  useUpdateParamGroup,
} from '@/api/hooks/param-group'
import { ParamGroupDBType, ParamItemDetail, ParamGroupItem } from '@/api/model'
import EditableParamCard from '@apps/main/[3]cluster/[3]param-group/components/EditableParamCard'
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

type BasicField = {
  name: string
  dbType: ParamGroupDBType
  dbVersion: string
  clusterSpec: string
  note?: string
}

interface BasicFormProps {
  form: FormInstance<BasicField>
  dataSource: Partial<BasicField>
}

const BasicForm: FC<BasicFormProps> = ({ form, dataSource }) => {
  const { t } = useI18n()
  const dbTypeValue = useMemo(() => {
    const labelHashmap = {
      [ParamGroupDBType.tidb]: 'TiDB',
      [ParamGroupDBType.dm]: 'DM',
    }
    const { dbType } = dataSource

    return dbType ? labelHashmap[dbType] || dbType : ''
  }, [dataSource])

  return (
    <div className={styles.basicWrapper}>
      <Form
        className={styles.basicForm}
        form={form}
        colon={false}
        requiredMark="optional"
        scrollToFirstError={true}
        initialValues={dataSource}
      >
        <Form.Item
          name="name"
          label={t('basic.fields.name')}
          rules={[
            { required: true, message: t('basic.rules.name.required') },
            { min: 1, max: 22, message: t('basic.rules.name.length') },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item
          requiredMark={false}
          label={t('basic.fields.dbType')}
          rules={[
            { required: true, message: t('basic.rules.dbType.required') },
          ]}
        >
          <Input disabled value={dbTypeValue} />
        </Form.Item>
        <Form.Item
          name="dbVersion"
          label={t('basic.fields.dbVersion')}
          rules={[
            { required: true, message: t('basic.rules.dbVersion.required') },
          ]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="clusterSpec"
          label={t('basic.fields.clusterSpec')}
          rules={[
            { required: true, message: t('basic.rules.clusterSpec.required') },
          ]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item name="note" label={t('basic.fields.note')}>
          <Input.TextArea allowClear autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
      </Form>
    </div>
  )
}

/**
 * Hook for fetching parameter group detail
 * @param paramGroupId parameter group ID
 */
function useFetchParamGroup(id: string) {
  const { data, isLoading, isError } = useQueryParamGroupDetail({
    id,
  })
  const groupDetail = data?.data.data

  const basicData = useMemo(() => {
    return {
      name: groupDetail?.name,
      dbType: groupDetail?.dbType,
      dbVersion: groupDetail?.clusterVersion,
      clusterSpec: groupDetail?.clusterSpec,
      note: groupDetail?.note,
    }
  }, [groupDetail])

  return {
    dataSource: groupDetail,
    basicData,
    paramData: groupDetail?.params,
    isLoading,
    isError,
  }
}

/**
 * Hook for getting state and handlers
 * of editable paramter list
 */
function useParamEdit() {
  const [paramEditing, setParamEditing] = useState(false)
  const [changedParamList, setChangedParamList] = useState<ParamItemDetail[]>(
    []
  )

  return {
    editing: paramEditing,
    onEdit: setParamEditing,
    editedData: changedParamList,
    onChange: setChangedParamList,
  }
}

/**
 * Hook for reseting parameter card's data source
 * @param dataSource origin parameter list
 */
function useParamReset(dataSource?: ParamItemDetail[]) {
  const [resetCnt, setResetCnt] = useState(0)
  const paramData = useMemo(() => dataSource?.concat(), [resetCnt, dataSource])
  const onParamReset = useCallback(() => setResetCnt((prev) => prev + 1), [])

  return {
    paramData,
    onParamReset,
  }
}

/**
 * Hook for getting state and handler of edit submitter
 */
function useSubmitter({
  paramGroupId,
  dataSource,
  basicForm,
  paramEditing,
  editedParamList,
  routeBack,
}: {
  paramGroupId: string
  dataSource?: ParamGroupItem
  basicForm: FormInstance<BasicField>
  paramEditing: boolean
  editedParamList: ParamItemDetail[]
  routeBack: () => void
}) {
  const { t, i18n } = useI18n()
  const queryClient = useQueryClient()
  const updateParamGroup = useUpdateParamGroup()

  const [submitting, setSubmitting] = useState(false)

  const onSubmit = useCallback(async () => {
    setSubmitting(true)

    try {
      const fields = await basicForm.validateFields()

      if (paramEditing) {
        message.error({
          content: t('footer.submit.error.param'),
          style: {
            marginTop: '10vh',
          },
        })

        setSubmitting(false)

        return
      }

      await updateParamGroup.mutateAsync(
        {
          payload: {
            paramGroupId,
            name: fields.name,
            clusterVersion: fields.dbVersion,
            clusterSpec: dataSource?.clusterSpec,
            note: fields.note,
            params: editedParamList.map((item) => ({
              paramId: item.paramId!,
              defaultValue: item.defaultValue!,
            })),
          },
          options: {
            successMessage: t('message.success'),
            errorMessage: t('message.failed'),
          },
        },
        {
          onSuccess() {
            routeBack()
          },
          onError() {
            setSubmitting(false)
          },
          onSettled() {
            return invalidateParamGroupList(queryClient)
          },
        }
      )
    } catch (e) {
      setSubmitting(false)
    }
  }, [
    i18n.language,
    routeBack,
    updateParamGroup.mutateAsync,
    queryClient,
    basicForm,
    paramGroupId,
    dataSource?.clusterSpec,
    paramEditing,
    editedParamList,
  ])

  return {
    submitting,
    onSubmit,
  }
}

interface EditPanelProps {
  back: () => void
  id: string
}

const EditPanel: FC<EditPanelProps> = ({ back, id: paramGroupId }) => {
  const {
    dataSource,
    basicData,
    paramData: originParamData,
    isLoading,
  } = useFetchParamGroup(paramGroupId)

  const { paramData: paramDataSource, onParamReset } =
    useParamReset(originParamData)

  const {
    editing: paramEditing,
    onEdit: onParamEdit,
    editedData: editedParamList,
    onChange: onParamChange,
  } = useParamEdit()

  const [basicForm] = Form.useForm<BasicField>()

  const { submitting, onSubmit } = useSubmitter({
    paramGroupId,
    dataSource,
    basicForm,
    paramEditing,
    editedParamList,
    routeBack: back,
  })

  const onReset = useCallback(() => {
    basicForm.resetFields()
    onParamReset()
  }, [basicForm, onParamReset])

  if (isLoading) {
    // TODO
    // add loading spin
    return <>loading...</>
  }

  return (
    <div className={styles.panel}>
      <BasicForm form={basicForm} dataSource={basicData} />
      <EditableParamCard
        loading={isLoading}
        data={paramDataSource}
        onEdit={onParamEdit}
        onSave={onParamChange}
      />
      <Footer
        submitting={submitting}
        disabled={isLoading}
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  )
}

export default EditPanel

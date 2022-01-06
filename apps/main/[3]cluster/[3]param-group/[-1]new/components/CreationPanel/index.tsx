import { FC, useCallback, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { Button, Form, FormInstance, Input, message, Select } from 'antd'
import { isArray, isNumber } from '@/utils/types'
import IntlPopConfirm from '@/components/IntlPopConfirm'
import {
  useQueryParamGroupDetail,
  useQueryParamGroupList,
  useCreateParamGroup,
  invalidateParamGroupList,
} from '@/api/hooks/param-group'
import {
  ParamGroupDBType,
  ParamGroupCreationType,
  ParamItemDetail,
  ParamGroupItem,
} from '@/api/model'
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

type BasicFilter = Pick<BasicField, 'dbType' | 'dbVersion' | 'clusterSpec'>

interface BasicFormProps {
  form: FormInstance<BasicField>
  filterList: Required<BasicFilter>[]
  onFilterValChange: (filterMap: BasicFilter) => void
}

const BasicForm: FC<BasicFormProps> = ({
  form,
  filterList,
  onFilterValChange,
}) => {
  const onValuesChange = useCallback(
    (changeValues: BasicField, values: BasicField) => {
      const keys = Object.keys(changeValues) as (keyof BasicField)[]
      const isDBTypeChange = keys.includes('dbType')

      if (isDBTypeChange) {
        form.setFieldsValue({
          dbVersion: undefined,
          clusterSpec: undefined,
        })
      }

      const isDBVersionChange = keys.includes('dbVersion')

      if (isDBVersionChange) {
        form.setFieldsValue({
          clusterSpec: undefined,
        })
      }

      const isClusterSpecChange = keys.includes('clusterSpec')

      if (isDBTypeChange || isDBVersionChange || isClusterSpecChange) {
        onFilterValChange({
          dbType: values.dbType,
          dbVersion: values.dbVersion,
          clusterSpec: values.clusterSpec,
        })
      }
    },
    [form, onFilterValChange]
  )

  const dbTypeOptionList = useMemo(() => {
    const labelMap = {
      [ParamGroupDBType.tidb]: 'TiDB',
      [ParamGroupDBType.dm]: 'DM',
    }
    const valueList = filterList.map((item) => item.dbType)
    const ret = Array.from(new Set(valueList)).map((value) => ({
      value,
      label: labelMap[value] || value,
    }))

    return ret
  }, [filterList])

  const dbVersionOptionList = useMemo(() => {
    const dbType = form.getFieldValue('dbType')
    const versionValueList = filterList
      .filter((item) => item.dbType === dbType)
      .map((item) => item.dbVersion)

    const ret = Array.from(new Set(versionValueList)).map((value) => ({
      value,
      label: value,
    }))

    return ret
  }, [filterList, form.getFieldValue('dbType')])

  const clusterSpecOptionList = useMemo(() => {
    const dbType = form.getFieldValue('dbType')
    const dbVersion = form.getFieldValue('dbVersion')
    const specValueList = filterList
      .filter((item) => item.dbType === dbType && item.dbVersion === dbVersion)
      .map((item) => item.clusterSpec)

    const ret = Array.from(new Set(specValueList)).map((value) => ({
      value,
      label: value,
    }))

    return ret
  }, [
    filterList,
    form.getFieldValue('dbType'),
    form.getFieldValue('dbVersion'),
  ])

  const { t } = useI18n()

  return (
    <div className={styles.basicWrapper}>
      <Form
        className={styles.basicForm}
        form={form}
        colon={false}
        requiredMark="optional"
        scrollToFirstError={true}
        onValuesChange={onValuesChange}
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
          name="dbType"
          label={t('basic.fields.dbType')}
          rules={[
            { required: true, message: t('basic.rules.dbType.required') },
          ]}
        >
          <Select allowClear>
            {dbTypeOptionList.map((item) => (
              <Select.Option key={item.value} value={item.value!}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="dbVersion"
          label={t('basic.fields.dbVersion')}
          rules={[
            { required: true, message: t('basic.rules.dbVersion.required') },
          ]}
        >
          <Select allowClear>
            {dbVersionOptionList.map((item) => (
              <Select.Option key={item.value} value={item.value!}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="clusterSpec"
          label={t('basic.fields.clusterSpec')}
          rules={[
            { required: true, message: t('basic.rules.clusterSpec.required') },
          ]}
        >
          <Select allowClear>
            {clusterSpecOptionList.map((item) => (
              <Select.Option key={item.value} value={item.value!}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="note" label={t('basic.fields.note')}>
          <Input.TextArea allowClear autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
      </Form>
    </div>
  )
}

/**
 * Fetch system built-in parameter group list as template
 */
function useFetchTmplParamGroup() {
  const { data, isLoading } = useQueryParamGroupList(
    {
      creationType: ParamGroupCreationType.system,
    },
    {
      refetchOnWindowFocus: false,
    }
  )

  return {
    isLoading,
    data: data?.data.data,
  }
}

/**
 * Fetch system built-in parameter list as template
 * @param paramGroupId parameter group ID
 */
function useFetchTmplParam(paramGroupId?: string) {
  const { data, isLoading } = useQueryParamGroupDetail(
    {
      id: paramGroupId ?? '',
    },
    {
      enabled: !!paramGroupId,
      refetchOnWindowFocus: false,
    }
  )

  return {
    data: data?.data.data?.params,
    isLoading,
  }
}

/**
 * Fetch template data for filling form
 */
function useFetchTmplData() {
  const { data: tmplGroupList, isLoading: isFilterLoading } =
    useFetchTmplParamGroup()

  /**
   * Filter data source
   */
  const { validGroupList, filterList } = useMemo(() => {
    if (!isArray(tmplGroupList)) {
      return {
        validGroupList: [],
        filterList: [],
      }
    }

    const validGroupList = tmplGroupList.filter(
      (item) =>
        item.paramGroupId &&
        isNumber(item.dbType) &&
        item.clusterVersion &&
        item.clusterSpec
    )

    const filterList = validGroupList.map((item) => ({
      dbType: item.dbType!,
      dbVersion: item.clusterVersion!,
      clusterSpec: item.clusterSpec!,
    }))

    return {
      validGroupList,
      filterList,
    }
  }, [tmplGroupList])

  /**
   * Filter value state
   */
  const [dbTypeFilter, setDBTypeFilter] = useState<ParamGroupDBType>()
  const [dbVersionFilter, setDBVersionFilter] = useState<string>()
  const [clusterSpecFilter, setClusterSpecFilter] = useState<string>()

  const onFilterValChange = useCallback((valMap?: BasicFilter) => {
    setDBTypeFilter(valMap?.dbType)
    setDBVersionFilter(valMap?.dbVersion)
    setClusterSpecFilter(valMap?.clusterSpec)
  }, [])

  /**
   * Use the filtered parameter group id
   * to fetch the target parameter list
   */
  const { targetGroupId, targetGroup } = useMemo(() => {
    const [dbType, dbVersion, clusterSpec] = [
      dbTypeFilter,
      dbVersionFilter,
      clusterSpecFilter,
    ]
    const valid = isNumber(dbType) && !!dbVersion && !!clusterSpec

    if (!valid) {
      return {}
    }

    const target = validGroupList.filter(
      (item) =>
        item.dbType === dbType &&
        item.clusterVersion === dbVersion &&
        item.clusterSpec === clusterSpec
    )

    return {
      targetGroupId: target[0]?.paramGroupId,
      targetGroup: target[0],
    }
  }, [validGroupList, dbTypeFilter, dbVersionFilter, clusterSpecFilter])

  const { data: tmplParamList, isLoading: isTmplParamLoading } =
    useFetchTmplParam(targetGroupId)

  return {
    isFilterLoading,
    filterList,
    onFilterValChange,
    isTmplParamLoading,
    tmplParamList,
    tmplParamGroup: targetGroup,
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
 * Hook for getting state and handler of creation submitter
 */
function useSubmitter({
  dataSource,
  basicForm,
  paramEditing,
  editedParamList,
  routeBack,
}: {
  dataSource?: ParamGroupItem
  basicForm: FormInstance<BasicField>
  paramEditing: boolean
  editedParamList: ParamItemDetail[]
  routeBack: () => void
}) {
  const { t, i18n } = useI18n()
  const queryClient = useQueryClient()
  const createParamGroup = useCreateParamGroup()

  const [submitting, setSubmitting] = useState(false)

  const onSubmit = useCallback(async () => {
    if (paramEditing) {
      message.error({
        content: t('footer.submit.error.param'),
        style: {
          marginTop: '10vh',
        },
      })

      return
    }

    setSubmitting(true)

    try {
      const fields = await basicForm.validateFields()

      await createParamGroup.mutateAsync(
        {
          payload: {
            name: fields.name,
            dbType: fields.dbType,
            clusterVersion: fields.dbVersion,
            clusterSpec: dataSource?.clusterSpec,
            note: fields.note,
            params: editedParamList.map((item) => ({
              paramId: item.paramId,
              defaultValue: item.defaultValue,
              note: item.note,
            })),
            hasDefault: ParamGroupCreationType.custom,
          },
          options: {
            actionName: t('message.name'),
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
    createParamGroup.mutateAsync,
    queryClient,
    basicForm,
    dataSource?.clusterSpec,
    paramEditing,
    editedParamList,
  ])

  return {
    submitting,
    onSubmit,
  }
}

interface CreationPanelProps {
  back: () => void
}

const CreationPanel: FC<CreationPanelProps> = ({ back }) => {
  const {
    isFilterLoading,
    filterList,
    onFilterValChange,
    isTmplParamLoading,
    tmplParamList,
    tmplParamGroup,
  } = useFetchTmplData()

  const {
    editing: paramEditing,
    onEdit: onParamEdit,
    editedData: editedParamList,
    onChange: onParamChange,
  } = useParamEdit()

  const [basicForm] = Form.useForm<BasicField>()

  const { submitting, onSubmit } = useSubmitter({
    dataSource: tmplParamGroup,
    basicForm,
    paramEditing,
    editedParamList,
    routeBack: back,
  })

  const onReset = useCallback(() => {
    basicForm.resetFields()
    onFilterValChange()
  }, [basicForm, onFilterValChange])

  if (isFilterLoading) {
    // TODO
    // add loading spin
    return <>loading...</>
  }

  return (
    <div className={styles.panel}>
      <BasicForm
        form={basicForm}
        filterList={filterList}
        onFilterValChange={onFilterValChange}
      />
      <EditableParamCard
        loading={isFilterLoading || isTmplParamLoading}
        data={tmplParamList}
        onEdit={onParamEdit}
        onSave={onParamChange}
      />
      <Footer
        submitting={submitting}
        disabled={isFilterLoading || isTmplParamLoading}
        onSubmit={onSubmit}
        onReset={onReset}
      />
    </div>
  )
}

export default CreationPanel

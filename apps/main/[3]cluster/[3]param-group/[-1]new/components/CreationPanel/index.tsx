import { FC, useCallback, useMemo, useState } from 'react'
import { useQueryClient } from 'react-query'
import { loadI18n, useI18n } from '@i18n-macro'
import { Button, Form, FormInstance, Input, message, Select } from 'antd'
import { errToMsg } from '@/utils/error'
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
  note?: string
}

type BasicFilter = Pick<BasicField, 'dbType' | 'dbVersion'>

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
          dbVersion: void 0,
        })
      }

      const isDBVersionChange = keys.includes('dbVersion')

      if (isDBTypeChange || isDBVersionChange) {
        onFilterValChange({
          dbType: values.dbType,
          dbVersion: values.dbVersion,
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

    return filterList
      .filter((item) => item.dbType === dbType)
      .map((item) => ({
        value: item.dbVersion,
        label: item.dbVersion,
      }))
  }, [filterList, form.getFieldValue('dbType')])

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
function useFetchTmplParam(paramGroupId?: number) {
  const INVALID_ID = 'not_number'
  const { data, isLoading } = useQueryParamGroupDetail(
    {
      id: String(paramGroupId ?? ''),
    },
    {
      enabled: (paramGroupId ?? INVALID_ID) !== INVALID_ID,
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

  const INVALID_VALUE = 'null_or_undefined'

  /**
   * Filter data source
   */
  const { validGroupList, filterList } = useMemo(() => {
    if (!Array.isArray(tmplGroupList)) {
      return {
        validGroupList: [],
        filterList: [],
      }
    }

    const validGroupList = tmplGroupList.filter((item) => {
      const isNum = [item.paramGroupId, item.dbType].every(
        (value) => (value ?? INVALID_VALUE) !== INVALID_VALUE
      )

      return isNum && item.version
    })

    const filterList = validGroupList.map((item) => ({
      dbType: item.dbType!,
      dbVersion: item.version!,
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

  const onFilterValChange = useCallback((valMap?: BasicFilter) => {
    setDBTypeFilter(valMap?.dbType)
    setDBVersionFilter(valMap?.dbVersion)
  }, [])

  /**
   * Use the filtered parameter group id
   * to fetch the target parameter list
   */
  const { targetGroupId, targetGroup } = useMemo(() => {
    const [dbType, dbVersion] = [dbTypeFilter, dbVersionFilter]
    const invalid = [dbType, dbVersion].every(
      (el) => (el ?? INVALID_VALUE) === INVALID_VALUE
    )

    if (invalid) {
      return {}
    }

    const target = validGroupList.filter(
      (item) => item.dbType === dbType && item.version === dbVersion
    )

    return {
      targetGroupId: target[0]?.paramGroupId,
      targetGroup: target[0],
    }
  }, [validGroupList, dbTypeFilter, dbVersionFilter])

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
          name: fields.name,
          dbType: fields.dbType,
          version: fields.dbVersion,
          spec: dataSource?.spec,
          note: fields.note,
          params: editedParamList.map((item) => ({
            paramId: item.paramId,
            defaultValue: item.defaultValue,
            note: item.note,
          })),
          hasDefault: ParamGroupCreationType.custom,
        },
        {
          onSuccess() {
            message.success(t('message.success')).then(routeBack)
          },
          onError(e) {
            message.error(
              t('message.fail', {
                msg: errToMsg(e),
              })
            )

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
    dataSource?.spec,
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

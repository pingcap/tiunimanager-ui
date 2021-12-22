import { FC, useMemo, useState, useEffect, useCallback } from 'react'
import { Steps, Card, Spin } from 'antd'
import type { StepProps } from 'antd'
import moment from 'moment'
import { loadI18n, useI18n } from '@i18n-macro'
import { formatTimeString } from '@/utils/time'
import { TaskWorkflowSubTaskInfo, TaskWorkflowSubTaskStatus } from '@/api/model'
import { useQueryTaskDetail } from '@/api/hooks/task'
import { isArray } from '@/utils/types'
import styles from './index.module.less'

loadI18n()

const useFetchTaskDetailData = (id: string) => {
  const { data, isLoading } = useQueryTaskDetail(
    {
      id,
    },
    {
      refetchOnWindowFocus: false,
    }
  )
  const result = data?.data.data

  return {
    steps: result?.nodes,
    allStepNames: result?.nodeNames,
    isLoading,
  }
}

const stepStatusMap: Record<TaskWorkflowSubTaskStatus, StepProps['status']> = {
  [TaskWorkflowSubTaskStatus.Initializing]: 'wait',
  [TaskWorkflowSubTaskStatus.Processing]: 'process',
  [TaskWorkflowSubTaskStatus.Finished]: 'finish',
  [TaskWorkflowSubTaskStatus.Error]: 'error',
  [TaskWorkflowSubTaskStatus.Canceled]: 'wait',
}

const useActiveStep = (stepLen: number) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const onStepChange = useCallback((current: number) => {
    setActiveIndex(current)
  }, [])

  useEffect(() => {
    onStepChange(stepLen ? stepLen - 1 : 0)
  }, [stepLen, onStepChange])

  return {
    activeIndex,
    onStepChange,
  }
}

type StepMap = Record<string, TaskWorkflowSubTaskInfo>

const getExecutedStepData = (steps: TaskWorkflowSubTaskInfo[]) => {
  const executedSteps = steps.filter(
    (step) => ['end', 'fail'].indexOf(step.name!) === -1
  )
  const executedStepMap: StepMap = executedSteps?.reduce((prev, step) => {
    return {
      ...prev,
      [step.name!]: step,
    }
  }, {} as StepMap)

  return {
    executedSteps,
    executedStepMap,
  }
}

interface TaskStepsProps {
  id: string
}

const TaskSteps: FC<TaskStepsProps> = ({ id }) => {
  const { t, i18n } = useI18n()
  const { steps, allStepNames, isLoading } = useFetchTaskDetailData(id)

  const { executedSteps, executedStepMap } = useMemo(() => {
    if (!isArray(steps)) {
      return {
        executedSteps: [],
        executedStepMap: {},
      }
    }

    return getExecutedStepData(steps)
  }, [steps])

  const { activeIndex, onStepChange } = useActiveStep(executedSteps.length)

  const stepResult = useMemo(() => {
    const stepName = allStepNames?.[activeIndex] || ''
    const { result } = executedStepMap[stepName] || {}

    return {
      title: t('result.title', { stepIndex: activeIndex + 1, stepName }),
      content: result || t('result.content.empty'),
    }
  }, [i18n.language, allStepNames, activeIndex, executedStepMap])

  if (isLoading) {
    return (
      <div className={styles.taskStepContainer}>
        <Spin />
      </div>
    )
  }

  return (
    <div className={styles.taskStepContainer}>
      <Steps
        className={styles.steps}
        current={activeIndex}
        onChange={onStepChange}
        direction="vertical"
      >
        {allStepNames?.map((stepName, stepIndex) => {
          const {
            startTime,
            endTime,
            name,
            status = TaskWorkflowSubTaskStatus.Initializing,
          } = executedStepMap[stepName] || {}
          const disabled = !name

          if (disabled) {
            return (
              <Steps.Step
                key={stepName}
                title={stepName}
                disabled={disabled}
                status={stepStatusMap[TaskWorkflowSubTaskStatus.Initializing]}
                description={t('description.unexecuted')}
              />
            )
          }

          const startTimeDisplay = formatTimeString(startTime!, 'HH:mm:ss')
          const timeDiff = moment(endTime).diff(startTime)
          const duration =
            timeDiff > 0 ? moment.duration(timeDiff).as('seconds') : 0
          const desc = t('description.executed', {
            startTime: startTimeDisplay,
            duration,
          })
          const isActive = stepIndex === activeIndex

          return (
            <Steps.Step
              key={stepName}
              status={stepStatusMap[status]}
              title={isActive ? <strong>{stepName}</strong> : stepName}
              description={desc}
              disabled={disabled}
            />
          )
        })}
      </Steps>
      {executedSteps.length ? (
        <Card className={styles.content} title={stepResult.title}>
          {stepResult.content}
        </Card>
      ) : null}
    </div>
  )
}

export default TaskSteps
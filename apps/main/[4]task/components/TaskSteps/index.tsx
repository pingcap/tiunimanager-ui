import { FC, useMemo, useState, useEffect, useCallback } from 'react'
import { Steps, Card, Spin } from 'antd'
import type { StepProps } from 'antd'
import moment from 'moment'
import { formatTimeString } from '@/utils/time'
import { TaskWorkflowSubTaskInfo } from '@/api/model'
import { useQueryTaskDetail } from '@/api/hooks/task'
import styles from './index.module.less'
import { loadI18n, useI18n } from '@i18n-macro'

loadI18n()

const { Step } = Steps

const useFetchTaskDetailData = (id: number) => {
  const { data, isLoading, isPreviousData } = useQueryTaskDetail(
    {
      id,
    },
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  )

  return {
    data: data?.data.data || {},
    isPreviousData,
    isLoading,
  }
}

interface TaskStepsProps {
  id: number
}

interface StepMap {
  [k: string]: TaskWorkflowSubTaskInfo
}

const stepStatusMap: { [k: number]: StepProps['status'] } = {
  0: 'wait',
  1: 'process',
  2: 'finish',
  3: 'error',
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

const TaskSteps: FC<TaskStepsProps> = ({ id }) => {
  const { t, i18n } = useI18n()
  const { data, isLoading } = useFetchTaskDetailData(id)

  const { excutedSteps, excutedStepMap } = useMemo(() => {
    const { tasks: steps = [] } = data
    const excutedSteps = steps.filter(
      (step) => ['end', 'fail'].indexOf(step.taskName!) === -1
    )
    const excutedStepMap: StepMap = excutedSteps.reduce((prev, step) => {
      return {
        ...prev,
        [step.taskName!]: step,
      }
    }, {} as StepMap)

    return {
      excutedSteps,
      excutedStepMap,
    }
  }, [data])

  const { activeIndex, onStepChange } = useActiveStep(excutedSteps.length)

  const { taskName: allStepNames = [] } = data

  const stepResult = useMemo(() => {
    const stepName = allStepNames[activeIndex]
    const { taskName = '', result } = excutedStepMap[stepName] || {}

    return {
      title: taskName,
      content: result || t('result.empty'),
    }
  }, [i18n.language, allStepNames, activeIndex, excutedStepMap])

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
        {allStepNames.map((stepName, stepIndex) => {
          const {
            startTime,
            endTime,
            taskName,
            taskStatus = 0,
          } = excutedStepMap[stepName] || {}
          const disabled = !taskName

          if (disabled) {
            return (
              <Step
                key={stepName}
                title={stepName}
                disabled={disabled}
                status={stepStatusMap[0]}
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
            <Step
              key={stepName}
              status={stepStatusMap[taskStatus]}
              title={isActive ? <strong>{stepName}</strong> : stepName}
              description={desc}
              disabled={disabled}
            />
          )
        })}
      </Steps>
      <Card className={styles.content} title={stepResult.title}>
        {stepResult.content}
      </Card>
    </div>
  )
}

export default TaskSteps

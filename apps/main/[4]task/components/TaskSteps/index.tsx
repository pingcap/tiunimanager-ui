import { useMemo, useState, FC } from 'react'
import { Steps, Card } from 'antd'
import moment from 'moment'
import { formatTimeString } from '@/utils/time'
import { TaskWorkflowSubTaskInfo } from '@/api/model'
import { useQueryTaskDetail } from '@/api/hooks/task'
import styles from './index.module.less'

const { Step } = Steps

const useFetchTaskDetailData = (id: number) => {
  const { data, isLoading, isPreviousData, refetch } = useQueryTaskDetail({
    id,
  })

  return {
    data,
    isPreviousData,
    isLoading,
    refetch,
  }
}

interface TaskStepsProps {
  id: number
}

interface StepMap {
  [k: string]: TaskWorkflowSubTaskInfo
}

const TaskSteps: FC<TaskStepsProps> = (props) => {
  const { data, isLoading } = useFetchTaskDetailData(props.id)

  const { taskName: stepNames = [], tasks = [] } = data?.data.data || {}
  const exactSteps = tasks.filter((step) => step.taskName !== 'end')
  const stepMap: StepMap = exactSteps.reduce((prev, step) => {
    const stepName = step.taskName as string
    return {
      ...prev,
      [stepName]: step,
    }
  }, {} as StepMap)

  const [actStepIndex, setActStepIndex] = useState(
    Math.max(0, exactSteps.length - 1)
  )

  const onChange = (current: number) => {
    setActStepIndex(current)
  }

  const stepContent = useMemo(() => {
    const { taskName = '', result = '' } = exactSteps[actStepIndex] || {}

    return {
      title: taskName,
      result: result || '结果：无',
    }
  }, [exactSteps, actStepIndex])

  if (isLoading) {
    return null
  }

  return (
    <div className={styles.taskStepContainer}>
      <Steps
        className={styles.steps}
        current={Math.max(0, exactSteps.length - 1)}
        onChange={onChange}
        direction="vertical"
      >
        {stepNames.map((stepName) => {
          const { startTime = '', endTime, taskName } = stepMap[stepName]
          const disabled = !taskName
          const startTimeStr = formatTimeString(startTime, 'HH:mm:ss')
          const timeDiff = moment(endTime).diff(startTime)
          const timeDiffDisplay = timeDiff
            ? moment.duration(timeDiff, 's')
            : timeDiff
          const desc = taskName
            ? `开始时间：${startTimeStr} 耗时：${timeDiffDisplay}`
            : '未开始'

          return (
            <Step
              key={taskName}
              title={stepName}
              description={desc}
              disabled={disabled}
            />
          )
        })}
      </Steps>
      <Card className={styles.content} title={stepContent.title}>
        {stepContent.result}
      </Card>
    </div>
  )
}

export default TaskSteps

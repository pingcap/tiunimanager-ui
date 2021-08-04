import {
  Button,
  Card,
  Drawer,
  Form,
  List,
  message,
  Popconfirm,
  Row,
} from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useAuthState } from '@store/auth'
import styles from './SettingPanel.module.less'
import { Cron } from 'react-js-cron'
import CronInput from '@/components/CronInput'
import { useEffect, useMemo, useState } from 'react'
import parser from 'cron-parser'
import { APIS } from '@/api/client'
import { ClusterapiClusterDisplayInfo } from '#/api'

export interface SettingPanelProps {
  onClose: () => void
  visible: boolean
  cluster: ClusterapiClusterDisplayInfo
}

export default function ({ onClose, visible, cluster }: SettingPanelProps) {
  const [{ token }] = useAuthState()

  const close = () => {
    onClose()
  }

  const [origin, setOrigin] = useState('* * * * *')
  const [cron, setCron] = useState('* * * * *')

  useEffect(() => {
    async function fetchCron() {
      try {
        const { data } = await APIS.ClusterBackup.backupStrategyClusterIdGet(
          token,
          cluster.clusterId!
        )
        // XXX: why array of cron string?
        setOrigin(data.data![0].cronString!)
        setCron(data.data![0].cronString!)
      } catch (e) {
        message.error(
          `获取已有备份计划失败: ${
            (e.response?.data?.message ?? e) || '未知原因'
          }`
        )
      }
    }
    fetchCron()
  }, [token, cluster.clusterId, visible])

  const nextTimes = useMemo(() => {
    try {
      const parsed = parser.parseExpression(cron)
      return Array.from(
        {
          length: 5,
        },
        () => new Date(parsed.next().toISOString()).toLocaleString('en')
      )
    } catch (e) {
      return []
    }
  }, [cron])

  return (
    <Drawer
      title="备份设置"
      width={640}
      onClose={close}
      closeIcon={<ArrowRightOutlined />}
      visible={visible}
      bodyStyle={{
        paddingTop: 0,
      }}
      maskClosable={false}
      footer={
        <div className={styles.footer}>
          <Button
            size="large"
            onClick={() => {
              setCron(origin)
            }}
          >
            重置
          </Button>
          <Button
            size="large"
            onClick={async () => {
              try {
                await APIS.ClusterBackup.backupStrategyPost(token, {
                  clusterId: cluster.clusterId,
                  cronString: cron,
                })
                message.success('保存备份计划任务成功')
                close()
              } catch (e) {
                // TODO: handle error
              }
            }}
            type="primary"
          >
            保存
          </Button>
        </div>
      }
    >
      <div className={styles.settingPanel}>
        <Card bordered={false}>
          <CronInput value={cron} setValue={setCron} lang={'zh'} />
        </Card>
        <Card bordered={false} title="下五次执行备份任务的时间为">
          <List
            size="small"
            dataSource={nextTimes}
            style={{ fontSize: 16 }}
            renderItem={(item) => <p>{item}</p>}
          />
        </Card>
      </div>
    </Drawer>
  )
}

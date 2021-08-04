import { useHistory, useParams } from 'react-router-dom'
import { ClusterapiClusterDisplayInfo } from '#/api'
import { FC, useEffect, useMemo, useState } from 'react'
import { APIS } from '@/api/client'
import { useAuthState } from '@store/auth'
import {
  Badge,
  Button,
  Card,
  Descriptions,
  message,
  PageHeader,
  Popconfirm,
  Tag,
} from 'antd'
import type { CardTabListType } from 'antd/es/card'
import { useTranslation } from 'react-i18next'
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  QuestionCircleOutlined,
  RedoOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import styles from './Layout.module.less'
import { ClusterProvider } from './context'
import { CopyIconButton } from '@/components/CopyToClipboard'
import { formatTimeString } from '@/utils/time'

const Layout: FC = ({ children }) => {
  const [{ token }] = useAuthState()
  const { clusterId } = useParams<{ clusterId: string }>()
  const [cluster, setCluster] = useState<ClusterapiClusterDisplayInfo>()

  const history = useHistory()
  const { t, i18n } = useTranslation()

  const menuItems: CardTabListType[] = useMemo(
    () => [
      { key: `/cluster/${clusterId}`, tab: '基本信息' },
      { key: `/cluster/${clusterId}/params`, tab: '参数管理' },
      { key: `/cluster/${clusterId}/backup`, tab: '备份管理' },
    ],
    [clusterId, i18n.language]
  )

  const currentItem = useMemo(() => {
    return menuItems.find((i) => i.key === history.location.pathname)?.key
  }, [history.location.pathname])

  useEffect(() => {
    async function fetchCluster() {
      try {
        const { data } = await APIS.Cluster.clusterClusterIdGet(
          token,
          clusterId
        )
        setCluster(data.data!)
      } catch (e) {
        message.error(
          `获取集群信息失败: ${(e.response?.data?.message ?? e) || '未知原因'}`
        )
      }
    }
    fetchCluster()
  }, [clusterId])

  return (
    <div>
      {cluster ? (
        <>
          <Header cluster={cluster} />
          <Card
            style={{ width: '100%' }}
            tabList={menuItems}
            activeTabKey={currentItem}
            onTabChange={(key) => {
              history.push(key)
            }}
            bordered={false}
          >
            <ClusterProvider value={cluster}>{children}</ClusterProvider>
          </Card>
        </>
      ) : (
        <h2>集群 {clusterId} 不存在</h2>
      )}
    </div>
  )
}

export default Layout

interface HeaderProps {
  cluster: ClusterapiClusterDisplayInfo
}

function Header({ cluster }: HeaderProps) {
  const [{ token }] = useAuthState()
  const history = useHistory()
  return useMemo(() => {
    const backToList = () => history.push('/cluster')
    const handleBackup = async () => {
      try {
        await APIS.ClusterBackup.backupClusterIdPost(token, cluster.clusterId!)
        message.success(`集群 ${cluster.clusterName} 创建备份任务成功`)
      } catch (e) {
        message.error(
          `创建备份任务失败: ${(e.response?.data?.message ?? e) || '未知原因'}`
        )
      }
    }
    const handleDelete = async () => {
      try {
        await APIS.Cluster.clusterClusterIdDelete(token, cluster.clusterId!)
        message.success(`删除集群 ${cluster.clusterName} 成功`)
        backToList()
      } catch (e) {
        message.error(
          `删除失败: ${(e.response?.data?.message ?? e) || '未知原因'}`
        )
      }
    }
    const backupBtn = (
      <Popconfirm
        key="backup"
        title="确认创建备份吗"
        icon={<QuestionCircleOutlined />}
        onConfirm={handleBackup}
      >
        <Button>
          <SaveOutlined /> 备份
        </Button>
      </Popconfirm>
    )
    const deleteBtn = (
      <Popconfirm
        key="delete"
        title="确认删除该集群吗"
        icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
        onConfirm={handleDelete}
      >
        <Button danger>
          <DeleteOutlined /> 删除
        </Button>
      </Popconfirm>
    )
    const title = (
      <>
        {'Cluster ' + cluster.clusterId}
        <CopyIconButton
          text={cluster.clusterId!}
          tip="复制集群 ID"
          message={`${cluster.clusterId} 复制成功`}
        />
      </>
    )
    const status = <Tag color="blue">{cluster.statusName}</Tag>
    const summary = (
      <Descriptions size="small" column={6} className={styles.summary}>
        <Descriptions.Item label="名称" span={2}>
          {cluster.clusterName}
        </Descriptions.Item>
        <Descriptions.Item label="标签" span={4}>
          {cluster.tags?.join(', ') || ''}
        </Descriptions.Item>
        <Descriptions.Item label="类型">
          {cluster.clusterType}
        </Descriptions.Item>
        <Descriptions.Item label="版本">
          {cluster.clusterVersion}
        </Descriptions.Item>
        <Descriptions.Item label="TLS">
          {cluster.tls ? (
            <Badge status="processing" text="已启用" />
          ) : (
            <Badge status="default" text="未启用" />
          )}
        </Descriptions.Item>
        <Descriptions.Item label="端口" span={3}>
          {cluster.port}
        </Descriptions.Item>
        <Descriptions.Item label="外网地址" span={3}>
          {cluster.extranetConnectAddresses?.map((a) => (
            <span className={styles.address} key={a}>
              <CopyIconButton
                text={a}
                tip="复制连接地址"
                message={`${a} 复制成功`}
              />{' '}
              {a}
            </span>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="内网地址" span={3}>
          {cluster.intranetConnectAddresses?.map((a) => (
            <span className={styles.address} key={a}>
              <CopyIconButton
                text={a}
                tip="复制连接地址"
                message={`${a} 复制成功`}
              />{' '}
              {a}
            </span>
          ))}
        </Descriptions.Item>
        <Descriptions.Item label="创建时间" span={2}>
          {formatTimeString(cluster.createTime!)}
        </Descriptions.Item>
        {cluster.updateTime && (
          <Descriptions.Item label="更新时间" span={2}>
            {formatTimeString(cluster.updateTime!)}
          </Descriptions.Item>
        )}
        {cluster.deleteTime && (
          <Descriptions.Item label="删除时间" span={2}>
            {formatTimeString(cluster.deleteTime!)}
          </Descriptions.Item>
        )}
      </Descriptions>
    )
    const actions = [
      <Button key="1">
        <EditOutlined />
        修改
      </Button>,
      <Button key="2">
        <UploadOutlined />
        导入
      </Button>,
      <Button key="3">
        <DownloadOutlined />
        导出
      </Button>,
      <Button key="4">
        <RedoOutlined />
        重启
      </Button>,
      backupBtn,
      deleteBtn,
    ]
    return (
      <PageHeader
        onBack={backToList}
        className={styles.header}
        title={title}
        ghost={false}
        tags={status}
        extra={actions}
      >
        {summary}
      </PageHeader>
    )
  }, [token, cluster, history])
}

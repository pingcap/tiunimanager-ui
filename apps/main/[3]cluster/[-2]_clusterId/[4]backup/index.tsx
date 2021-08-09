import BackupTable from '@apps/main/[3]cluster/[-2]_clusterId/[4]backup/components/BackupTable'
import { useClusterContext } from '@apps/main/[3]cluster/[-2]_clusterId/context'
import useToggle from '@hooks/useToggle'
import styles from '@apps/main/[3]cluster/[-2]_clusterId/[4]backup/components/BackupTable/index.module.less'
import { Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import SettingModal from '@apps/main/[3]cluster/[-2]_clusterId/[4]backup/components/SettingModal'
import { useI18n } from '@i18n-macro'

export default function () {
  const { t } = useI18n()
  const [settingVisible, toggleSettingVisible] = useToggle(false)

  const cluster = useClusterContext()
  return (
    <>
      <div className={styles.toolbar}>
        <Button
          type="primary"
          key="create"
          onClick={() => toggleSettingVisible()}
        >
          <SettingOutlined /> {t('toolbar.strategy')}
        </Button>
      </div>
      <SettingModal
        close={toggleSettingVisible}
        clusterId={cluster.clusterId!}
        visible={settingVisible}
      />
      <BackupTable cluster={cluster} />
    </>
  )
}

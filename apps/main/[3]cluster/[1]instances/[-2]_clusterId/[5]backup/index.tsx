import BackupTable from './components/BackupTable'
import { useClusterContext } from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/context'
import useToggle from '@hooks/useToggle'
import styles from '@apps/main/[3]cluster/[1]instances/[-2]_clusterId/[5]backup/components/BackupTable/index.module.less'
import { Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import SettingModal from './components/SettingModal'
import { useI18n } from '@i18n-macro'

export default function () {
  const { t } = useI18n()
  const [settingVisible, toggleSettingVisible] = useToggle(false)

  const { info } = useClusterContext()
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
        clusterId={info!.clusterId!}
        visible={settingVisible}
      />
      <BackupTable cluster={info!} />
    </>
  )
}

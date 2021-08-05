import { InboxOutlined } from '@ant-design/icons'
import { message, Modal, UploadProps } from 'antd'
import { Upload } from 'antd'
import { basePath } from '@/api/client'
import { useAuthState } from '@store/auth'

export interface UploadModalProps {
  visible: boolean
  close: () => void
}

const checkFileFormat: UploadProps['beforeUpload'] = (file) => {
  console.log(file)
  // see https://www.iana.org/assignments/media-types/media-types.xhtml
  if (
    file.type === 'application/vnd.ms-excel' ||
    file.type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return true
  }
  message.error('目前仅支持通过 .xls 或 .xlsx 文件批量导入主机')
  return Upload.LIST_IGNORE
}

export default function UploadModal({ visible, close }: UploadModalProps) {
  const [{ token }] = useAuthState()
  return (
    <Modal
      title="批量导入"
      visible={visible}
      onOk={() => {
        close()
      }}
      onCancel={() => close()}
      maskClosable={false}
      destroyOnClose={true}
      footer={null}
    >
      {/*TODO: how to get api path more gracefully*/}
      <Upload.Dragger
        name="file"
        action={basePath + '/hosts'}
        headers={{
          Token: token,
        }}
        beforeUpload={checkFileFormat}
        maxCount={1}
        onChange={(info) => {
          switch (info.file.status) {
            case 'uploading':
              message.info('上传中...', 1)
              return
            case 'done':
              message.success('导入成功', 2)
              close()
              return
            case 'error':
              message.error(
                `导入失败: ${info.file.response.message || '未知原因'}`
              )
              return
          }
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或将文件拖拽到此以上传文件</p>
        <p className="ant-upload-hint">
          目前仅支持通过 .xls 或 .xlsx 文件批量导入主机
        </p>
      </Upload.Dragger>
    </Modal>
  )
}

import { Spin, SpinProps } from 'antd'
import { FC } from 'react'

const Loading: FC<SpinProps> = (props) => {
  return (
    <div style={{ paddingTop: 100, textAlign: 'center' }}>
      <Spin size="large" {...props} />
    </div>
  )
}
export default Loading

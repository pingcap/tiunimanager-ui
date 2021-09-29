import commonLogo from '/logo/common.svg'
import smallLogo from '/logo/small.svg'

export type LogoProps = {
  className?: string
  logoWidth?: number
  size?: 'common' | 'small'
}

export function Logo({
  className,
  size = 'common',
  logoWidth = 200,
}: LogoProps) {
  return (
    <div className={className}>
      <img
        src={size === 'common' ? commonLogo : smallLogo}
        alt="logo"
        width={logoWidth}
      />
    </div>
  )
}

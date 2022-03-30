import commonLogo from '/img/logo/common.svg'
import commonLightLogo from '/img/logo/common-light.svg'
import smallLogo from '/img/logo/small.svg'

const logoHashmap = {
  common: commonLogo,
  commonLight: commonLightLogo,
  small: smallLogo,
}

export type LogoProps = {
  className?: string
  logoWidth?: number
  type?: 'common' | 'commonLight' | 'small'
}

export function Logo({
  className,
  type = 'common',
  logoWidth = 200,
}: LogoProps) {
  return (
    <div className={className}>
      <img src={logoHashmap[type]} alt="logo" width={logoWidth} />
    </div>
  )
}

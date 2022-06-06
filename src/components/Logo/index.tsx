/*
 * Copyright 2022 PingCAP, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

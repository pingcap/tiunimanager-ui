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

import { ParamRangeType } from '@/api/model'

const rangeRenderTable = [
  {
    rangeType: (type: number) => type === ParamRangeType.continuous,
    render: (range: string[]) => {
      const [start, end] = range

      return [start, end].filter((el) => el !== undefined).join(' ~ ')
    },
  },
  {
    rangeType: (type: number) => type === ParamRangeType.discrete,
    render: (range: string[]) =>
      range.filter((el) => el !== undefined).join(', '),
  },
  {
    rangeType: (type: number) => type === ParamRangeType.none,
    render: () => undefined,
  },
]

/**
 * Render the parameter range
 * @param range parameter range value
 * @param rangeType parameter range type
 */
export const renderRange = (range: string[], rangeType: number) => {
  const target = rangeRenderTable.find((config) => config.rangeType(rangeType))

  return target?.render(range)
}

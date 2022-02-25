import { ParamValueDataType, ParamRangeType } from '@/api/model'

const rangeRenderTable = [
  {
    valueType: (type: number) =>
      [ParamValueDataType.int, ParamValueDataType.float].includes(type),
    rangeType: (type: number) => type === ParamRangeType.continuous,
    render: (range: string[]) => `${range[0]} ~ ${range[1]}`,
  },
  {
    valueType: (type: number) =>
      [ParamValueDataType.int, ParamValueDataType.float].includes(type),
    rangeType: (type: number) => type === ParamRangeType.discrete,
    render: (range: string[]) =>
      range.filter((el) => el !== undefined).join(', '),
  },
  {
    valueType: (type: number) =>
      [ParamValueDataType.string, ParamValueDataType.array].includes(type),
    rangeType: (type: number) =>
      type === ParamRangeType.discrete || type === ParamRangeType.none,
    render: (range: string[]) =>
      range.filter((el) => el !== undefined).join(', '),
  },
  {
    valueType: (type: number) => type === ParamValueDataType.boolean,
    rangeType: (type: number) =>
      type === ParamRangeType.discrete || type === ParamRangeType.none,
    render: (range: string[]) => {
      const [first, second] = range

      return [first, second].filter((el) => el !== undefined).join(', ')
    },
  },
]

/**
 * Render parameter range
 * @param type parameter type
 * @param range parameter range
 */
export const renderRange = (
  valType: number,
  range: string[],
  rangeType: number
) => {
  const target = rangeRenderTable.find(
    (config) => config.valueType(valType) && config.rangeType(rangeType)
  )

  return target?.render(range)
}

import { ParamValueDataType } from '@/api/model'

const rangeRenderTable = [
  {
    valueType: (type: number) =>
      [ParamValueDataType.int, ParamValueDataType.float].includes(type),
    rangeLen: (range: string[]) => range.length === 2,
    render: (range: string[]) => `${range[0]} ~ ${range[1]}`,
  },
  {
    valueType: (type: number) =>
      [ParamValueDataType.int, ParamValueDataType.float].includes(type),
    rangeLen: (range: string[]) => range.length === 1 || range.length > 2,
    render: (range: string[]) =>
      range.filter((el) => el !== undefined).join(', '),
  },
  {
    valueType: (type: number) =>
      [ParamValueDataType.string, ParamValueDataType.array].includes(type),
    rangeLen: (range: string[]) => range.length > 0,
    render: (range: string[]) =>
      range.filter((el) => el !== undefined).join(', '),
  },
  {
    valueType: (type: number) => type === ParamValueDataType.boolean,
    rangeLen: (range: string[]) => range.length > 0,
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
export const renderRange = (type: number, range: string[]) => {
  const target = rangeRenderTable.find(
    (config) => config.valueType(type) && config.rangeLen(range)
  )

  return target?.render(range)
}

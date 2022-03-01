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
 * Render parameter range
 * @param type parameter type
 * @param range parameter range
 */
export const renderRange = (range: string[], rangeType: number) => {
  const target = rangeRenderTable.find((config) => config.rangeType(rangeType))

  return target?.render(range)
}

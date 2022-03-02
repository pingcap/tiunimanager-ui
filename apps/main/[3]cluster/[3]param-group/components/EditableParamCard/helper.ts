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

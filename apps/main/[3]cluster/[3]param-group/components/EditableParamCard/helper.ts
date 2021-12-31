import { ParamValueDataType } from '@/api/model'

const rangeRenderMap: Record<
  number,
  (range: string[], unit: string) => string
> = {
  [ParamValueDataType.int]: (range: string[], unit) =>
    `${range[0]}${unit} ~ ${range[1]}${unit}`,
  [ParamValueDataType.string]: (range: string[]) => range.join(', '),
  [ParamValueDataType.boolean]: (range: string[]) => `${range[0]}, ${range[1]}`,
  [ParamValueDataType.float]: (range: string[], unit) =>
    `${range[0]}${unit} ~ ${range[1]}${unit}`,
  [ParamValueDataType.array]: (range: string[]) => range.join(', '),
}

/**
 * Render parameter range
 * @param type parameter type
 * @param range parameter range
 * @param unit parameter unit
 */
export const renderRange = (type: number, range: string[], unit = '') => {
  return range.length === 1
    ? `${range[0]}${unit}`
    : rangeRenderMap[type]?.(range, unit)
}

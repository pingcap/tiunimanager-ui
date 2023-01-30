import { FC } from 'react'
import { default as RawSkeleton, SkeletonTheme } from 'react-loading-skeleton'
import type { SkeletonProps as SkeletonRawProps, SkeletonThemeProps, SkeletonStyleProps } from 'react-loading-skeleton'

export interface SkeletonProps extends SkeletonRawProps {
  /**
   * The number of lines of skeletons to render.
   * If `count` is a decimal number like 3.5,
   * three full skeletons and one half-width skeleton will be rendered.
   *
   * Default: 1
   */
  count?: number
  /**
   * A custom wrapper component that goes around
   * the individual skeleton elements.
   *
   * Default: undefined
   */
  wrapper?: SkeletonRawProps['wrapper']
  /**
   * A custom class name for the individual skeleton elements
   * which is used alongside the default class, `react-loading-skeleton`.
   *
   * Default: undefined
   */
  className?: string
  /**
   * A custom class name for the `<span>`
   * that wraps the individual skeleton elements.
   *
   * Default: undefined
   */
  containerClassName?: string
  /**
   * A string that is added to the container element
   * as a `data-testid` attribute.
   * Use it with `screen.getByTestId('...')` from React Testing Library.
   *
   * Default: undefined
   */
  containerTestId?: string
  /**
   * Makes the skeleton circular by setting `border-radius` to `50%`
   *
   * Default: false
   */
  circle?: boolean
  /**
   * This is an escape hatch for advanced use cases
   * and is not the preferred way to style the skeleton.
   * Props (e.g. width, borderRadius) take priority over this style object.
   *
   * Default: undefined
   */
  style?: SkeletonRawProps['style']
}

export const Skeleton: FC<SkeletonProps> = RawSkeleton

export type { SkeletonThemeProps, SkeletonStyleProps }

export { SkeletonTheme }

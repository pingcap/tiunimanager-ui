const getCollapsedHeight = () => ({ height: 0, opacity: 0 })
const getRealHeight = (node: HTMLElement) => {
  const { scrollHeight } = node
  return { height: scrollHeight, opacity: 1 }
}
const getCurrentHeight = (node: HTMLElement) => ({ height: node ? node.offsetHeight : 0 })
const skipOpacityTransition = (_: any, event: any) =>
  event?.deadline === true || (event as TransitionEvent).propertyName === 'height'

export const collapseMotion = {
  motionName: 'tc-uikit-tree-motion-collapse',
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onAppearEnd: skipOpacityTransition,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500
}

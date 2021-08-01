// NOTE: stackTraceLimit is provided by V8 only
if ((window as any).chrome) {
  ;(Error as any).stackTraceLimit = 20
}

// NOTE: AntD has some components that throws `deprecated` errors
//  in strict mode, so just ignore them.
//  https://github.com/ant-design/ant-design/issues/26136
const consoleErr = window.console.error
window.console.error = (...data: any[]) => {
  if (data.some((d) => typeof d === 'string' && d.includes('findDOMNode')))
    return
  consoleErr(...data)
}

if (import.meta.env.VITE_MOCK) {
  const mock = await import('@mock/index')
  // By default MSW will catch all requests during its initialization
  mock.initMock().then()
}

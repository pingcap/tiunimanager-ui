import { useState } from 'react'

export function usePagination(defaultPageSize = 10) {
  return useState({
    page: 1,
    pageSize: defaultPageSize,
  })
}

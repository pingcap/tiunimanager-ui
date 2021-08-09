export function errToMsg(err: any): string {
  return err?.response?.data?.message ?? err.message ?? JSON.stringify(err)
}

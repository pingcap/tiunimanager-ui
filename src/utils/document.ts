export function setTitlePrefix(prefix: string) {
  if (document.title.includes(' - ')) {
    document.title = document.title.replace(/^.*? - /, prefix + ' - ')
  } else {
    document.title = `${prefix} - ${document.title}`
  }
}

export function setTitle(prefix?: string) {
  if (prefix) document.title = `${prefix} - ${import.meta.env.VITE_TITLE}`
  else document.title = import.meta.env.VITE_TITLE
}

import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-sql'
import 'ace-builds/src-noconflict/mode-mysql'
import 'ace-builds/src-noconflict/theme-github'
import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-spellcheck'
import { IAceEditorProps } from 'react-ace/lib/ace'

export type CodeInputProps = {
  name?: string
  mode?: 'sql' | 'mysql'
  theme?: 'github'
  fontSize?: number
  value?: string
  onChange?: (v: string) => void
} & IAceEditorProps

export function CodeInput({
  name = 'code-input',
  mode = 'sql',
  theme = 'github',
  fontSize = 16,
  value = '',
  onChange,
  ...props
}: CodeInputProps) {
  return (
    <AceEditor
      mode={mode}
      theme={theme}
      name={name}
      fontSize={fontSize}
      onChange={(value) => onChange?.(value)}
      value={value}
      style={{ width: '100%' }}
      setOptions={{
        spellcheck: true,
        maxLines: 20,
        showPrintMargin: false,
        showGutter: false,
        enableLiveAutocompletion: true,
        highlightActiveLine: false,
        tabSize: 2,
        wrap: true,
        autoScrollEditorIntoView: true,
      }}
      {...props}
    />
  )
}

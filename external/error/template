import i18next from 'i18next'

const addMessages = () => {
  i18next.addResourceBundle('en', 'error', {
    {%- for _,value in data.iterrows() %}
    '{{ value.code }}': `{{ value.en }}`,
    {%- endfor %}
  })
  i18next.addResourceBundle('zh', 'error', {
    {%- for _,value in data.iterrows() %}
    '{{ value.code }}': `{{ value.zh }}`,
    {%- endfor %}
  })
}

if (i18next.isInitialized) addMessages()
else i18next.on('initialized', addMessages)

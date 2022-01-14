## Example

```typescript
import { render } from 'react-dom'
import { wrap } from '@components-macro'

render(
  // <A>
  //   <B>
  //     <C>
  //       {d}
  //     </C>
  //   </B>
  // </A>
  wrap(d, C, B, A),
  document.getElementById('root')
)
```

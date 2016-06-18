## Usage

```js
import replaceHostname from '../libs/replace-link-hostname';

router.get('/', (req, res) => {
  replaceHostname('http://inner-network-host/url', req.headers.host);
});
```

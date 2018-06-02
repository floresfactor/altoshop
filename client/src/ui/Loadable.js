import L from 'react-loadable';
import Loading from './common/components/loading.jsx';

const Loadable = opts =>
  L({ loading:Loading ,
  delay: 300,
  ...opts
});

export default Loadable;

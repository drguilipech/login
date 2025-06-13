import { motion } from 'https://unpkg.com/framer-motion/dist/framer-motion.es.js';
const e = React.createElement;

function App() {
  const [page, setPage] = React.useState('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const submit = async (path) => {
    await fetch(`http://localhost:3001/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if(path !== 'forgot') setPage('welcome');
  };

  if(page === 'welcome') return e('h2', null, 'Welcome');

  return (
    React.createElement(motion.div, { className:'container', initial:{opacity:0,y:-20}, animate:{opacity:1,y:0} },
      page === 'login' && [
        e('h3', { key:'title' }, 'Login'),
        e('input', { key:'email', placeholder:'Email', value:email, onChange:e=>setEmail(e.target.value) }),
        e('input', { key:'pass', type:'password', placeholder:'Password', value:password, onChange:e=>setPassword(e.target.value) }),
        e('button', { key:'btn', onClick:()=>submit('login') }, 'Login'),
        e('div', { key:'links' },
          e('a', { onClick:()=>submit('auth/google') }, 'Login with Google'), e('br'),
          e('a', { onClick:()=>setPage('register') }, 'Register'), ' | ',
          e('a', { onClick:()=>setPage('forgot') }, 'Forgot Password'))
      ],
      page === 'register' && [
        e('h3', { key:'title' }, 'Register'),
        e('input', { key:'email', placeholder:'Email', value:email, onChange:e=>setEmail(e.target.value) }),
        e('input', { key:'pass', type:'password', placeholder:'Password', value:password, onChange:e=>setPassword(e.target.value) }),
        e('button', { key:'btn', onClick:()=>submit('signup') }, 'Create Account'),
        e('a', { key:'back', onClick:()=>setPage('login') }, 'Back')
      ],
      page === 'forgot' && [
        e('h3', { key:'title' }, 'Password Recovery'),
        e('input', { key:'email', placeholder:'Email', value:email, onChange:e=>setEmail(e.target.value) }),
        e('button', { key:'btn', onClick:()=>submit('forgot') }, 'Send Magic Link'),
        e('a', { key:'back', onClick:()=>setPage('login') }, 'Back')
      ]
    )
  );
}

ReactDOM.render(e(App), document.getElementById('root'));

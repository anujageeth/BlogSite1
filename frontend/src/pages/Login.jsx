import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toast from '../components/Toast';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        await axios.post('https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/register', { 
          email, 
          password,
          firstName,
          lastName,
          dateOfBirth
        });
        setToast({
          show: true,
          message: 'Registered successfully! Please login.',
          type: 'success'
        });
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
      } else {
        const res = await axios.post('https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/login', { email, password });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          setToast({
            show: true,
            message: 'Login successful!',
            type: 'success'
          });
          setTimeout(() => navigate('/feed'), 1500);
        } else {
          setError('No token received from server');
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
      setToast({
        show: true,
        message: err.response?.data?.msg || 'An error occurred',
        type: 'error'
      });
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setError('');
  };

  return (
    <>
      <div className="login-container">
        <h2 className="login-title">{isRegistering ? 'Register' : 'Login'}</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <input
                type="text"
                className="login-input"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="First Name"
                required
              />
              <input
                type="text"
                className="login-input"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Last Name"
                required
              />
              <input
                type="date"
                className="login-input"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                required
              />
            </>
          )}
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <input
            type="password"
            className="login-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          {isRegistering && (
            <input
              type="password"
              className="login-input"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required
            />
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>
        </form>
        <button
          className="toggle-button"
          onClick={toggleMode}
        >
          {isRegistering ? 'Back to Login' : 'Create an Account'}
        </button>
        <button
          className="google-login-button"
          onClick={() => window.location.href = 'https://495b9df7-a50d-4524-b4a5-88c978129b04-00-92mz2jkdw2ok.sisko.replit.dev/api/auth/google'}
        >
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path
              fill="currentColor"
              d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.416,1.363-1.405,2.478-2.73,3.034 C13.967,17.646,12.493,18,11,18c-2.761,0-5-2.239-5-5s2.239-5,5-5c1.231,0,2.363,0.444,3.239,1.186l2.121-2.121 C14.584,5.404,12.847,4.627,11,4.627c-4.418,0-8,3.582-8,8s3.582,8,8,8c2.598,0,4.925-1.243,6.383-3.192 c1.185-1.578,1.871-3.532,1.871-5.808c0-0.463-0.042-0.922-0.125-1.375H14.454C13.4,10.251,12.545,11.106,12.545,12.151z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
      {toast.show && (
        <Toast 
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
          duration={2000}
        />
      )}
    </>
  );
}

export default Login;
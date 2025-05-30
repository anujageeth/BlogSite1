import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
        await axios.post('http://localhost:5000/api/auth/register', { 
          email, 
          password,
          firstName,
          lastName,
          dateOfBirth
        });
        alert('Registered successfully! Please login.');
        setIsRegistering(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFirstName('');
        setLastName('');
        setDateOfBirth('');
      } else {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          navigate('/feed');
        } else {
          setError('No token received from server');
        }
      }
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
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
    </div>
  );
}

export default Login;
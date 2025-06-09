import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('token', token);
      navigate('/feed');
    } else {
      navigate('/login');
    }
  }, [navigate, location]);

  return (
    <div className="oauth-callback">
      <div className="loading-spinner"></div>
      <p>Completing login...</p>
    </div>
  );
}

export default OAuthCallback;
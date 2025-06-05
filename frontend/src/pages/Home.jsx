import { Link } from 'react-router-dom';
import Navbar from '../components/NavBar';
import '../styles/Home.css';

function Home() {
  return (
    <>
      <Navbar />
      <div className="home-container">
        <h1 className="home-title">Welcome to BlogSpace</h1>
        
        <div className="home-content">
          <p className="home-text">
            Share your thoughts, experiences, and stories with our growing community of writers and readers.
          </p>
          <p className="home-text">
            Join us in creating meaningful conversations through engaging blog posts.
          </p>
          
          <div className="home-features">
            <div className="feature-card">
              <h3>Write & Share</h3>
              <p>Create beautiful blog posts and share your unique perspective with the world.</p>
            </div>
            <div className="feature-card">
              <h3>Connect</h3>
              <p>Join a community of passionate writers and engage with like-minded readers.</p>
            </div>
            <div className="feature-card">
              <h3>Discover</h3>
              <p>Explore diverse topics and perspectives from our growing collection of posts.</p>
            </div>
          </div>

          <div className="home-cta">
            <Link to="/login" className="home-button">Start Writing</Link>
            <Link to="/feed" className="home-button secondary">Browse Posts</Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
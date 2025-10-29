import { Link } from 'react-router-dom';
import logo from '../assets/logo_w.png';

export default function NotFoundPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#0d1117' }}
    >
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="GitWork Logo" 
            className="w-16 h-16 sm:w-24 sm:h-24 opacity-50"
          />
        </div>

        {/* 404 */}
        <h1 className="text-8xl sm:text-9xl font-bold text-white mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-base sm:text-lg text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/" 
            className="px-6 py-3 text-white rounded-lg transition-colors font-medium w-full sm:w-auto"
            style={{ background: '#8B5CF6' }}
            onMouseEnter={(e) => e.target.style.background = '#7C3AED'}
            onMouseLeave={(e) => e.target.style.background = '#8B5CF6'}
          >
            Go Home
          </Link>
          <Link 
            to="/search" 
            className="px-6 py-3 text-white rounded-lg transition-colors font-medium w-full sm:w-auto"
            style={{ background: '#161b22', border: '1px solid #30363d' }}
            onMouseEnter={(e) => e.target.style.background = '#1f2937'}
            onMouseLeave={(e) => e.target.style.background = '#161b22'}
          >
            Search Bounties
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8">
          <Link 
            to="/contact" 
            className="text-sm text-gray-400 transition-colors"
            style={{ color: '#9ca3af' }}
            onMouseEnter={(e) => e.target.style.color = '#8B5CF6'}
            onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
          >
            Need help? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}


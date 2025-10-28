import { Link } from 'react-router-dom';
import logo from '../assets/logo_t.png';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={logo} 
            alt="GitWork Logo" 
            className="w-24 h-24 sm:w-32 sm:h-32 opacity-50"
          />
        </div>

        {/* 404 */}
        <h1 className="text-8xl sm:text-9xl font-bold text-purple-600 mb-4">
          404
        </h1>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/" 
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium w-full sm:w-auto"
          >
            Go Home
          </Link>
          <Link 
            to="/search" 
            className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg hover:bg-purple-50 transition-colors font-medium w-full sm:w-auto"
          >
            Search Bounties
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8">
          <Link 
            to="/contact" 
            className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
          >
            Need help? Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}


import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { user_access_type } from '../commons/user_access_type';
import { FaCat } from 'react-icons/fa';  // Import a cat icon (using a placeholder)
import { GiWool  } from 'react-icons/gi';  // Import a wool ball icon (using a placeholder)

// Create Props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: user_access_type[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useUser();

  if (loading) {
    // Show a playful loading animation
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="relative flex items-center">
          <FaCat className="text-gray-800 text-6xl animate-cat-chase" />
          <GiWool  className="text-pink-500 text-6xl ml-12 animate-spin-wool" />
        </div>
      </div>
    );
  }

  if (!user || !user.active) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role as user_access_type)) {
    // User does not have the required role, redirect to not authorized page
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>; // Render the protected component
};

export default ProtectedRoute;

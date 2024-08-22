import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { user_access_type } from '../commons/user_access_type';

//create Props
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: user_access_type[];
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading } = useUser();
    if (loading) {
      // While loading, you might want to show a spinner or a blank screen
      return <div>Loading...</div>;
    }

  if (!user || !user.active) {
    // User is not authenticated, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !requiredRole.includes(user.role as user_access_type)) {
    // User does not have the required role, redirect to not authorized page
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;  // Render the protected component
};

export default ProtectedRoute;
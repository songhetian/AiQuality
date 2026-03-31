import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  requiredPermission?: string;
  requiredRoles?: string[];
}

export function ProtectedRoute({ requiredPermission, requiredRoles }: ProtectedRouteProps) {
  const { token, permissions, roles } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. 如果设置了角色要求，且用户不是超级管理员，则检查角色
  if (requiredRoles && !roles.includes('SUPER_ADMIN')) {
    const hasRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRole) {
      return <Navigate to="/403" state={{ from: location, requiredRoles }} replace />;
    }
  }

  // 2. 如果设置了权限要求，且用户不是超级管理员，则检查权限
  if (requiredPermission && !roles.includes('SUPER_ADMIN')) {
    if (!permissions.includes(requiredPermission)) {
      return <Navigate to="/403" state={{ from: location, requiredPermission }} replace />;
    }
  }

  return <Outlet />;
}

import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { Homepage } from '../pages/Homepage';
import { BackfillDetail } from '../pages/BackfillDetail';
import { MonthlyReview } from '../pages/MonthlyReview';
import { Log } from '../pages/Log';
import { ProgressProjection } from '../pages/ProgressProjection';
import { Profile } from '../pages/Profile';
import { Splash } from '../pages/auth/Splash';
import { Login } from '../pages/auth/Login';
import { SignUp } from '../pages/auth/SignUp';
import { Onboarding } from '../pages/auth/Onboarding';
import { WelcomeBack } from '../pages/auth/WelcomeBack';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { ResetPassword } from '../pages/auth/ResetPassword';
import { VerifyEmail } from '../pages/auth/VerifyEmail';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/splash" replace />,
  },
  // Splash standalone (bukan child AuthLayout) — dia sendiri sudah full-screen branding (logo di
  // tengah), bukan form, jadi gak butuh (dan gak boleh dobel sama) header logo-bar AuthLayout.
  { path: '/splash', element: <Splash /> },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <SignUp /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/verify-email', element: <VerifyEmail /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/welcome-back', element: <WelcomeBack /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/homepage', element: <Homepage /> },
          { path: '/monthly-review', element: <MonthlyReview /> },
          { path: '/log', element: <Log /> },
          { path: '/progress', element: <ProgressProjection /> },
          { path: '/profile', element: <Profile /> },
        ],
      },
      { path: '/backfill', element: <BackfillDetail /> },
    ],
  },
]);

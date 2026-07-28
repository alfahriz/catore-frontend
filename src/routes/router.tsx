import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AuthLayout } from '../components/layout/AuthLayout';
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

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/splash" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/splash', element: <Splash /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <SignUp /> },
      { path: '/onboarding', element: <Onboarding /> },
      { path: '/welcome-back', element: <WelcomeBack /> },
    ],
  },
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
]);

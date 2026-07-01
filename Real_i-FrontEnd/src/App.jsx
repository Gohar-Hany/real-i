import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ToastProvider } from '@/components/common/Toast';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import PageLoader from '@/components/common/PageLoader';

// Layouts
import PublicLayout from '@/layouts/PublicLayout';
import DashboardLayout from '@/layouts/DashboardLayout';

// Lazy Loaded Pages
const HomePage = lazy(() => import('@/pages/public/HomePage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const CoursesPage = lazy(() => import('@/pages/public/CoursesPage'));
const CourseDetailPage = lazy(() => import('@/pages/public/CourseDetailPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminChat = lazy(() => import('@/pages/admin/AdminChat'));
const AdminData = lazy(() => import('@/pages/admin/AdminData'));
const AdminUpload = lazy(() => import('@/pages/admin/AdminUpload'));
const AdminGuidelines = lazy(() => import('@/pages/admin/AdminGuidelines'));
const AdminStudents = lazy(() => import('@/pages/admin/AdminStudents'));
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));

// Student Pages
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const StudentChat = lazy(() => import('@/pages/student/StudentChat'));
const StudentQuiz = lazy(() => import('@/pages/student/StudentQuiz'));
const StudentCourses = lazy(() => import('@/pages/student/StudentCourses'));
const StudentProfile = lazy(() => import('@/pages/student/StudentProfile'));

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) return <Navigate to="/login" replace />;
  // Allow admins to access student routes, but not vice versa
  if (role && user.role !== role && user.role !== 'admin') {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public Routes (with Navbar + Footer) ── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        </Route>

        {/* ── Auth ── */}
        <Route path="/login" element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage />} />

        {/* ── Admin Routes ── */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="data" element={<AdminData />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="guidelines" element={<AdminGuidelines />} />
        </Route>

        {/* ── Student Routes ── */}
        <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="quiz" element={<StudentQuiz />} />
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* ── 404 inside PublicLayout for nav context ── */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const handleLoaderComplete = () => {
    setFadeOut(true);
    setTimeout(() => setInitialLoading(false), 500); // Wait for fade out transition
  };

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <SidebarProvider>
              <AuthProvider>
                <ToastProvider>
                  {initialLoading && (
                    <div className={`fixed inset-0 z-[9999] transition-opacity duration-500 ${fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                      <PageLoader onComplete={handleLoaderComplete} />
                    </div>
                  )}
                  <AppRoutes />
                </ToastProvider>
              </AuthProvider>
            </SidebarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

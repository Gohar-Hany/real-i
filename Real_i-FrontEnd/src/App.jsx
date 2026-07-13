import { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AssessmentProvider } from '@/contexts/AssessmentContext';
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
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const NotFound = lazy(() => import('@/pages/errors/NotFound'));

// Admin Pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminChat = lazy(() => import('@/pages/admin/AdminChat'));
const AdminData = lazy(() => import('@/pages/admin/AdminData'));
const AdminUpload = lazy(() => import('@/pages/admin/AdminUpload'));
const AdminGuidelines = lazy(() => import('@/pages/admin/AdminGuidelines'));
const AdminStudents = lazy(() => import('@/pages/admin/AdminStudents'));
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses'));
const AdminAnalytics = lazy(() => import('@/pages/admin/AdminAnalytics'));
const AdminProfile = lazy(() => import('@/pages/admin/AdminProfile'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings'));
const AdminStudentProfile = lazy(() => import('@/pages/admin/AdminStudentProfile'));
const AdminAssessments = lazy(() => import('@/pages/admin/AdminAssessments'));
const AdminAssessmentCreate = lazy(() => import('@/pages/admin/AdminAssessmentCreate'));
const AdminAssessmentDetail = lazy(() => import('@/pages/admin/AdminAssessmentDetail'));
const AdminCalendar = lazy(() => import('@/pages/admin/AdminCalendar'));

// Student Pages
const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const StudentChat = lazy(() => import('@/pages/student/StudentChat'));
const StudentQuiz = lazy(() => import('@/pages/student/StudentQuiz'));
const StudentCourses = lazy(() => import('@/pages/student/StudentCourses'));
const StudentProfile = lazy(() => import('@/pages/student/StudentProfile'));
const StudentPerformance = lazy(() => import('@/pages/student/StudentPerformance'));
const StudentAssessments = lazy(() => import('@/pages/student/StudentAssessments'));
const StudentExamTake = lazy(() => import('@/pages/student/StudentExamTake'));
const StudentAssignmentSubmit = lazy(() => import('@/pages/student/StudentAssignmentSubmit'));
const StudentAssessmentResult = lazy(() => import('@/pages/student/StudentAssessmentResult'));
const StudentCalendar = lazy(() => import('@/pages/student/StudentCalendar'));

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
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
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface-950">
        <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
      </div>
    }>
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
          <Route path="students/:id" element={<AdminStudentProfile />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="data" element={<AdminData />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="guidelines" element={<AdminGuidelines />} />
          <Route path="assessments" element={<AdminAssessments />} />
          <Route path="assessments/create" element={<AdminAssessmentCreate />} />
          <Route path="assessments/:id" element={<AdminAssessmentDetail />} />
          <Route path="assessments/:id/edit" element={<AdminAssessmentCreate />} />
          <Route path="calendar" element={<AdminCalendar />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ── Student Routes ── */}
        <Route path="/student" element={<ProtectedRoute role="student"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<StudentCourses />} />
          <Route path="chat" element={<StudentChat />} />
          <Route path="quiz" element={<StudentQuiz />} />
          <Route path="performance" element={<StudentPerformance />} />
          <Route path="assessments" element={<StudentAssessments />} />
          <Route path="assessments/:id/take" element={<StudentExamTake />} />
          <Route path="assessments/:id/submit" element={<StudentAssignmentSubmit />} />
          <Route path="assessments/:id/results" element={<StudentAssessmentResult />} />
          <Route path="calendar" element={<StudentCalendar />} />
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
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <BrowserRouter>
          <ThemeProvider>
            <SidebarProvider>
              <AuthProvider>
                <AssessmentProvider>
                  <ToastProvider>
                    <AppRoutes />
                  </ToastProvider>
                </AssessmentProvider>
              </AuthProvider>
            </SidebarProvider>
          </ThemeProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

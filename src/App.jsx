import { Layout } from "@/Layout";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import SegmentPage from "./pages/SegmentPage";
import CreateSegment from "./pages/CreateSegment";
import CampaignPage from "./pages/CampaignPage";
import CreateCampaign from "./pages/CreateCampaign";
import Authentication from "./pages/Authentication";
import ActivityPage from "./pages/ActivityPage";
import Customer from "./pages/Customer";
import useAuthStore from "./stores/useAuthStore";
import { GoogleOAuthProvider } from "@react-oauth/google";
import OrganizationSetup from "./pages/OrganizationSetup";
import TeamManagement from "./pages/TeamManagement";
import { Toaster } from "sonner";

const ProtectedLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasActiveOrganization = useAuthStore((state) =>
    state.hasActiveOrganization()
  );
  if (!isAuthenticated && !checkAuth()) {
    return <Navigate to="/login" replace />;
  }

  if (!hasActiveOrganization) {
    return <Navigate to="/create-organization" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const RequireAuth = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  if (!isAuthenticated && !checkAuth()) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={`${import.meta.env.VITE_GOOGLE_CLIENT_ID}`}>
      <Router>
        <Routes>
          <Route path="/login" element={<Authentication />} />
          <Route path="/signup" element={<Authentication isSignup />} />
          <Route
            path="/forgot-password"
            element={<Authentication forgotPassword />}
          />

          <Route
            path="/create-organization"
            element={
              <RequireAuth>
                <OrganizationSetup />
              </RequireAuth>
            }
          />

          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="segments" element={<SegmentPage />} />
            <Route path="segments/createsegment" element={<CreateSegment />} />
            <Route path="campaigns" element={<CampaignPage />} />
            <Route
              path="campaigns/createcampaign"
              element={<CreateCampaign />}
            />
            <Route path="actioncenter" element={<ActivityPage />} />
            <Route path="addcustomer" element={<Customer />} />
            <Route path="analytics" element={<h1>Analytics</h1>} />
            <Route path="team" element={<TeamManagement />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </GoogleOAuthProvider>
  );
}

export default App;

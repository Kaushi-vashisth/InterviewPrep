import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SubmitExperience from "./pages/SubmitExperience";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import SubmitOAQuestion from "./pages/SubmitOAQuestion";
import AllExperiences from "./pages/AllExperiences"
import ExperienceDetail from "./components/ExperienceDetail";
import Interview from "./pages/Interview";
import CompanyDetail from "./pages/CompanyDetail";
import OAquestions from "./pages/OAquestions";
import OACompanyWise from "./pages/OACompanyWise";
import { ToastContainer } from "react-toastify";
import ProtectedAdminRoute from "./components/protectedAdminRoute";

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <ToastContainer />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/submit-oa" element={<SubmitOAQuestion />} />
            <Route path="/interview" element={<AllExperiences />} />
            <Route path="/interview/company-wise" element={<Interview />} />
            <Route path="/interview/:id" element={<ExperienceDetail />} />
            <Route path="/company/:companyName" element={<CompanyDetail />} />
            <Route path="/submit" element={<SubmitExperience />} />
            <Route path="/admin" element={
              <ProtectedAdminRoute>
                <AdminPanel />
              </ProtectedAdminRoute>} />
            <Route path="/oa" element={<OAquestions />} />
            <Route path="/oa/:companyName" element={<OACompanyWise />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

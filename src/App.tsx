import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import ProgramsPage from "@/pages/ProgramsPage";
import ProgramDetailPage from "@/pages/ProgramDetailPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";
import BlogPage from "@/pages/BlogPage";
import ArticlePage from "@/pages/ArticlePage";
import TeamPage from "@/pages/TeamPage";
import ContactPage from "@/pages/ContactPage";
import DonatePage from "@/pages/DonatePage";
import PartnersPage from "@/pages/PartnersPage";
import ProfilePage from "@/pages/ProfilePage";
import LoginPage from "@/pages/LoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminArticles from "@/pages/admin/AdminArticles";
import AdminComments from "@/pages/admin/AdminComments";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminPrograms from "@/pages/admin/AdminPrograms";
import AdminProjects from "@/pages/admin/AdminProjects";
import AdminTeam from "@/pages/admin/AdminTeam";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminPages from "@/pages/admin/AdminPages";
import AdminPartners from "@/pages/admin/AdminPartners";
import AdminHomepage from "@/pages/admin/AdminHomepage";
import AdminTestimonials from "@/pages/admin/AdminTestimonials";
import AdminMenu from "@/pages/admin/AdminMenu";
import AdminDonate from "@/pages/admin/AdminDonate";
import AdminAbout from "@/pages/admin/AdminAbout";
import AdminContact from "@/pages/admin/AdminContact";
import AdminSiteContent from "@/pages/admin/AdminSiteContent";
import AdminMedia from "@/pages/admin/AdminMedia";
import CategoryPage from "@/pages/CategoryPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public */}
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/programs" element={<ProgramsPage />} />
                  <Route path="/programs/:id" element={<ProgramDetailPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<ArticlePage />} />
                  <Route path="/team" element={<TeamPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/donate" element={<DonatePage />} />
                  <Route path="/partners" element={<PartnersPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                </Route>

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />

                {/* Admin */}
                <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="homepage" element={<AdminHomepage />} />
                  <Route path="donate" element={<AdminDonate />} />
                  <Route path="about" element={<AdminAbout />} />
                  <Route path="contact" element={<AdminContact />} />
                  <Route path="site" element={<AdminSiteContent />} />
                  <Route path="menu" element={<AdminMenu />} />
                  <Route path="testimonials" element={<AdminTestimonials />} />
                  <Route path="articles" element={<AdminArticles />} />
                  <Route path="comments" element={<AdminComments />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="programs" element={<AdminPrograms />} />
                  <Route path="projects" element={<AdminProjects />} />
                  <Route path="team" element={<AdminTeam />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="pages" element={<AdminPages />} />
                  <Route path="partners" element={<AdminPartners />} />
                  <Route path="media" element={<AdminMedia />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

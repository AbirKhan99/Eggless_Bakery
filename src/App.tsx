import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CakesGallery from './components/CakesGallery';
import About from './components/About';
import WhyUs from './components/WhyUs';
import OrderCTA from './components/OrderCTA';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import { AuthProvider } from './lib/authContext';
import { RouterProvider, useRouter } from './lib/router';

function AppContent() {
  const { isAdminLogin, isAdminRoute } = useRouter();

  if (isAdminLogin) {
    return <AdminLogin />;
  }

  if (isAdminRoute) {
    return <AdminLayout />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <CakesGallery />
        <About />
        <WhyUs />
        <OrderCTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}

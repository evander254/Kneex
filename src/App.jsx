import { useState, Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Hero from './components/Hero'
import Footer from './components/Footer'
import AdminLogin from './components/Admin/Adminlogin'
import AdminDashboard from './components/Admin/AdminDashboard'
import ProductDetails from './components/ProductDetails'
import Login from './components/Login'
import Checkout from './components/Checkout'
import AnalyticsTracker from './components/AnalyticsTracker'
import CookieConsent from './components/CookieConsent'

const DealsSection = lazy(() => import('./components/DealsSection'))
const ProductGrid = lazy(() => import('./components/ProductGrid'))
const StripSection = lazy(() => import('./components/StripSection'))

// Admin Components
import ProductList from './components/Admin/Inventory/ProductList'
import AddProduct from './components/Admin/Inventory/AddProduct'
import EditProduct from './components/Admin/Inventory/EditProduct'

// Cart Drawer Import
import CartDrawer from './components/CartDrawer'

const GlobalLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="font-sans bg-gray-100 text-greyDark min-h-screen flex flex-col">
      {/* Cart Drawer - Global */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Header - Global */}
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Sidebar - Global */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {children}

      <Footer />
    </div>
  )
}

function MainLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 w-full">
      {/* Main Content */}
      <main className="space-y-8 w-full overflow-hidden">
        <Hero />
        <Suspense fallback={<div className="h-40 flex items-center justify-center">Loading...</div>}>
          <DealsSection />
          <StripSection />
          <ProductGrid />
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AnalyticsTracker />
        <CookieConsent />
        <GlobalLayout>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/product/:id" element={
              <div className="flex-1 w-full">
                <ProductDetails />
              </div>
            } />
            <Route path="/login" element={<Login />} />
            {/* Protected Checkout Route - check handled in CartDrawer usually but good to keep route open */}
            <Route path="/checkout" element={<Checkout />} />

            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/inventory" element={<ProductList />} />
            <Route path="/admin/inventory/add" element={<AddProduct />} />
            <Route path="/admin/inventory/edit/:id" element={<EditProduct />} />
          </Routes>
        </GlobalLayout>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

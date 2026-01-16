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

const DealsSection = lazy(() => import('./components/DealsSection'))
const ProductGrid = lazy(() => import('./components/ProductGrid'))
const StripSection = lazy(() => import('./components/StripSection'))

// Admin Components
import ProductList from './components/Admin/Inventory/ProductList'
import AddProduct from './components/Admin/Inventory/AddProduct'
import EditProduct from './components/Admin/Inventory/EditProduct'

// Cart Drawer Import
import CartDrawer from './components/CartDrawer'

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  return (
    <div className="font-sans bg-gray-100 text-greyDark min-h-screen flex flex-col">
      {/* Header */}
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 flex-1 w-full">

        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

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

      {/* Footer */}
      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainLayout />} />
          <Route path="/product/:id" element={
            <div className="font-sans bg-gray-100 text-greyDark min-h-screen flex flex-col">
              <Header />
              <div className="flex-1 w-full">
                <ProductDetails />
              </div>
              <Footer />
            </div>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/inventory" element={<ProductList />} />
          <Route path="/admin/inventory/add" element={<AddProduct />} />
          <Route path="/admin/inventory/edit/:id" element={<EditProduct />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  )
}

export default App

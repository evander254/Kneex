import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../supabaseClient'

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('admin_token')
            // Basic check - relying on token presence. 
            // In a real app, verify token validity with Supabase or check session.
            if (!token) {
                navigate('/admin')
            }
        }

        checkAuth()

        // Handle responsive sidebar on mount
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false)
            } else {
                setIsSidebarOpen(true)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Initial check

        return () => window.removeEventListener('resize', handleResize)
    }, [navigate])

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        navigate('/admin')
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-greyDark flex">
            {/* Sidebar */}
            <aside
                className={`fixed lg:static inset-y-0 left-0 z-40 bg-white shadow-xl transition-all duration-300 ease-in-out transform ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-0 lg:translate-x-0 lg:hidden'
                    } border-r border-gray-100 flex flex-col`}
            >
                {/* Logo Area */}
                <div className="h-20 flex items-center justify-center border-b border-gray-100 px-6">
                    <div className="text-2xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent">
                        KNEEX <span className="text-greyDark text-xs font-light tracking-widest ml-1 opacity-80">ADMIN</span>
                    </div>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>

                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${location.pathname === '/admin/dashboard'
                                ? 'bg-pink/10 text-pink font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-greyDark'
                            }`}
                    >
                        <i className="fas fa-chart-line w-5 text-center"></i>
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/users"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${location.pathname === '/admin/users'
                                ? 'bg-pink/10 text-pink font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-greyDark'
                            }`}
                    >
                        <i className="fas fa-users w-5 text-center"></i>
                        <span>Manage Users</span>
                    </Link>

                    <Link
                        to="/admin/inventory"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${location.pathname.startsWith('/admin/inventory')
                                ? 'bg-purple/10 text-purple font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-greyDark'
                            }`}
                    >
                        <i className="fas fa-box w-5 text-center"></i>
                        <span>Manage Inventory</span>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${location.pathname === '/admin/orders'
                                ? 'bg-blue-100 text-blue-600 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-greyDark'
                            }`}
                    >
                        <i className="fas fa-shopping-bag w-5 text-center"></i>
                        <span>View Orders</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition duration-200 ${location.pathname === '/admin/settings'
                                ? 'bg-gray-200 text-gray-800 font-medium'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-greyDark'
                            }`}
                    >
                        <i className="fas fa-cog w-5 text-center"></i>
                        <span>Settings</span>
                    </Link>
                </nav>

                {/* User Info / Logout */}
                <div className="p-4 border-t border-gray-100">
                    <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-greyDark">Admin</p>
                            <p className="text-xs text-gray-500">Administrator</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content Wrapper */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 shadow-sm z-20">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
                    >
                        <i className={`fas ${isSidebarOpen ? 'fa-indent' : 'fa-outdent'} text-xl`}></i>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-pink/10 flex items-center justify-center text-pink font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminLayout

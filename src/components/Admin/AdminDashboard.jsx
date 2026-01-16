import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0
    })
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('admin_token')
            if (!token) {
                navigate('/admin')
            }
        }

        checkAuth()
        fetchStats()
    }, [navigate])

    const fetchStats = async () => {
        try {
            // Count Users
            const { count: userCount, error: userError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })

            if (userError) throw userError

            // Count Products
            const { count: productCount, error: productError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })

            if (productError) throw productError

            // Count Orders
            const { count: orderCount, error: orderError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true })

            if (orderError) console.error('Error fetching orders:', orderError)

            setStats({
                users: userCount || 0,
                products: productCount || 0,
                orders: orderCount || 0
            })

        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        navigate('/admin')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-greyDark flex items-center justify-center">
                <div className="text-xl font-semibold text-white animate-pulse">Loading Admin Portal...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-greyDark">
            {/* Top Navigation Bar - Matching Header.jsx Style */}
            <nav className="sticky top-0 z-50 backdrop-blur-md bg-greyDark/90 border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
                <div className="text-2xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent">
                    KNEEX <span className="text-white text-sm font-light tracking-widest ml-1 opacity-80">ADMIN</span>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-sm text-gray-300">Welcome, Admin</span>
                    <button
                        onClick={handleLogout}
                        className="bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2 rounded-lg text-sm transition duration-200 flex items-center gap-2"
                    >
                        <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <h2 className="text-2xl font-bold text-greyDark mb-6">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Users Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-pink hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Total Users</p>
                                <h3 className="text-4xl font-extrabold text-greyDark">{stats.users}</h3>
                            </div>
                            <div className="p-4 bg-pink/10 rounded-full text-pink">
                                <i className="fas fa-users text-2xl"></i>
                            </div>
                        </div>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Total Inventory</p>
                                <h3 className="text-4xl font-extrabold text-greyDark">{stats.products}</h3>
                            </div>
                            <div className="p-4 bg-purple/10 rounded-full text-purple">
                                <i className="fas fa-box-open text-2xl"></i>
                            </div>
                        </div>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Total Orders</p>
                                <h3 className="text-4xl font-extrabold text-greyDark">{stats.orders}</h3>
                            </div>
                            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                                <i className="fas fa-shopping-bag text-2xl"></i>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                    <h2 className="text-xl font-bold mb-6 text-greyDark flex items-center gap-2">
                        <i className="fas fa-bolt text-purple"></i> Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <button className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-pink/30 hover:shadow-md transition duration-200 group">
                            <div className="w-12 h-12 rounded-full bg-pink/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-user-edit text-pink text-xl"></i>
                            </div>
                            <span className="font-semibold text-gray-700">Manage Users</span>
                        </button>
                        <Link to="/admin/inventory" className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-purple/30 hover:shadow-md transition duration-200 group">
                            <div className="w-12 h-12 rounded-full bg-purple/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-tags text-purple text-xl"></i>
                            </div>
                            <span className="font-semibold text-gray-700">Manage Inventory</span>
                        </Link>
                        <button className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-blue-500/30 hover:shadow-md transition duration-200 group">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-clipboard-list text-blue-600 text-xl"></i>
                            </div>
                            <span className="font-semibold text-gray-700">View Orders</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-6 border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-400/30 hover:shadow-md transition duration-200 group">
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <i className="fas fa-cog text-gray-600 text-xl"></i>
                            </div>
                            <span className="font-semibold text-gray-700">Settings</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default AdminDashboard

import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        orders: 0
    })
    const [loading, setLoading] = useState(true)

    // Auth check is now handled by AdminLayout, but keeping a failsafe here or relying on Layout is fine.
    // Layout does the check, so we can simplify.

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            // Count Users - assuming rpc get_user_count exists as per previous code
            // fallbacks might be needed if RPC is missing, but adhering to existing logic
            const { data: userCount, error: userError } = await supabase
                .rpc('get_user_count')

            if (userError) console.error('Error fetching users:', userError)

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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-xl font-semibold text-greyDark animate-pulse">Loading Stats...</div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-greyDark">Dashboard Overview</h1>
                <p className="text-sm text-gray-500">Welcome back, Admin</p>
            </div>

            {/* Stats Grid - Requested Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

                {/* Orders Card (Matching Style) */}
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

            {/* Quick Actions (Optional - can be kept or removed since they are in sidebar now) */}
            {/* Keeping simpler version if needed, or removing as they are in sidebar.
                User said "Every Item In the Quick Action should be in the collapsible sidebar".
                So I will remove the redundant Quick Actions section from the main view to keep it clean,
                or replace with "Recent Activity" later. For now, removing redundant actions.
            */}
        </div>
    )
}

export default AdminDashboard

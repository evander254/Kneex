import { useState } from 'react'
import { supabase } from '../../supabaseClient'
import { useNavigate } from 'react-router-dom'

const AdminLogin = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase
                .from('Admin')
                .select('*')
                .eq('Username', username)
                .eq('Password', password)
                .single()

            if (error) {
                if (error.code === 'PGRST116') { // no rows returned
                    throw new Error('Invalid credentials')
                }
                throw error
            }

            if (data) {
                // Login successful
                console.log('Login successful:', data)
                localStorage.setItem('admin_token', JSON.stringify(data))
                navigate('/admin/dashboard')
            }
        } catch (err) {
            console.error('Login error:', err)
            setError(err.message || 'An error occurred during login')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans relative overflow-hidden">
            {/* Background with Theme Colors */}
            <div className="absolute inset-0 bg-greyDark z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-greyDark via-grey to-black opacity-90"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 -right-24 w-64 h-64 bg-purple opacity-20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-pink to-purple bg-clip-text text-transparent inline-block">
                        Admin Portal
                    </h2>
                    <p className="text-gray-300 mt-2 text-sm">Sign in to manage Kneex Marketplace</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="username">
                            Username
                        </label>
                        <div className="relative">
                            <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-pink transition duration-200"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-pink transition duration-200"
                                placeholder="Enter your password"
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-lg text-white font-bold tracking-wide shadow-lg transition duration-200 transform hover:scale-[1.02] ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-pink to-purple hover:shadow-purple/50'
                            }`}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AdminLogin

import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useState(new URLSearchParams(window.location.search))
    const redirectUrl = searchParams.get('redirect') || '/'
    const { user } = useAuth() || {}

    useEffect(() => {
        if (user) {
            navigate(redirectUrl)
        }
    }, [user, navigate, redirectUrl])
    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setMessage('')

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                })
                if (error) throw error
                setMessage('Signup successful! Check your email for confirmation.')
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                // Navigation handled by useEffect
            }
        } catch (err) {
            console.error('Auth error:', err)
            setError(err.message || 'An error occurred during authentication')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (error) throw error
        } catch (err) {
            console.error('Google Auth error:', err)
            setError(err.message || 'An error occurred during Google authentication')
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
                        {isSignUp ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <p className="text-gray-300 mt-2 text-sm">
                        {isSignUp ? 'Join Kneex Marketplace today' : 'Sign in to access your account'}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6 text-sm text-center" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {message && (
                    <div className="bg-green-500/10 border border-green-500/50 text-green-200 px-4 py-3 rounded mb-6 text-sm text-center" role="alert">
                        <span className="block sm:inline">{message}</span>
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300" htmlFor="email">
                            Email Address
                        </label>
                        <div className="relative">
                            <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-pink transition duration-200"
                                placeholder="Enter your email"
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
                        {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-[#2d2d2d] text-gray-400 rounded">Or continue with</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="mt-6 w-full py-3 rounded-lg bg-white text-gray-900 font-bold tracking-wide shadow-lg transition duration-200 transform hover:scale-[1.02] hover:bg-gray-100 flex items-center justify-center gap-3"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                        Google
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsSignUp(!isSignUp)
                            setError(null)
                            setMessage('')
                        }}
                        className="text-gray-300 hover:text-white text-sm transition-colors"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                    </button>
                    <div className="mt-4">
                        <button
                            onClick={() => navigate('/')}
                            className="text-gray-400 hover:text-white text-xs transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login

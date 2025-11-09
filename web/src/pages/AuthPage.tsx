import { useAuth } from '@/contexts/AuthProvider';
import { getData, postData } from '@/utils/Fetcher';
import { toastError } from '@/utils/Toast';
import { Smile } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function AuthPage() {
    const { googleSignIn, signIn, signUp } = useAuth();
    const [currentPage, setCurrentPage] = useState('login');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const handleGoogleCallback = async () => {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');

            // Only run if we came from Google
            if (!code) return;

            try {
                const response = await postData('auth/token', { code, platform: 'web' });
                console.log(response)
                if (response.data.access_token || response.data.success) {
                    setIsLoggedIn(true);
                    setCurrentPage('home');

                    // Clean URL: remove ?code=...&state=...
                    window.history.replaceState({}, '', window.location.pathname);
                } else {
                    console.error('Login failed:', response.data);
                    // Optional: show error toast
                    toastError('Google sign-in failed. Please try again.');
                }
            } catch (err: any) {
                console.error('Token exchange failed:', err.response?.data || err);
                toastError('Google sign-in failed. Please try again.');
            }
        };

        handleGoogleCallback();
    }, []);

    return (
        <>
            {currentPage === 'login' ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-black flex items-center justify-center px-4 py-8">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-8">
                            <Smile className="w-16 h-16 text-red-500 animate-pulse mx-auto mb-4" />
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                Welcome to Happy Snippets
                            </h1>
                            <p className="text-gray-400">Sign in to access your code snippets</p>
                        </div>

                        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-red-900/30 p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Email or Username</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your email or username"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Enter your password"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-red-600 rounded bg-gray-950 border-red-900" />
                                        <span className="text-gray-400 text-sm">Remember me</span>
                                    </label>
                                    <button className="text-sm text-orange-500 hover:text-red-500 transition-colors">
                                        Forgot password?
                                    </button>
                                </div>

                                <button
                                    onClick={() => { signIn ({ email: '', password: '' }); }}
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
                                >
                                    Sign In
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-red-900/30"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gray-900 text-gray-500">Or continue with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-red-900/30 rounded-lg text-gray-300 hover:border-red-600 hover:text-red-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        <span>GitHub</span>
                                    </button>
                                    <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-red-900/30 rounded-lg text-gray-300 hover:border-red-600 hover:text-red-400 transition-colors"
                                        onClick={() => googleSignIn('login')}>
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Google</span>
                                    </button>
                                </div>

                                <p className="text-center text-gray-400 text-sm">
                                    Don't have an account?{' '}
                                    <button onClick={() => setCurrentPage('register')} className="text-orange-500 hover:text-red-500 font-semibold transition-colors">
                                        Create an account
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950 to-black flex items-center justify-center px-4 py-8">
                    <div className="max-w-md w-full">
                        <div className="text-center mb-8">
                            <Smile className="w-16 h-16 text-red-500 animate-pulse mx-auto mb-4" />
                            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                                Create Your Account
                            </h1>
                            <p className="text-gray-400">Create your account to start snipping</p>
                        </div>

                        <div className="bg-gray-900 rounded-2xl shadow-2xl border border-red-900/30 p-8">
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Username</label>
                                    <input
                                        type="text"
                                        placeholder="Choose a username"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Email</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Password</label>
                                    <input
                                        type="password"
                                        placeholder="Create a password"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-red-400 mb-2">Confirm Password</label>
                                    <input
                                        type="password"
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3 rounded-lg bg-gray-950 border-2 border-red-900/30 text-gray-300 placeholder-gray-600 focus:border-red-600 focus:outline-none transition-colors"
                                    />
                                </div>

                                {/* <div className="flex items-start space-x-2">
                                    <input type="checkbox" className="w-4 h-4 mt-1 text-red-600 rounded bg-gray-950 border-red-900" />
                                    <label className="text-gray-400 text-sm">
                                        I accept the{' '}
                                        <button className="text-orange-500 hover:text-red-500 transition-colors">
                                            Terms of Service
                                        </button>
                                        {' '}and{' '}
                                        <button className="text-orange-500 hover:text-red-500 transition-colors">
                                            Privacy Policy
                                        </button>
                                    </label>
                                </div> */}

                                <button
                                    onClick={() => { setIsLoggedIn(true); setCurrentPage('home'); }}
                                    className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-red-900/50"
                                >
                                    Register
                                </button>

                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-red-900/30"></div>
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-gray-900 text-gray-500">Or register with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-red-900/30 rounded-lg text-gray-300 hover:border-red-600 hover:text-red-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                        </svg>
                                        <span>GitHub</span>
                                    </button>
                                    <button className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-red-900/30 rounded-lg text-gray-300 hover:border-red-600 hover:text-red-400 transition-colors">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                        </svg>
                                        <span>Google</span>
                                    </button>
                                </div>

                                <p className="text-center text-gray-400 text-sm">
                                    Already have an account?{' '}
                                    <button onClick={() => setCurrentPage('login')} className="text-orange-500 hover:text-red-500 font-semibold transition-colors">
                                        Log in here
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
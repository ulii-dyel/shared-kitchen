'use client';

import { useState } from 'react';
import { ChefHat, ArrowRight, Loader2 } from 'lucide-react';
import { login, signup } from './actions';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        try {
            const action = isLogin ? login : signup;
            const result = await action(formData) as { error?: string; message?: string } | undefined;

            if (result?.error) {
                setMessage({ text: result.error, type: 'error' });
            } else if (result?.message) {
                setMessage({ text: result.message, type: 'success' });
            }
            // If successful login, the action redirects, so we don't need to do anything
        } catch (e) {
            setMessage({ text: 'An unexpected error occurred', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-dark)] relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)]/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[var(--secondary)]/10 blur-[120px] rounded-full"></div>
            </div>

            <div className="w-full max-w-md z-10 space-y-8 animate-fade-in-up">
                {/* Brand */}
                <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-gradient-to-tr from-[var(--primary)] to-[var(--secondary)] rounded-2xl shadow-lg mb-2">
                        <ChefHat size={32} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold font-display tracking-tight">
                        The Shared Kitchen
                    </h1>
                    <p className="text-[var(--text-secondary)]">
                        Plan meals, shop smarter, and cook together.
                    </p>
                </div>

                {/* Card */}
                <div className="bg-[var(--bg-card)] border border-[var(--border-color)] p-8 rounded-2xl shadow-xl backdrop-blur-sm">
                    <div className="flex gap-4 mb-6 p-1 bg-[var(--bg-darker)] rounded-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLogin ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLogin ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-4">
                            <Input
                                name="email"
                                type="email"
                                label="Email Address"
                                placeholder="you@example.com"
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                label="Password"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={loading}
                        >
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                            {!loading && <ArrowRight size={18} className="ml-2" />}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-xs text-[var(--text-muted)]">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
}

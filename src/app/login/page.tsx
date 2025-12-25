import LoginForm from '@/components/auth/LoginForm';
import Navbar from '@/components/layout/Navbar';

export default function LoginPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <LoginForm />
            </main>
        </>
    );
}


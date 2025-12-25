import RegisterForm from '@/components/auth/RegisterForm';
import Navbar from '@/components/layout/Navbar';

export default function RegisterPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
                <RegisterForm />
            </main>
        </>
    );
}


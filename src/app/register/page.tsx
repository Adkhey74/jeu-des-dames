import RegisterForm from '@/components/auth/RegisterForm';
import Navbar from '@/components/layout/Navbar';

export default function RegisterPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen flex items-center justify-center ml-20 lg:ml-64 p-4 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-100">
                <div className="w-full max-w-lg">
                    <RegisterForm />
                </div>
            </main>
        </>
    );
}


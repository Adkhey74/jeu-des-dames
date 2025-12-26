import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen ml-20 lg:ml-64">
        {/* Hero Section */}
        <div className="hero min-h-[calc(100vh-4rem)] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="hero-content text-center relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-sm mb-6 shadow-2xl">
                <span className="text-5xl">🎲</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 bg-clip-text">
                Jeu de Dames
              </h1>
              <p className="py-6 text-xl text-white/95 leading-relaxed max-w-xl mx-auto">
                Jouez au jeu de dames en ligne avec vos amis ! Créez une partie, partagez le code avec votre ami et commencez à jouer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/register" 
                  className="btn bg-white text-indigo-600 hover:bg-indigo-50 border-0 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all text-lg px-8 py-3 font-semibold"
                >
                  Commencer à jouer
                </Link>
                <Link 
                  href="/login" 
                  className="btn btn-outline text-white border-2 border-white/50 hover:bg-white/10 hover:border-white backdrop-blur-sm text-lg px-8 py-3 font-semibold"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4 bg-gradient-to-b from-white to-indigo-50/30">
          <div className="max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Fonctionnalités
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl">
                Découvrez toutes les fonctionnalités qui rendent votre expérience de jeu exceptionnelle
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-white shadow-xl border border-indigo-100 hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="card-body items-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-4xl">🎮</span>
                  </div>
                  <h3 className="card-title text-indigo-700 text-xl mb-3">Créer une partie</h3>
                  <p className="text-slate-600 leading-relaxed">Créez une nouvelle partie et obtenez un code unique pour inviter vos amis</p>
                </div>
              </div>

              <div className="card bg-white shadow-xl border border-purple-100 hover:shadow-2xl hover:border-purple-300 hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="card-body items-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-4xl">🔗</span>
                  </div>
                  <h3 className="card-title text-purple-700 text-xl mb-3">Rejoindre une partie</h3>
                  <p className="text-slate-600 leading-relaxed">Utilisez un code pour rejoindre une partie créée par un ami</p>
                </div>
              </div>

              <div className="card bg-white shadow-xl border border-indigo-100 hover:shadow-2xl hover:border-indigo-300 hover:-translate-y-2 transition-all duration-300 rounded-2xl overflow-hidden">
                <div className="card-body items-center text-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <h3 className="card-title text-indigo-700 text-xl mb-3">Suivre vos scores</h3>
                  <p className="text-slate-600 leading-relaxed">Consultez l&apos;historique de vos parties et vos statistiques</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Section */}
        <div className="py-20 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Comment jouer ?
            </h2>
            <p className="text-lg text-slate-600 mb-12">C&apos;est simple, suivez ces étapes</p>
            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary text-indigo-600">
                <div className="step-content">
                  <div className="font-semibold text-lg">Créez un compte</div>
                  <div className="text-sm text-slate-600 mt-1">Inscription gratuite et rapide</div>
                </div>
              </div>
              <div className="step step-primary text-indigo-600">
                <div className="step-content">
                  <div className="font-semibold text-lg">Créez ou rejoignez</div>
                  <div className="text-sm text-slate-600 mt-1">Une partie en un clic</div>
                </div>
              </div>
              <div className="step text-slate-400">
                <div className="step-content">
                  <div className="font-semibold text-lg">Jouez en temps réel</div>
                  <div className="text-sm text-slate-600 mt-1">Avec vos amis</div>
                </div>
              </div>
              <div className="step text-slate-400">
                <div className="step-content">
                  <div className="font-semibold text-lg">Gagnez et progressez</div>
                  <div className="text-sm text-slate-600 mt-1">Montez dans le classement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center p-10 bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 text-white border-t border-indigo-800/50">
        <aside>
          <p className="font-bold">
            Jeu de Dames <br />
            Application de jeu en ligne
          </p>
          <p>Copyright © 2025 - Tous droits réservés</p>
        </aside>
      </footer>
    </>
  );
}

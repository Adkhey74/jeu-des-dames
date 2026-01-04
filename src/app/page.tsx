import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Header from '@/components/layout/Header';

export default function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <main className="min-h-screen ml-20 lg:ml-64 pt-16 lg:pt-20">
        {/* Hero Section */}
        <div className="hero min-h-[calc(100vh-4rem)] bg-gradient-gaming relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-10"></div>
          <div className="hero-content text-center relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/20 backdrop-blur-sm mb-6 shadow-2xl border border-red-500/30">
                <span className="text-5xl">🎲</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Jeu de Dames
              </h1>
              <p className="py-6 text-xl text-white/90 leading-relaxed max-w-xl mx-auto">
                Jouez au jeu de dames en ligne avec vos amis ! Créez une partie, partagez le code avec votre ami et commencez à jouer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link 
                  href="/register" 
                  className="btn bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white border-0 shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 transform hover:scale-105 transition-all text-lg px-8 py-3 font-semibold"
                >
                  Commencer à jouer
                </Link>
                <Link 
                  href="/login" 
                  className="btn btn-outline text-white border-2 border-white/20 hover:bg-white/10 hover:border-white/40 backdrop-blur-sm text-lg px-8 py-3 font-semibold"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-4 bg-gradient-gaming">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
                Fonctionnalités
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Découvrez toutes les fonctionnalités qui rendent votre expérience de jeu exceptionnelle
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="gaming-card rounded-2xl overflow-hidden">
                <div className="p-8 items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <span className="text-4xl">🎮</span>
                  </div>
                  <h3 className="text-white text-xl mb-3 font-bold">Créer une partie</h3>
                  <p className="text-white/70 leading-relaxed">Créez une nouvelle partie et obtenez un code unique pour inviter vos amis</p>
                </div>
              </div>

              <div className="gaming-card rounded-2xl overflow-hidden">
                <div className="p-8 items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <span className="text-4xl">🔗</span>
                  </div>
                  <h3 className="text-white text-xl mb-3 font-bold">Rejoindre une partie</h3>
                  <p className="text-white/70 leading-relaxed">Utilisez un code pour rejoindre une partie créée par un ami</p>
                </div>
              </div>

              <div className="gaming-card rounded-2xl overflow-hidden">
                <div className="p-8 items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg mx-auto">
                    <span className="text-4xl">🏆</span>
                  </div>
                  <h3 className="text-white text-xl mb-3 font-bold">Suivre vos scores</h3>
                  <p className="text-white/70 leading-relaxed">Consultez l&apos;historique de vos parties et vos statistiques</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Section */}
        <div className="py-20 px-4 bg-gradient-gaming">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-red-500 to-orange-500 bg-clip-text text-transparent">
              Comment jouer ?
            </h2>
            <p className="text-lg text-white/70 mb-12">C&apos;est simple, suivez ces étapes</p>
            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary text-red-500">
                <div className="step-content">
                  <div className="font-semibold text-lg text-white">Créez un compte</div>
                  <div className="text-sm text-white/60 mt-1">Inscription gratuite et rapide</div>
                </div>
              </div>
              <div className="step step-primary text-red-500">
                <div className="step-content">
                  <div className="font-semibold text-lg text-white">Créez ou rejoignez</div>
                  <div className="text-sm text-white/60 mt-1">Une partie en un clic</div>
                </div>
              </div>
              <div className="step text-white/40">
                <div className="step-content">
                  <div className="font-semibold text-lg text-white/80">Jouez en temps réel</div>
                  <div className="text-sm text-white/60 mt-1">Avec vos amis</div>
                </div>
              </div>
              <div className="step text-white/40">
                <div className="step-content">
                  <div className="font-semibold text-lg text-white/80">Gagnez et progressez</div>
                  <div className="text-sm text-white/60 mt-1">Montez dans le classement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center p-10 bg-gradient-gaming text-white border-t border-white/10">
        <aside>
          <p className="font-bold">
            Jeu de Dames <br />
            Application de jeu en ligne
          </p>
          <p className="text-white/60">Copyright © 2025 - Tous droits réservés</p>
        </aside>
      </footer>
    </>
  );
}

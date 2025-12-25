import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="hero min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold text-white">
                <span className="inline-block mr-3">🎲</span>
                <span>Jeu de Dames</span>
              </h1>
              <p className="py-6 text-lg text-white/90 leading-relaxed">
                Jouez au jeu de dames en ligne avec vos amis ! Créez une partie, partagez le code avec votre ami et commencez à jouer.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/register" className="btn btn-primary btn-lg">
                  Commencer à jouer
                </Link>
                <Link href="/login" className="btn btn-outline btn-lg text-white border-white hover:bg-white hover:text-blue-600">
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 px-4 bg-gray-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-800">Fonctionnalités</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card bg-white shadow-xl border border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300">
                <div className="card-body items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <span className="text-3xl">🎮</span>
                  </div>
                  <h3 className="card-title text-blue-800">Créer une partie</h3>
                  <p className="text-slate-600">Créez une nouvelle partie et obtenez un code unique pour inviter vos amis</p>
                </div>
              </div>

              <div className="card bg-white shadow-xl border border-purple-100 hover:shadow-2xl hover:border-purple-300 transition-all duration-300">
                <div className="card-body items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                    <span className="text-3xl">🔗</span>
                  </div>
                  <h3 className="card-title text-indigo-700">Rejoindre une partie</h3>
                  <p className="text-slate-600">Utilisez un code pour rejoindre une partie créée par un ami</p>
                </div>
              </div>

              <div className="card bg-white shadow-xl border border-cyan-100 hover:shadow-2xl hover:border-cyan-300 transition-all duration-300">
                <div className="card-body items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mb-4">
                    <span className="text-3xl">🏆</span>
                  </div>
                  <h3 className="card-title text-cyan-700">Suivre vos scores</h3>
                  <p className="text-slate-600">Consultez l'historique de vos parties et vos statistiques</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="py-16 px-4 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-slate-800">Comment jouer ?</h2>
            <div className="steps steps-vertical lg:steps-horizontal w-full">
              <div className="step step-primary">Créez un compte</div>
              <div className="step step-primary">Créez ou rejoignez une partie</div>
              <div className="step">Jouez en temps réel</div>
              <div className="step">Gagnez et montez dans le classement</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer footer-center p-10 bg-slate-900 text-white border-t border-slate-800">
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

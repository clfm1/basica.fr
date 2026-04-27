import { motion } from 'motion/react';

export default function Terms() {
  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-[#050505]">
      <div className="max-w-[800px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#120c0d]/96 border border-white/10 rounded-2xl p-8 lg:p-12 shadow-[0_16px_44px_rgba(0,0,0,0.75)]"
        >
          <h1 className="text-4xl font-black mb-4 tracking-tight">Conditions Générales d'Utilisation</h1>
          <p className="text-zinc-400 mb-12 text-lg leading-relaxed">
            En utilisant notre plateforme, vous reconnaissez que toutes les acquisitions sont régies par ces dispositions spécifiques. 
            Basico fournit un accès à des services d'abonnements fitness et des comptes de jeux premium.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">1. NATURE DE L'ACQUISITION</h2>
              <p className="text-zinc-400 leading-relaxed">
                Les transactions sur ce site constituent l'achat de services d'abonnements fitness (Basic-Fit, Fitness Park) ou de comptes gaming (Fortnite, Valorant). 
                Basico facilite le transfert de ces actifs numériques et services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">2. ÉLÉMENTS DESCRIPTIFS</h2>
              <p className="text-zinc-400 leading-relaxed">
                Toute description textuelle, titre ou narration contextuelle entourant un produit est fournie à des fins d'organisation et d'esthétique. 
                Ces blocs descriptifs sont indépendants du produit de base et ne constituent pas une représentation contractuelle des fonctionnalités externes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">3. LIMITATIONS DE SERVICE</h2>
              <p className="text-zinc-400 leading-relaxed">
                Notre prestation est strictement limitée à la livraison des données ou services visibles dans l'aperçu. 
                Aucune intégration logicielle complexe ou service tiers non spécifié n'est inclus.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">4. ÉLIGIBILITÉ AU REMBOURSEMENT</h2>
              <p className="text-zinc-400 leading-relaxed italic">
                En raison de la livraison immédiate des données numériques et services, l'annulation des transactions est restreinte. 
                Toutes les ventes sont considérées comme finales une fois la livraison effectuée.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">5. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p className="text-zinc-400 leading-relaxed">Tout le contenu appartient à Basico et est protégé par la loi.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">6. COMPTES UTILISATEURS</h2>
              <p className="text-zinc-400 leading-relaxed">Gardez vos identifiants en sécurité. Vous êtes responsable de toute l'activité sur votre compte.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">7. LIMITATION DE RESPONSABILITÉ</h2>
              <p className="text-zinc-400 leading-relaxed">Basico n'est pas responsable des dommages indirects ou consécutifs résultant de l'utilisation de nos services.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">8. INDEMNISATION</h2>
              <p className="text-zinc-400 leading-relaxed">Vous acceptez de tenir Basico hors de cause pour toute réclamation découlant de votre violation de ces conditions.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">9. CONFIDENTIALITÉ</h2>
              <p className="text-zinc-400 leading-relaxed">Votre vie privée est importante. Consultez notre Politique de Confidentialité pour plus de détails sur l'utilisation des données.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">10. MODIFICATIONS DES CONDITIONS</h2>
              <p className="text-zinc-400 leading-relaxed">Nous pouvons mettre à jour ces conditions. Les mises à jour seront publiées ici avec une nouvelle date d'entrée en vigueur.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">11. DROIT APPLICABLE</h2>
              <p className="text-zinc-400 leading-relaxed">Ces conditions sont régies par les lois de l'Union Européenne.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">12. CONTACT</h2>
              <p className="text-zinc-400 leading-relaxed">Des questions ? Contactez-nous via :</p>
              <p className="text-zinc-400 leading-relaxed">Discord : discord.gg/basico</p>
            </section>

            <div className="pt-12 border-t border-white/10">
              <p className="text-lg font-bold text-white">Merci de faire confiance à Basico !</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

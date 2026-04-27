import { motion } from 'motion/react';

export default function Refund() {
  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-[#050505]">
      <div className="max-w-[800px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#120c0d]/96 border border-white/10 rounded-2xl p-8 lg:p-12 shadow-[0_16px_44px_rgba(0,0,0,0.75)]"
        >
          <h1 className="text-4xl font-black mb-4 tracking-tight">Politique de Remboursement</h1>
          <p className="text-zinc-400 mb-8 text-lg leading-relaxed">
            Basico utilise un modèle de distribution spécialisé pour les actifs numériques et services. 
            En finalisant une acquisition, vous reconnaissez l'exécution immédiate du transfert de données ou de service.
          </p>

          <div className="space-y-12 text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">1. Clause d'Exécution</h2>
              <p>
                Nos produits étant exclusivement des services numériques ou des actifs dématérialisés, la livraison est considérée comme instantanée et totale dès la confirmation. 
                Tous les transferts sont définitifs.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">2. Critères d'Éligibilité</h2>
              <p className="mb-4">
                La réclamation de fonds est soumise à des critères de évaluation stricts. 
                En règle générale, en raison de la nature irrévocable de la livraison de données numériques, les acquisitions ne sont pas éligibles au remboursement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">3. Écarts de Représentation</h2>
              <p className="mb-4">
                Notre prestation est limitée au service ou fichier numérique défini. Les descriptions textuelles sont supplémentaires et non contraignantes. 
                Les écarts entre le texte supplémentaire et l'actif réel ne constituent pas un motif de remboursement si l'actif lui-même a été livré.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">4. Résolution Technique</h2>
              <p className="mb-4">
                En cas d'erreur dans la livraison d'un actif numérique, notre équipe de support Discord fournira une solution de remplacement. 
                L'engagement dans des processus de litige externes sans tentative préalable de conciliation entraînera des restrictions administratives.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">5. Oppositions et Litiges Paiement</h2>
              <p>
                L'initiation d'une opposition de paiement non autorisée est une violation directe de ces Conditions. 
                Basico se réserve le droit de bannir définitivement tout utilisateur abusant du système de litige.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">6. Annulations Initiées par Basico</h2>
              <p>
                Dans les rares cas où Basico annule une commande avant la livraison, un remboursement complet sera émis. 
                C'est le seul scénario dans lequel un remboursement est garanti.
              </p>
            </section>

            <div className="pt-12 border-t border-white/10">
              <p className="text-white mb-4">
                En achetant auprès de Basico, vous confirmez avoir lu et accepté cette Politique de Remboursement. 
                Pour toute question, contactez-nous sur Discord avant de faire un achat.
              </p>
              <p className="text-lg font-bold text-white">L'équipe Support de Basico</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

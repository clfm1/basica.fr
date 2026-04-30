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
            Basico utilise un modèle de distribution spécialisé pour les contenus numériques. 
            En finalisant une acquisition, vous reconnaissez l'exécution immédiate ou rapide de la mise à disposition du contenu commandé.
          </p>

          <div className="space-y-12 text-zinc-400 leading-relaxed">
            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">1. Clause d'Exécution</h2>
              <p>
                Nos produits étant des contenus numériques fournis sans support matériel, la livraison est considérée comme exécutée dès que le contenu est mis à disposition selon les modalités indiquées lors de la commande. 
                Sauf mention expresse contraire, l'achat porte sur le visuel numérique présenté sur la page produit correspondante.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">2. Critères d'Éligibilité</h2>
              <p className="mb-4">
                Toute demande est étudiée au cas par cas. En raison de la nature immédiatement accessible des contenus numériques, une commande déjà livrée n'est en principe pas remboursable, sauf erreur manifeste de livraison, double paiement, annulation par Basico avant livraison ou obligation légale contraire.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">3. Écarts de Représentation</h2>
              <p className="mb-4">
                Notre prestation est limitée au contenu numérique défini sur la page produit. Les titres, catégories, exemples ou références à des univers tiers servent à classer ou illustrer le contenu et ne garantissent pas la fourniture d'un compte, abonnement, objet physique, avantage en jeu ou service tiers.
              </p>
              <p>
                Un remboursement ne peut pas être fondé sur une attente non mentionnée de manière expresse dans la description contractuelle du produit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">4. Résolution Technique</h2>
              <p className="mb-4">
                En cas d'erreur de livraison, de fichier inaccessible ou de problème technique directement imputable à Basico, notre équipe de support Discord pourra fournir un nouveau lien, un remplacement équivalent ou une correction adaptée.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">5. Oppositions et Litiges Paiement</h2>
              <p>
                Avant toute opposition de paiement, l'utilisateur est invité à contacter le support afin de permettre une résolution amiable. Les oppositions abusives, frauduleuses ou engagées malgré une livraison conforme peuvent entraîner une restriction d'accès au service et la conservation des preuves de commande nécessaires à la défense de Basico.
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

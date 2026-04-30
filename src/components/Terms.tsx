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
            Basico propose un catalogue de contenus numériques présentés sur les pages produit.
          </p>

          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">1. NATURE DE L'ACQUISITION</h2>
              <p className="text-zinc-400 leading-relaxed">
                Les transactions sur ce site constituent l'achat de contenus numériques fournis sous forme dématérialisée. Aucun produit physique, abonnement tiers, compte tiers, licence externe ou accès à un service appartenant à une marque tierce n'est inclus, sauf mention expresse, écrite et visible sur la page produit concernée.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Sauf mention expresse contraire, l'achat porte sur le visuel numérique présenté sur la page produit correspondante.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">2. INFORMATION AVANT COMMANDE</h2>
              <p className="text-zinc-400 leading-relaxed">
                Avant toute commande, l'utilisateur doit vérifier le nom, le prix, le visuel, la description et les éventuelles conditions particulières affichées sur la page produit. Les prix sont indiqués en euros. La validation de la commande vaut acceptation pleine et entière des informations présentées au moment de l'achat.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">3. ÉLÉMENTS DESCRIPTIFS</h2>
              <p className="text-zinc-400 leading-relaxed">
                Les titres, catégories, descriptions, exemples, marques ou univers mentionnés peuvent servir à identifier, classer ou illustrer le contenu proposé. Ils ne constituent pas une promesse de transfert de compte, d'abonnement, d'avantage en jeu, d'accès à une plateforme tierce ou de relation commerciale avec une marque tierce.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">4. LIVRAISON NUMÉRIQUE</h2>
              <p className="text-zinc-400 leading-relaxed">
                La livraison intervient par mise à disposition du contenu numérique après confirmation de la commande ou selon les indications affichées lors du paiement. L'utilisateur est responsable de conserver le contenu livré et de vérifier que ses coordonnées de contact sont exactes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">5. DROIT DE RÉTRACTATION</h2>
              <p className="text-zinc-400 leading-relaxed">
                Lorsque l'utilisateur demande ou accepte l'exécution immédiate de la livraison d'un contenu numérique fourni sans support matériel, il reconnaît que son droit de rétractation peut être limité ou perdu dans les conditions prévues par la réglementation applicable.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">6. PROPRIÉTÉ INTELLECTUELLE</h2>
              <p className="text-zinc-400 leading-relaxed">
                Les contenus fournis sont destinés à un usage personnel, non exclusif et non transférable, sauf autorisation écrite contraire. Toute reproduction, revente, diffusion publique ou exploitation commerciale non autorisée est interdite.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">7. ABSENCE D'AFFILIATION</h2>
              <p className="text-zinc-400 leading-relaxed">
                Les marques, noms de jeux, salles de sport, plateformes ou services tiers éventuellement cités appartiennent à leurs titulaires respectifs. Basico n'est ni affilié, ni approuvé, ni sponsorisé par ces tiers, sauf indication officielle contraire.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">8. COMPTES UTILISATEURS</h2>
              <p className="text-zinc-400 leading-relaxed">Gardez vos identifiants en sécurité. Vous êtes responsable de toute l'activité réalisée depuis votre compte ou avec vos informations de commande.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">9. LIMITATION DE RESPONSABILITÉ</h2>
              <p className="text-zinc-400 leading-relaxed">Dans les limites autorisées par la loi, Basico n'est pas responsable des dommages indirects, pertes d'opportunité, pertes de données, mauvaise utilisation du contenu livré ou attentes non prévues dans la description contractuelle du produit.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">10. INDEMNISATION</h2>
              <p className="text-zinc-400 leading-relaxed">Vous acceptez de tenir Basico hors de cause pour toute réclamation découlant d'une utilisation non conforme du site, d'une violation de ces conditions ou d'une exploitation non autorisée des contenus livrés.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">11. CONFIDENTIALITÉ</h2>
              <p className="text-zinc-400 leading-relaxed">Votre vie privée est importante. Consultez notre Politique de Confidentialité pour plus de détails sur l'utilisation des données.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">12. MODIFICATIONS DES CONDITIONS</h2>
              <p className="text-zinc-400 leading-relaxed">Nous pouvons mettre à jour ces conditions. Les mises à jour seront publiées ici et s'appliqueront aux commandes passées après leur mise en ligne.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">13. DROIT APPLICABLE</h2>
              <p className="text-zinc-400 leading-relaxed">Ces conditions sont régies par le droit applicable au consommateur et aux contrats conclus à distance, sous réserve des règles impératives protectrices dont l'utilisateur pourrait bénéficier.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">14. CONTACT</h2>
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

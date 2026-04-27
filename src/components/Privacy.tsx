import { motion } from 'motion/react';

export default function Privacy() {
  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-[#050505]">
      <div className="max-w-[800px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#120c0d]/96 border border-white/10 rounded-2xl p-8 lg:p-12 shadow-[0_16px_44px_rgba(0,0,0,0.75)]"
        >
          <h1 className="text-4xl font-black mb-4 tracking-tight">Politique de Confidentialité</h1>
          <p className="text-zinc-400 mb-12 text-lg leading-relaxed">
            Basico s'engage à traiter en toute sécurité les métadonnées nécessaires à la fourniture de nos services. 
            Ce document décrit comment nous gérons les identifiants liés aux transferts d'abonnements et de données numériques.
          </p>

          <div className="space-y-12 text-zinc-400 leading-relaxed">
            <p>
              Nos protocoles internes se concentrent sur la journalisation des événements de livraison. 
              L'utilisation de notre interface implique le consentement au suivi de l'acquisition des actifs.
            </p>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">1. Informations Collectées</h2>
              <p className="mb-4">Nous conservons les enregistrements des identifiants nécessaires à la synchronisation des données :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-white">Métadonnées de Transfert :</strong> Identifiants de base utilisés pour associer un utilisateur à un événement d'acquisition spécifique.</li>
                <li><strong className="text-white">Marqueurs de Livraison :</strong> Indicateurs confirmant qu'un service ou fichier numérique a été présenté avec succès à l'utilisateur.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">2. Utilisation des Données</h2>
              <p className="mb-4">Les informations enregistrées sont utilisées exclusivement pour :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Vérifier le bon fonctionnement et l'affichage des services acquis.</li>
                <li>Surveiller en interne le trafic du catalogue.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">3. Portée du Service</h2>
              <p>
                Notre cadre opérationnel est dédié uniquement à la distribution d'actifs numériques et services fitness/gaming. 
                La collecte de données est calibrée pour soutenir ce modèle de distribution.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">4. Protection et Sécurité des Données</h2>
              <p className="mb-4">Nous prenons la protection de vos données au sérieux. Basico met en œuvre des mesures de sécurité pour prévenir :</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>L'accès non autorisé</li>
                <li>L'altération des données</li>
                <li>La divulgation ou la destruction d'informations personnelles</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">5. Partage d'Informations</h2>
              <p>Nous ne vendons ni ne partageons vos données personnelles avec des tiers, sauf si cela est nécessaire pour traiter les paiements, prévenir les activités frauduleuses, se conformer aux obligations légales ou fournir des services essentiels.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">6. Cookies</h2>
              <p>Basico peut utiliser des cookies pour améliorer l'expérience utilisateur, suivre les performances et mémoriser les préférences. Vous pouvez gérer les cookies via les paramètres de votre navigateur.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">7. Rétention des Données</h2>
              <p>Nous conservons les données utilisateur uniquement le temps nécessaire à la conformité légale, à la sécurité et à l'exploitation du service. Lorsqu'elles ne sont plus nécessaires, elles sont supprimées de manière sécurisée.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">8. Droits des Utilisateurs</h2>
              <p>Selon votre région, vous pouvez avoir le droit de demander l'accès, la suppression ou la correction de vos données personnelles. Contactez notre équipe support via Discord pour exercer ces droits.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">9. Modifications de Cette Politique</h2>
              <p>Basico peut mettre à jour cette Politique de Confidentialité. L'utilisation continue de nos services indique l'acceptation des conditions mises à jour.</p>
            </section>

            <section>
              <h2 className="text-xl font-black tracking-widest uppercase mb-4 text-white">10. Informations de Contact</h2>
              <p>Discord : discord.gg/basico</p>
            </section>

            <div className="pt-12 border-t border-white/10">
              <p className="text-lg font-bold text-white">L'équipe de Confidentialité de Basico</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

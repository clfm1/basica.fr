import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect, FormEvent } from 'react';
import { 
  User, Mail, Lock, LogIn, UserPlus, LogOut, 
  CheckCircle2, AlertCircle, Loader2, LayoutDashboard, 
  ShoppingBag, Key, MapPin, Settings, ChevronRight,
  ShieldCheck, Clock, CreditCard, ExternalLink
} from 'lucide-react';

type TabType = 'dashboard' | 'orders' | 'licenses' | 'addresses' | 'settings';

async function readApiJson(res: Response) {
  const responseText = await res.text();
  try {
    return responseText ? JSON.parse(responseText) : {};
  } catch {
    console.error('API response is not valid JSON:', responseText);
    throw new Error('Erreur serveur temporaire. Veuillez réessayer dans quelques instants.');
  }
}

export default function Account() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [user, setUser] = useState<{ email: string, username?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [stats, setStats] = useState({ orderCount: 0, activeLicenses: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [licenses, setLicenses] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    // Check for reset token in URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      setResetToken(token);
      setAuthView('reset');
    }

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      fetchData(savedToken);
    }
  }, []);

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword })
      });

      const data = await readApiJson(res);
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setTimeout(() => setAuthView('login'), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (token: string) => {
    try {
      const [statsRes, ordersRes, licensesRes, addressesRes] = await Promise.all([
        fetch('/api/user/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/orders', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/licenses', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/user/addresses', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (statsRes.ok) setStats(await statsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (licensesRes.ok) setLicenses(await licensesRes.json());
      if (addressesRes.ok) setAddresses(await addressesRes.json());
    } catch (err) {
      console.error("Failed to fetch account data", err);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await readApiJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la connexion');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);
      setUser(data.user);
      fetchData(data.token);
      setMessage({ type: 'success', text: 'Connexion réussie !' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await readApiJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setMessage({ type: 'success', text: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMessage({ type: 'success', text: 'Déconnexion réussie.' });
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Le nouveau mot de passe doit faire au moins 6 caractères' });
      return;
    }

    setPasswordLoading(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await readApiJson(res);

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe');
      }

      setPasswordMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès !' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (user) {
    const navItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
      { id: 'orders', label: 'Commandes', icon: ShoppingBag },
      { id: 'licenses', label: 'Licences & Clés', icon: Key },
      { id: 'addresses', label: 'Adresses', icon: MapPin },
      { id: 'settings', label: 'Paramètres', icon: Settings },
    ];

    return (
      <div className="pt-24 pb-20 px-4 min-h-screen bg-[#050505] relative overflow-hidden">
        {/* Décorations de fond */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-600/10 to-transparent pointer-events-none" />
        <div className="absolute top-[20%] -left-20 w-80 h-80 bg-orange-600/5 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[20%] -right-20 w-80 h-80 bg-orange-900/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header de la page */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-white/5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="px-2 py-0.5 rounded bg-orange-600/20 text-orange-500 text-[10px] font-black uppercase tracking-widest">Compte Client</div>
                <div className="w-1 h-1 rounded-full bg-zinc-600" />
                <div className="text-zinc-500 text-xs font-medium uppercase tracking-widest">{activeTab}</div>
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                Mon <span className="text-orange-500">Espace</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4 bg-zinc-900/50 backdrop-blur-md border border-white/5 p-2 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-900/20">
                {user.username?.[0].toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div className="pr-4">
                <div className="text-sm font-bold text-white tracking-wide">{user.username || 'Utilisateur'}</div>
                <div className="text-[10px] text-zinc-500 font-mono tracking-tighter truncate max-w-[150px]">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[280px_1fr] gap-8">
            {/* Navigation latérale */}
            <aside className="space-y-2">
              <div className="p-1 rounded-2xl bg-zinc-950/50 border border-white/5 backdrop-blur-sm">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as TabType)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/20' 
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-orange-500'} />
                    <span>{item.label}</span>
                    {activeTab === item.id && <ChevronRight size={16} className="ml-auto opacity-50" />}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-xl text-sm font-bold text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all mt-4 border border-transparent hover:border-rose-500/10"
              >
                <LogOut size={18} />
                <span>Déconnexion</span>
              </button>
            </aside>

            {/* Contenu principal */}
            <main className="min-h-[500px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                      {/* Stats Grid */}
                      <div className="grid sm:grid-cols-3 gap-4">
                        {[
                          { label: 'Commandes', value: stats.orderCount.toString(), icon: ShoppingBag, color: 'text-orange-500' },
                          { label: 'Licences Actives', value: stats.activeLicenses.toString(), icon: Key, color: 'text-blue-500' },
                          { label: 'Points Fidélité', value: '450', icon: CreditCard, color: 'text-emerald-500' },
                        ].map((stat, i) => (
                          <div key={i} className="p-6 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                            <div className={`p-2.5 rounded-xl bg-white/5 w-fit mb-4 ${stat.color}`}>
                              <stat.icon size={24} />
                            </div>
                            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                            <div className="text-xs font-black uppercase tracking-widest text-zinc-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Recent Activity Section */}
                      <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black uppercase tracking-tight">Bienvenue sur votre tableau de bord</h3>
                          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <ShieldCheck size={12} /> Compte Vérifié
                          </div>
                        </div>
                        
                        <p className="text-zinc-400 mb-8 max-w-2xl leading-relaxed">
                          Depuis votre tableau de bord, vous pouvez voir vos <span className="text-white font-bold">commandes récentes</span>, 
                          gérer vos <span className="text-white font-bold">adresses de livraison</span> et modifier votre 
                          <span className="text-white font-bold"> mot de passe</span>.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <button onClick={() => setActiveTab('orders')} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all text-left group">
                            <ShoppingBag className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <div className="font-bold text-white mb-1">Commandes Récentes</div>
                            <div className="text-xs text-zinc-500">Voir l'historique de vos achats fitness et gaming.</div>
                          </button>
                          <button onClick={() => setActiveTab('settings')} className="p-5 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-orange-500/30 transition-all text-left group">
                            <Settings className="text-orange-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
                            <div className="font-bold text-white mb-1">Détails du compte</div>
                            <div className="text-xs text-zinc-500">Modifiez vos informations personnelles et sécurité.</div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'orders' && (
                    <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tight">Historique des Commandes</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              <th className="pb-4 pr-4">Commande</th>
                              <th className="pb-4 pr-4 text-center">Date</th>
                              <th className="pb-4 pr-4 text-center">Statut</th>
                              <th className="pb-4 pr-4 text-right">Total</th>
                              <th className="pb-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {orders.map((order, i) => (
                              <tr key={i} className="group hover:bg-white/[0.02]">
                                <td className="py-5 font-bold text-white">#{order.id.toString().slice(0, 6)}</td>
                                <td className="py-5 text-center text-zinc-400 text-sm whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</td>
                                <td className="py-5 text-center">
                                  <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                                    Complété
                                  </span>
                                </td>
                                <td className="py-5 text-right font-black text-white">Liaison</td>
                                <td className="py-5 text-right">
                                  <button className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                                    Voir Détails
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Empty State Mock */}
                      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center justify-center text-center py-12">
                        <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-700 mb-4">
                          <ShoppingBag size={24} />
                        </div>
                        <p className="text-zinc-500 text-sm italic">C'est tout pour le moment !</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'licenses' && (
                    <div className="space-y-6">
                      <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                          <div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-1">Mes Licences & Comptes</h3>
                            <p className="text-xs text-zinc-500">Accédez instantanément à vos clés d'activation et identifiants.</p>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Filtre :</span>
                             <select className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none">
                               <option>Tous</option>
                               <option>Actifs</option>
                               <option>Expirés</option>
                             </select>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {licenses.length > 0 ? (
                            licenses.map((item, i) => (
                              <div key={i} className="group p-5 rounded-2xl bg-zinc-900/40 border border-white/5 hover:border-orange-500/30 transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-orange-600/10 text-orange-500">
                                      <Key size={20} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-black text-white uppercase tracking-wide mb-1 flex items-center gap-2">
                                        {item.product_name}
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-zinc-500">Licence</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-mono">
                                        <span className="opacity-50">Clé :</span>
                                        <span className="text-zinc-300 font-black">{item.license_key}</span>
                                        <button 
                                          onClick={() => navigator.clipboard.writeText(item.license_key)}
                                          className="text-orange-500 hover:text-orange-400 transition-colors ml-1 uppercase text-[9px] font-black tracking-widest"
                                        >
                                          copier
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                                    <div className="flex flex-col items-start sm:items-end">
                                      <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest mb-0.5">Délivré le</span>
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-white whitespace-nowrap">
                                        <Clock size={12} className="text-orange-500" />
                                        {new Date(item.created_at).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <button className="sm:hidden text-xs font-black uppercase text-orange-500">Télécharger</button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-12 text-center">
                              <Key size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                              <p className="text-zinc-500 text-sm italic">Vous n'avez pas encore de licence.</p>
                            </div>
                          )}

                          <div className="p-6 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                            <AlertCircle size={24} className="text-zinc-700" />
                            <div className="text-sm text-zinc-500 max-w-xs">
                              Une licence manque ? Vérifiez votre <span className="text-orange-600 cursor-pointer">historique de commande</span> ou contactez le support Discord.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                      <h3 className="text-xl font-black uppercase tracking-tight mb-8">Informations personnelles</h3>
                      <form className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nom d'utilisateur</label>
                            <input 
                              type="text" 
                              className="w-full h-12 bg-black/50 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                              defaultValue={user.username || 'calofadam16'}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Adresse Email</label>
                            <input 
                              type="email" 
                              className="w-full h-12 bg-black/50 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                              defaultValue={user.email}
                              disabled
                            />
                          </div>
                        </div>

                        <div className="pt-6 border-t border-white/5">
                           <h4 className="text-sm font-black uppercase tracking-widest text-white mb-6">Changement de mot de passe</h4>
                           
                           {passwordMessage && (
                             <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                               passwordMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                             }`}>
                               {passwordMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                               <span className="text-xs font-bold">{passwordMessage.text}</span>
                             </div>
                           )}

                           <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Ancien mot de passe</label>
                                <input 
                                  type="password" 
                                  placeholder="••••••••" 
                                  className="w-full h-12 bg-black/50 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800" 
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="grid sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nouveau mot de passe</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full h-12 bg-black/50 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Confirmation</label>
                                  <input 
                                    type="password" 
                                    placeholder="••••••••" 
                                    className="w-full h-12 bg-black/50 border border-white/5 rounded-xl px-4 text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-zinc-800"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                  />
                                </div>
                              </div>
                           </div>
                        </div>

                        <button 
                          type="button"
                          onClick={handleChangePassword}
                          disabled={passwordLoading}
                          className="px-8 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center gap-2"
                        >
                          {passwordLoading ? <Loader2 className="animate-spin" size={18} /> : 'Enregistrer les modifications'}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeTab === 'addresses' && (
                    <div className="p-8 rounded-3xl bg-zinc-950/80 border border-white/5 backdrop-blur-md">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black uppercase tracking-tight">Adresses enregistrées</h3>
                        <button className="text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-400">Ajouter une adresse</button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        {addresses.length > 0 ? (
                          addresses.map((addr, i) => (
                           <div key={i} className="p-6 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col justify-between group h-full">
                              <div>
                                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-4 flex items-center justify-between">
                                    <span>Adresse #{i+1}</span>
                                    {i === 0 && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />}
                                 </div>
                                 <div className="text-white font-bold mb-1">{addr.first_name} {addr.last_name}</div>
                                 <div className="text-xs text-zinc-400 leading-relaxed">
                                    {addr.street}<br />
                                    {addr.zip} {addr.city}<br />
                                    {addr.country}
                                 </div>
                              </div>
                              <div className="mt-8 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button className="text-[10px] font-black uppercase tracking-widest text-white hover:text-orange-500 transition-colors">Éditer</button>
                                 <button className="text-[10px] font-black uppercase tracking-widest text-rose-500">Supprimer</button>
                              </div>
                           </div>
                          ))
                        ) : (
                          <div className="col-span-2 p-12 text-center border border-dashed border-white/10 rounded-2xl">
                             <MapPin size={48} className="mx-auto text-zinc-800 mb-4 opacity-20" />
                             <p className="text-zinc-500 text-sm italic">Aucune adresse enregistrée.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-4 min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 bg-orange-600/10 blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 bg-orange-900/10 blur-[128px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight mb-4"
          >
            Mon <span className="text-orange-600">Compte</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 text-lg"
          >
            Accédez à vos commandes, licences et profil
          </motion.p>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[500px] mx-auto mb-8 p-4 rounded-xl flex items-center gap-3 border ${
              message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Login Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-[#120c0d]/96 border border-white/10 rounded-2xl p-8 lg:p-10 shadow-[0_16px_44px_rgba(0,0,0,0.75)] ${authView !== 'login' && authView !== 'forgot' && authView !== 'reset' ? 'hidden md:block' : ''}`}
          >
            {authView === 'login' && (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-500">
                    <LogIn size={20} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Connexion</h2>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Email ou utilisateur</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
                        placeholder="Votre email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Mot de passe</label>
                      <button 
                        type="button"
                        onClick={() => setAuthView('forgot')}
                        className="text-xs text-orange-600/70 hover:text-orange-500 transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                      <input 
                        type="password" 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_8px_24px_rgba(234,88,12,0.25)] hover:shadow-[0_8px_32px_rgba(234,88,12,0.4)] active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Se connecter'}
                  </button>
                </form>
              </>
            )}

            {authView === 'forgot' && (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-500">
                    <Mail size={20} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Récupération</h2>
                </div>

                <form className="space-y-6" onSubmit={handleForgotPassword}>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                    Saisissez votre adresse email pour recevoir un lien de réinitialisation.
                  </p>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Adresse Email</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-orange-500 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-orange-600/50 transition-all placeholder:text-zinc-700"
                        placeholder="nom@exemple.com"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Envoyer le lien'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setAuthView('login')}
                      className="text-xs text-zinc-500 hover:text-white transition-colors uppercase font-black tracking-widest"
                    >
                      Retour à la connexion
                    </button>
                  </div>
                </form>
              </>
            )}

            {authView === 'reset' && (
              <>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-orange-600/20 flex items-center justify-center text-orange-500">
                    <Lock size={20} />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Nouveau mot de passe</h2>
                </div>

                <form className="space-y-6" onSubmit={handleResetPassword}>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Nouveau mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-orange-600/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Confirmer le mot de passe</label>
                    <input 
                      type="password" 
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 px-4 text-white focus:outline-none focus:border-orange-600/50 transition-all"
                      placeholder="••••••••"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-orange-900/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Réinitialiser'}
                  </button>
                </form>
              </>
            )}
          </motion.div>

          {/* Register Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className={`bg-zinc-900/40 border border-white/5 rounded-2xl p-8 lg:p-10 ${authView !== 'login' ? 'hidden md:block' : ''}`}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                <UserPlus size={20} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">Inscription</h2>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Créer un compte vous permet de suivre vos licences de produits et d'accéder à votre historique.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Adresse Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                    placeholder="nom@exemple.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-widest ml-1">Mot de passe</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={18} />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-700"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="text-xs text-zinc-500 px-1 leading-relaxed">
                Vos données personnelles seront utilisées pour soutenir votre expérience dans ce répertoire de métadonnées, comme décrit dans notre <a href="/privacy" className="text-orange-600/70 hover:text-orange-500">protocole de confidentialité</a>.
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Créer un compte'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

"use client"
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, Users, MapPin, 
  CreditCard, Download, BarChart3, PieChart,
  Activity, ArrowUpRight, ArrowDownRight, FileText,
  Filter, RefreshCw, Printer, Mail, Eye
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// Mock data
const mockUsers = [
  { id: '1', nom: 'Jean Mbarga', email: 'jean.mbarga@email.cm', role: 'user' },
  { id: '2', nom: 'Marie Fouda', email: 'marie.fouda@email.cm', role: 'user' },
  { id: '3', nom: 'Paul Nkotto', email: 'paul.nkotto@email.cm', role: 'user' }
];

const mockParcelles = [
  { id: '1', numero: 'YDE-001-2024', quartier: 'Bastos', superficie: 500, impotAnnuel: 480000, statut: 'actif' },
  { id: '2', numero: 'YDE-002-2024', quartier: 'Nlongkak', superficie: 350, impotAnnuel: 360000, statut: 'actif' },
  { id: '3', numero: 'YDE-003-2024', quartier: 'Omnisport', superficie: 800, impotAnnuel: 720000, statut: 'actif' },
  { id: '4', numero: 'YDE-004-2024', quartier: 'Bastos', superficie: 600, impotAnnuel: 540000, statut: 'actif' },
  { id: '5', numero: 'YDE-005-2024', quartier: 'Essos', superficie: 400, impotAnnuel: 380000, statut: 'en_attente' }
];

// Génération de données mensuelles
const generateMonthlyData = () => {
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  return months.map((month) => ({
    mois: month,
    revenus: 15000000 + Math.random() * 8000000,
    depenses: 3000000 + Math.random() * 2000000,
    transactions: 80 + Math.floor(Math.random() * 40),
    nouveauxUtilisateurs: 5 + Math.floor(Math.random() * 15)
  }));
};

// Génération de données par quartier
const generateQuartierData = () => {
  const quartiers = ['Bastos', 'Nlongkak', 'Omnisport', 'Essos', 'Mfoundi', 'Mokolo'];
  return quartiers.map(quartier => ({
    quartier,
    parcelles: Math.floor(Math.random() * 50) + 20,
    revenus: (Math.random() * 30000000) + 10000000,
    superficie: Math.floor(Math.random() * 15000) + 5000
  }));
};

// Génération de données par méthode de paiement
const generateMethodeData = () => {
  return [
    { methode: 'Mobile Money', value: 45, montant: 52000000, couleur: '#10b981' },
    { methode: 'Carte bancaire', value: 30, montant: 38000000, couleur: '#3b82f6' },
    { methode: 'Virement', value: 20, montant: 28000000, couleur: '#8b5cf6' },
    { methode: 'Espèces', value: 5, montant: 8000000, couleur: '#f59e0b' }
  ];
};

// Génération de données de performance
const generatePerformanceData = () => {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - i));
    return {
      date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
      transactionsReussies: Math.floor(Math.random() * 50) + 30,
      transactionsEchouees: Math.floor(Math.random() * 10) + 2,
      montantTotal: (Math.random() * 3000000) + 1000000
    };
  });
};

export default function StatistiquesRapports() {
  const [periodFilter, setPeriodFilter] = useState('mensuel');
  const [selectedQuartier, setSelectedQuartier] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const monthlyData = useMemo(() => generateMonthlyData(), []);
  const quartierData = useMemo(() => generateQuartierData(), []);
  const methodeData = useMemo(() => generateMethodeData(), []);
  const performanceData = useMemo(() => generatePerformanceData(), []);

  // Calcul des KPIs
  const kpis = useMemo(() => {
    const totalRevenus = monthlyData.reduce((sum, m) => sum + m.revenus, 0);
    const totalDepenses = monthlyData.reduce((sum, m) => sum + m.depenses, 0);
    const revenusMoisPrecedent = monthlyData[monthlyData.length - 2]?.revenus || 0;
    const revenusMoisActuel = monthlyData[monthlyData.length - 1]?.revenus || 0;
    const croissance = revenusMoisPrecedent > 0 ? ((revenusMoisActuel - revenusMoisPrecedent) / revenusMoisPrecedent) * 100 : 0;
    
    return {
      totalRevenus,
      totalDepenses,
      beneficeNet: totalRevenus - totalDepenses,
      croissance,
      totalTransactions: monthlyData.reduce((sum, m) => sum + m.transactions, 0),
      totalUtilisateurs: mockUsers.length + monthlyData.reduce((sum, m) => sum + m.nouveauxUtilisateurs, 0),
      totalParcelles: mockParcelles.length + quartierData.reduce((sum, q) => sum + q.parcelles, 0),
      tauxReussite: 94.5
    };
  }, [monthlyData, quartierData]);

  const exportRapport = (type: string) => {
    const timestamp = new Date().toISOString().split('T')[0];
    let content = '';
    
    if (type === 'csv') {
      content = [
        ['Rapport de Statistiques', `Généré le ${new Date().toLocaleString('fr-FR')}`],
        [],
        ['KPI', 'Valeur'],
        ['Revenus totaux (FCFA)', kpis.totalRevenus],
        ['Dépenses totales (FCFA)', kpis.totalDepenses],
        ['Bénéfice net (FCFA)', kpis.beneficeNet],
        ['Croissance (%)', kpis.croissance.toFixed(2)],
        ['Total transactions', kpis.totalTransactions],
        ['Total utilisateurs', kpis.totalUtilisateurs],
        ['Total parcelles', kpis.totalParcelles],
        [],
        ['Données mensuelles'],
        ['Mois', 'Revenus (FCFA)', 'Dépenses (FCFA)', 'Transactions', 'Nouveaux utilisateurs'],
        ...monthlyData.map(m => [m.mois, m.revenus, m.depenses, m.transactions, m.nouveauxUtilisateurs])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([content], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport_statistiques_${timestamp}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques et Rapports</h1>
              <p className="text-gray-600">Analyse complète des performances et activités</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => exportRapport('csv')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4" />
                Exporter CSV
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer className="h-4 w-4" />
                Imprimer
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Mail className="h-4 w-4" />
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-5 w-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtres</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="journalier">Journalier</option>
              <option value="hebdomadaire">Hebdomadaire</option>
              <option value="mensuel">Mensuel</option>
              <option value="annuel">Annuel</option>
            </select>

            <select
              value={selectedQuartier}
              onChange={(e) => setSelectedQuartier(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">Tous les quartiers</option>
              {quartierData.map(q => (
                <option key={q.quartier} value={q.quartier}>{q.quartier}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Date début"
            />

            <input
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Date fin"
            />
          </div>
        </div>

        {/* KPIs principaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                kpis.croissance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {kpis.croissance >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {Math.abs(kpis.croissance).toFixed(1)}%
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Revenus totaux</p>
            <p className="text-2xl font-bold text-gray-900">{(kpis.totalRevenus / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-gray-500 mt-1">FCFA</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Ce mois</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Bénéfice net</p>
            <p className="text-2xl font-bold text-gray-900">{(kpis.beneficeNet / 1000000).toFixed(1)}M</p>
            <p className="text-xs text-green-600 mt-1">+{((kpis.beneficeNet / kpis.totalRevenus) * 100).toFixed(1)}% marge</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Transactions</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.totalTransactions}</p>
            <p className="text-xs text-green-600 mt-1">Taux: {kpis.tauxReussite}%</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-600">Actifs</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">Utilisateurs</p>
            <p className="text-2xl font-bold text-gray-900">{kpis.totalUtilisateurs}</p>
            <p className="text-xs text-gray-500 mt-1">{kpis.totalParcelles} parcelles</p>
          </div>
        </div>

        {/* Graphiques principaux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Évolution des revenus */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Évolution des revenus</h3>
                <p className="text-sm text-gray-600">Comparaison revenus vs dépenses</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mois" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(2)}M FCFA`} />
                <Legend />
                <Area type="monotone" dataKey="revenus" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenus)" name="Revenus" />
                <Area type="monotone" dataKey="depenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorDepenses)" name="Dépenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition par méthode de paiement */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Méthodes de paiement</h3>
                <p className="text-sm text-gray-600">Répartition des transactions</p>
              </div>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={methodeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ methode, value }) => `${methode}: ${value}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.couleur} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {methodeData.map((methode) => (
                <div key={methode.methode} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: methode.couleur }}></div>
                    <span className="text-gray-700">{methode.methode}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{(methode.montant / 1000000).toFixed(1)}M FCFA</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Graphiques secondaires */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Performance quotidienne */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Performance quotidienne</h3>
                <p className="text-sm text-gray-600">30 derniers jours</p>
              </div>
              <Activity className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="transactionsReussies" stroke="#10b981" strokeWidth={2} name="Réussies" />
                <Line type="monotone" dataKey="transactionsEchouees" stroke="#ef4444" strokeWidth={2} name="Échouées" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Statistiques par quartier */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Revenus par quartier</h3>
                <p className="text-sm text-gray-600">Top performances</p>
              </div>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quartierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quartier" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(2)}M FCFA`} />
                <Bar dataKey="revenus" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tableau de bord détaillé */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Top utilisateurs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Utilisateurs</h3>
            <div className="space-y-4">
              {mockUsers.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.nom}</p>
                      <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 3} transactions</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-green-600">{(Math.random() * 2000000 + 500000).toFixed(0)} FCFA</p>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    i % 3 === 0 ? 'bg-green-500' : i % 3 === 1 ? 'bg-blue-500' : 'bg-purple-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {i % 3 === 0 ? 'Nouveau paiement' : i % 3 === 1 ? 'Parcelle ajoutée' : 'Utilisateur inscrit'}
                    </p>
                    <p className="text-xs text-gray-500">Il y a {Math.floor(Math.random() * 60)} minutes</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Objectifs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Objectifs mensuels</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Revenus</span>
                  <span className="font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">17M / 20M FCFA</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Transactions</span>
                  <span className="font-semibold">72%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">720 / 1000</p>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Nouveaux utilisateurs</span>
                  <span className="font-semibold">95%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">95 / 100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Résumé exportable */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Résumé du rapport</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Financier</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Revenus totaux:</span>
                  <span className="font-semibold">{(kpis.totalRevenus / 1000000).toFixed(2)}M FCFA</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dépenses totales:</span>
                  <span className="font-semibold">{(kpis.totalDepenses / 1000000).toFixed(2)}M FCFA</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-900 font-semibold">Bénéfice net:</span>
                  <span className="font-bold text-green-600">{(kpis.beneficeNet / 1000000).toFixed(2)}M FCFA</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Opérationnel</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total transactions:</span>
                  <span className="font-semibold">{kpis.totalTransactions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taux de réussite:</span>
                  <span className="font-semibold text-green-600">{kpis.tauxReussite}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions/jour:</span>
                  <span className="font-semibold">{(kpis.totalTransactions / 365).toFixed(0)}</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Croissance</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilisateurs actifs:</span>
                  <span className="font-semibold">{kpis.totalUtilisateurs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Parcelles gérées:</span>
                  <span className="font-semibold">{kpis.totalParcelles}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Croissance MoM:</span>
                  <span className={`font-semibold ${kpis.croissance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpis.croissance >= 0 ? '+' : ''}{kpis.croissance.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Rapport généré le {new Date().toLocaleString('fr-FR')}
              </div>
              <div className="flex gap-2">
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Eye className="h-4 w-4" />
                  Prévisualiser
                </button>
                <button className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="h-4 w-4" />
                  Générer PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tableau détaillé des quartiers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Statistiques détaillées par quartier</h3>
            <p className="text-sm text-gray-600 mt-1">Analyse comparative des performances</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Quartier</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Parcelles</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Revenus</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Superficie (m²)</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Revenu/m²</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quartierData.sort((a, b) => b.revenus - a.revenus).map((quartier, index) => {
                  const revenuParM2 = quartier.revenus / quartier.superficie;
                  const performance = (quartier.revenus / Math.max(...quartierData.map(q => q.revenus))) * 100;
                  return (
                    <tr key={quartier.quartier} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{quartier.quartier}</div>
                            <div className="text-xs text-gray-500">Zone {index < 3 ? 'premium' : 'standard'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {quartier.parcelles}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-green-600">{(quartier.revenus / 1000000).toFixed(2)}M</div>
                        <div className="text-xs text-gray-500">FCFA</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-medium text-gray-900">{quartier.superficie.toLocaleString('fr-FR')}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-semibold text-gray-900">{Math.round(revenuParM2).toLocaleString('fr-FR')}</span>
                        <div className="text-xs text-gray-500">FCFA/m²</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                performance >= 80 ? 'bg-green-600' : performance >= 60 ? 'bg-blue-600' : performance >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                              }`}
                              style={{ width: `${performance}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{Math.round(performance)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Insights et recommandations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-start gap-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Points forts</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Croissance des revenus de <strong>{Math.abs(kpis.croissance).toFixed(1)}%</strong> ce mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Taux de réussite des transactions de <strong>{kpis.tauxReussite}%</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Mobile Money représente <strong>45%</strong> des paiements</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">•</span>
                    <span>Le quartier {quartierData[0]?.quartier} génère le plus de revenus</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Recommandations</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Augmenter la promotion dans les quartiers à faible performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Optimiser les méthodes de paiement moins utilisées</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Analyser les causes des {Math.round((100 - kpis.tauxReussite) * kpis.totalTransactions / 100)} échecs de transaction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">→</span>
                    <span>Développer des stratégies de rétention pour les utilisateurs actifs</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec métadonnées */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6 text-sm text-gray-600">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span>📊 Rapport automatisé</span>
              <span>•</span>
              <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1 px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-3 w-3" />
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
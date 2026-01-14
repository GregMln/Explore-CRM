import React, { useState, useMemo, useEffect } from 'react';
import { Search, Users, UserCheck, TrendingUp, Building2, Filter, X, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Calendar, MessageSquare, Tag, User, BarChart3, PieChart, Activity, Euro } from 'lucide-react';

// Importer les données depuis le fichier JSON
import crmData from './crm-data.json';

const CONTACTS_DATA = crmData.contacts;
const STATS_DATA = crmData.stats;

export default function CRMApplication() {
  const [activeView, setActiveView] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ statut: '', consultant: '', scpi: '', annee: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  const filterOptions = useMemo(() => {
    const consultants = [...new Set(CONTACTS_DATA.map(c => c.consultant).filter(Boolean))].sort();
    const scpisSet = new Set();
    CONTACTS_DATA.forEach(c => { if (c.scpi) c.scpi.split(' - ').forEach(s => scpisSet.add(s.trim())); });
    const scpis = [...scpisSet].sort();
    const statuts = [...new Set(CONTACTS_DATA.map(c => c.statut).filter(Boolean))];
    const annees = [...new Set(CONTACTS_DATA.map(c => { const m = c.date_creation ? c.date_creation.match(/(\d{4})/) : null; return m ? m[1] : null; }).filter(Boolean))].sort().reverse();
    return { consultants, scpis, statuts, annees };
  }, []);

  const filteredContacts = useMemo(() => {
    let results = CONTACTS_DATA;
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      results = results.filter(contact => {
        const nom = (contact.nom || '').toLowerCase();
        const email = (contact.email || '').toLowerCase();
        const telephone = (contact.telephone || '').toLowerCase();
        const mobile = (contact.mobile || '').toLowerCase();
        const adresse = (contact.adresse || '').toLowerCase();
        const commentaires = (contact.commentaires || '').toLowerCase();
        return nom.includes(query) || email.includes(query) || telephone.includes(query) || mobile.includes(query) || adresse.includes(query) || commentaires.includes(query);
      });
    }
    if (filters.statut) results = results.filter(c => c.statut === filters.statut);
    if (filters.consultant) results = results.filter(c => c.consultant && c.consultant.includes(filters.consultant));
    if (filters.scpi) results = results.filter(c => c.scpi && c.scpi.includes(filters.scpi));
    if (filters.annee) results = results.filter(c => c.date_creation && c.date_creation.includes(filters.annee));
    return results;
  }, [searchQuery, filters]);

  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredContacts.slice(start, start + itemsPerPage);
  }, [filteredContacts, currentPage]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, filters]);

  const clearFilters = () => { setFilters({ statut: '', consultant: '', scpi: '', annee: '' }); setSearchQuery(''); };
  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);
  const formatMontant = (m) => m ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(m) : null;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim().length > 0) { setActiveView('contacts'); setSelectedContact(null); }
  };

  const handleToggleFilters = () => {
    const newState = !showFilters;
    setShowFilters(newState);
    if (newState) { setActiveView('contacts'); setSelectedContact(null); }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters({...filters, [filterName]: value});
    if (value) { setActiveView('contacts'); setSelectedContact(null); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); } ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 4px; }
        .glass-card { background: rgba(255,255,255,0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; }
        .stat-card { background: linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05)); border: 1px solid rgba(99,102,241,0.2); border-radius: 16px; padding: 24px; transition: all 0.3s; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(99,102,241,0.4); }
        .contact-row { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 16px 20px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
        .contact-row:hover { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.3); transform: translateX(4px); }
        .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; padding: 10px 20px; border-radius: 10px; font-weight: 600; cursor: pointer; }
        .input-field { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 16px; color: #e2e8f0; font-size: 14px; width: 100%; }
        .input-field:focus { outline: none; border-color: rgba(99,102,241,0.5); }
        .input-field::placeholder { color: #64748b; }
        select.input-field option { background: #1e293b; }
        .tag { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500; }
        .tag-prospect { background: rgba(59,130,246,0.2); color: #60a5fa; }
        .tag-client { background: rgba(34,197,94,0.2); color: #4ade80; }
        .tag-societe { background: rgba(249,115,22,0.2); color: #fb923c; }
        .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 20px; border-radius: 10px; cursor: pointer; transition: all 0.2s; color: #94a3b8; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }
        .nav-item.active { background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1)); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.3); }
        .chart-bar { background: linear-gradient(to top, #6366f1, #8b5cf6); border-radius: 4px 4px 0 0; }
      `}</style>

      <header style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} color="white" /></div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM Explorer</h1>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>{STATS_DATA.total.toLocaleString()} contacts</p>
          </div>
        </div>
        <div style={{ flex: 1, maxWidth: 500, margin: '0 40px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={handleSearchChange} className="input-field" style={{ paddingLeft: 48 }} />
          {searchQuery && <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>}
        </div>
        <button onClick={handleToggleFilters} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Filter size={16} />Filtres{activeFiltersCount > 0 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 20, fontSize: 12 }}>{activeFiltersCount}</span>}</button>
      </header>

      <div style={{ display: 'flex' }}>
        <nav style={{ width: 240, padding: '24px 16px', borderRight: '1px solid rgba(255,255,255,0.05)', minHeight: 'calc(100vh - 85px)', background: 'rgba(15,23,42,0.5)' }}>
          <div className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveView('dashboard'); setSelectedContact(null); }}><BarChart3 size={20} /><span>Tableau de bord</span></div>
          <div className={`nav-item ${activeView === 'contacts' && !filters.statut ? 'active' : ''}`} onClick={() => { setActiveView('contacts'); setSelectedContact(null); clearFilters(); }}><Users size={20} /><span>Contacts</span></div>
          <div className={`nav-item ${filters.statut === 'Client' ? 'active' : ''}`} onClick={() => { setActiveView('contacts'); setFilters({statut: 'Client', consultant: '', scpi: '', annee: ''}); setSelectedContact(null); }}><UserCheck size={20} /><span>Clients</span></div>
          <div className={`nav-item ${filters.statut === 'Prospect' ? 'active' : ''}`} onClick={() => { setActiveView('contacts'); setFilters({statut: 'Prospect', consultant: '', scpi: '', annee: ''}); setSelectedContact(null); }}><TrendingUp size={20} /><span>Prospects</span></div>
          <div style={{ marginTop: 32, padding: '0 8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Top Consultants</p>
            {Object.entries(STATS_DATA.consultants).slice(0,5).map(([n,c])=>(<div key={n} onClick={()=>{setActiveView('contacts');setFilters({statut:'',consultant:n,scpi:'',annee:''});setSelectedContact(null);}} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,cursor:'pointer',fontSize:13,color:'#94a3b8'}}><span>{n}</span><span style={{color:'#6366f1'}}>{c}</span></div>))}
          </div>
          <div style={{ marginTop: 24, padding: '0 8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
            <p style={{ fontSize: 11, color: '#64748b', marginBottom: 12, textTransform: 'uppercase' }}>Top SCPI</p>
            {Object.entries(STATS_DATA.scpi).slice(0,5).map(([n,c])=>(<div key={n} onClick={()=>{setActiveView('contacts');setFilters({statut:'',consultant:'',scpi:n,annee:''});setSelectedContact(null);}} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,cursor:'pointer',fontSize:11,color:'#94a3b8'}}><span>{n}</span><span style={{color:'#ec4899'}}>{c}</span></div>))}
          </div>
        </nav>

        <main style={{ flex: 1, padding: 32, overflow: 'auto' }}>
          {showFilters && (
            <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Filtres avancés</h3>
                {activeFiltersCount > 0 && <button onClick={clearFilters} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}><X size={14} /> Effacer</button>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Statut</label><select className="input-field" value={filters.statut} onChange={e => handleFilterChange('statut', e.target.value)}><option value="">Tous</option>{filterOptions.statuts.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Consultant</label><select className="input-field" value={filters.consultant} onChange={e => handleFilterChange('consultant', e.target.value)}><option value="">Tous</option>{filterOptions.consultants.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>SCPI</label><select className="input-field" value={filters.scpi} onChange={e => handleFilterChange('scpi', e.target.value)}><option value="">Toutes</option>{filterOptions.scpis.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 6 }}>Année</label><select className="input-field" value={filters.annee} onChange={e => handleFilterChange('annee', e.target.value)}><option value="">Toutes</option>{filterOptions.annees.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
              </div>
            </div>
          )}

          {activeView === 'dashboard' && !selectedContact && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 32 }}>
                <div className="stat-card"><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><div style={{ width: 48, height: 48, background: 'rgba(99,102,241,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={24} color="#818cf8" /></div><span style={{ color: '#94a3b8', fontSize: 14 }}>Total</span></div><p style={{ margin: 0, fontSize: 36, fontWeight: 700, fontFamily: 'Space Mono' }}>{STATS_DATA.total.toLocaleString()}</p></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))', borderColor: 'rgba(34,197,94,0.2)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><div style={{ width: 48, height: 48, background: 'rgba(34,197,94,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserCheck size={24} color="#4ade80" /></div><span style={{ color: '#94a3b8', fontSize: 14 }}>Clients</span></div><p style={{ margin: 0, fontSize: 36, fontWeight: 700, fontFamily: 'Space Mono', color: '#4ade80' }}>{STATS_DATA.clients.toLocaleString()}</p><p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>{((STATS_DATA.clients / STATS_DATA.total) * 100).toFixed(1)}%</p></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(37,99,235,0.05))', borderColor: 'rgba(59,130,246,0.2)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><div style={{ width: 48, height: 48, background: 'rgba(59,130,246,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp size={24} color="#60a5fa" /></div><span style={{ color: '#94a3b8', fontSize: 14 }}>Prospects</span></div><p style={{ margin: 0, fontSize: 36, fontWeight: 700, fontFamily: 'Space Mono', color: '#60a5fa' }}>{STATS_DATA.prospects.toLocaleString()}</p></div>
                <div className="stat-card" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(219,39,119,0.05))', borderColor: 'rgba(236,72,153,0.2)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}><div style={{ width: 48, height: 48, background: 'rgba(236,72,153,0.2)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={24} color="#f472b6" /></div><span style={{ color: '#94a3b8', fontSize: 14 }}>SCPI</span></div><p style={{ margin: 0, fontSize: 36, fontWeight: 700, fontFamily: 'Space Mono', color: '#f472b6' }}>{Object.values(STATS_DATA.scpi).reduce((a, b) => a + b, 0).toLocaleString()}</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div className="glass-card" style={{ padding: 24 }}><h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 600 }}><Activity size={20} color="#818cf8" style={{verticalAlign:'middle',marginRight:10}} />Évolution par année</h3><div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 200 }}>{Object.entries(STATS_DATA.annees).map(([y, c]) => { const max = Math.max(...Object.values(STATS_DATA.annees)); return (<div key={y} style={{ flex: 1, textAlign: 'center' }}><div className="chart-bar" style={{ height: (c / max) * 180, margin: '0 auto', width: '80%' }} /><p style={{ margin: '8px 0 0', fontSize: 11, color: '#64748b' }}>{y}</p><p style={{ margin: '2px 0 0', fontSize: 10, color: '#94a3b8' }}>{c}</p></div>); })}</div></div>
                <div className="glass-card" style={{ padding: 24 }}><h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}><PieChart size={20} color="#f472b6" style={{verticalAlign:'middle',marginRight:10}} />Top SCPI</h3><div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{Object.entries(STATS_DATA.scpi).slice(0, 8).map(([n, c]) => { const max = Math.max(...Object.values(STATS_DATA.scpi)); return (<div key={n}><div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span style={{ fontSize: 12, color: '#94a3b8' }}>{n}</span><span style={{ fontSize: 12, color: '#f472b6', fontFamily: 'Space Mono' }}>{c}</span></div><div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3 }}><div style={{ width: `${(c / max) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ec4899, #f472b6)', borderRadius: 3 }} /></div></div>); })}</div></div>
              </div>
              <div className="glass-card" style={{ padding: 24, marginTop: 24 }}><h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}><User size={20} color="#8b5cf6" style={{verticalAlign:'middle',marginRight:10}} />Consultants</h3><div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>{Object.entries(STATS_DATA.consultants).slice(0, 10).map(([n, c]) => (<div key={n} onClick={() => { setActiveView('contacts'); setFilters({statut: '', consultant: n, scpi: '', annee: ''}); }} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 12, padding: 16, textAlign: 'center', cursor: 'pointer' }}><div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 14, fontWeight: 700 }}>{n}</div><p style={{ margin: 0, fontSize: 24, fontWeight: 700, fontFamily: 'Space Mono' }}>{c}</p></div>))}</div></div>
            </div>
          )}

          {activeView === 'contacts' && !selectedContact && (
            <div>
              <div style={{ marginBottom: 24 }}><h2 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>{filteredContacts.length.toLocaleString()} contacts</h2><p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>{searchQuery ? `Recherche: "${searchQuery}"` : activeFiltersCount > 0 ? `${activeFiltersCount} filtre(s)` : 'Tous'}</p></div>
              {paginatedContacts.length === 0 ? (<div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}><Search size={48} style={{ marginBottom: 16, opacity: 0.5 }} /><p>Aucun contact trouvé</p></div>) : (
                paginatedContacts.map((contact) => (
                  <div key={contact.id} className="contact-row" onClick={() => setSelectedContact(contact)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, background: contact.statut === 'Client' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600 }}>{contact.nom ? contact.nom.charAt(0).toUpperCase() : '?'}</div>
                        <div><p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{contact.nom || '—'}</p><p style={{ margin: '2px 0 0', fontSize: 13, color: '#64748b' }}>{contact.email || '—'}</p></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {contact.montant && <span className="tag" style={{ background: 'rgba(234,179,8,0.2)', color: '#fbbf24' }}><Euro size={12} />{formatMontant(contact.montant)}</span>}
                        {contact.consultant && <span className="tag" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}>{contact.consultant}</span>}
                        {contact.scpi && <span className="tag" style={{ background: 'rgba(236,72,153,0.2)', color: '#f472b6' }}><Building2 size={12} />{contact.scpi.split(' - ')[0]}</span>}
                        <span className={`tag ${contact.statut === 'Client' ? 'tag-client' : contact.statut === 'Prospect' ? 'tag-prospect' : 'tag-societe'}`}>{contact.statut}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {totalPages > 1 && (<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 }}><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: currentPage === 1 ? '#475569' : '#e2e8f0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}><ChevronLeft size={16} /> Préc.</button><span style={{ color: '#94a3b8', fontSize: 14 }}>Page {currentPage}/{totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 16px', color: currentPage === totalPages ? '#475569' : '#e2e8f0', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}>Suiv. <ChevronRight size={16} /></button></div>)}
            </div>
          )}

          {selectedContact && (
            <div>
              <button onClick={() => setSelectedContact(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 14 }}><ChevronLeft size={18} />Retour</button>
              <div className="glass-card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 32 }}>
                  <div style={{ width: 80, height: 80, background: selectedContact.statut === 'Client' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700 }}>{selectedContact.nom ? selectedContact.nom.charAt(0).toUpperCase() : '?'}</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{selectedContact.nom}</h2>
                    <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                      <span className={`tag ${selectedContact.statut === 'Client' ? 'tag-client' : selectedContact.statut === 'Prospect' ? 'tag-prospect' : 'tag-societe'}`}>{selectedContact.statut}</span>
                      {selectedContact.consultant && <span className="tag" style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa' }}><User size={12} />{selectedContact.consultant}</span>}
                      {selectedContact.montant && <span className="tag" style={{ background: 'rgba(234,179,8,0.2)', color: '#fbbf24', fontSize: 14, padding: '6px 12px' }}><Euro size={14} />{formatMontant(selectedContact.montant)}</span>}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b', textTransform: 'uppercase' }}>Coordonnées</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Mail size={18} color="#6366f1" /><span>{selectedContact.email || '—'}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Phone size={18} color="#22c55e" /><span>{selectedContact.mobile || selectedContact.telephone || '—'}</span></div>
                      {selectedContact.telephone && selectedContact.mobile && <div style={{ paddingLeft: 30, color: '#64748b', fontSize: 13 }}>Fixe: {selectedContact.telephone}</div>}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}><MapPin size={18} color="#fb923c" /><span>{selectedContact.adresse || '—'}</span></div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b', textTransform: 'uppercase' }}>Informations</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Calendar size={18} color="#8b5cf6" /><span>Créé le {selectedContact.date_creation || '—'}</span></div>
                      {selectedContact.marketing && <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Tag size={18} color="#60a5fa" /><span style={{ fontSize: 13 }}>{selectedContact.marketing}</span></div>}
                    </div>
                  </div>
                </div>
                {selectedContact.scpi && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20, marginTop: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: 14, color: '#64748b', textTransform: 'uppercase' }}><Building2 size={16} color="#f472b6" style={{verticalAlign:'middle',marginRight:8}} />SCPI</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedContact.scpi.split(' - ').map((s, i) => (<span key={i} style={{ background: 'rgba(236,72,153,0.15)', color: '#f472b6', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, border: '1px solid rgba(236,72,153,0.3)' }}>{s.trim()}</span>))}
                    </div>
                  </div>
                )}
                {selectedContact.commentaires && (
                  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 20, marginTop: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 12px', fontSize: 14, color: '#64748b', textTransform: 'uppercase' }}><MessageSquare size={16} style={{verticalAlign:'middle',marginRight:8}} />Commentaires</h4>
                    <p style={{ margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedContact.commentaires}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

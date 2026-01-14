import React, { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function MagicVerify() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/auth/magic-link/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Lien invalide');
      }
      return res.json();
    },
    onSuccess: () => {
      setStatus('success');
      queryClient.invalidateQueries({ queryKey: ['/api/auth/session'] });
      setTimeout(() => {
        setLocation('/');
      }, 1500);
    },
    onError: (err: Error) => {
      setStatus('error');
      setErrorMessage(err.message);
    },
  });

  useEffect(() => {
    const params = new URLSearchParams(search);
    const token = params.get('token');
    
    if (token) {
      verifyMutation.mutate(token);
    } else {
      setStatus('error');
      setErrorMessage('Lien invalide - token manquant');
    }
  }, [search]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); }}
      `}</style>
      
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM Sereniteo</h1>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 40, textAlign: 'center' }}>
          {status === 'loading' && (
            <>
              <div style={{ width: 64, height: 64, background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Loader2 size={32} color="#6366f1" style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>Vérification en cours...</h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Veuillez patienter</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: 64, height: 64, background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <CheckCircle size={32} color="#22c55e" />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#22c55e' }}>Connexion réussie !</h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14 }}>Redirection vers le CRM...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <XCircle size={32} color="#ef4444" />
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600, color: '#ef4444' }}>Lien invalide</h2>
              <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: 14 }}>{errorMessage}</p>
              <button
                onClick={() => setLocation('/login')}
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: 'white', padding: '12px 24px', borderRadius: 10, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}
                data-testid="button-back-to-login"
              >
                Retourner à la connexion
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

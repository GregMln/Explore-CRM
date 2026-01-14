import React, { useState } from 'react';
import { Mail, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de l\'envoi');
      }
      return res.json();
    },
    onSuccess: () => {
      setSuccess(true);
      setError('');
    },
    onError: (err: Error) => {
      setError(err.message);
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    magicLinkMutation.mutate(email);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', fontFamily: "'DM Sans', sans-serif", color: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        * { box-sizing: border-box; }
        .login-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 14px 16px 14px 48px; color: #e2e8f0; font-size: 15px; width: 100%; transition: all 0.2s; }
        .login-input:focus { outline: none; border-color: rgba(99,102,241,0.5); background: rgba(255,255,255,0.08); }
        .login-input::placeholder { color: #64748b; }
        .login-btn { background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; color: white; padding: 14px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; width: 100%; font-size: 15px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .login-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
      `}</style>
      
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Users size={32} color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM Sereniteo</h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 14 }}>Connectez-vous par email</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 32 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(34, 197, 94, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#22c55e" />
              </div>
              <h2 style={{ margin: '0 0 12px', fontSize: 20, fontWeight: 600 }}>Email envoyé !</h2>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>
                Si cet email est autorisé, vous recevrez un lien de connexion.<br />
                Vérifiez votre boîte de réception.
              </p>
              <button
                onClick={() => { setSuccess(false); setEmail(''); }}
                style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
                data-testid="button-retry"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={18} color="#f87171" />
                  <span style={{ color: '#f87171', fontSize: 14 }}>{error}</span>
                </div>
              )}

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 8, fontWeight: 500 }}>Adresse email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="login-input"
                    required
                    data-testid="input-email"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-btn" 
                disabled={magicLinkMutation.isPending}
                data-testid="button-send-magic-link"
              >
                {magicLinkMutation.isPending ? (
                  <>
                    <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Envoi en cours...
                  </>
                ) : (
                  'Recevoir le lien de connexion'
                )}
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#475569' }}>
          Accès réservé aux utilisateurs autorisés
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
    </div>
  );
}

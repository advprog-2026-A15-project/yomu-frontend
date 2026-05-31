import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clanService } from '../services/clanService';
import { useAuth } from '../../auth/hooks/useAuth';

export const ClanPage = () => {
  const { user } = useAuth();
  const [clans, setClans] = useState([]);
  const [tierFilter, setTierFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [newClanName, setNewClanName] = useState('');
  const [newClanDesc, setNewClanDesc] = useState('');
  const [membership, setMembership] = useState(undefined); // undefined=loading, null=none
  const [myClan, setMyClan] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, [tierFilter]);

  useEffect(() => {
    if (!user) return;
    loadMembership();
  }, [user]);

  const loadMembership = async () => {
    try {
      const m = await clanService.getMembership(user.id);
      setMembership(m);
      if (m) {
        const clan = await clanService.getClan(m.clanId);
        setMyClan(clan);
      }
    } catch {
      setMembership(null);
    }
  };

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await clanService.getLeaderboard(tierFilter);
      setClans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClan = async (e) => {
    e.preventDefault();
    if (!user) { alert('Silakan masuk terlebih dahulu.'); return; }
    if (!newClanName.trim()) return;

    try {
      await clanService.createClan({
        name: newClanName,
        description: newClanDesc,
        leaderId: user.id
      });
      alert('Clan berhasil dibuat!');
      setShowCreate(false);
      loadLeaderboard();
      loadMembership();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleJoinClan = async (clanId) => {
    if (!user) { alert('Silakan masuk terlebih dahulu untuk bergabung ke clan.'); return; }
    try {
      await clanService.joinClan(clanId, user.id);
      alert('Permintaan bergabung telah dikirim!');
      loadMembership();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLeaveClan = async () => {
    const isPending = membership?.status === 'PENDING';
    const label = isPending ? 'Batalkan permintaan bergabung?' : `Keluar dari clan "${myClan?.name}"?`;
    if (!window.confirm(label)) return;
    try {
      await clanService.leaveClan();
      setMembership(null);
      setMyClan(null);
      loadLeaderboard();
    } catch (error) {
      alert(error.message);
    }
  };

  const getTierColor = (tier) => {
    switch(tier) {
      case 'BRONZE': return '#cd7f32';
      case 'SILVER': return '#c0c0c0';
      case 'GOLD': return '#ffd700';
      case 'DIAMOND': return '#b9f2ff';
      default: return 'var(--border-color)';
    }
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Liga Yomu</h1>
          <p className="page-subtitle">Berkompetisi bersama clanmu dan raih divisi tertinggi!</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {user?.role === 'ADMIN' && (
            <button
              onClick={async () => {
                try {
                  await clanService.recalculateTiers();
                  await loadLeaderboard();
                  alert('Tier semua clan berhasil diperbarui!');
                } catch (e) {
                  alert(e.message);
                }
              }}
              className="btn btn-outline"
              style={{ fontSize: '13px' }}
            >
              ⚙ RECALCULATE TIER
            </button>
          )}
          <button onClick={() => setShowCreate(!showCreate)} className="btn btn-secondary">
            {showCreate ? 'BATAL' : '+ BUAT CLAN'}
          </button>
        </div>
      </div>

      {/* Banner status keanggotaan */}
      {membership && myClan && (
        <div className="card" style={{
          marginBottom: '24px',
          borderColor: membership.status === 'ACCEPTED' ? '#58cc02' : '#f59e0b',
          borderWidth: 2, borderStyle: 'solid',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
              {membership.status === 'ACCEPTED' ? '✓ Anggota' : '⏳ Menunggu Persetujuan'}
            </div>
            <div style={{ color: 'var(--text-light)', fontSize: '14px' }}>
              {membership.status === 'ACCEPTED'
                ? `Kamu anggota clan ${myClan.name} · Skor: ${membership.personalScore ?? 0}`
                : `Permintaanmu bergabung ke clan "${myClan.name}" sedang menunggu persetujuan ketua.`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {membership.status === 'ACCEPTED' && myClan.leaderId === user?.id && (
              <Link to={`/clan/${myClan.id}/manage`} className="btn btn-secondary" style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap' }}>
                KELOLA CLAN
              </Link>
            )}
            {myClan.leaderId !== user?.id && (
              <button
                onClick={handleLeaveClan}
                className="btn btn-outline"
                style={{ fontSize: '13px', padding: '8px 16px', whiteSpace: 'nowrap', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                {membership.status === 'PENDING' ? 'BATALKAN' : 'KELUAR'}
              </button>
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <form onSubmit={handleCreateClan} className="card" style={{ marginBottom: '32px', borderColor: 'var(--secondary)', borderWidth: 2, borderStyle: 'solid' }}>
          <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Buat Clan Baru</h2>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Nama Clan</label>
              <input value={newClanName} onChange={e => setNewClanName(e.target.value)} placeholder="Masukkan nama clan..." required />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Deskripsi</label>
              <input value={newClanDesc} onChange={e => setNewClanDesc(e.target.value)} placeholder="Deskripsi singkat clan..." />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">BUAT SEKARANG</button>
        </form>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', padding: '16px 24px', backgroundColor: 'var(--border-light)', borderBottom: '2px solid var(--border-color)', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: 'auto' }}>Filter Divisi:</span>
          {['', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND'].map(t => (
            <button 
              key={t} 
              onClick={() => setTierFilter(t)}
              className={tierFilter === t ? 'btn btn-secondary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              {t === '' ? 'SEMUA' : t}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>Memuat papan peringkat...</div>
        ) : clans.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
            Belum ada clan di divisi ini.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)' }}>
                <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '60px' }}>Rank</th>
                <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)' }}>Nama Clan</th>
                <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '120px' }}>Divisi</th>
                <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '120px', textAlign: 'right' }}>Total Skor</th>
                <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '140px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {clans.map((clan, idx) => (
                <tr key={clan.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px 24px', fontWeight: '900', fontSize: '20px', color: idx < 3 ? 'var(--primary)' : 'inherit' }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{clan.name}</div>
                    <div style={{ fontSize: '14px', color: 'var(--text-light)' }}>{clan.description}</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '16px', 
                      backgroundColor: getTierColor(clan.tier),
                      color: clan.tier === 'DIAMOND' ? '#000' : '#fff',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}>
                      {clan.tier}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                    {clan.totalScore.toLocaleString()}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                    {clan.leaderId === user?.id ? (
                      <Link
                        to={`/clan/${clan.id}/manage`}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '12px' }}
                      >
                        KELOLA
                      </Link>
                    ) : membership?.clanId === clan.id ? (
                      <span style={{
                        padding: '8px 16px', fontSize: '12px', fontWeight: 'bold',
                        color: membership.status === 'ACCEPTED' ? 'var(--primary)' : '#f59e0b',
                      }}>
                        {membership.status === 'ACCEPTED' ? '✓ BERGABUNG' : '⏳ MENUNGGU'}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinClan(clan.id)}
                        disabled={!!membership}
                        className="btn btn-outline"
                        style={{ padding: '8px 16px', fontSize: '12px', opacity: membership ? 0.4 : 1, cursor: membership ? 'not-allowed' : 'pointer' }}
                      >
                        GABUNG
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clanService } from '../services/clanService';
import { useAuth } from '../../auth/hooks/useAuth';

export const ClanManagePage = () => {
  const { clanId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clan, setClan] = useState(null);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [acceptedMembers, setAcceptedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [clanData, pending, all] = await Promise.all([
        clanService.getClan(clanId),
        clanService.getPendingMembers(clanId),
        clanService.getMembers(clanId),
      ]);

      if (clanData.leaderId !== user?.id) {
        setError('Hanya ketua clan yang dapat mengakses halaman ini.');
        return;
      }

      setClan(clanData);
      setPendingMembers(pending);
      setAcceptedMembers(all.filter(m => m.status === 'ACCEPTED'));
    } catch (err) {
      setError(err.message || 'Gagal memuat data clan.');
    } finally {
      setLoading(false);
    }
  }, [clanId, user?.id]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadData();
  }, [user, navigate, loadData]);

  const handleAccept = async (memberId) => {
    setActionLoading(memberId);
    try {
      await clanService.acceptMember(clanId, memberId);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (memberId) => {
    setActionLoading(memberId);
    try {
      await clanService.rejectMember(clanId, memberId);
      await loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClan = async () => {
    if (!window.confirm(`Hapus clan "${clan?.name}"? Semua anggota akan dikeluarkan. Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      await clanService.deleteClan(clanId);
      navigate('/clan');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  };

  if (loading) {
    return <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>Memuat...</div>;
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>
        <p style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</p>
        <Link to="/clan" className="btn btn-secondary">Kembali ke Liga</Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
        <Link to="/clan" style={{ color: 'var(--text-light)', textDecoration: 'none', fontSize: '14px' }}>
          ← Kembali ke Liga
        </Link>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Kelola Clan: {clan?.name}</h1>
          <p className="page-subtitle">{clan?.description}</p>
        </div>
        <button onClick={handleDeleteClan} className="btn btn-danger" style={{ fontSize: '13px', padding: '8px 16px' }}>
          HAPUS CLAN
        </button>
        <span style={{
          padding: '6px 16px', borderRadius: '16px', fontWeight: 'bold', fontSize: '14px',
          backgroundColor: clan?.tier === 'GOLD' ? '#ffd700' : clan?.tier === 'SILVER' ? '#c0c0c0' : clan?.tier === 'DIAMOND' ? '#b9f2ff' : '#cd7f32',
          color: clan?.tier === 'DIAMOND' ? '#000' : '#fff',
        }}>
          {clan?.tier}
        </span>
      </div>

      {/* Permintaan Bergabung */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Permintaan Bergabung
          {pendingMembers.length > 0 && (
            <span style={{
              backgroundColor: 'var(--danger)', color: '#fff',
              borderRadius: '50%', width: '24px', height: '24px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: 'bold',
            }}>
              {pendingMembers.length}
            </span>
          )}
        </h2>

        {pendingMembers.length === 0 ? (
          <p style={{ color: 'var(--text-light)', margin: 0 }}>Tidak ada permintaan masuk saat ini.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Tanggal Daftar</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '2px solid var(--border-color)', width: '200px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingMembers.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {member.userId}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-light)', fontSize: '14px' }}>
                    {formatDate(member.joinedAt)}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleAccept(member.id)}
                        disabled={actionLoading === member.id}
                        className="btn btn-primary"
                        style={{ padding: '6px 16px', fontSize: '13px' }}
                      >
                        {actionLoading === member.id ? '...' : 'TERIMA'}
                      </button>
                      <button
                        onClick={() => handleReject(member.id)}
                        disabled={actionLoading === member.id}
                        className="btn btn-danger"
                        style={{ padding: '6px 16px', fontSize: '13px' }}
                      >
                        {actionLoading === member.id ? '...' : 'TOLAK'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Anggota Aktif */}
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>
          Anggota Aktif ({acceptedMembers.length})
        </h2>

        {acceptedMembers.length === 0 ? (
          <p style={{ color: 'var(--text-light)', margin: 0 }}>Belum ada anggota aktif.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-page)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>User ID</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '2px solid var(--border-color)' }}>Skor</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '2px solid var(--border-color)' }}>Bergabung</th>
              </tr>
            </thead>
            <tbody>
              {acceptedMembers.map(member => (
                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                    {member.userId}
                    {member.userId === clan?.leaderId && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', color: 'var(--secondary)', fontWeight: 'bold', fontFamily: 'inherit' }}>
                        KETUA
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                    {(member.personalScore ?? 0).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', color: 'var(--text-light)', fontSize: '14px' }}>
                    {formatDate(member.joinedAt)}
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

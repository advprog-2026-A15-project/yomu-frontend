import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth';
import { BookOpen, Trophy, Shield, Settings, Users, MessageSquare, Trash2, Search, RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { forumService } from '../features/forum/services/forumService';
import { learningService } from '../features/learning/services/learningService';
import { clanService } from '../features/clan/services/clanService';
import { useToast } from '../components/Toast';

const decodeHtmlEntities = (value = "") => {
  if (typeof document === "undefined") return value;
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
};

export const AdminDashboardPage = () => {
  const { user, isLoading } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('quick');
  
  // Moderation tab states
  const [comments, setComments] = useState([]);
  const [readingsMap, setReadingsMap] = useState({});
  const [modLoading, setModLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // League tab states
  const [leagueLoading, setLeagueLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'moderation') {
      loadModData();
    }
  }, [activeTab]);

  const loadModData = async () => {
    setModLoading(true);
    try {
      const [allComments, allReadings] = await Promise.all([
        forumService.getComments(),
        learningService.listBacaan()
      ]);
      const rMap = {};
      allReadings.forEach(r => {
        rMap[r.id] = r.title;
      });
      setReadingsMap(rMap);
      setComments(allComments || []);
    } catch (err) {
      console.error(err);
      toast("Gagal memuat data moderasi.", "error");
    } finally {
      setModLoading(false);
    }
  };

  const handleModDeleteComment = async (commentId) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini dari forum? Tindakan ini tidak dapat dibatalkan.")) return;
    setDeletingId(commentId);
    try {
      await forumService.deleteComment(commentId);
      toast("Komentar berhasil dihapus dari sistem.", "success");
      setComments(prev => prev.filter(c => (c.id || c.commentId) !== commentId));
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal menghapus komentar.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTriggerEndSeason = async () => {
    if (!window.confirm("PERINGATAN KRITIKAL: Apakah Anda yakin ingin mengakhiri musim Liga Yomu saat ini?\n\nTindakan ini akan menghitung divisi Clan baru dan me-reset skor personal semua anggota menjadi 0. Proses ini tidak dapat dibatalkan!")) return;
    setLeagueLoading(true);
    try {
      await clanService.endSeason();
      toast("Berhasil mengakhiri musim liga! Divisi Clan telah diperbarui.", "success");
    } catch (err) {
      console.error(err);
      toast(err.message || "Gagal mengakhiri musim liga.", "error");
    } finally {
      setLeagueLoading(false);
    }
  };

  if (isLoading) {
    return <div className="page-container" style={{ textAlign: 'center' }}>Memuat...</div>;
  }

  // Only ADMIN can access this page
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  const filteredComments = comments.filter(c => {
    const author = (c.userId || '').toLowerCase();
    const content = (c.commentContent || c.content || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return author.includes(query) || content.includes(query);
  });

  return (
    <div className="page-container">
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Premium Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
        padding: '32px',
        borderRadius: '20px',
        color: 'white',
        marginBottom: '32px',
        boxShadow: '0 10px 25px -5px rgba(49, 46, 129, 0.2)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <Shield size={32} color="#818cf8" />
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '11px', fontWeight: '800', background: 'rgba(129, 140, 248, 0.2)', padding: '4px 10px', borderRadius: '20px', color: '#a5b4fc' }}>
              Konsol Administrator
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' }}>Dashboard Admin</h1>
          <p style={{ margin: '8px 0 0 0', opacity: 0.8, fontSize: '15px' }}>
            Selamat datang, {user.displayName || user.username}. Anda memiliki otoritas penuh untuk mengelola konten, moderasi diskusi, dan siklus musim liga.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, transform: 'rotate(-10deg)', color: 'white' }}>
          <Shield size={200} />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        borderBottom: '2px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveTab('quick')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'quick' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'quick' ? 'white' : 'var(--text-light)',
          }}
        >
          <Settings size={18} />
          Aksi Cepat & Navigasi
        </button>
        <button
          onClick={() => setActiveTab('moderation')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'moderation' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'moderation' ? 'white' : 'var(--text-light)',
          }}
        >
          <MessageSquare size={18} />
          Moderasi Forum
        </button>
        <button
          onClick={() => setActiveTab('league')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: activeTab === 'league' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'league' ? 'white' : 'var(--text-light)',
          }}
        >
          <Trophy size={18} />
          Sistem Liga & Musim
        </button>
      </div>

      {/* Tab: Quick Actions */}
      {activeTab === 'quick' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {/* Card: Kelola Bacaan */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, backgroundColor: '#e8f7ff', borderRadius: 12, color: 'var(--secondary)' }}>
                    <BookOpen size={24} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Kelola Bacaan & Kuis</h2>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Buat modul bacaan baru, sunting isi cerita, hapus bacaan, dan kelola daftar pertanyaan kuis evaluasi untuk menguji pemahaman pelajar.
                </p>
              </div>
              <Link to="/learning/admin" className="btn btn-secondary" style={{ width: '100%', boxSizing: 'border-box', textDecoration: 'none', textAlign: 'center' }}>
                Buka Kelola Bacaan
              </Link>
            </div>

            {/* Card: Kelola Misi & Achievement */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', boxSizing: 'border-box' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, backgroundColor: '#f0fff4', borderRadius: 12, color: 'var(--primary)' }}>
                    <Trophy size={24} />
                  </div>
                  <h2 style={{ margin: 0, fontSize: 20 }}>Kelola Misi & Pencapaian</h2>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Tambahkan misi harian baru dengan target tertentu, tentukan perolehan poin hadiah (reward), dan kelola status pencapaian (achievement) pengguna.
                </p>
              </div>
              <Link to="/achievements/admin" className="btn btn-primary" style={{ width: '100%', boxSizing: 'border-box', textDecoration: 'none', textAlign: 'center' }}>
                Buka Kelola Misi
              </Link>
            </div>
          </div>

          {/* User Info / Profile card */}
          <div className="card" style={{ backgroundColor: '#fafafa', borderStyle: 'dashed' }}>
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Settings size={20} color="var(--text-light)" />
              Status Akses & Peran Anda
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Peran Pengguna</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--danger)', marginTop: 4 }}>ADMINISTRATOR</div>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Email Terdaftar</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--text-main)', marginTop: 4 }}>{user.email}</div>
              </div>
              <div style={{ padding: '12px 16px', backgroundColor: 'white', border: '1px solid var(--border-color)', borderRadius: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Koneksi SSO</div>
                <div style={{ fontSize: 16, fontWeight: 'bold', color: 'var(--primary)', marginTop: 4 }}>Google Account</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Forum Moderation */}
      {activeTab === 'moderation' && (
        <div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: 14, color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Cari komentar berdasarkan isi atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 42, height: '44px', borderRadius: '12px', border: '2px solid var(--border-color)' }}
              />
            </div>
            <button onClick={loadModData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 8, height: '44px' }}>
              <RefreshCw size={16} />
              Segarkan
            </button>
          </div>

          {modLoading ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-light)' }}>
              <RefreshCw className="animate-spin" size={24} style={{ marginBottom: 12, display: 'inline-block' }} />
              <div>Memuat seluruh komentar sistem...</div>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-light)' }}>
              Belum ada komentar dalam sistem atau tidak ada yang sesuai dengan pencarian Anda.
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-page)' }}>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '150px' }}>Penulis</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '180px' }}>Modul Bacaan</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)' }}>Isi Komentar</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '160px' }}>Tanggal</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '100px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredComments.map((c) => {
                      const commentId = c.id || c.commentId;
                      const readingTitle = readingsMap[c.bacaanId] || `ID: ${c.bacaanId.substring(0, 8)}...`;
                      const content = decodeHtmlEntities(c.commentContent || c.content || "");
                      return (
                        <tr key={commentId} style={{ borderBottom: '1px solid var(--border-light)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 'bold' }}>
                            {c.userId}
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--secondary)', fontSize: '14px', fontWeight: 'bold' }}>
                            {readingTitle}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--text-main)' }}>
                            {content}
                          </td>
                          <td style={{ padding: '16px 24px', fontSize: '12px', color: 'var(--text-light)' }}>
                            {new Date(c.timestamp || c.createdAt).toLocaleString('id-ID')}
                          </td>
                          <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleModDeleteComment(commentId)}
                              disabled={deletingId === commentId}
                              className="btn btn-danger"
                              style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: League & Season Management */}
      {activeTab === 'league' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ borderColor: '#f59e0b', backgroundColor: '#fffbeb', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <AlertTriangle size={32} color="#d97706" style={{ flexShrink: 0, marginTop: 4 }} />
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#b45309' }}>Peringatan Manajemen Musim</h3>
              <p style={{ margin: 0, color: '#78350f', fontSize: '14px', lineHeight: 1.6 }}>
                Mengakhiri musim Liga Yomu merupakan tindakan permanen. Proses ini akan menghitung divisi Clan baru untuk musim berikutnya berdasarkan aturan skor liga, mereset skor personal anggota, dan memulai siklus liga yang baru. Harap lakukan ini hanya saat periode kompetisi resmi berakhir.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, backgroundColor: '#f3e8ff', borderRadius: 12, color: 'var(--primary)' }}>
                    <Trophy size={24} />
                  </div>
                  <h3 style={{ margin: 0 }}>Eksekusi Akhir Musim</h3>
                </div>
                <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                  Tekan tombol di bawah untuk memicu API akhir musim pada sistem Clan Yomu. Backend akan memproses promosi ke Silver/Gold/Diamond atau degradasi Clan.
                </p>
              </div>
              <button
                onClick={handleTriggerEndSeason}
                disabled={leagueLoading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontWeight: 'bold' }}
              >
                {leagueLoading ? (
                  <>
                    <RefreshCw className="animate-spin" size={18} />
                    Memproses Akhir Musim...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    AKHIRI MUSIM LIGA SEKARANG
                  </>
                )}
              </button>
            </div>

            <div className="card">
              <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Info size={20} color="var(--secondary)" />
                Aturan Siklus Liga Yomu
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.6 }}>
                <li>
                  <strong>Divisi Bronze (Divisi Dasar)</strong>: Peringkat didasarkan pada jumlah total skor (sum) dari seluruh aktivitas Clan.
                </li>
                <li>
                  <strong>Divisi Silver & Gold (Divisi Menengah)</strong>: Peringkat dihitung menggunakan rumus gabungan aktivitas. Top 30% Clan dipromosikan ke divisi atasnya, sedangkan bottom 20% Clan didegradasi ke divisi bawahnya.
                </li>
                <li>
                  <strong>Divisi Diamond (Divisi Tertinggi)</strong>: Peringkat dihitung menggunakan rata-rata tertimbang (weighted average). Bottom 20% Clan diturunkan kembali ke Divisi Gold.
                </li>
                <li>
                  <strong>Reset Skor</strong>: Setelah promosi/degradasi diproses, semua skor personal anggota diatur kembali menjadi 0 untuk memulai musim baru.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState, useEffect } from 'react';
import { clanService } from '../features/clan/services/clanService';
import { Trophy, Medal, Star, Award } from 'lucide-react';

export const LeagueStandingsPage = () => {
  const [clans, setClans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      // Fetch all clans
      const data = await clanService.getLeaderboard('');
      setClans(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'DIAMOND': return <Trophy size={20} color="#00bfff" />;
      case 'GOLD': return <Award size={20} color="#ffd700" />;
      case 'SILVER': return <Medal size={20} color="#c0c0c0" />;
      case 'BRONZE': return <Star size={20} color="#cd7f32" />;
      default: return null;
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

  // Group clans by tier
  const tiers = ['DIAMOND', 'GOLD', 'SILVER', 'BRONZE'];
  const clansByTier = tiers.reduce((acc, tier) => {
    acc[tier] = clans.filter(c => c.tier === tier);
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 className="page-title" style={{ fontSize: '36px', color: 'var(--primary)' }}>Klasemen Liga Yomu</h1>
        <p className="page-subtitle" style={{ fontSize: '18px' }}>Pantau peringkat clan di setiap divisi kompetisi</p>
      </div>

      {loading ? (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-light)' }}>
          <div className="animate-spin" style={{ display: 'inline-block', marginBottom: '16px' }}>
            <Trophy size={32} color="var(--primary)" />
          </div>
          <div>Memuat klasemen...</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {tiers.map((tier) => {
            const tierClans = clansByTier[tier];
            if (!tierClans || tierClans.length === 0) return null;

            return (
              <div key={tier} className="card" style={{ padding: 0, overflow: 'hidden', borderTop: `4px solid ${getTierColor(tier)}` }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '16px 24px', 
                  backgroundColor: 'var(--bg-page)', 
                  borderBottom: '2px solid var(--border-color)' 
                }}>
                  {getTierIcon(tier)}
                  <h2 style={{ margin: 0, fontSize: '20px', textTransform: 'capitalize' }}>
                    Divisi {tier.toLowerCase()}
                  </h2>
                  <span style={{ marginLeft: 'auto', fontSize: '14px', color: 'var(--text-light)', fontWeight: 'bold' }}>
                    {tierClans.length} Clan
                  </span>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main)' }}>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '60px' }}>Rank</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)' }}>Nama Clan</th>
                      <th style={{ padding: '16px 24px', borderBottom: '2px solid var(--border-color)', width: '150px', textAlign: 'right' }}>Total Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierClans.map((clan, idx) => (
                      <tr key={clan.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: '900', fontSize: '20px', color: idx < 3 && tier === 'DIAMOND' ? 'var(--primary)' : 'var(--text-main)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--text-main)' }}>{clan.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-light)', marginTop: '4px' }}>{clan.description}</div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: '900', fontSize: '18px', color: 'var(--text-main)' }}>
                          {clan.totalScore.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

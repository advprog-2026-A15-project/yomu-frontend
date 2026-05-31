import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { learningService } from '../services/learningService';
import { useAuth } from '../../auth/hooks/useAuth';

const CATEGORIES = ['FIKSI', 'NON_FIKSI', 'SAINS', 'SEJARAH', 'TEKNOLOGI', 'BUDAYA'];

export const LearningPage = () => {
  const { user } = useAuth();
  const [bacaanList, setBacaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    loadBacaan();
  }, [selectedCategory, searchQuery]);

  const loadBacaan = async () => {
    setLoading(true);
    try {
      const data = await learningService.listBacaan(selectedCategory, searchQuery);
      setBacaanList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setSearchInput('');
    setSearchQuery('');
  };

  const hasActiveFilter = selectedCategory || searchQuery;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Modul Belajar</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>Pilih artikel untuk mulai membaca dan raih skor kuis tertinggi!</p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link to="/learning/admin" className="btn btn-secondary" style={{ fontSize: 13, padding: '8px 16px', whiteSpace: 'nowrap' }}>
            + KELOLA KONTEN
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari judul atau isi bacaan..."
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid var(--border-light)',
            borderRadius: 8,
            fontSize: 14,
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px' }}>
          Cari
        </button>
      </form>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        <button
          onClick={() => setSelectedCategory('')}
          className={selectedCategory === '' ? 'btn btn-primary' : 'btn btn-secondary'}
          style={{ fontSize: 13, padding: '6px 14px' }}
        >
          Semua
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={selectedCategory === cat ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: 13, padding: '6px 14px' }}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
        {hasActiveFilter && (
          <button
            onClick={handleClearFilters}
            style={{ fontSize: 13, padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', textDecoration: 'underline' }}
          >
            Reset Filter
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-container">Memuat bacaan...</div>
      ) : bacaanList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>
          {hasActiveFilter ? 'Tidak ada bacaan yang sesuai filter.' : 'Belum ada bacaan yang tersedia saat ini.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {bacaanList.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'inline-block', padding: '4px 8px', backgroundColor: 'var(--border-light)', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '12px', alignSelf: 'flex-start' }}>
                {item.category}
              </div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '20px', color: 'var(--text-main)' }}>{item.title}</h3>
              <p style={{ margin: '0 0 24px 0', color: 'var(--text-light)', fontSize: '14px', flex: 1 }}>
                {item.content.substring(0, 100)}...
              </p>
              <Link to={`/learning/${item.id}`} className="btn btn-primary" style={{ width: '100%', boxSizing: 'border-box' }}>
                MULAI BACA
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

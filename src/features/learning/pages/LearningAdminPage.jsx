import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { learningService } from '../services/learningService';
import { useAuth } from '../../auth/hooks/useAuth';

const CATEGORIES = ['FIKSI', 'NON_FIKSI', 'SAINS', 'SEJARAH', 'TEKNOLOGI', 'BUDAYA'];

const emptyBacaan = { title: '', content: '', category: 'FIKSI' };
const emptyQuestion = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A' };

export const LearningAdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bacaanList, setBacaanList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(emptyBacaan);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [expandedId, setExpandedId] = useState(null);
  const [questions, setQuestions] = useState({});
  const [questionForm, setQuestionForm] = useState({});

  useEffect(() => {
    if (user?.role !== 'ADMIN') { navigate('/'); return; }
    loadBacaan();
  }, [user]);

  const loadBacaan = async () => {
    try {
      setLoading(true);
      const data = await learningService.listBacaan();
      setBacaanList(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBacaan = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await learningService.updateBacaan(editingId, form);
      } else {
        await learningService.createBacaan(form);
      }
      setForm(emptyBacaan);
      setEditingId(null);
      await loadBacaan();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (b) => {
    setForm({ title: b.title, content: b.content, category: b.category });
    setEditingId(b.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus bacaan ini beserta semua soalnya?')) return;
    try {
      await learningService.deleteBacaan(id);
      await loadBacaan();
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleQuestions = async (bacaanId) => {
    if (expandedId === bacaanId) { setExpandedId(null); return; }
    setExpandedId(bacaanId);
    if (!questions[bacaanId]) {
      try {
        const qs = await learningService.getQuestions(bacaanId);
        setQuestions((prev) => ({ ...prev, [bacaanId]: qs }));
        setQuestionForm((prev) => ({ ...prev, [bacaanId]: emptyQuestion }));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleAddQuestion = async (e, bacaanId) => {
    e.preventDefault();
    const q = questionForm[bacaanId];
    if (!q?.questionText.trim()) return;
    try {
      await learningService.addQuestion({ ...q, bacaanId });
      const updated = await learningService.getQuestions(bacaanId);
      setQuestions((prev) => ({ ...prev, [bacaanId]: updated }));
      setQuestionForm((prev) => ({ ...prev, [bacaanId]: emptyQuestion }));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteQuestion = async (questionId, bacaanId) => {
    if (!window.confirm('Hapus soal ini?')) return;
    try {
      await learningService.deleteQuestion(questionId);
      setQuestions((prev) => ({ ...prev, [bacaanId]: prev[bacaanId].filter((q) => q.id !== questionId) }));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Admin — Kelola Bacaan</h1>
      <p className="page-subtitle">Buat, edit, dan hapus konten pembelajaran beserta soal kuisnya.</p>

      {/* Form Buat/Edit Bacaan */}
      <form onSubmit={handleSaveBacaan} className="card" style={{ marginBottom: 32, backgroundColor: editingId ? '#fffbeb' : '#f0f9ff', borderColor: editingId ? '#f59e0b' : 'var(--secondary)' }}>
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>{editingId ? 'Edit Bacaan' : 'Buat Bacaan Baru'}</h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ flex: 2 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Judul</label>
            <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Judul bacaan..." required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Kategori</label>
            <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '2px solid var(--border-color)' }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 6 }}>Konten</label>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Isi bacaan..." rows={6} required style={{ width: '100%', resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : editingId ? 'SIMPAN PERUBAHAN' : 'BUAT BACAAN'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={() => { setForm(emptyBacaan); setEditingId(null); }}>BATAL</button>}
        </div>
      </form>

      {/* Daftar Bacaan */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}>Memuat...</div>
      ) : bacaanList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: 'var(--text-light)' }}>Belum ada bacaan.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bacaanList.map((b) => (
            <div key={b.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: 18 }}>{b.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 2 }}>{b.category}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                  <button onClick={() => toggleQuestions(b.id)} className="btn btn-outline" style={{ fontSize: 12, padding: '6px 14px' }}>
                    {expandedId === b.id ? 'TUTUP SOAL' : 'KELOLA SOAL'}
                  </button>
                  <button onClick={() => handleEdit(b)} className="btn btn-secondary" style={{ fontSize: 12, padding: '6px 14px' }}>EDIT</button>
                  <button onClick={() => handleDelete(b.id)} className="btn btn-danger" style={{ fontSize: 12, padding: '6px 14px' }}>HAPUS</button>
                </div>
              </div>

              {expandedId === b.id && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-color)' }}>
                  <h3 style={{ marginTop: 0, marginBottom: 12 }}>Soal Kuis ({(questions[b.id] || []).length})</h3>

                  {(questions[b.id] || []).map((q, idx) => (
                    <div key={q.id} style={{ backgroundColor: 'var(--bg-page)', borderRadius: 8, padding: '12px 16px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{idx + 1}. {q.questionText}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-light)' }}>
                          A: {q.optionA} · B: {q.optionB} · C: {q.optionC} · D: {q.optionD}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--primary)', fontWeight: 'bold', marginTop: 4 }}>Jawaban: {q.correctOption ?? '(tersembunyi)'}</div>
                      </div>
                      <button onClick={() => handleDeleteQuestion(q.id, b.id)} className="btn btn-danger" style={{ fontSize: 12, padding: '4px 12px', flexShrink: 0 }}>HAPUS</button>
                    </div>
                  ))}

                  {/* Form Tambah Soal */}
                  <form onSubmit={(e) => handleAddQuestion(e, b.id)} style={{ marginTop: 16, backgroundColor: '#f0fff4', borderRadius: 8, padding: 16, border: '1px solid var(--primary)' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>Tambah Soal Baru</h4>
                    <input
                      value={questionForm[b.id]?.questionText || ''}
                      onChange={(e) => setQuestionForm((prev) => ({ ...prev, [b.id]: { ...prev[b.id], questionText: e.target.value } }))}
                      placeholder="Teks pertanyaan..." required
                      style={{ width: '100%', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      {['A', 'B', 'C', 'D'].map((opt) => (
                        <input key={opt}
                          value={questionForm[b.id]?.[`option${opt}`] || ''}
                          onChange={(e) => setQuestionForm((prev) => ({ ...prev, [b.id]: { ...prev[b.id], [`option${opt}`]: e.target.value } }))}
                          placeholder={`Pilihan ${opt}`} required
                          style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label style={{ fontWeight: 'bold', fontSize: 13 }}>Jawaban Benar:</label>
                      <select
                        value={questionForm[b.id]?.correctOption || 'A'}
                        onChange={(e) => setQuestionForm((prev) => ({ ...prev, [b.id]: { ...prev[b.id], correctOption: e.target.value } }))}
                        style={{ padding: '6px 10px', borderRadius: 8, border: '2px solid var(--border-color)' }}
                      >
                        {['A', 'B', 'C', 'D'].map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <button type="submit" className="btn btn-primary" style={{ fontSize: 12, padding: '6px 16px' }}>TAMBAH SOAL</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

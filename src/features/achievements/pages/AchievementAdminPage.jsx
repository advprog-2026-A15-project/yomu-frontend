import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { useAuth } from '../../auth';
import { achievementService } from '../services/achievementService';
import '../styles/achievements.css';

const metricOptions = [
  { value: 'READING_COMPLETED', label: 'Bacaan' },
  { value: 'QUIZ_COMPLETED', label: 'Kuis' },
  { value: 'LEAGUE_ACTIVITY', label: 'Liga' },
  { value: 'COMMENT_CREATED', label: 'Diskusi' },
  { value: 'CLAN_PROMOTED', label: 'Promosi Clan' },
  { value: 'CLAN_REACHED_DIAMOND', label: 'Diamond Clan' },
];

const todayIso = () => new Date().toISOString().slice(0, 10);

const tomorrowIso = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const initialAchievementForm = {
  code: '',
  name: '',
  description: '',
  metric: 'READING_COMPLETED',
  milestone: 1,
};

const initialMissionForm = {
  code: '',
  name: '',
  description: '',
  metric: 'READING_COMPLETED',
  targetCount: 1,
  rewardPoints: 10,
  activeFrom: todayIso(),
  activeUntil: tomorrowIso(),
};

export const AchievementAdminPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [achievementForm, setAchievementForm] = useState(initialAchievementForm);
  const [missionForm, setMissionForm] = useState(initialMissionForm);
  const [missions, setMissions] = useState([]);
  const [editingMissionId, setEditingMissionId] = useState(null);
  const [isSubmittingAchievement, setIsSubmittingAchievement] = useState(false);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);
  const [isLoadingMissions, setIsLoadingMissions] = useState(false);
  const [deletingMissionId, setDeletingMissionId] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const canAccess = useMemo(() => user?.role === 'ADMIN', [user?.role]);
  const isEditingMission = Boolean(editingMissionId);

  const loadMissions = useCallback(async () => {
    if (!canAccess) return;

    setIsLoadingMissions(true);
    try {
      const data = await achievementService.listAdminDailyMissions();
      setMissions(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoadingMissions(false);
    }
  }, [canAccess]);

  useEffect(() => {
    loadMissions();
  }, [loadMissions]);

  const handleAchievementChange = (event) => {
    const { name, value } = event.target;
    setAchievementForm((current) => ({
      ...current,
      [name]: name === 'milestone' ? Number(value) : value,
    }));
  };

  const handleMissionChange = (event) => {
    const { name, value } = event.target;
    setMissionForm((current) => ({
      ...current,
      [name]: ['targetCount', 'rewardPoints'].includes(name) ? Number(value) : value,
    }));
  };

  const handleCreateAchievement = async (event) => {
    event.preventDefault();
    setIsSubmittingAchievement(true);
    setError(null);
    setMessage(null);

    try {
      const payload = {
        ...achievementForm,
        code: achievementForm.code.trim() || null,
        description: achievementForm.description.trim(),
      };
      const result = await achievementService.createAchievement(payload);
      setMessage(`Achievement ${result.name} berhasil dibuat.`);
      setAchievementForm(initialAchievementForm);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmittingAchievement(false);
    }
  };

  const buildMissionPayload = () => ({
    ...missionForm,
    code: missionForm.code.trim() || null,
    description: missionForm.description.trim(),
  });

  const handleSubmitDailyMission = async (event) => {
    event.preventDefault();
    setIsSubmittingMission(true);
    setError(null);
    setMessage(null);

    try {
      const payload = buildMissionPayload();
      const result = isEditingMission
        ? await achievementService.updateDailyMission(editingMissionId, payload)
        : await achievementService.createDailyMission(payload);
      setMessage(
        `Daily mission ${result.name} berhasil ${isEditingMission ? 'diubah' : 'dibuat'}.`,
      );
      setEditingMissionId(null);
      setMissionForm(initialMissionForm);
      await loadMissions();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmittingMission(false);
    }
  };

  const handleEditMission = (mission) => {
    setEditingMissionId(mission.missionId);
    setMissionForm({
      code: mission.code || '',
      name: mission.name || '',
      description: mission.description || '',
      metric: mission.metric || 'READING_COMPLETED',
      targetCount: mission.targetCount,
      rewardPoints: mission.rewardPoints,
      activeFrom: mission.activeFrom || todayIso(),
      activeUntil: mission.activeUntil || tomorrowIso(),
    });
    setError(null);
    setMessage(null);
  };

  const handleCancelMissionEdit = () => {
    setEditingMissionId(null);
    setMissionForm(initialMissionForm);
  };

  const handleDeleteMission = async (missionId) => {
    const shouldDelete = window.confirm('Hapus daily mission ini?');
    if (!shouldDelete) return;

    setDeletingMissionId(missionId);
    setError(null);
    setMessage(null);
    try {
      await achievementService.deleteDailyMission(missionId);
      if (editingMissionId === missionId) {
        handleCancelMissionEdit();
      }
      setMessage('Daily mission berhasil dihapus.');
      await loadMissions();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingMissionId(null);
    }
  };

  if (!user && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  if (user && !canAccess) {
    return <Navigate to="/achievements" replace />;
  }

  return (
    <main className="achievement-shell">
      <header className="achievement-topbar">
        <div>
          <Link to="/achievements" className="achievement-back-link">
            <ArrowLeft size={18} />
            Achievement
          </Link>
          <h1>Admin Achievement</h1>
          <p>{user?.displayName || user?.username || 'Admin'}</p>
        </div>
      </header>

      {(error || message) && (
        <div className={error ? 'achievement-alert achievement-alert-error' : 'achievement-alert achievement-alert-success'}>
          {error || message}
        </div>
      )}

      <section className="achievement-admin-grid">
        <form className="achievement-admin-panel" onSubmit={handleCreateAchievement}>
          <div className="achievement-admin-heading">
            <Trophy size={22} />
            <h2>Achievement Baru</h2>
          </div>

          <label>
            Kode
            <input name="code" value={achievementForm.code} onChange={handleAchievementChange} placeholder="FIRST_QUIZ" />
          </label>
          <label>
            Nama
            <input name="name" value={achievementForm.name} onChange={handleAchievementChange} required />
          </label>
          <label>
            Metric
            <select name="metric" value={achievementForm.metric} onChange={handleAchievementChange}>
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Milestone
            <input
              name="milestone"
              type="number"
              min="1"
              value={achievementForm.milestone}
              onChange={handleAchievementChange}
              required
            />
          </label>
          <label>
            Deskripsi
            <textarea name="description" value={achievementForm.description} onChange={handleAchievementChange} rows="4" />
          </label>

          <button className="achievement-submit-button" type="submit" disabled={isSubmittingAchievement}>
            {isSubmittingAchievement ? <Loader2 className="achievement-spin" size={18} /> : <Plus size={18} />}
            Buat Achievement
          </button>
        </form>

        <form className="achievement-admin-panel" onSubmit={handleSubmitDailyMission}>
          <div className="achievement-admin-heading">
            <ClipboardList size={22} />
            <h2>{isEditingMission ? 'Edit Daily Mission' : 'Daily Mission Baru'}</h2>
          </div>

          <label>
            Kode
            <input name="code" value={missionForm.code} onChange={handleMissionChange} placeholder="DAILY_READ" />
          </label>
          <label>
            Nama
            <input name="name" value={missionForm.name} onChange={handleMissionChange} required />
          </label>
          <label>
            Metric
            <select name="metric" value={missionForm.metric} onChange={handleMissionChange}>
              {metricOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="achievement-form-row">
            <label>
              Target
              <input
                name="targetCount"
                type="number"
                min="1"
                value={missionForm.targetCount}
                onChange={handleMissionChange}
                required
              />
            </label>
            <label>
              Reward
              <input
                name="rewardPoints"
                type="number"
                min="0"
                value={missionForm.rewardPoints}
                onChange={handleMissionChange}
              />
            </label>
          </div>
          <div className="achievement-form-row">
            <label>
              <span className="achievement-label-icon">
                <CalendarDays size={16} />
                Mulai
              </span>
              <input name="activeFrom" type="date" value={missionForm.activeFrom} onChange={handleMissionChange} />
            </label>
            <label>
              <span className="achievement-label-icon">
                <CalendarDays size={16} />
                Sampai
              </span>
              <input name="activeUntil" type="date" value={missionForm.activeUntil} onChange={handleMissionChange} />
            </label>
          </div>
          <label>
            Deskripsi
            <textarea name="description" value={missionForm.description} onChange={handleMissionChange} rows="4" />
          </label>

          <div className="achievement-form-actions">
            {isEditingMission && (
              <button
                className="achievement-secondary-button"
                type="button"
                onClick={handleCancelMissionEdit}
              >
                <X size={18} />
                Batal
              </button>
            )}
            <button className="achievement-submit-button" type="submit" disabled={isSubmittingMission}>
              {isSubmittingMission ? (
                <Loader2 className="achievement-spin" size={18} />
              ) : isEditingMission ? (
                <Save size={18} />
              ) : (
                <Plus size={18} />
              )}
              {isEditingMission ? 'Simpan Daily Mission' : 'Buat Daily Mission'}
            </button>
          </div>
        </form>
      </section>

      <section className="achievement-section">
        <div className="achievement-admin-panel achievement-admin-panel--wide">
          <div className="achievement-section-heading">
            <div className="achievement-admin-heading">
              <ClipboardList size={22} />
              <h2>Daily Mission</h2>
            </div>
            <button
              className="achievement-icon-button"
              type="button"
              onClick={loadMissions}
              disabled={isLoadingMissions}
            >
              {isLoadingMissions ? (
                <Loader2 className="achievement-spin" size={18} />
              ) : (
                <RefreshCw size={18} />
              )}
              Refresh
            </button>
          </div>

          {isLoadingMissions && missions.length === 0 ? (
            <div className="achievement-empty-state">
              <Loader2 className="achievement-spin" size={22} />
              Memuat daily mission
            </div>
          ) : missions.length === 0 ? (
            <div className="achievement-empty-state">
              Belum ada daily mission.
            </div>
          ) : (
            <div className="achievement-admin-list">
              {missions.map((mission) => (
                <div className="achievement-admin-list-item" key={mission.missionId}>
                  <div className="achievement-admin-list-content">
                    <div className="mission-title-row">
                      <h3>{mission.name}</h3>
                      <span>{mission.metric}</span>
                    </div>
                    {mission.description && <p>{mission.description}</p>}
                    <div className="mission-meta">
                      <span>{mission.code}</span>
                      <span>Target {mission.targetCount}</span>
                      <span>{mission.rewardPoints} poin</span>
                      <span>
                        {formatDate(mission.activeFrom)} - {formatDate(mission.activeUntil)}
                      </span>
                    </div>
                  </div>
                  <div className="achievement-list-actions">
                    <button
                      className="achievement-icon-button"
                      type="button"
                      onClick={() => handleEditMission(mission)}
                    >
                      <Pencil size={18} />
                      Edit
                    </button>
                    <button
                      className="achievement-danger-button"
                      type="button"
                      onClick={() => handleDeleteMission(mission.missionId)}
                      disabled={deletingMissionId === mission.missionId}
                    >
                      {deletingMissionId === mission.missionId ? (
                        <Loader2 className="achievement-spin" size={18} />
                      ) : (
                        <Trash2 size={18} />
                      )}
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
};

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { learningService } from "../services/learningService";
import { useAuth } from "../../auth/hooks/useAuth";
import { CommentItem } from "../../forum/components/CommentItem";
import { forumService } from "../../forum/services/forumService";
import { useToast } from "../../../components/Toast";

export const BacaanDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bacaan, setBacaan] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);

  const [mode, setMode] = useState("READING"); // READING, QUIZ, DONE
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  const [comments, setComments] = useState([]);
  const toast = useToast();

  useEffect(() => {
    loadBacaan();
    if (user) {
      loadUserProgress();
      loadComments();
    }
  }, [id, user]);

  const loadBacaan = async () => {
    try {
      const bacaanData = await learningService.getBacaan(id);
      setBacaan(bacaanData);
      const qs = await learningService.getQuestions(id);
      setQuestions(qs);
    } catch (error) {
      console.error(error);
    }
  };

  const loadUserProgress = async () => {
    try {
      const status = await learningService.checkQuizStatus(id, user.id);
      setHasCompleted(status);
      if (status) {
        setMode("DONE");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartQuiz = () => setMode("QUIZ");

  const loadComments = async () => {
    try {
      const res = await forumService.getCommentsTree(id);
      setComments(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleCommentUpdate = () => {
    // If tree is active, we reload to get correct structure, but we keep this handler
    loadComments();
  };

  const handleCommentDelete = () => {
    // If tree is active, we reload to get correct structure, but we keep this handler
    loadComments();
  };

  const handleAddComment = async (e) => {s
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await forumService.createComment({
        bacaanId: id,
        userId: user.id,
        commentContent: newComment.trim(),
      });
      setNewComment('');
      await loadComments();
    } catch (err) {
      toast(err.message || 'Gagal mengirim komentar.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      toast("Harap jawab semua pertanyaan!", "error");
      return;
    }

    const payload = {
      userId: user.id,
      answers: Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOption: answers[qId],
      })),
    };

    try {
      const result = await learningService.submitQuiz(id, payload);
      setScore(result.score);
      setHasCompleted(true);
      setMode("DONE");
    } catch (error) {
      toast(error.message || "Terjadi kesalahan saat mengirim kuis", "error");
    }
  };

  if (!bacaan) return <div className="page-container" style={{ textAlign: 'center', paddingTop: '80px' }}>Memuat bacaan...</div>;

  return (
    <div className="page-container" style={{ maxWidth: "800px" }}>
      {mode === "READING" && (
        <div className="card">
          <h1 className="page-title">{bacaan.title}</h1>
          <div
            style={{
              display: "inline-block",
              padding: "4px 8px",
              backgroundColor: "var(--border-light)",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "bold",
              color: "var(--text-light)",
              marginBottom: "24px",
            }}
          >
            {bacaan.category}
          </div>

          <div
            style={{
              fontSize: "18px",
              lineHeight: "1.8",
              color: "var(--text-main)",
              marginBottom: "40px",
              whiteSpace: "pre-wrap",
            }}
          >
            {bacaan.content}
          </div>

          {!user ? (
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--border-light)",
                borderRadius: "12px",
                textAlign: "center",
                color: "var(--text-light)",
              }}
            >
              <a href="/login" style={{ fontWeight: "bold", color: "var(--primary)" }}>Masuk</a> untuk mengerjakan kuis dan melacak progressmu.
            </div>
          ) : !hasCompleted ? (
            <button
              onClick={handleStartQuiz}
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              Selesai Membaca, Mulai Kuis
            </button>
          ) : (
            <div
              style={{
                padding: "16px",
                backgroundColor: "var(--border-light)",
                borderRadius: "12px",
                textAlign: "center",
                fontWeight: "bold",
                color: "var(--text-light)",
              }}
            >
              Anda sudah menyelesaikan modul ini.
            </div>
          )}
        </div>
      )}

      {/* Comments Section */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Diskusi</h2>

        {user ? (
          <form onSubmit={handleAddComment} className="card" style={{ marginBottom: 12 }}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Tulis komentar atau pertanyaan..."
              rows={3}
              style={{ width: '100%', resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submittingComment || !newComment.trim()}
              style={{ padding: '8px 20px', fontSize: '14px' }}
            >
              {submittingComment ? 'Mengirim...' : 'KIRIM'}
            </button>
          </form>
        ) : (
          <div className="card" style={{ marginBottom: 12, color: 'var(--text-light)', textAlign: 'center' }}>
            <a href="/login" style={{ fontWeight: 'bold', color: 'var(--primary)' }}>Masuk</a> untuk ikut berdiskusi.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {comments.length === 0 && (
            <div className="card">Belum ada komentar.</div>
          )}
          {comments.map((c) => (
            <CommentItem
              key={c.commentId || c.id}
              comment={c}
              currentUserId={user?.id}
              onUpdate={handleCommentUpdate}
              onDelete={handleCommentDelete}
              onRefresh={loadComments}
            />
          ))}
        </div>
      </div>

      {mode === "QUIZ" && (
        <div>
          <h1
            className="page-title"
            style={{ textAlign: "center", marginBottom: "8px" }}
          >
            Kuis Evaluasi
          </h1>
          <p className="page-subtitle" style={{ textAlign: "center" }}>
            Uji pemahamanmu tanpa melihat teks kembali!
          </p>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {questions.map((q, idx) => (
              <div key={q.id} className="card">
                <h3 style={{ margin: "0 0 16px 0" }}>
                  {idx + 1}. {q.questionText}
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {["A", "B", "C", "D"].map((opt) => {
                    const optText = q[`option${opt}`];
                    const isSelected = answers[q.id] === opt;
                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectOption(q.id, opt)}
                        style={{
                          padding: "16px",
                          border: `2px solid ${isSelected ? "var(--secondary)" : "var(--border-color)"}`,
                          backgroundColor: isSelected
                            ? "#eef9ff"
                            : "var(--bg-main)",
                          borderRadius: "12px",
                          cursor: "pointer",
                          fontWeight: isSelected ? "bold" : "normal",
                          transition: "all 0.2s",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "30px",
                            fontWeight: "bold",
                            color: isSelected
                              ? "var(--secondary)"
                              : "var(--text-light)",
                          }}
                        >
                          {opt}.
                        </span>{" "}
                        {optText}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "32px", textAlign: "center" }}>
            <button
              onClick={handleSubmitQuiz}
              className="btn btn-primary"
              style={{ width: "100%", maxWidth: "300px" }}
            >
              KIRIM JAWABAN
            </button>
          </div>
        </div>
      )}

      {mode === "DONE" && (() => {
        const total = questions.length;
        const pct = total > 0 && score !== null ? (score / total) * 100 : null;
        const isPerfect = pct === 100;
        const isGood = pct !== null && pct >= 60;
        const emoji = isPerfect ? "🎉" : isGood ? "😊" : pct !== null ? "📚" : "✅";
        const title = isPerfect
          ? "Sempurna!"
          : isGood
          ? "Bagus!"
          : pct !== null
          ? "Terus Berlatih!"
          : "Selesai!";
        const subtitle =
          pct !== null && pct < 60
            ? "Jangan menyerah! Baca ulang materinya dan coba lagi di bacaan lain."
            : "Kamu telah menyelesaikan modul bacaan ini.";
        const scoreColor =
          pct === null ? "var(--primary)" : isPerfect ? "#58cc02" : isGood ? "var(--primary)" : "#ef4444";

        return (
          <div
            className="card"
            style={{ textAlign: "center", padding: "48px 24px" }}
          >
            <div style={{ fontSize: "64px", marginBottom: "16px" }}>{emoji}</div>
            <h1 className="page-title" style={{ color: scoreColor }}>{title}</h1>
            <p className="page-subtitle">{subtitle}</p>

            {score !== null && total > 0 && (
              <div
                style={{
                  margin: "24px 0",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: scoreColor,
                }}
              >
                Skor Kamu: {score} / {total} Benar
              </div>
            )}

            {pct !== null && (
              <div
                style={{
                  margin: "0 auto 24px",
                  width: "200px",
                  height: "8px",
                  backgroundColor: "var(--border-light)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    backgroundColor: scoreColor,
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            )}

            <button
              onClick={() => navigate("/learning")}
              className="btn btn-secondary"
            >
              KEMBALI KE MENU BELAJAR
            </button>
          </div>
        );
      })()}
    </div>
  );
};

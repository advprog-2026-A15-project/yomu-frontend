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
    if (user) {
      loadData();
      loadComments();
    }
  }, [id, user]);

  const loadData = async () => {
    try {
      const status = await learningService.checkQuizStatus(id, user.id);
      setHasCompleted(status);
      if (status) {
        setMode("DONE");
      }

      const bacaanData = await learningService.getBacaan(id);
      setBacaan(bacaanData);

      const qs = await learningService.getQuestions(id);
      setQuestions(qs);
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

  const handleCommentUpdate = (updated) => {
    // If tree is active, we reload to get correct structure, but we keep this handler
    loadComments();
  };

  const handleCommentDelete = (commentId) => {
    // If tree is active, we reload to get correct structure, but we keep this handler
    loadComments();
  };

  const handleAddComment = async (e) => {
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

  if (!bacaan) return <div className="page-container">Memuat...</div>;

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

          {!hasCompleted ? (
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
                            ? "var(--bg-selected)"
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

      {mode === "DONE" && (
        <div
          className="card"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <div style={{ fontSize: "64px", marginBottom: "16px" }}>
            {score !== null && score === questions.length ? "🎉"
              : score !== null && score >= questions.length / 2 ? "👍"
              : score !== null ? "💪"
              : "🎉"}
          </div>
          <h1 className="page-title">
            {score !== null && score === questions.length ? "Sempurna!"
              : score !== null && score >= questions.length / 2 ? "Hebat Sekali!"
              : score !== null ? "Coba Lagi!"
              : "Hebat Sekali!"}
          </h1>
          <p className="page-subtitle">
            Kamu telah menyelesaikan modul bacaan ini.
          </p>

          {score !== null && (
            <div
              style={{
                margin: "24px 0",
                fontSize: "24px",
                fontWeight: "bold",
                color: "var(--primary)",
              }}
            >
              Skor Kamu: {score} / {questions.length} Benar
            </div>
          )}

          <button
            onClick={() => navigate("/learning")}
            className="btn btn-secondary"
          >
            KEMBALI KE MENU BELAJAR
          </button>
        </div>
      )}
    </div>
  );
};

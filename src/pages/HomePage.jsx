import { Link } from "react-router-dom";

export const HomePage = () => {
  return (
    <div
      className="page-container"
      style={{ textAlign: "center", marginTop: "60px" }}
    >
      <h1
        style={{
          fontSize: "64px",
          color: "var(--primary)",
          fontWeight: "900",
          letterSpacing: "-2px",
          marginBottom: "16px",
        }}
      >
        Yomu
      </h1>
      <h2
        style={{
          fontSize: "28px",
          color: "var(--text-main)",
          marginBottom: "40px",
        }}
      >
        Tingkatkan literasimu, mulai hari ini.
      </h2>
      <p
        style={{
          fontSize: "18px",
          color: "var(--text-light)",
          maxWidth: "600px",
          margin: "0 auto 40px",
          lineHeight: "1.6",
        }}
      >
        Latih kemampuan membaca dan mengolah informasimu dengan gamifikasi yang
        seru. Selesaikan misi, kumpulkan poin, dan bersainglah di Liga!
      </p>

      <div style={{ display: "flex", gap: "20px", justifyContent: "center" }}>
        <Link
          to="/learning"
          className="btn btn-primary"
          style={{ fontSize: "20px", padding: "16px 32px" }}
        >
          MULAI BELAJAR
        </Link>
        <Link
          to="/clan"
          className="btn btn-secondary"
          style={{ fontSize: "20px", padding: "16px 32px" }}
        >
          GABUNG LIGA
        </Link>
      </div>
    </div>
  );
};

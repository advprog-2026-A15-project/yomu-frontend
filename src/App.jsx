import { Routes, Route } from "react-router-dom";
import { LoginPage, RegisterPage, ProfilePage } from "./features/auth";
import {
  AchievementAdminPage,
  AchievementsPage,
} from "./features/achievements";
import { LearningPage } from "./features/learning/pages/LearningPage";
import { BacaanDetailPage } from "./features/learning/pages/BacaanDetailPage";
import { LearningAdminPage } from "./features/learning/pages/LearningAdminPage";
import { ClanPage } from "./features/clan/pages/ClanPage";
import { ClanManagePage } from "./features/clan/pages/ClanManagePage";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { LeagueStandingsPage } from "./pages/LeagueStandingsPage";

import { ToastProvider } from "./components/Toast";
import { ThemeProvider } from "./features/theme/ThemeContext";
import { NotificationProvider } from "./features/notification/NotificationContext";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>
        <div
          style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
        >
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route
              path="/achievements/users/:profileUserId"
              element={<AchievementsPage />}
            />
            <Route
              path="/achievements/admin"
              element={<AchievementAdminPage />}
            />

            <Route path="/learning" element={<LearningPage />} />
            <Route path="/learning/admin" element={<LearningAdminPage />} />
            <Route path="/learning/:id" element={<BacaanDetailPage />} />

            <Route path="/clan" element={<ClanPage />} />
            <Route path="/clan/:clanId/manage" element={<ClanManagePage />} />
            <Route path="/liga/standings" element={<LeagueStandingsPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Routes>
        </main>
      </div>
      </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

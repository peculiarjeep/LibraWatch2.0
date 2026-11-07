import React, { useState } from 'react';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/OverviewTab';
import { WatchlistTab } from './components/WatchlistTab';
import { LoginLogTab } from './components/LoginLogTab';
import { StudentsTab } from './components/StudentsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SettingsTab } from './components/SettingsTab';
import { SettingsPasswordModal } from './components/SettingsPasswordModal';
import { DataSheetSyncModal } from './components/DataSheetSyncModal';
import { StudentAuditModal } from './components/StudentAuditModal';
import { RightDockToolbar } from './components/RightDockToolbar';
import { LiveToastStream } from './components/LiveToastStream';

const DashboardContent: React.FC = () => {
  const { activeTab, selectedStudent, setSelectedStudentId } = useDashboard();
  const [syncModalOpen, setSyncModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-[#1E293B]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 px-8 py-6 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'login-log' && <LoginLogTab />}
          {activeTab === 'students' && <StudentsTab />}
          {activeTab === 'watchlist' && <WatchlistTab />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </main>
      </div>
      <RightDockToolbar onOpenSync={() => setSyncModalOpen(true)} />
      <SettingsPasswordModal />
      <DataSheetSyncModal isOpen={syncModalOpen} onClose={() => setSyncModalOpen(false)} />
      {selectedStudent && (
        <StudentAuditModal student={selectedStudent} onClose={() => setSelectedStudentId(null)} />
      )}
      <LiveToastStream />
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
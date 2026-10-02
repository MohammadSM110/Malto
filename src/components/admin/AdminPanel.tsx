import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AdminAuthGate } from './AdminAuthGate.tsx';
import { AdminLayout, AdminSection } from './AdminLayout.tsx';
import { AdminDashboard } from './AdminDashboard.tsx';
import { AdminUsers } from './AdminUsers.tsx';
import { AdminItems } from './AdminItems.tsx';

interface AdminPanelProps {
  onNavigateHome: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome }) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      const token = sessionStorage.getItem('maalto_admin_token');
      if (token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch {}
    sessionStorage.removeItem('maalto_admin_session_active');
    sessionStorage.removeItem('maalto_admin_token');
    sessionStorage.removeItem('maalto_admin_user');
    onNavigateHome();
  };

  return (
    <AdminAuthGate onNavigateHome={onNavigateHome}>
      <AdminLayout
        currentSection={currentSection}
        onSelectSection={setCurrentSection}
        onNavigateHome={onNavigateHome}
        onLogout={handleLogout}
      >
        {currentSection === 'dashboard' && (
          <AdminDashboard
            onNavigateToUsers={() => setCurrentSection('users')}
            onNavigateToItems={() => setCurrentSection('items')}
          />
        )}

        {currentSection === 'users' && <AdminUsers />}

        {currentSection === 'items' && <AdminItems />}
      </AdminLayout>
    </AdminAuthGate>
  );
};

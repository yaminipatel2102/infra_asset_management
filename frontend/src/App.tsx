import React, { useState, useEffect } from 'react';
import { User } from './types/auth';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser, api } from './services/api';

import { LoginView } from './views/LoginView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { DigitalAssetPassportModal } from './components/DigitalAssetPassportModal';
import { AddAssetModal } from './components/AddAssetModal';
import { NewInspectionModal } from './components/NewInspectionModal';
import { NewMaintenanceModal } from './components/NewMaintenanceModal';
import { UpdateMaintenanceModal } from './components/UpdateMaintenanceModal';
import { EvidenceLightboxModal } from './components/EvidenceLightboxModal';

import { DashboardView } from './views/DashboardView';
import { AssetInventoryView } from './views/AssetInventoryView';
import { InspectionsView } from './views/InspectionsView';
import { MaintenanceView } from './views/MaintenanceView';
import { PriorityView } from './views/PriorityView';
import { MapView } from './components/MapView';
import { ReportsView } from './views/ReportsView';
import { UserManagementView } from './views/UserManagementView';

import { Asset, DashboardStats, Maintenance } from './types/asset';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals
  const [activePassportAssetId, setActivePassportAssetId] = useState<string | null>(null);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState<boolean>(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [isAddInspectionOpen, setIsAddInspectionOpen] = useState<boolean>(false);
  const [inspectionTargetAssetId, setInspectionTargetAssetId] = useState<string | null>(null);

  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState<boolean>(false);
  const [maintenanceTargetAssetId, setMaintenanceTargetAssetId] = useState<string | null>(null);

  const [updatingMaintenance, setUpdatingMaintenance] = useState<Maintenance | null>(null);

  const [evidenceLightbox, setEvidenceLightbox] = useState<{
    isOpen: boolean;
    before?: string;
    after?: string;
  }>({ isOpen: false });

  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'ROAD' | 'BRIDGE' | 'BUILDING'>('ALL');

  // Initial category set based on user role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'ROAD_OFFICER') setSelectedCategory('ROAD');
      else if (currentUser.role === 'BRIDGE_OFFICER') setSelectedCategory('BRIDGE');
      else if (currentUser.role === 'BUILDING_OFFICER') setSelectedCategory('BUILDING');
      else setSelectedCategory('ALL');
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role]);

  // Load Data
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser, currentTab, selectedCategory, searchQuery, selectedDistrict, selectedType, selectedCondition, selectedRisk, selectedStatus]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const catFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
      const [statsData, assetsData] = await Promise.all([
        api.getDashboardStats(catFilter),
        api.getAssets({
          search: searchQuery,
          district: selectedDistrict,
          assetType: selectedType,
          condition: selectedCondition,
          riskLevel: selectedRisk,
          status: selectedStatus,
        })
      ]);
      setStats(statsData);
      setAssets(assetsData);
    } catch (err) {
      console.error('Error loading data from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ROAD_OFFICER') setSelectedCategory('ROAD');
    else if (user.role === 'BRIDGE_OFFICER') setSelectedCategory('BRIDGE');
    else if (user.role === 'BUILDING_OFFICER') setSelectedCategory('BUILDING');
    else setSelectedCategory('ALL');
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  const handleOpenAddInspection = (assetId?: string) => {
    setInspectionTargetAssetId(assetId || null);
    setIsAddInspectionOpen(true);
  };

  const handleOpenAddMaintenance = (assetId?: string) => {
    setMaintenanceTargetAssetId(assetId || null);
    setIsAddMaintenanceOpen(true);
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      await api.deleteAsset(assetId);
      if (activePassportAssetId === assetId) {
        setActivePassportAssetId(null);
      }
      loadAllData();
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Sidebar */}
      <Sidebar
        user={currentUser}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        openAddAssetModal={() => setIsAddAssetOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={currentUser}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          onRefresh={loadAllData}
          onNavigateToAssets={() => setCurrentTab('assets')}
          onLogout={handleLogout}
        />

        <main className="p-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          {(currentTab === 'dashboard' || currentTab === 'roads' || currentTab === 'bridges' || currentTab === 'buildings') && (
            <DashboardView
              stats={stats}
              assets={assets}
              loading={loading}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onOpenAssetPassport={(id) => setActivePassportAssetId(id)}
              onNavigateToTab={setCurrentTab}
              onOpenAddInspection={handleOpenAddInspection}
              onOpenAddMaintenance={handleOpenAddMaintenance}
            />
          )}

          {currentTab === 'assets' && (
            <AssetInventoryView
              assets={assets}
              loading={loading}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedCondition={selectedCondition}
              setSelectedCondition={setSelectedCondition}
              selectedRisk={selectedRisk}
              setSelectedRisk={setSelectedRisk}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              onOpenAssetPassport={(id) => setActivePassportAssetId(id)}
              onOpenAddAsset={() => setIsAddAssetOpen(true)}
              onOpenEditAsset={(asset) => setEditingAsset(asset)}
              onDeleteAsset={handleDeleteAsset}
            />
          )}

          {currentTab === 'inspections' && (
            <InspectionsView
              onOpenAddInspection={handleOpenAddInspection}
              onOpenAssetPassport={(id) => setActivePassportAssetId(id)}
            />
          )}

          {currentTab === 'maintenance' && (
            <MaintenanceView
              onOpenAddMaintenance={handleOpenAddMaintenance}
              onOpenUpdateMaintenance={(maint) => setUpdatingMaintenance(maint)}
              onOpenEvidenceLightbox={(before, after) => setEvidenceLightbox({ isOpen: true, before, after })}
              onOpenAssetPassport={(id) => setActivePassportAssetId(id)}
            />
          )}

          {currentTab === 'priority' && (
            <PriorityView
              onOpenAssetPassport={(id) => setActivePassportAssetId(id)}
              onOpenAddMaintenance={handleOpenAddMaintenance}
            />
          )}

          {currentTab === 'map' && (
            <MapView
              assets={assets}
              onSelectAsset={(id) => setActivePassportAssetId(id)}
            />
          )}

          {currentTab === 'reports' && <ReportsView />}

          {currentTab === 'users' && currentUser.role === 'SUPER_ADMIN' && <UserManagementView />}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Digital Asset Passport Modal */}
      {activePassportAssetId && (
        <DigitalAssetPassportModal
          assetId={activePassportAssetId}
          onClose={() => setActivePassportAssetId(null)}
          onOpenAddInspection={handleOpenAddInspection}
          onOpenAddMaintenance={handleOpenAddMaintenance}
          onOpenEditAsset={(asset) => setEditingAsset(asset)}
          onOpenEvidenceLightbox={(before, after) => setEvidenceLightbox({ isOpen: true, before, after })}
        />
      )}

      {/* 2. Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddAssetOpen}
        onClose={() => setIsAddAssetOpen(false)}
        onSuccess={(newAsset) => {
          loadAllData();
          setActivePassportAssetId(newAsset.id);
        }}
      />

      {/* 3. Record Inspection Modal */}
      <NewInspectionModal
        isOpen={isAddInspectionOpen}
        preSelectedAssetId={inspectionTargetAssetId}
        onClose={() => setIsAddInspectionOpen(false)}
        onSuccess={() => {
          loadAllData();
          if (activePassportAssetId) {
            const current = activePassportAssetId;
            setActivePassportAssetId(null);
            setTimeout(() => setActivePassportAssetId(current), 50);
          }
        }}
      />

      {/* 4. Issue Maintenance Work Order Modal */}
      <NewMaintenanceModal
        isOpen={isAddMaintenanceOpen}
        preSelectedAssetId={maintenanceTargetAssetId}
        onClose={() => setIsAddMaintenanceOpen(false)}
        onSuccess={() => {
          loadAllData();
          if (activePassportAssetId) {
            const current = activePassportAssetId;
            setActivePassportAssetId(null);
            setTimeout(() => setActivePassportAssetId(current), 50);
          }
        }}
      />

      {/* 5. Update Maintenance Status Modal */}
      <UpdateMaintenanceModal
        maintenance={updatingMaintenance}
        onClose={() => setUpdatingMaintenance(null)}
        onSuccess={() => {
          loadAllData();
        }}
      />

      {/* 6. Evidence Lightbox Modal */}
      <EvidenceLightboxModal
        isOpen={evidenceLightbox.isOpen}
        beforeUrl={evidenceLightbox.before}
        afterUrl={evidenceLightbox.after}
        onClose={() => setEvidenceLightbox({ isOpen: false })}
      />
    </div>
  );
}

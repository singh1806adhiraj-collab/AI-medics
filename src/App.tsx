/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { HOSPITALS, MEDICINES } from './data/mockHealthcareData';
import {
  buildInitialInventory,
  calculateTransferOpportunities,
  applyTransferToInventory,
} from './utils/calculations';
import { InventoryRecord, TransferOpportunity, TransferLog, UserSession } from './types';
import { Header } from './components/Header';
import { SyntheticDataBanner, OperationalSafetyNotice } from './components/Disclaimers';
import { CommandCenter } from './components/CommandCenter';
import { InventoryIntelligence } from './components/InventoryIntelligence';
import { ResourceNetwork } from './components/ResourceNetwork';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { AIOperationsAssistant } from './components/AIOperationsAssistant';
import { TransferManifestModal } from './components/TransferManifestModal';
import { TransferLogModal } from './components/TransferLogModal';
import { UserSessionModal } from './components/UserSessionModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Master Inventory State (One source of truth: 10 hospitals × 16 medicines = 160 records)
  const [inventory, setInventory] = useState<InventoryRecord[]>(() => buildInitialInventory());

  // User Session & Security Role State
  const [userSession, setUserSession] = useState<UserSession>({
    name: 'Dr. Marcus Sterling, RPh',
    role: 'Director of Pharmacy Supply Chain',
    facility: 'Regional Command Center',
    hasDispatchAuthority: true,
    authenticated: true,
  });
  const [isUserSessionModalOpen, setIsUserSessionModalOpen] = useState(false);

  // Navigation State
  const [activeTab, setActiveTab] = useState<'command' | 'inventory' | 'network' | 'simulator' | 'assistant'>('command');

  // Filter State
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string | null>(null);

  // Modal States
  const [activeTransferForManifest, setActiveTransferForManifest] = useState<TransferOpportunity | null>(null);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);

  // Toast Notification State
  const [toast, setToast] = useState<{ message: string; subtext: string } | null>(null);

  // Transfer Logs (pre-seeded with 1 baseline transfer)
  const [transferLogs, setTransferLogs] = useState<TransferLog[]>([
    {
      id: 'LOG-001',
      transferId: 'MED-XFER-03-01-9214',
      timestamp: '2026-09-29 16:42:00',
      medicineName: 'Norepinephrine Bitartrate',
      quantity: 120,
      fromHospital: 'Valley Medical Center',
      toHospital: 'Metropolitan General Hospital',
      authorizedBy: 'Sarah Chen',
      approverRole: 'Supply Chain Vice President',
      status: 'Delivered',
      notes: 'Emergency Code Blue reserve replenishment under mutual aid compact.',
      preDonorRunway: 38.4,
      postDonorRunway: 33.8,
      preRecipientRunway: 1.2,
      postRecipientRunway: 4.1,
      expiryUnitsSaved: 120,
      transitMinutes: 22,
    },
  ]);

  // Deterministically compute dynamic transfer opportunities based on current inventory
  const transferOpportunities = useMemo(() => {
    return calculateTransferOpportunities(inventory, HOSPITALS, MEDICINES);
  }, [inventory]);

  // Critical item count
  const criticalCount = useMemo(() => {
    return inventory.filter((i) => i.stockStatus === 'critical').length;
  }, [inventory]);

  // Execute Transfer in state
  const handleAuthorizeTransfer = (
    transfer: TransferOpportunity,
    authorizedByName?: string,
    authorizedRole?: string
  ) => {
    const updatedInventory = applyTransferToInventory(inventory, transfer);
    setInventory(updatedInventory);

    const newLog: TransferLog = {
      id: `LOG-${Date.now()}`,
      transferId: `MED-XFER-${transfer.fromHospitalId.replace('HOSP-', '')}-${transfer.toHospitalId.replace('HOSP-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      medicineName: transfer.medicineName,
      quantity: transfer.recommendedQuantity,
      fromHospital: transfer.fromHospitalName,
      toHospital: transfer.toHospitalName,
      authorizedBy: authorizedByName || 'Dr. Marcus Sterling, RPh',
      approverRole: authorizedRole || 'Director of Pharmacy Supply Chain',
      status: 'Dispatched',
      notes: transfer.rationale,
      preDonorRunway: transfer.donorPreBufferDays,
      postDonorRunway: transfer.donorPostBufferDays,
      preRecipientRunway: transfer.recipientPreBufferDays,
      postRecipientRunway: transfer.recipientPostBufferDays,
      expiryUnitsSaved: transfer.expiryUnitsSaved,
      transitMinutes: transfer.estTransitMinutes,
    };

    setTransferLogs((prev) => [newLog, ...prev]);

    setToast({
      message: `Mutual Transfer Dispatched!`,
      subtext: `${transfer.recommendedQuantity} units of ${transfer.medicineName} authorized from ${transfer.fromHospitalName} to ${transfer.toHospitalName}. Recipient runway expands from ${transfer.recipientPreBufferDays}d to ${transfer.recipientPostBufferDays}d.`,
    });

    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  // Reset to initial baseline
  const handleResetData = () => {
    setInventory(buildInitialInventory());
    setSelectedHospitalFilter(null);
    setToast({
      message: 'Telemetry Reset to Baseline',
      subtext: 'Synthetic hospital network inventory has been restored to default initial state (5 critical shortages).',
    });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Synthetic Demonstration Data Banner */}
      <SyntheticDataBanner />

      {/* Main Command Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        criticalCount={criticalCount}
        transferOpportunityCount={transferOpportunities.length}
        session={userSession}
        onResetData={handleResetData}
        onOpenManifests={() => setIsAuditLogOpen(true)}
        onOpenUserSession={() => setIsUserSessionModalOpen(true)}
      />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-xl border border-teal-500 bg-slate-900 shadow-2xl flex items-start gap-3 animate-fade-in text-xs">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-0.5">
            <div className="font-bold text-white text-sm">{toast.message}</div>
            <p className="text-slate-300 leading-relaxed">{toast.subtext}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'command' && (
          <CommandCenter
            hospitals={HOSPITALS}
            medicines={MEDICINES}
            inventory={inventory}
            transferOpportunities={transferOpportunities}
            onAuthorizeTransfer={(opp) => setActiveTransferForManifest(opp)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onSelectHospitalFilter={(hId) => setSelectedHospitalFilter(hId)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryIntelligence
            hospitals={HOSPITALS}
            medicines={MEDICINES}
            inventory={inventory}
            transferOpportunities={transferOpportunities}
            selectedHospitalIdFilter={selectedHospitalFilter}
            onClearHospitalFilter={() => setSelectedHospitalFilter(null)}
            onSelectHospitalFilter={(id) => setSelectedHospitalFilter(id)}
            onInitiateTransfer={(opp) => setActiveTransferForManifest(opp)}
          />
        )}

        {activeTab === 'network' && (
          <ResourceNetwork
            hospitals={HOSPITALS}
            medicines={MEDICINES}
            inventory={inventory}
            transferOpportunities={transferOpportunities}
            onAuthorizeTransfer={(opp) => setActiveTransferForManifest(opp)}
            onOpenManifestModal={(opp) => setActiveTransferForManifest(opp)}
          />
        )}

        {activeTab === 'simulator' && (
          <ScenarioSimulator
            hospitals={HOSPITALS}
            medicines={MEDICINES}
            baseInventory={inventory}
          />
        )}

        {activeTab === 'assistant' && (
          <AIOperationsAssistant
            hospitals={HOSPITALS}
            medicines={MEDICINES}
            inventory={inventory}
            transferOpportunities={transferOpportunities}
          />
        )}

        {/* Persistent Operational Safety Governance Notice */}
        <OperationalSafetyNotice className="mt-8" />
      </main>

      {/* Human-in-the-Loop Transfer Manifest Dialog */}
      {activeTransferForManifest && (
        <TransferManifestModal
          transfer={activeTransferForManifest}
          session={userSession}
          onClose={() => setActiveTransferForManifest(null)}
          onConfirmAuthorization={(opp, adminName, adminRole) =>
            handleAuthorizeTransfer(opp, adminName, adminRole)
          }
        />
      )}

      {/* User Session & Role Permissions Dialog */}
      <UserSessionModal
        session={userSession}
        isOpen={isUserSessionModalOpen}
        onClose={() => setIsUserSessionModalOpen(false)}
        onUpdateSession={(updatedSession) => {
          setUserSession(updatedSession);
          setToast({
            message: `Active Profile: ${updatedSession.name}`,
            subtext: `Security clearance role set to ${updatedSession.role} (${updatedSession.hasDispatchAuthority ? 'Dispatch Authorized' : 'Read-Only'}).`,
          });
          setTimeout(() => setToast(null), 4000);
        }}
      />

      {/* Authorized Transfer Audit Log Dialog */}
      <TransferLogModal
        logs={transferLogs}
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AI-Medics</span>
            <span>·</span>
            <span>Healthcare Resource Intelligence System</span>
            <span>·</span>
            <span className="text-teal-400">Google for Developers × Hack2Skill</span>
          </div>
          <div className="text-[11px] text-slate-600">
            Smart Health & Supply Chain Resilience Track · Code for Communities 2.0
          </div>
        </div>
      </footer>
    </div>
  );
}

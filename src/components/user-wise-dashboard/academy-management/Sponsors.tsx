"use client";

import { useState, useEffect } from "react";
import { 
  IconPlus, 
  IconCurrencyDollar,
  IconFileText,
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { 
  useGetSponsorsMetaQuery, 
  useGetSponsorsQuery,
} from "@/redux/features/academy/academyApi";
import { ISponsorItem } from "@/types/academy.type";
import {
  CreateSponsorModal,
  EditSponsorModal,
  DeleteSponsorModal,
  SponsorsFilterBar,
  SponsorsTable,
  SponsorDetailsModal,
  DEFAULT_SPONSORS_META,
} from "./sponsors/index";

export const SponsorsManagement = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSponsorForView, setSelectedSponsorForView] = useState<ISponsorItem | null>(null);
  const [selectedSponsorForEdit, setSelectedSponsorForEdit] = useState<ISponsorItem | null>(null);
  const [selectedSponsorForDelete, setSelectedSponsorForDelete] = useState<ISponsorItem | null>(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [page, setPage] = useState(1);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when any filter changes
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handlePaymentStatusChange = (paymentStatus: string) => {
    setSelectedPaymentStatus(paymentStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedType("");
    setSelectedStatus("");
    setSelectedPaymentStatus("");
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm || selectedType || selectedStatus || selectedPaymentStatus
  );

  // API Queries
  const { data: metaResponse } = useGetSponsorsMetaQuery();
  const metaData = metaResponse?.data || DEFAULT_SPONSORS_META;

  const { data: sponsorsResponse, isLoading } = useGetSponsorsQuery({
    searchTerm: debouncedSearch || undefined,
    sponsorshipType: selectedType || undefined,
    status: selectedStatus || undefined,
    paymentStatus: selectedPaymentStatus || undefined,
    page,
    limit: 10,
  });

  const stats = sponsorsResponse?.data?.stats;
  const sponsorsList = sponsorsResponse?.data?.sponsors || [];
  const paginationMeta = sponsorsResponse?.data?.meta;

  const totalSponsorsCount = paginationMeta?.total ?? sponsorsList.length;

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-full overflow-x-hidden pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase text-white font-orbitron tracking-tight leading-none wrap-break-word">
            Sponsors
          </h1>
          <p className="text-white/60 font-bold uppercase tracking-widest text-[9px] md:text-[11px] mt-2">
            Manage academy sponsors and partnerships
          </p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full md:w-auto justify-center bg-[#E31B23] hover:bg-[#C2181F] text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 cursor-pointer"
        >
          <IconPlus size={20} className="shrink-0" />
          <span className="text-sm font-bold uppercase tracking-widest truncate">
            Add New Sponsor
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Contract Value */}
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconCurrencyDollar size={24} className="text-[#4ADE80]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5 truncate">
              Total Contract Value
            </p>
            <p className="text-2xl font-black text-white font-orbitron truncate">
              {stats?.totalContractValueFormatted ||
                (stats?.totalContractValue != null
                  ? `$${stats.totalContractValue.toLocaleString()}`
                  : "$0")}
            </p>
          </div>
        </div>

        {/* Active Sponsors */}
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconFileText size={24} className="text-[#E31B23]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5 truncate">
              Active Sponsors
            </p>
            <p className="text-2xl font-black text-white font-orbitron truncate">
              {stats?.activeSponsors ?? 0}
            </p>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconCalendar size={24} className="text-[#FBBF24]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5 truncate">
              Expiring Soon
            </p>
            <p className="text-2xl font-black text-white font-orbitron truncate">
              {stats?.expiringSoon ?? 0}
            </p>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-6 flex items-center gap-4 shadow-xl">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <IconCurrencyDollar size={24} className="text-[#3B82F6]" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5 truncate">
              Pending Payments
            </p>
            <p className="text-2xl font-black text-white font-orbitron truncate">
              {stats?.pendingPaymentsFormatted ||
                (stats?.pendingPayments != null
                  ? `$${stats.pendingPayments.toLocaleString()}`
                  : "$0")}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <SponsorsFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={handleTypeChange}
        typeOptions={metaData.sponsorshipTypes}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        statusOptions={metaData.sponsorshipStatuses}
        selectedPaymentStatus={selectedPaymentStatus}
        onPaymentStatusChange={handlePaymentStatusChange}
        paymentStatusOptions={metaData.paymentStatuses}
        onResetFilters={handleResetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Main Table Card */}
      <div className="bg-[#111111] rounded-4xl border border-white/15 p-5 md:p-8 flex flex-col gap-6 md:gap-8 shadow-2xl min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-black uppercase text-white font-orbitron wrap-break-word">
            All Sponsors ({totalSponsorsCount})
          </h2>
        </div>

        <SponsorsTable
          sponsors={sponsorsList}
          isLoading={isLoading}
          onView={(sponsor: ISponsorItem) => setSelectedSponsorForView(sponsor)}
          onEdit={(sponsor: ISponsorItem) => setSelectedSponsorForEdit(sponsor)}
          onDelete={(sponsor: ISponsorItem) => setSelectedSponsorForDelete(sponsor)}
        />

        {/* Pagination Controls */}
        {paginationMeta && paginationMeta.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <p className="text-xs text-white/40">
              Page {paginationMeta.page} of {paginationMeta.totalPages} ({paginationMeta.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous page"
              >
                <IconChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={page >= paginationMeta.totalPages}
                onClick={() => setPage((p) => Math.min(paginationMeta.totalPages, p + 1))}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next page"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Sponsor Modal */}
      <CreateSponsorModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        metaData={metaData}
      />

      {/* Edit Sponsor Modal */}
      <EditSponsorModal
        isOpen={Boolean(selectedSponsorForEdit)}
        onClose={() => setSelectedSponsorForEdit(null)}
        sponsor={selectedSponsorForEdit}
        metaData={metaData}
      />

      {/* Delete Sponsor Modal */}
      <DeleteSponsorModal
        isOpen={Boolean(selectedSponsorForDelete)}
        onClose={() => setSelectedSponsorForDelete(null)}
        sponsor={selectedSponsorForDelete}
      />

      {/* Sponsor Details View Modal */}
      <SponsorDetailsModal
        sponsor={selectedSponsorForView}
        isOpen={Boolean(selectedSponsorForView)}
        onClose={() => setSelectedSponsorForView(null)}
      />
    </div>
  );
};

export default SponsorsManagement;

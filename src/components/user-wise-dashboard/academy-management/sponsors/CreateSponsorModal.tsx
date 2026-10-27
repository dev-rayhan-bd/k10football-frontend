"use client";

import React, { useState } from "react";
import DashboardModal from "@/components/dashboard/DashboardModal";
import {
  IconMail,
  IconPhone,
  IconCurrencyDollar,
  IconChevronDown,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";
import { ISponsorsMetaData } from "@/types/academy.type";
import { useCreateSponsorMutation } from "@/redux/features/academy/academyApi";
import { DEFAULT_SPONSORS_META } from "./sponsor.constants";

interface CreateSponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  metaData?: ISponsorsMetaData;
}

interface SponsorFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  fullAddress: string;
  sponsorshipType: string;
  sponsorshipStatus: string;
  contractValue: string;
  paymentStatus: string;
  startDate: string;
  endDate: string;
  sponsorshipDescription: string;
  benefitsAndDeliverables: string;
}

const INITIAL_FORM_DATA: SponsorFormData = {
  companyName: "",
  contactPerson: "",
  email: "",
  phone: "",
  fullAddress: "",
  sponsorshipType: "",
  sponsorshipStatus: "",
  contractValue: "",
  paymentStatus: "",
  startDate: "",
  endDate: "",
  sponsorshipDescription: "",
  benefitsAndDeliverables: "",
};

export const CreateSponsorModal: React.FC<CreateSponsorModalProps> = ({
  isOpen,
  onClose,
  metaData,
}) => {
  const [formData, setFormData] = useState<SponsorFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createSponsor, { isLoading }] = useCreateSponsorMutation();

  const activeMeta = metaData || DEFAULT_SPONSORS_META;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Dynamic date validation check
    if (name === "startDate" || name === "endDate") {
      const start = name === "startDate" ? value : formData.startDate;
      const end = name === "endDate" ? value : formData.endDate;
      if (start && end && new Date(start) > new Date(end)) {
        setErrors((prev) => ({
          ...prev,
          endDate: "End date cannot be earlier than start date",
        }));
      } else if (errors.endDate === "End date cannot be earlier than start date") {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.endDate;
          return next;
        });
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.fullAddress.trim()) {
      newErrors.fullAddress = "Full address is required";
    }

    if (!formData.sponsorshipType) {
      newErrors.sponsorshipType = "Please select a sponsorship type";
    }

    if (!formData.sponsorshipStatus) {
      newErrors.sponsorshipStatus = "Please select a sponsorship status";
    }

    if (!formData.contractValue.trim()) {
      newErrors.contractValue = "Contract value is required";
    } else {
      const val = Number(formData.contractValue);
      if (isNaN(val) || val <= 0) {
        newErrors.contractValue = "Contract value must be greater than 0";
      }
    }

    if (!formData.paymentStatus) {
      newErrors.paymentStatus = "Please select a payment status";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    // Validation: startDate cannot be after endDate
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (start > end) {
        newErrors.endDate = "End date cannot be earlier than start date";
      }
    }

    if (!formData.sponsorshipDescription.trim()) {
      newErrors.sponsorshipDescription = "Sponsorship description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (isLoading) return;
    setFormData(INITIAL_FORM_DATA);
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactPerson: formData.contactPerson.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        fullAddress: formData.fullAddress.trim(),
        sponsorshipType: formData.sponsorshipType,
        sponsorshipStatus: formData.sponsorshipStatus,
        contractValue: Number(formData.contractValue),
        currency: "$",
        paymentStatus: formData.paymentStatus,
        startDate: formData.startDate,
        endDate: formData.endDate,
        sponsorshipDescription: formData.sponsorshipDescription.trim(),
        benefitsAndDeliverables: formData.benefitsAndDeliverables.trim() || undefined,
      };

      const res = await createSponsor(payload).unwrap();
      if (res?.success || !res?.error) {
        handleClose();
      }
    } catch {
      // Error is handled in academyApi onQueryStarted with ErrorToast
    }
  };

  return (
    <DashboardModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Sponsor"
      subtitle="Enter sponsor and partnership details"
      showBackButton
      footer={
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl border border-white/30 text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/5 transition-all flex items-center justify-center shrink-0 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-4 sm:px-8 py-3.5 rounded-xl bg-[#E31B23] hover:bg-[#C2181F] text-[11px] font-black uppercase tracking-widest text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#E31B23]/20 shrink-0 disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <IconLoader2 size={16} className="animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <span>Add Sponsor</span>
            )}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-10">
        {/* Company Information */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Company Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Company Name <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name..."
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.companyName
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.companyName && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.companyName}
                </p>
              )}
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Contact Person <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="Enter contact person name..."
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.contactPerson
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.contactPerson && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.contactPerson}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Email <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <IconMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={18}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="sponsor@company.com"
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                    errors.email
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Phone <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <IconPhone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20"
                  size={18}
                />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 555-0123"
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                    errors.phone
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.phone}
                </p>
              )}
            </div>

            {/* Full Address */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Full Address <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleChange}
                placeholder="Enter company address..."
                className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                  errors.fullAddress
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.fullAddress && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.fullAddress}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sponsorship Details */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-black uppercase text-white font-orbitron">
            Sponsorship Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sponsorship Type */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Sponsorship Type <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="sponsorshipType"
                  value={formData.sponsorshipType}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.sponsorshipType ? "text-white" : "text-white/40"
                  } ${
                    errors.sponsorshipType
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    Select Sponsorship Type
                  </option>
                  {activeMeta.sponsorshipTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#111111] text-white">
                      {type}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.sponsorshipType && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sponsorshipType}
                </p>
              )}
            </div>

            {/* Sponsorship Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Sponsorship Status <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="sponsorshipStatus"
                  value={formData.sponsorshipStatus}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.sponsorshipStatus ? "text-white" : "text-white/40"
                  } ${
                    errors.sponsorshipStatus
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    Select Sponsorship Status
                  </option>
                  {activeMeta.sponsorshipStatuses.map((status) => (
                    <option key={status} value={status} className="bg-[#111111] text-white">
                      {status}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.sponsorshipStatus && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sponsorshipStatus}
                </p>
              )}
            </div>

            {/* Contract Value */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Contract Value <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <IconCurrencyDollar
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                  size={18}
                />
                <input
                  type="number"
                  name="contractValue"
                  min="0"
                  step="any"
                  value={formData.contractValue}
                  onChange={handleChange}
                  placeholder="50000"
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 pl-12 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${
                    errors.contractValue
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.contractValue && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.contractValue}
                </p>
              )}
            </div>

            {/* Payment Status */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Payment Status <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm appearance-none focus:outline-none transition-all cursor-pointer ${
                    formData.paymentStatus ? "text-white" : "text-white/40"
                  } ${
                    errors.paymentStatus
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                >
                  <option value="" disabled className="bg-[#111111] text-white/40">
                    Select Payment Status
                  </option>
                  {activeMeta.paymentStatuses.map((status) => (
                    <option key={status} value={status} className="bg-[#111111] text-white">
                      {status}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none"
                  size={16}
                />
              </div>
              {errors.paymentStatus && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.paymentStatus}
                </p>
              )}
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Start Date <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all cursor-pointer [color-scheme:dark] ${
                    errors.startDate
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.startDate && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.startDate}
                </p>
              )}
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                End Date <span className="text-[#E31B23]">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="endDate"
                  min={formData.startDate || undefined}
                  value={formData.endDate}
                  onChange={handleChange}
                  onClick={(e) => e.currentTarget.showPicker?.()}
                  className={`w-full bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white focus:outline-none transition-all cursor-pointer [color-scheme:dark] ${
                    errors.endDate
                      ? "border-[#E31B23] focus:border-[#E31B23]"
                      : "border-white/15 focus:border-white/25"
                  }`}
                />
              </div>
              {errors.endDate && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.endDate}
                </p>
              )}
            </div>

            {/* Sponsorship Description */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60 flex items-center gap-1">
                Sponsorship Description <span className="text-[#E31B23]">*</span>
              </label>
              <textarea
                name="sponsorshipDescription"
                value={formData.sponsorshipDescription}
                onChange={handleChange}
                placeholder="Describe the sponsorship agreement and terms..."
                className={`w-full h-28 bg-[#111111] border rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none transition-all resize-none ${
                  errors.sponsorshipDescription
                    ? "border-[#E31B23] focus:border-[#E31B23]"
                    : "border-white/15 focus:border-white/25"
                }`}
              />
              {errors.sponsorshipDescription && (
                <p className="text-[11px] text-[#E31B23] flex items-center gap-1 font-bold">
                  <IconAlertCircle size={14} /> {errors.sponsorshipDescription}
                </p>
              )}
            </div>

            {/* Benefits & Deliverables */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-white/60">
                Benefits &amp; Deliverables
              </label>
              <textarea
                name="benefitsAndDeliverables"
                value={formData.benefitsAndDeliverables}
                onChange={handleChange}
                placeholder="List the benefits and what the academy will provide to the sponsor..."
                className="w-full h-28 bg-[#111111] border border-white/15 rounded-xl py-3.5 px-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/25 transition-all resize-none"
              />
            </div>
          </div>
        </div>
      </form>
    </DashboardModal>
  );
};

export default CreateSponsorModal;

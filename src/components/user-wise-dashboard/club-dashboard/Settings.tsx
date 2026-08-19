"use client";
import React from "react";
import { 
  IconBuildingCommunity, 
  IconLock, 
  IconCreditCard,
  IconBell,
} from "@tabler/icons-react";
import { 
  SettingsSection, 
  SettingsInput, 
  SettingsToggle 
} from "@/components/dashboard/DashboardSettingsElements";

const ClubSettings = () => {
  return (
    <div className="space-y-6 md:space-y-8 pb-8 md:pb-12 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Settings</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-2">Manage your club account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Club Information */}
        <SettingsSection title="Club Information" icon={<IconBuildingCommunity size={20} />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <SettingsInput label="Club Name" placeholder="Liverpool FC" />
            <SettingsInput label="Date of Establishment" placeholder="1878" isDate />
            <SettingsInput label="Nationality" placeholder="Brazil" />
            <SettingsInput label="Contact" placeholder="+55 11 9999-8888" />
            <SettingsInput label="Club Category" placeholder="Premier League" />
            <SettingsInput label="Email" placeholder="liverpool.fc@gmail.com" />
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection title="Security" icon={<IconLock size={20} />}>
          <div className="space-y-6">
            <SettingsInput label="Current Password" type="password" />
            <SettingsInput label="New Password" type="password" />
            <SettingsInput label="Confirm New Password" type="password" />
            
            <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/20 transition-all border border-white/10 mt-2 sm:mt-0">
              Update Password
            </button>
          </div>
        </SettingsSection>

        {/* Billing & Subscription */}
        <SettingsSection title="Billing & Subscription" icon={<IconCreditCard size={20} />}>
          <div className="space-y-6">
            <div className="p-4 sm:p-6 rounded-xl border border-white/10 bg-white/2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex flex-col sm:flex-row sm:items-center">
                    Premium Plan <span className="text-gray-500 font-medium sm:ml-2">($150/month)</span>
                  </h4>
                </div>
                <button className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-lg bg-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/20 transition-all border border-white/10 whitespace-nowrap">
                  Change Plan
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-widest">Next billing date</span>
                  <span className="text-white font-bold italic">July 15, 2025</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 uppercase font-bold tracking-widest">Payment method</span>
                  <span className="text-white font-bold italic">....4242</span>
                </div>
              </div>
            </div>
            
            <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white/10 text-white text-[10px] sm:text-xs font-bold hover:bg-white/20 transition-all border border-white/10 mt-2 sm:mt-0">
              Update Payment Method
            </button>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notifications" icon={<IconBell size={20} />}>
          <div className="space-y-4">
            <SettingsToggle 
              title="New CV Alerts" 
              description="Get notified of new athlete CVs" 
              defaultChecked 
            />
            <SettingsToggle 
              title="Profile Share Alerts" 
              description="Notification when profiles are viewed" 
              defaultChecked 
            />
          </div>
        </SettingsSection>
      </div>
    </div>
  );
};

export default ClubSettings;

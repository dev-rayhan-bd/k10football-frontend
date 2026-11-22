export interface RoleNotificationControlDef {
  key: string;
  title: string;
  description: string;
  defaultValue: boolean;
}

export const ROLE_NOTIFICATION_CONTROLS: Record<string, RoleNotificationControlDef[]> = {
  // 1. PLAYER / ATHLETE / PARENT / GUARDIAN (4 toggles)
  PLAYER: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Get notified when someone likes your video", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when a club views your profile", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Get notified when a club shows interest in you", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive newsletters and platform updates", defaultValue: false },
  ],
  ATHLETE: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Get notified when someone likes your video", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when a club views your profile", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Get notified when a club shows interest in you", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive newsletters and platform updates", defaultValue: false },
  ],
  PARENT: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Get notified when someone likes your child's video", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when a club views your child's profile", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Get notified when a club shows interest in your child", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive newsletters and platform updates", defaultValue: false },
  ],
  GUARDIAN: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Get notified when someone likes your child's video", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when a club views your child's profile", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Get notified when a club shows interest in your child", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive newsletters and platform updates", defaultValue: false },
  ],

  // 2. COACH / ACADEMY (4 toggles)
  COACH: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Notifications for video reactions and player highlights", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when scouts inspect your team and athletes", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Receive alerts when clubs show interest in your players", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive news and platform updates", defaultValue: false },
  ],
  ACADEMY: [
    { key: "newVideoLikes", title: "New Video Likes", description: "Notifications for video reactions and academy highlights", defaultValue: true },
    { key: "profileViews", title: "Profile Views", description: "Get notified when scouts inspect your academy athletes", defaultValue: true },
    { key: "interestAlerts", title: "Interest Alerts", description: "Receive alerts when clubs show interest in your players", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive news and platform updates", defaultValue: false },
  ],

  // 3. CLUB (3 toggles)
  CLUB: [
    { key: "newCvAlerts", title: "New CV Alerts", description: "Get notified when a new athlete CV matches your criteria", defaultValue: true },
    { key: "profileShareAlerts", title: "Profile Share Alerts", description: "Get notified regarding shared athlete profiles", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive platform newsletters and scouting updates", defaultValue: false },
  ],

  // 4. AGENT (4 toggles)
  AGENT: [
    { key: "newPlayers", title: "New Players", description: "Get notified when new talent joins the platform", defaultValue: true },
    { key: "profileUpdates", title: "Profile Updates", description: "Get notified when followed athletes update their profile", defaultValue: true },
    { key: "sharedWithYou", title: "Shared with You", description: "Get notified when an agent or scout shares a profile", defaultValue: true },
    { key: "marketingEmails", title: "Marketing Emails", description: "Receive agent network bulletins and marketing updates", defaultValue: false },
  ],

  // 5. SUPER_ADMIN / ADMIN (7 toggles)
  ADMIN: [
    { key: "verificationAlerts", title: "Verification & KYC Requests", description: "Alerts when clubs, agents or coaches submit verifications", defaultValue: true },
    { key: "storyAlerts", title: "Success Story Approvals", description: "Alerts when new success stories are submitted", defaultValue: true },
    { key: "paymentAlerts", title: "Payment & Revenue Alerts", description: "Notifications regarding subscriptions and payments", defaultValue: true },
    { key: "userRegistrationAlerts", title: "New User Registrations", description: "Alerts when new users sign up on the platform", defaultValue: true },
    { key: "reportAlerts", title: "Game Reports & Match Evaluations", description: "Alerts when game reports or evaluations are submitted", defaultValue: true },
    { key: "systemAlerts", title: "System & Security Alerts", description: "Critical platform security and system events", defaultValue: true },
    { key: "marketingEmails", title: "Platform Digests & Updates", description: "Receive platform digest emails and newsletters", defaultValue: false },
  ],
  SUPER_ADMIN: [
    { key: "verificationAlerts", title: "Verification & KYC Requests", description: "Alerts when clubs, agents or coaches submit verifications", defaultValue: true },
    { key: "storyAlerts", title: "Success Story Approvals", description: "Alerts when new success stories are submitted", defaultValue: true },
    { key: "paymentAlerts", title: "Payment & Revenue Alerts", description: "Notifications regarding subscriptions and payments", defaultValue: true },
    { key: "userRegistrationAlerts", title: "New User Registrations", description: "Alerts when new users sign up on the platform", defaultValue: true },
    { key: "reportAlerts", title: "Game Reports & Match Evaluations", description: "Alerts when game reports or evaluations are submitted", defaultValue: true },
    { key: "systemAlerts", title: "System & Security Alerts", description: "Critical platform security and system events", defaultValue: true },
    { key: "marketingEmails", title: "Platform Digests & Updates", description: "Receive platform digest emails and newsletters", defaultValue: false },
  ],
};

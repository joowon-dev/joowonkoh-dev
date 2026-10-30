import type { Copy } from "./types";

const en: Copy = {
  appName: "Your Meal, My Meal",
  quote: ["“", "”"],
  store: { download: "Download" },

  landing: {
    meta: {
      title: "Your Meal, My Meal",
      description:
        "Fill breakfast, lunch and dinner on your plate one photo at a time, and look out for each other with family or friends. The intro and support page for the iOS and Android app Your Meal, My Meal.",
      ogTitle: "Your Meal, My Meal — instead of asking “Did you eat?”",
      ogDescription:
        "Fill breakfast, lunch and dinner on your plate one photo at a time, and look out for each other with family or friends.",
      ogAlt: "Your Meal, My Meal intro image: a white plate on a yolk-yellow background, with only the lunch slot filled in tomato red",
    },
    trayTitle: "Plate from Your Meal, My Meal",
    greetings: [
      "What did you eat today?",
      "Have you been eating well?",
      "Was lunch good?",
      "Dinner tonight, like we’re eating together",
    ],
    tagline: "Share today’s plate with family and friends, one meal photo at a time.",
    together: {
      title: "One table, together",
      lead: "The plates of 2–12 people who joined with an invite code sit side by side on one table. You can see who hasn’t eaten yet without having to ask.",
    },
    featuresTitle: "What it does",
    features: [
      { title: "One slot at a time", tail: "Snap or pick from your album, right into the slot" },
      { title: "You choose the framing", tail: "Drag and zoom so your food doesn’t get cut off" },
      { title: "Nudge the empty ones", tail: "Haven’t eaten yet? A gentle poke" },
      { title: "One plate", tail: "Post once, it shows up in every group" },
      { title: "Reactions · comments", tail: "“Looks yummy” is all it takes" },
      { title: "Your day in one image", tail: "Save the day’s plate to your photos" },
    ],
    statement: { before: "Instead of “Did you eat?”, the ", em: "empty slot", after: " speaks first." },
    story: [
      "When you live alone, meals are the first thing you start skipping or rushing. The only way to check on someone is to call and ask, and when you ask, the answer is usually “Yeah, I ate.”",
      "So instead of asking, we made it visible. It’s not an app that automates nagging — it’s an app that takes the effort out of checking in. That’s why it never scolds an empty slot. There are three meals, and snacks are a bonus.",
    ],
    faqTitle: "FAQ",
    faq: [
      {
        q: "Who can see my photos?",
        a: "Only people in the same group as you. This restriction lives in the database itself, not just the app screens, so even a tampered app can’t pull someone else’s meals. The photo storage is private, and photo links only work for a short time.",
      },
      {
        q: "Can I be in a family group and a friends group at the same time?",
        a: "Yes. Everyone has just one plate, so when you post breakfast once, it shows up in every group you’re in. No need to post separately for each group.",
      },
      {
        q: "How many times can I send a Nudge?",
        a: "So it never turns into a notification flood, the server counts how many you send each day. When you run out, you can watch a short ad to get a few more, and that has a daily cap too. The snack slot is a bonus, so it can’t be nudged.",
      },
      {
        q: "Are there ads?",
        a: "There are full-screen ads that occasionally appear after you close a photo or finish posting, and rewarded ads that you only watch when you want more Nudges. There are no banners that stay on screen. We also collect usage statistics to improve the app. The details are in the privacy policy.",
      },
      {
        q: "What happens if I delete my account?",
        a: "You can delete it right in the app. All your photos and records are gone and can’t be restored. Groups you created pass to the longest-standing remaining member, and if no one is left, the group is deleted too.",
      },
    ],
    closing: {
      title: "Dinner tonight, like we’re eating together",
      body: "Feature ideas or questions? Feel free to email us anytime.",
      privacy: "Privacy Policy",
      deleteAccount: "Account deletion",
    },
  },

  join: {
    meta: {
      title: "Have you eaten? · Your Meal, My Meal",
      description:
        "You’re invited to the table. Log what you ate today on your plate. Copy the invite code and enter it in the app to join the group.",
      ogTitle: "Have you eaten?",
      ogDescription: "You’re invited to the table · Log what you ate today on your plate",
      ogAlt: "Invite image: a white plate with all four slots empty in the middle of a pale yolk-yellow background, with a tomato-red spoon and a mint-green fork on either side",
    },
    trayTitle: "An empty plate with nothing on it yet",
    title: "Have you eaten?",
    sub: "Log what you ate today on your plate!",
    pill: "You’re invited · Fill it together",
    step1: "Copy the invite code",
    copyAria: "Copy invite code {code}",
    noCodeAria: "No invite code",
    copied: "Copied!",
    missing: ["The invite code is missing or cut off in the link.", "Please ask the person who invited you for the code again."],
    step2: "Install the app and enter it",
    hint: { before: "In the app, ", tab: "Groups", after: " tab", add: "Add a group", join: "Join with an invite code" },
    openInApp: "Already have the app? · Open in app",
    limit: "Groups hold up to 12 people. If it’s full, you can’t join.",
    about: "About Your Meal, My Meal",
    privacy: "Privacy",
  },

  shell: {
    homeAria: "Your Meal, My Meal home",
    about: "About",
    privacy: "Privacy Policy",
    deleteAccount: "Delete account",
    language: "Language",
  },

  legal: {
    badge: "Your Meal, My Meal · Legal",
    updated: "Last updated",
    koreanPrevails: "This is a translation. If it differs from the Korean version in any way, the Korean version prevails.",
    koreanLink: "View the Korean version",
  },

  privacy: {
    title: "Your Meal, My Meal Privacy Policy",
    description:
      "What information the iOS and Android app “Your Meal, My Meal” handles, who can see your photos and meal records, and how to delete your account.",
    updatedAt: "October 16, 2026",
    sections: [
      {
        h: "1. Overview",
        blocks: [
          {
            p: "Your Meal, My Meal (네밥내밥; the “App”) is an iOS and Android application for logging the meals you eat each day with photos and sharing them with people in the same group. This policy explains what information the App handles, why, and the choices you have.",
          },
          { p: "In short:" },
          {
            ul: [
              "Your photos and meal records are visible **only to people in the same group as you**.",
              "The App shows **Google AdMob full-screen ads and rewarded ads**. Full-screen ads occasionally take up the whole screen after you close a photo or finish posting, and rewarded ads are watched only when you choose to, after you’ve used up your Nudges. There are no banner ads that stay on screen. We use Google Analytics for Firebase for usage statistics. Your name, email, photos and meal records are not passed to these services.",
              "On iOS, after you sign in, we **ask first whether you allow ad tracking**, and you can use every feature of the App even if you decline.",
              "You can delete your account **directly in the App**, and deleting it removes your photos and records along with it.",
            ],
          },
          { p: "If you have any questions, please contact us at [contact@joowonkoh.com](contact)." },
        ],
      },
      {
        h: "2. Information we collect",
        blocks: [
          {
            ul: [
              "**Email address** — Received through Sign in with Apple or Google. Used only to identify who is signed in.",
              "**Display name** — The name shown to people in your groups. You choose it yourself and can change it anytime.",
              "**Meal photos** — Photos you take yourself or pick from your album. They are the whole purpose of the App.",
              "**Meal date and time slot** — Needed to tell which meal on which day a photo belongs to.",
              "**Device push token** — Stored so we know where to send notifications.",
              "**Comments** — Text you leave on meals of people in the same group. Visible only to people in that group.",
              "**Profile photo** — A photo you upload yourself. Visible only to people in the same group as you.",
              "**Report and block records** — Who reported what and why, and whom you blocked. Used only to handle inappropriate content.",
              "**Account identifier** — A random string created automatically when you sign up. Used only to link photos and records to their owner, and unlike your name or email, it is never shown on screen.",
            ],
          },
          { p: "The following information is processed for ads and usage statistics." },
          {
            ul: [
              "**App usage information** — Screens viewed and features used, app instance ID, device type and OS, and approximate region. Used to understand which features are used and to improve the App, and processed by Google Analytics for Firebase.",
              "**Advertising identifier and ad information** — The IDFA on iOS or the advertising ID on Android, and ad impression and click information. Used to show ads and measure their performance, and processed by Google AdMob. On iOS, if you decline “Allow apps to request to track,” the IDFA is not used and non-personalized ads are shown.",
            ],
          },
          { p: "The App does not access precise location, contacts, call history, health information or payment information." },
        ],
      },
      {
        h: "3. Who can see it",
        blocks: [
          {
            p: "Photos and meal records are visible only to people in the same group. This restriction is **enforced in the database itself** (Row Level Security), not just in the app screens, so even modifying the App or imitating its network requests cannot retrieve someone else’s meals.",
          },
          { p: "The photo storage is private, and links for viewing photos are valid only for a short time." },
          {
            p: "Push tokens are kept in a separate table that only you can read. They are not visible even to people in the same group, because anyone who knows a token could send arbitrary notifications to that device.",
          },
          {
            p: "Comments and reactions are visible **only within the group where they were left**. Even on the same photo, people in other groups cannot see them. Content you report or block becomes invisible to you from that moment on.",
          },
        ],
      },
      {
        h: "4. Third-party services",
        blocks: [
          {
            p: "The App does not sell personal information. Your name, email, photos and meal records are not provided to third parties for advertising or analytics purposes. The App uses the following services.",
          },
          {
            ul: [
              "**Supabase** — Sign-in and data storage. The servers are located in South Korea (Seoul).",
              "**Cloudflare R2** — Storage for meal photos and profile photos. Stored privately in the Asia-Pacific region, and served through addresses valid for one hour only after confirming the viewer is allowed to see them.",
              "**Expo** — Notification delivery, via Apple APNs on iOS and Google FCM on Android. The notification text and device token are passed on.",
              "**Apple / Google** — Sign-in. We receive your email address.",
              "**Google AdMob** — Full-screen ads and rewarded ads. The advertising identifier, ad impression and click information, and device information are passed on.",
              "**Google Analytics for Firebase** — Usage statistics. App usage information, app instance ID and device information are passed on.",
            ],
          },
          { p: "You can see how Google processes this information in [How Google uses information from sites or apps that use our services](google)." },
        ],
      },
      {
        h: "5. Retention period",
        blocks: [
          {
            p: "We keep your information while your account exists and delete it when you delete your account. We keep no separate copies. Usage statistics are not tied to your account and are deleted after 2 months under the Google Analytics default setting.",
          },
        ],
      },
      {
        h: "6. Account deletion",
        blocks: [
          { p: "You can delete your account right in the App: **Me > Delete account**." },
          {
            p: "Deleting it permanently removes your profile and display name, profile photo, uploaded photo files, meal records, comments, reactions, report and block records, group memberships and push tokens. This cannot be undone.",
          },
          {
            p: "Groups you created pass to the longest-standing remaining member. If no one is left, the group is deleted too. One person leaving never removes the group for everyone else.",
          },
        ],
      },
      {
        h: "7. Your rights",
        blocks: [
          {
            ul: [
              "You can change your display name in the App at any time.",
              "You can immediately delete your account and all records using the method in section 6 above. If you have already removed the App, please see [Account deletion](deleteAccount).",
              "You can unblock people at any time in Me > Blocked people.",
              "You can turn off notifications at any time in your device settings.",
              "You can turn off ad tracking or delete your advertising ID at any time — on iOS in Settings > Privacy & Security > Tracking, and on Android in Settings > Google > Ads.",
              "For any other requests to access, correct or delete your information, please contact us at the email address above.",
            ],
          },
        ],
      },
      {
        h: "8. Children’s privacy",
        blocks: [
          {
            p: "The App is not directed at children under 14, and we do not knowingly collect information from users of that age.",
          },
        ],
      },
      {
        h: "9. Changes to this policy",
        blocks: [
          {
            p: "This policy may be revised to reflect changes in law or in the service. If what we process changes, we will update this policy and its “Last updated” date before releasing the version that includes the feature.",
          },
        ],
      },
    ],
  },

  deleteAccount: {
    title: "Delete your account on Your Meal, My Meal",
    description:
      "How to delete your account on Your Meal, My Meal, along with the photos and meal records you posted. You can delete it right in the App, or request it by email if you no longer have the App.",
    updatedAt: "September 18, 2026",
    mailSubject: "[네밥내밥] Account deletion request",
    sections: [
      {
        h: "Delete it in the app",
        blocks: [
          { p: "This is the fastest way. There’s no request to wait on — it’s deleted right then and there." },
          {
            ol: [
              "Open Your Meal, My Meal and tap the **Me** tab at the bottom of the screen.",
              "Tap **Delete account**.",
              "Type **delete** to confirm, and the button becomes active.",
            ],
          },
          {
            p: "The Me tab is always visible, even if you’re not in any group. You can delete your account even if you’ve only just opened the App and signed in.",
          },
        ],
      },
      {
        h: "If you don’t have the app",
        blocks: [
          {
            p: "If you’ve changed devices or already removed the App, please request deletion by email. Please send it from the email address you signed up with so we can verify it’s you.",
          },
          { p: "Send to: [contact@joowonkoh.com](deleteMail)" },
          { p: "We will process it within 7 business days and reply with the result." },
        ],
      },
      {
        h: "What gets deleted",
        blocks: [
          { p: "The following items are deleted **immediately and permanently**." },
          {
            ul: [
              "Your account and sign-in information (email address, account identifier)",
              "Display name",
              "All meal photo files you posted",
              "Meal records and dates",
              "Reactions you left on other people’s meals",
              "Group memberships",
              "Device push tokens stored for sending you notifications",
            ],
          },
          {
            p: "Groups you created are not deleted. They pass to the longest-standing remaining member, and if no one is left, the group is deleted too. Other people’s records are never deleted along with yours.",
          },
        ],
      },
      {
        h: "How long anything remains",
        blocks: [
          {
            p: "There is no retention period. Your data is deleted the moment you tap delete. Copies left on backup media disappear within 30 days at most, following the backup cycle.",
          },
        ],
      },
      {
        h: "See also",
        blocks: [{ p: "What information we collect and why is explained in the [Privacy Policy](privacy)." }],
      },
    ],
  },
};

export default en;

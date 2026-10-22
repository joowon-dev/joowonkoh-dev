import type { Privacy } from "./types";

const en: Privacy = {
  meta: {
    title: "MoneyTick Privacy Policy",
    description:
      "What the iOS and Android app MoneyTick processes, the third-party services used for ads, analytics and crash reports, and your choices.",
  },
  badge: "MoneyTick · Legal",
  title: "MoneyTick Privacy Policy",
  updated: "Last updated: October 22, 2026",
  sections: [
    {
      h: "1. Overview",
      body: [
        "MoneyTick (the “App”) is an iOS and Android application that shows, in real time, how much you have earned so far based on the pay you enter. This policy explains what information the App processes, why, and what choices you have.",
        "In short:",
        [
          "**The pay, settings and wish photos you enter never leave your device.** The App has no accounts and no server that receives your data.",
          "The App does use Google services for **showing ads**, **usage analytics** and **crash reports**, and in the process Google processes information such as device details.",
          "The App **uses an advertising identifier for personalized ads.** On iOS, the advertising identifier (IDFA) is used only if you allow it in the App Tracking Transparency (ATT) prompt. On Android, the device's advertising ID (AAID) is used without a separate prompt, and you can turn it off at any time in your device settings. Either way, every feature works the same.",
        ],
        "For any questions, please contact {email}.",
      ],
    },
    {
      h: "2. Information you enter",
      body: [
        "Everything you enter in the App, such as your pay, work hours, display settings, people you add for comparison, wish items (photo, name and price) and Paid to Slack records, is handled as follows.",
        [
          "**It is stored only on your device.** On iOS the App uses an App Group container so the App and its widgets can show the same values; on Android it uses the App's private storage.",
          "No one, including the developer, can see this information, because it is never sent anywhere. Your pay and photos are not used for ads or analytics (see section 4 for what analytics records).",
          "If backups are turned on, App data may be included in Apple's iCloud Backup or Google's Android Auto Backup. This is standard operating-system behavior and not something the App requests.",
        ],
        "**Photos and camera.** When you add a wish item or customize the StandBy screen (iOS), the App only uses photos you take or choose yourself. Camera and photo library access is requested when you use these features, and the rest of the App works normally if you decline. Removing the background from wish photos happens on your device (Apple Vision on iOS, Google ML Kit on Android). Photos are stored only on your device and are never uploaded.",
        "The App does not access your location, contacts, phone number, payment information or health data.",
      ],
    },
    {
      h: "3. Advertising (Google AdMob)",
      body: [
        "The App shows ads through Google AdMob: a banner at the bottom of the screen, rewarded ads you choose to watch (for example, to refill amount changes or hide the banner for a while), and interstitial ads that occasionally appear when you use certain features.",
        "The identifier used for personalized ads, and how consent works, **depends on the operating system.**",
        [
          "**iOS** — We ask through the App Tracking Transparency (ATT) prompt, and request ads tailored to your interests using the advertising identifier (IDFA) **only if you allow it**. If you don't, only non-personalized ads are requested and the IDFA is not accessed.",
          "**Android** — There is no equivalent of ATT, so the App doesn't ask separately and **requests personalized ads using the device's advertising ID (AAID) by default.** If you delete your advertising ID in device settings, only non-personalized ads are shown from then on (see section 8, Your choices).",
        ],
        "In every case, all features of the App work the same.",
        "Whether ads are personalized or not, Google may process the following to deliver ads and prevent fraudulent clicks:",
        [
          "IP address and the approximate location inferred from it (country or city level)",
          "Device information such as device type, OS version and language setting",
          "Ad interactions such as impressions and clicks",
          "Only when personalized ads apply, the advertising identifier (IDFA on iOS or advertising ID on Android) and interest information inferred from it",
        ],
        "On iOS the App also supports Apple's SKAdNetwork, a method Apple provides to measure ad performance without identifying individual users.",
      ],
    },
    {
      h: "4. Usage analytics (Google Analytics for Firebase)",
      body: [
        "To understand which features are actually used and improve the App, we use Google Analytics for Firebase. It processes the following:",
        [
          "**App instance ID** — a random value Firebase creates for each installation. It is not linked to you personally (such as your name or email) and disappears when you delete the App.",
          "**Device and environment information** — device type, OS version, language and country.",
          "**App usage events** — feature usage such as screen views, pay unit changes, comparisons run, widget use (iOS), and use of Wish and Paid to Slack. When you add a wish item, its price (the number only) is recorded; when a wish fills up, the work time it took to earn it; and when you finish a Paid to Slack session, its length in seconds.",
        ],
        "**The pay amount you enter is never sent.** Only the kind of setting is recorded, such as which unit you chose (yearly, monthly, daily or hourly), not the amount itself. Wish photos and item names are not sent either.",
      ],
    },
    {
      h: "5. Crash reports (Firebase Crashlytics)",
      body: [
        "If the App crashes, a crash report is sent to Firebase Crashlytics so we can find and fix the cause. A report includes where in the code the error occurred (stack trace), device type, OS version, memory and storage state, the time of the crash, and a random identifier Crashlytics creates for each installation.",
        "Crash reports do not include your pay, photos or item names.",
      ],
    },
    {
      h: "6. Third-party services",
      body: [
        "All of the above are provided by Google, and that information is processed under Google's policies.",
        [
          "**Google AdMob** — showing ads and measuring their performance",
          "**Google Analytics for Firebase** — usage analytics",
          "**Firebase Crashlytics** — crash reports",
        ],
        "For details, please see Google's [How Google uses information from sites or apps that use our services](https://policies.google.com/technologies/partner-sites). The App does not sell your information to third parties.",
      ],
    },
    {
      h: "7. Retention and deletion",
      body: [
        "Because your pay, settings and photos exist only on your device, they are deleted together with the App, and no copy is kept elsewhere. Information processed by Google for ads, analytics and crash reports is retained according to Google's policies.",
      ],
    },
    {
      h: "8. Your choices",
      body: [
        [
          "**iOS** — You can change whether the App may track you at any time in **Settings > Privacy & Security > Tracking**. If you turn it off, only non-personalized ads are shown from then on. You can also limit personalized ads under **Apple Advertising** in the same menu.",
          "**Android** — In **Settings > Security & privacy > Privacy > Ads** (or **Settings > Google > All services > Ads** on some devices), choose **Delete advertising ID**, and only non-personalized ads are shown from then on.",
          "You can turn off camera and photo access at any time in your device settings.",
          "Deleting the App removes the data stored on your device along with the app instance ID.",
          "For any other questions or requests, please contact the email address above.",
        ],
      ],
    },
    {
      h: "9. Children's privacy",
      body: [
        "The App is not directed at children under 14 and does not collect information that could personally identify users, including their age.",
      ],
    },
    {
      h: "10. Changes to this policy",
      body: [
        "This policy may be updated to reflect changes in law or in the App. If what the App processes changes, we will update this policy and its “Last updated” date before releasing the version that includes the change.",
        "This policy is available in several languages. If a translation differs from the Korean version, the Korean version prevails.",
      ],
    },
  ],
};

export default en;

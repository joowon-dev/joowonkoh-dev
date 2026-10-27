import Legal, { legalMetadata } from "../../Legal";

export const metadata = legalMetadata("ko", "privacy");

export default function YourMealMyMealPrivacyPage() {
  return <Legal lang="ko" kind="privacy" />;
}

import Legal, { legalMetadata } from "../../Legal";

export const metadata = legalMetadata("ko", "terms");

export default function YourMealMyMealTermsPage() {
  return <Legal lang="ko" kind="terms" />;
}

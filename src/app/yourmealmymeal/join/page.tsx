import { joinMetadata } from "./metadata";
import Join from "./Join";

export const metadata = joinMetadata("ko");

export default function YourMealMyMealJoinPage() {
  return <Join lang="ko" />;
}

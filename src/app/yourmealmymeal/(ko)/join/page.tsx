import { joinMetadata } from "../../join/metadata";
import Join from "../../join/Join";

export const metadata = joinMetadata("ko");

export default function YourMealMyMealJoinPage() {
  return <Join lang="ko" />;
}

import { redirect } from "next/navigation";

export default function PlayerSubscriptionRedirectPage() {
  redirect("/dashboard/player/my-subscription");
}

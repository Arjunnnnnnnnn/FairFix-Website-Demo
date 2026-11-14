import { createFileRoute } from "@tanstack/react-router";
import { UserSignup } from "@/components/auth/UserSignup";
import type { PlanId } from "@/data/pricing";

const PLAN_IDS: readonly PlanId[] = ["free", "plus", "apartment", "villa"];

/** /signup?plan=plus preselects the plan picked on the pricing cards. */
type Search = { plan?: PlanId | undefined };

export const Route = createFileRoute("/signup/")({
  validateSearch: (s: Record<string, unknown>): Search => ({ plan: PLAN_IDS.find((p) => p === s["plan"]) }),
  head: () => ({
    meta: [
      { title: "Sign up · FairFix" },
      { name: "description", content: "Create a FairFix account with your mobile number. AI diagnosis, fair prices and verified technicians in Qatar." },
      { property: "og:title", content: "Sign up · FairFix" },
      { property: "og:description", content: "Create a FairFix account with your mobile number." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const { plan } = Route.useSearch();
  return <UserSignup plan={plan} />;
}

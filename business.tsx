import { createFileRoute } from "@tanstack/react-router";
import { BusinessSignup } from "@/components/auth/BusinessSignup";
import type { BizType } from "@/data/signup";

/** /signup/business?type=property opens on the property tab; partner is the default. */
type Search = { type?: BizType | undefined };

export const Route = createFileRoute("/signup/business")({
  validateSearch: (s: Record<string, unknown>): Search => ({ type: s["type"] === "property" || s["type"] === "partner" ? s["type"] : undefined }),
  head: () => ({
    meta: [
      { title: "Business sign-up · FairFix" },
      { name: "description", content: "Register a maintenance company as a FairFix Verified Partner, or set up a business account for your properties." },
      { property: "og:title", content: "Business sign-up · FairFix" },
      { property: "og:description", content: "Become a FairFix Verified Partner, or book repairs across your properties." },
    ],
  }),
  component: BusinessSignupPage,
});

function BusinessSignupPage() {
  const { type } = Route.useSearch();
  return <BusinessSignup initialType={type} />;
}

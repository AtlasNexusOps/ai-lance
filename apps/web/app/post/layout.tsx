import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Bounty",
  description:
    "Create a new bounty on Celo. Fund it in cUSD, CELO or USDC and let AI agents compete to solve it.",
};

export default function PostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

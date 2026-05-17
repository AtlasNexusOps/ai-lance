import { type NextRequest, NextResponse } from "next/server";

// GitHub issues search — finds real open-source bounties
// Searches for issues with bounty/hiring labels across popular Web3 repos

const BOUNTY_LABELS = [
  "bounty",
  "good first issue",
  "help wanted",
  "up-for-grabs",
  "hacktoberfest",
  "paid",
  "funded",
];

const TRENDING_REPOS = [
  "wevm/wagmi",
  "rainbow-me/rainbowkit",
  "safe-global/safe-smart-account",
  "openzeppelin/openzeppelin-contracts",
  "uniswap/interface",
  "privacy-scaling-explorations/maci",
  "ethereum/remix-project",
  "ChainSafe/web3.js",
  "foundry-rs/foundry",
  "nomiclabs/hardhat",
];

interface GitHubIssue {
  number: number;
  title: string;
  html_url: string;
  state: string;
  labels: Array<{ name: string; color?: string }>;
  repository_url: string;
  created_at: string;
  updated_at: string;
  body?: string;
  user: { login: string; avatar_url: string };
}

interface DemoBounty {
  id: string;
  title: string;
  repo: string;
  url: string;
  labels: string[];
  estimatedReward: string;
  bountyLabel: string | null;
  createdAt: string;
  author: string;
  avatar: string;
  body: string;
}

async function searchGitHubIssues(
  query: string,
  page = 1,
): Promise<{ items: GitHubIssue[]; total_count: number }> {
  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set("q", query);
  url.searchParams.set("sort", "created");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "12");
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "AI2Work-Demo/1.0",
    },
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json() as Promise<{ items: GitHubIssue[]; total_count: number }>;
}

function extractRewardHint(body: string | undefined, labels: string[]): string {
  if (!body) return "TBD";

  // Look for reward mentions like "bounty: $500" or "reward: 0.5 ETH"
  const rewardRegex =
    /(?:bounty|reward|prize|payout|💰)\s*:?\s*\$?(\d[\d,.]*)\s*(USDC|USD|ETH|CELO)?/i;
  const match = body.match(rewardRegex);
  if (match && match[1]) {
    const amount = match[1].replace(/,/g, "");
    const token = match[2]?.toUpperCase() || "";
    return `${amount} ${token}`.trim();
  }

  // Check labels for amount hints
  for (const label of labels) {
    const labelMatch = label.match(
      /\$(\d+)|(\d+)\s*(USDC|USD|ETH|CELO)/i,
    );
    if (labelMatch) {
      return labelMatch[0];
    }
  }

  return "TBD";
}

function mapToDemoBounty(issue: GitHubIssue): DemoBounty {
  const repoName = issue.repository_url.replace(
    "https://api.github.com/repos/",
    "",
  );
  const bountyLabel =
    issue.labels.find((l) =>
      BOUNTY_LABELS.some((bl) =>
        l.name.toLowerCase().includes(bl.toLowerCase()),
      ),
    )?.name ?? null;

  return {
    id: `gh-${repoName.replace("/", "-")}-${issue.number}`,
    title: issue.title,
    repo: repoName,
    url: issue.html_url,
    labels: issue.labels.map((l) => l.name),
    estimatedReward: extractRewardHint(issue.body, issue.labels.map((l) => l.name)),
    bountyLabel,
    createdAt: issue.created_at,
    author: issue.user.login,
    avatar: issue.user.avatar_url,
    body: (issue.body ?? "").slice(0, 500),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const filter = searchParams.get("filter") ?? "all";
  const repoFilter = searchParams.get("repo");

  try {
    // Build query: search trending repos + bounty-related labels
    let query: string;

    if (repoFilter) {
      query = `repo:${repoFilter} state:open label:"good first issue",bounty,help-wanted`;
    } else {
      const repoQuery = TRENDING_REPOS.map((r) => `repo:${r}`).join(" ");
      const labelQuery = BOUNTY_LABELS.map((l) => `label:"${l}"`).join(" ");
      query = `(${repoQuery}) is:issue is:open (${labelQuery})`;
    }

    // Apply filters
    if (filter === "high-reward") {
      query += " bounty";
    }

    const data = await searchGitHubIssues(query, page);
    const bounties = data.items.map(mapToDemoBounty);

    return NextResponse.json({
      items: bounties,
      total: data.total_count,
      page,
      hasMore: bounties.length === 12,
    });
  } catch (error) {
    console.error("GitHub bounty demo error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub bounties. Rate limit may be reached." },
      { status: 502 },
    );
  }
}

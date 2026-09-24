import axios from "axios";
import { aboutMe, itemsToFetch, includedRepos } from "../constants";

export const scrollToSection = (id) => {
  const element = document.getElementById(id);
  const yOffset = -70;
  const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

  window.scrollTo({ top: y, behavior: "smooth" });
};

const parseOriginFromUrl = (url) => {
  /**
   * splits https://github.com/repos/org-name/repo-name/issues/25
   * into [ "github.com", "repos", "org-name", "repo-name", "issues", "25"]
   */
  const [, ...parts] = url.split(/https:\/\/|\//gm);
  const organization = parts[1];
  const repo = parts[2];
  /**
   * accessing a github profile or organization and adding a .png
   * at the end of the URL will return their logo/profile picture
   */
  const logoUrl = `https://github.com/${organization}.png`;

  return {
    organization,
    repo,
    logoUrl,
  };
};

export async function fetchContributionsWithRetry(maxRetries = 1) {
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      const result = await fetchContributions();
      return result;
    } catch (error) {
      attempts++;
      console.log(`Attempt ${attempts} failed: ${error.message}. Retrying...`);

      if (attempts > maxRetries) {
        console.log("Max retries reached. Returning last error.");
        return { error: error.message };
      }
    }
  }
}

function generatePRQuery(repos, username) {
  const repoFilters = repos.map((repo) => `repo:${repo}`).join(" ");
  const searchQuery = `is:pr author:${username} sort:created-desc ${repoFilters}`;

  return `
    query($after: String) {
      search(query: "${searchQuery}", type: ISSUE, first: ${itemsToFetch}, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          ... on PullRequest {
            id
            title
            state
            number
            createdAt
            url
            additions
            deletions
          }
        }
      }
    }
  `;
}

// The search API returns at most `itemsToFetch` results per request, so walk
// every page — otherwise repos with many PRs crowd out the rest.
const MAX_PAGES = 10;

export async function fetchContributions() {
  const token = import.meta.env.VITE_GH_TOKEN;
  if (!token) throw new Error("VITE_GH_TOKEN not set in .env");

  const query = generatePRQuery(includedRepos, aboutMe.githubUsername);
  const pullRequests = [];
  let after = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const response = await axios.post(
      "https://api.github.com/graphql",
      { query, variables: { after } },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.errors) {
      throw new Error(response.data.errors.map((e) => e.message).join("; "));
    }

    const { nodes, pageInfo } = response.data.data.search;
    pullRequests.push(...nodes);
    if (!pageInfo.hasNextPage) break;
    after = pageInfo.endCursor;
  }

  // Closed-but-unmerged PRs aren't contributions (and the UI would label them "open").
  return pullRequests
    .filter((item) => item.state !== "CLOSED")
    .map((item) => {
    const { organization, repo, logoUrl } = parseOriginFromUrl(item.url);
    return {
      id: item.id,
      organization,
      logoUrl,
      repo,
      status: item.state,
      title: item.title,
      link: item.url,
      number: item.number,
      date: new Date(item.createdAt).toLocaleDateString(),
      linesAdded: item.additions,
      linesDeleted: item.deletions,
    };
  });
}

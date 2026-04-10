/**
 * Next.js Fetch API allows us to heavily cache requests easily!
 * By using Next's extended `fetch` with caching options, we can adhere to the 30 req/min rule
 * and avoid spamming the HenrikDev API.
 */

// We define basic types for our responses so TypeScript can guide us.
export interface AccountData {
  puuid: string;
  region: string;
  account_level: number;
  name: string;
  tag: string;
  card?: {
    small: string;
    large: string;
    wide: string;
  };
}

export interface MmrData {
  currenttier: number;
  currenttierpatched: string;
  images: {
    small: string;
    large: string;
    triangle_down: string;
    triangle_up: string;
  };
  ranking_in_tier: number;
  mmr_change_to_last_game: number;
  elo: number;
}

export interface MatchData {
  metadata: {
    map: string;
    mode: string;
  };
  players: {
    all_players: Array<{
      name: string;
      tag: string;
      team: string;
      character: string;
      assets?: {
        agent?: { small: string; full: string; bust: string };
      };
      stats: {
        score: number;
        kills: number;
        deaths: number;
        assists: number;
        headshots: number;
        bodyshots: number;
        legshots: number;
      };
    }>;
  };
  teams?: {
    red: {
      has_won: boolean;
      rounds_won: number;
      rounds_lost: number;
    };
    blue: {
      has_won: boolean;
      rounds_won: number;
      rounds_lost: number;
    };
  };
}

/**
 * 1. Fetch Account Info (to automatically grab the region!)
 */
export async function getAccountInfo(name: string, tag: string): Promise<AccountData> {
  // We use Node's native fetch. Next.js extends this to cache it.
  // We MUST encode the name and tag to handle spaces (e.g. "FNC Flash")
  const url = `https://api.henrikdev.xyz/valorant/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
  
  // `next: { tags: [...] }` allows us to manually bust (clear) the cache later when the user clicks 'Hard Refresh'!
  // `revalidate: 86400` means it stays in the cache for 24 hours (86400 seconds).
  const res = await fetch(url, {
    headers: {
      "Authorization": process.env.HENRIK_API_KEY || "",
    },
    next: {
      tags: [`account-${name}-${tag}`],
      revalidate: 86400, // 24 hours cache for account info
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch account info. Make sure the Riot ID is correct!');
  }

  const data = await res.json();
  return data.data; // Henriks API wraps payload in a 'data' object
}

/**
 * 2. Fetch MMR Info (Rank, RR, Change)
 */
export async function getMMRInfo(region: string, name: string, tag: string): Promise<MmrData | null> {
  const url = `https://api.henrikdev.xyz/valorant/v1/mmr/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
  
  const res = await fetch(url, {
    headers: {
      "Authorization": process.env.HENRIK_API_KEY || "",
    },
    next: {
      tags: [`mmr-${name}-${tag}`],
      revalidate: 3600, // 1 hour cache
    }
  });

  if (!res.ok) {
    // Some accounts might not have MMR data if they haven't played competitive
    return null;
  }

  const data = await res.json();
  return data.data;
}

/**
 * 3. Fetch The Last 5 Matches
 */
export async function getLastMatches(region: string, name: string, tag: string): Promise<MatchData[]> {
  // We fetch a larger size (15) so we have enough matches to filter out the Competitive ones locally,
  // since the ?mode=competitive parameter on the API sometimes throws errors.
  const url = `https://api.henrikdev.xyz/valorant/v3/matches/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=15`;
  
  const res = await fetch(url, {
    headers: {
      "Authorization": process.env.HENRIK_API_KEY || "",
    },
    next: {
      tags: [`matches-${name}-${tag}`], // We use this tag to force-refresh when needed
      revalidate: 86400, // 24 hours cache by default
    }
  });

  if (!res.ok) {
    throw new Error('Failed to fetch matches. They might have a private profile.');
  }

  const data = await res.json();
  
  const competitiveMatches = data.data.filter((match: MatchData) => 
    match.metadata?.mode?.toLowerCase() === "competitive"
  );
  
  return competitiveMatches.slice(0, 5);
}

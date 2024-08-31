// src/utils/routeHelper.ts

import routes from '../config/routes';

export const suggestRoute = (query: string, limit = 3) => {
  const normalizedQuery = query.toLowerCase().trim();
  const matches: { route: typeof routes[number]; score: number }[] = [];

  for (const route of routes) {
    let score = 0;

    // Score the main route
    for (const keyword in route.keywords) {
      if (normalizedQuery.includes(keyword.toLowerCase())) {
        score += route.keywords[keyword];
      }
    }

    if (score > 0) {
      matches.push({ route, score });
    }

    // Score child routes
    if (route.children) {
      for (const childRoute of route.children) {
        let childScore = 0;

        for (const keyword in childRoute.keywords) {
          if (normalizedQuery.includes(keyword.toLowerCase())) {
            childScore += childRoute.keywords[keyword];
          }
        }

        if (childScore > 0) {
          matches.push({ route: childRoute, score: childScore });
        }
      }
    }
  }

  // Sort matches by score in descending order and limit to the top results
  matches.sort((a, b) => b.score - a.score);

  return matches.slice(0, limit).map((match) => match.route);
};

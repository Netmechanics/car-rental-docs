/**
 * Calculates a keyword relevance score between a query and a documentation chunk.
 * Returns a normalized score between 0.0 and 1.0.
 */
export function calculateKeywordScore(
  query: string,
  chunk: { text: string; pageTitle: string; section?: string }
): number {
  if (!query || !query.trim()) return 0;

  // Extract alphanumeric tokens (Greek, Latin letters, numbers, underscores, hyphens)
  const rawTokens = query.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) || [];
  // Filter out tiny stop words (< 3 chars)
  const tokens = rawTokens.filter((t) => t.length >= 3);
  if (tokens.length === 0) return 0;

  const textLower = chunk.text.toLowerCase();
  const titleLower = chunk.pageTitle.toLowerCase();
  const sectionLower = (chunk.section || "").toLowerCase();

  let matchedTokens = 0;
  let titleMatches = 0;

  // Check for technical identifier terms in the query (UPPER_CASE, camelCase, snake_case)
  const identifierTerms =
    query.match(/[A-Z][a-zA-Z0-9]+|[a-z]+[A-Z][a-zA-Z0-9]*|[A-Z0-9_]{3,}/g) || [];
  let exactIdentifierMatches = 0;

  for (const token of tokens) {
    const inText = textLower.includes(token);
    const inTitle = titleLower.includes(token);
    const inSection = sectionLower.includes(token);

    if (inText || inTitle || inSection) {
      matchedTokens++;
    }
    if (inTitle || inSection) {
      titleMatches++;
    }
  }

  for (const idTerm of identifierTerms) {
    if (chunk.text.includes(idTerm)) {
      exactIdentifierMatches++;
    }
  }

  // Ratio of query tokens present in the chunk
  const matchRatio = matchedTokens / tokens.length;

  // Bonus for appearing in page title or section heading (up to 0.3)
  const titleBonus =
    titleMatches > 0 ? Math.min(0.3, (titleMatches / tokens.length) * 0.3) : 0;

  // Bonus for exact technical identifiers (e.g. FREE_SALE, preparationTimeMinutes, GroupUnavailability) (up to 0.4)
  const idBonus =
    identifierTerms.length > 0
      ? Math.min(0.4, (exactIdentifierMatches / identifierTerms.length) * 0.4)
      : 0;

  return Math.min(1.0, matchRatio * 0.5 + titleBonus + idBonus);
}

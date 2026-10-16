import { describe, it, expect } from "vitest";
import { calculateKeywordScore } from "../src/indexing/keyword.js";

describe("calculateKeywordScore", () => {
  it("gives high score for exact technical identifier matches", () => {
    const chunk = {
      text: "Η λειτουργία FREE_SALE επιτρέπει απεριόριστες πωλήσεις.",
      pageTitle: "Ομάδες οχημάτων",
      section: "Availability Modes",
    };

    const score = calculateKeywordScore("FREE_SALE διαθεσιμότητα", chunk);
    expect(score).toBeGreaterThan(0.6);
  });

  it("boosts matches found in section or page title", () => {
    const chunkWithTitle = {
      text: "Περιγραφή για τις ρυθμίσεις.",
      pageTitle: "Ημερήσιο Πλάνο Ελεύθερης Πώλησης",
      section: "Stop Sale",
    };
    const chunkWithoutTitle = {
      text: "Περιγραφή για τις ρυθμίσεις.",
      pageTitle: "Άλλη σελίδα",
      section: "Γενικά",
    };

    const score1 = calculateKeywordScore("Stop Sale πλάνο", chunkWithTitle);
    const score2 = calculateKeywordScore("Stop Sale πλάνο", chunkWithoutTitle);
    expect(score1).toBeGreaterThan(score2);
  });

  it("returns 0 for unrelated queries", () => {
    const chunk = {
      text: "Εκπτώσεις και κουπόνια.",
      pageTitle: "Κουπόνια",
      section: "Κανόνες",
    };

    const score = calculateKeywordScore("ασφάλειες οχημάτων", chunk);
    expect(score).toBe(0);
  });

  it("handles empty or whitespace queries safely", () => {
    const chunk = {
      text: "Κείμενο",
      pageTitle: "Τίτλος",
    };

    expect(calculateKeywordScore("", chunk)).toBe(0);
    expect(calculateKeywordScore("   ", chunk)).toBe(0);
  });
});

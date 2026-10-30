import { Keyword } from "../effects/effect";

export class GameStatistics {
  private keywordsTriggered: Partial<Record<Keyword, number>> = {};

  triggerKeyword(keyword: Keyword, amount?: number) {
    this.keywordsTriggered[keyword] =
      (this.keywordsTriggered[keyword] ?? 0) + (amount ?? 1);
  }

  getKeywordTriggers(keyword: Keyword) {
    if (keyword === "Any") return this.getOverallKeywordsTriggeres();
    return this.keywordsTriggered[keyword] ?? 0;
  }

  private getOverallKeywordsTriggeres() {
    let total = 0;
    for (const [k, v] of Object.entries(this.keywordsTriggered)) {
      total += v;
    }
    return total;
  }
}

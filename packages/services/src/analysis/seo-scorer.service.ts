export class SeoScorerService {
  calculateScore(issues: { type: string; impact: number }[]): number {
    const deductions = issues.reduce((total, issue) => {
      const impact = issue.impact;
      if (issue.type === 'error') return total + impact * 5;
      if (issue.type === 'warning') return total + impact * 2;
      return total + impact;
    }, 0);

    return Math.max(0, Math.min(100, 100 - deductions));
  }

  getScoreLabel(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    if (score >= 30) return 'Poor';
    return 'Critical';
  }

  getScoreColor(score: number): string {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    if (score >= 50) return 'text-orange-500';
    if (score >= 30) return 'text-red-500';
    return 'text-red-700';
  }
}

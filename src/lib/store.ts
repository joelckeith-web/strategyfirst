import { AnalysisResult, AnalysisListItem } from './types/analysis';

// In-memory store for MVP - can be swapped for database later
const analysisStore = new Map<string, AnalysisResult>();

export function saveAnalysis(result: AnalysisResult): void {
  analysisStore.set(result.id, result);
}

export function getAnalysis(id: string): AnalysisResult | undefined {
  return analysisStore.get(id);
}

export function updateAnalysis(id: string, updates: Partial<AnalysisResult>): AnalysisResult | undefined {
  const existing = analysisStore.get(id);
  if (!existing) return undefined;

  const updated = { ...existing, ...updates };
  analysisStore.set(id, updated);
  return updated;
}

export function deleteAnalysis(id: string): boolean {
  return analysisStore.delete(id);
}

export function listAnalyses(): AnalysisListItem[] {
  const items: AnalysisListItem[] = [];

  analysisStore.forEach((result) => {
    items.push({
      id: result.id,
      status: result.status,
      businessName: result.client.name,
      location: `${result.client.address.city}, ${result.client.address.state}`,
      industry: result.client.industry,
      createdAt: result.createdAt,
      completedAt: result.completedAt,
    });
  });

  // Sort by created date, newest first
  return items.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getAnalysisCount(): number {
  return analysisStore.size;
}

export function clearAllAnalyses(): void {
  analysisStore.clear();
}

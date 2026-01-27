import { IntakeData } from './types/intake';

// In-memory store for intake data (MVP)
const intakeStore = new Map<string, IntakeData>();

export function saveIntake(data: IntakeData): void {
  if (!data.id) {
    throw new Error('Intake ID is required');
  }
  intakeStore.set(data.id, data);
}

export function getIntake(id: string): IntakeData | undefined {
  return intakeStore.get(id);
}

export function updateIntake(id: string, updates: Partial<IntakeData>): IntakeData | undefined {
  const existing = intakeStore.get(id);
  if (!existing) return undefined;

  const updated = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };
  intakeStore.set(id, updated);
  return updated;
}

export function deleteIntake(id: string): boolean {
  return intakeStore.delete(id);
}

export function listIntakes(): IntakeData[] {
  return Array.from(intakeStore.values()).sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
}

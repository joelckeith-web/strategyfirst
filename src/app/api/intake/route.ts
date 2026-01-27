import { NextRequest, NextResponse } from 'next/server';
import { IntakeData } from '@/lib/types/intake';
import { generateId } from '@/lib/utils/helpers';

// In-memory storage for intake data (MVP)
const intakeStore = new Map<string, IntakeData>();

export async function GET() {
  try {
    const intakes = Array.from(intakeStore.values());
    return NextResponse.json({ intakes });
  } catch (error) {
    console.error('Failed to list intakes:', error);
    return NextResponse.json(
      { error: 'Failed to list intakes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.businessContext?.businessName) {
      return NextResponse.json(
        { error: 'Business name is required' },
        { status: 400 }
      );
    }

    if (!body.businessContext?.websiteUrl) {
      return NextResponse.json(
        { error: 'Website URL is required' },
        { status: 400 }
      );
    }

    const id = generateId();
    const intakeData: IntakeData = {
      ...body,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: body.status || 'completed',
    };

    intakeStore.set(id, intakeData);

    return NextResponse.json({ id, status: 'saved' }, { status: 201 });
  } catch (error) {
    console.error('Failed to save intake:', error);
    return NextResponse.json(
      { error: 'Failed to save intake' },
      { status: 500 }
    );
  }
}

// Export for use by other modules
export function getIntake(id: string): IntakeData | undefined {
  return intakeStore.get(id);
}

export function saveIntake(data: IntakeData): void {
  intakeStore.set(data.id!, data);
}

import { BusinessInfo, GbpData, Review } from '@/lib/types';

export interface GbpAnalysisInput {
  client: BusinessInfo;
}

export interface GbpAnalysisOutput {
  gbp: GbpData;
}

function generateMockReviews(count: number): Review[] {
  const reviews: Review[] = [];
  const reviewTexts = [
    'Excellent service! Very professional and timely.',
    'Great experience overall. Would recommend.',
    'Good work but could improve communication.',
    'Amazing team, went above and beyond!',
    'Satisfied with the results. Fair pricing.',
  ];

  for (let i = 0; i < count; i++) {
    reviews.push({
      id: `review-${i}`,
      rating: Math.floor(Math.random() * 2) + 4,
      text: reviewTexts[i % reviewTexts.length],
      authorName: `Customer ${i + 1}`,
      date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      response: Math.random() > 0.5 ? {
        text: 'Thank you for your feedback!',
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      } : undefined,
    });
  }

  return reviews;
}

export async function gbpAnalysis(input: GbpAnalysisInput): Promise<GbpAnalysisOutput> {
  // TODO: Integrate with Google Business Profile API
  // Placeholder implementation returns mock data

  const mockGbp: GbpData = {
    profileCompleteness: Math.floor(Math.random() * 25) + 75,
    rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
    reviewCount: Math.floor(Math.random() * 200) + 50,
    recentReviews: generateMockReviews(5),
    photos: {
      count: Math.floor(Math.random() * 50) + 10,
      quality: Math.floor(Math.random() * 30) + 70,
    },
    posts: [
      {
        id: 'post-1',
        type: 'update',
        content: 'Check out our latest services!',
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        engagement: { views: 150, clicks: 23 },
      },
      {
        id: 'post-2',
        type: 'offer',
        title: 'Spring Special',
        content: '20% off all services this month!',
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        engagement: { views: 320, clicks: 45 },
      },
    ],
    qAndA: [
      {
        id: 'qa-1',
        question: 'Do you offer free estimates?',
        questionerName: 'Local Customer',
        questionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        answers: [
          {
            text: 'Yes, we offer free estimates for all services!',
            authorName: input.client.name,
            isOwner: true,
            date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
            upvotes: 5,
          },
        ],
      },
    ],
    attributes: ['Wheelchair accessible', 'Free WiFi', 'Accepts credit cards'],
    serviceAreas: input.client.serviceArea,
    businessHours: [
      { day: 'Monday', open: '8:00 AM', close: '6:00 PM', isClosed: false },
      { day: 'Tuesday', open: '8:00 AM', close: '6:00 PM', isClosed: false },
      { day: 'Wednesday', open: '8:00 AM', close: '6:00 PM', isClosed: false },
      { day: 'Thursday', open: '8:00 AM', close: '6:00 PM', isClosed: false },
      { day: 'Friday', open: '8:00 AM', close: '6:00 PM', isClosed: false },
      { day: 'Saturday', open: '9:00 AM', close: '4:00 PM', isClosed: false },
      { day: 'Sunday', open: '', close: '', isClosed: true },
    ],
    verified: true,
  };

  return { gbp: mockGbp };
}

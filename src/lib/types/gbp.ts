export interface Review {
  id: string;
  rating: number;
  text: string;
  authorName: string;
  date: Date;
  response?: {
    text: string;
    date: Date;
  };
}

export interface GbpPost {
  id: string;
  type: 'update' | 'offer' | 'event' | 'product';
  title?: string;
  content: string;
  imageUrl?: string;
  publishedAt: Date;
  engagement: {
    views: number;
    clicks: number;
  };
}

export interface QAndA {
  id: string;
  question: string;
  questionerName: string;
  questionDate: Date;
  answers: {
    text: string;
    authorName: string;
    isOwner: boolean;
    date: Date;
    upvotes: number;
  }[];
}

export interface GbpData {
  profileCompleteness: number;
  rating: number;
  reviewCount: number;
  recentReviews: Review[];
  photos: { count: number; quality: number };
  posts: GbpPost[];
  qAndA: QAndA[];
  attributes: string[];
  serviceAreas: string[];
  businessHours: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  verified: boolean;
}

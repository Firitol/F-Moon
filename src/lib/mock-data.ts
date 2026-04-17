
import { PlaceHolderImages } from '@/lib/placeholder-images';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'NormalUser' | 'BusinessOwner';
  avatar: string;
  bio?: string;
  status: 'active' | 'suspended';
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  description: string;
  locationDescription: string;
  contactPhone: string;
  isVerified: boolean;
  isPromoted: boolean;
  status: 'active' | 'pending' | 'suspended';
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  isPromoted: boolean;
  status: 'active' | 'moderated';
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  userName: string;
  userAvatar: string;
}

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Abebe Bikila',
    email: 'abebe@example.com',
    role: 'NormalUser',
    avatar: PlaceHolderImages.find(img => img.id === 'user-avatar-1')?.imageUrl || '',
    bio: 'Avid explorer of Ethiopian culture.',
    status: 'active'
  },
  {
    id: 'u2',
    name: 'Sara Kedebe',
    email: 'sara@hotel.com',
    role: 'BusinessOwner',
    avatar: PlaceHolderImages.find(img => img.id === 'user-avatar-2')?.imageUrl || '',
    bio: 'Owner of Addis Luxury Suites.',
    status: 'active'
  }
];

export const MOCK_BUSINESSES: Business[] = [
  {
    id: 'b1',
    ownerId: 'u2',
    name: 'Addis Luxury Suites',
    category: 'Hotel',
    description: 'The finest stay in the heart of Addis Ababa with panoramic views.',
    locationDescription: 'Bole, Addis Ababa',
    contactPhone: '+251 911 223344',
    isVerified: true,
    isPromoted: true,
    status: 'active',
    createdAt: Date.now() - 1000000
  },
  {
    id: 'b2',
    ownerId: 'u2',
    name: 'Habesha Traditional Restaurant',
    category: 'Restaurant',
    description: 'Authentic Ethiopian dining experience with live traditional music.',
    locationDescription: 'Piazza, Addis Ababa',
    contactPhone: '+251 922 556677',
    isVerified: true,
    isPromoted: false,
    status: 'active',
    createdAt: Date.now() - 2000000
  }
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'p1',
    authorId: 'u1',
    userName: 'Abebe Bikila',
    userAvatar: MOCK_USERS[0].avatar,
    content: 'Just had the best coffee in Addis! Nothing beats the traditional ceremony. ☕🇪🇹',
    imageUrl: PlaceHolderImages.find(img => img.id === 'ethiopian-coffee')?.imageUrl,
    isPromoted: false,
    status: 'active',
    createdAt: '2 hours ago',
    likesCount: 42,
    commentsCount: 5
  },
  {
    id: 'p2',
    authorId: 'u2',
    userName: 'Addis Luxury Suites',
    userAvatar: MOCK_USERS[1].avatar,
    content: 'Book your weekend getaway now and enjoy 20% off! Experience luxury like never before. ✨',
    imageUrl: PlaceHolderImages.find(img => img.id === 'addis-ababa')?.imageUrl,
    isPromoted: true,
    status: 'active',
    createdAt: '4 hours ago',
    likesCount: 128,
    commentsCount: 12
  }
];

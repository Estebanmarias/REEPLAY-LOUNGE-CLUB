import { LucideIcon } from 'lucide-react';

export interface FeatureItem {
  title: string;
  description: string;
  icon: LucideIcon;
}

export interface EventItem {
  title: string;
  description: string;
  tag: string;
  day: string;
}

export interface ReviewItem {
  id: number;
  user: string;
  rating: number;
  text: string;
}

export interface SocialLink {
  icon: LucideIcon;
  href: string;
  label: string;
}
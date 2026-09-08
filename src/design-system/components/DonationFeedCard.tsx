import React from 'react';
import { ItemCard, BaseItemData } from './ItemCard.tsx';

export interface DonationFeedItem extends BaseItemData {
  id: string;
  title: string;
  description: string;
  condition: string;
  timeAgo: string;
  imageUrl: string;
  donorName?: string;
  location?: string;
  isDonated?: boolean;
}

export interface DonationFeedCardProps {
  item: DonationFeedItem;
  onClick?: (id: string) => void;
  className?: string;
}

/**
 * Signature Feed List Card directly matching the Figma design:
 * Refactored to delegate to unified ItemCard with 'feed' variant.
 */
export const DonationFeedCard: React.FC<DonationFeedCardProps> = ({
  item,
  onClick,
  className,
}) => {
  return (
    <ItemCard
      item={item}
      variant="feed"
      onClick={(it) => onClick?.(it.id)}
      className={className}
    />
  );
};


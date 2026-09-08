import React from 'react';
import { ExploreItem } from '../../data/exploreData.ts';
import { ItemCard } from './ItemCard.tsx';

export interface ExploreItemCardProps {
  item: ExploreItem;
  onClick?: (item: ExploreItem) => void;
  className?: string;
  viewMode?: 'grid' | 'list';
}

export const ExploreItemCard: React.FC<ExploreItemCardProps> = ({
  item,
  onClick,
  className,
  viewMode = 'grid',
}) => {
  return (
    <ItemCard
      item={item}
      variant={viewMode === 'list' ? 'list' : 'grid'}
      onClick={onClick}
      className={className}
    />
  );
};


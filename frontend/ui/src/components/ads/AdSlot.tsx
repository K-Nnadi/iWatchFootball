import { Link } from 'react-router-dom';
import { useShowAds } from '../../hooks/useShowAds';
import classes from './AdSlot.module.css';

export type AdPlacement = 'rail-left' | 'rail-right' | 'banner';

interface AdSlotProps {
  placement: AdPlacement;
  /** Ad network unit id — wire up when integrating a provider */
  unitId?: string;
  className?: string;
}

const PLACEMENT_COPY: Record<AdPlacement, string> = {
  'rail-left': 'Left rail',
  'rail-right': 'Right rail',
  banner: 'Banner',
};

export function AdSlot({ placement, unitId, className = '' }: AdSlotProps) {
  const showAds = useShowAds();

  if (!showAds) {
    return null;
  }

  const isRail = placement === 'rail-left' || placement === 'rail-right';

  return (
    <aside
      className={`${classes.adSlot} ${isRail ? classes.adSlotRail : classes.adSlotBanner} ${className}`}
      data-ad-placement={placement}
      data-ad-unit={unitId}
      aria-label="Advertisement"
    >
      <span className={classes.adLabel}>Ad</span>
      <span className={classes.adPlaceholder}>
        {PLACEMENT_COPY[placement]} placement
        {unitId ? ` · ${unitId}` : ''}
      </span>
      <Link to="/logs" className={classes.adUpsell}>
        Go ad-free with Premium
      </Link>
    </aside>
  );
}

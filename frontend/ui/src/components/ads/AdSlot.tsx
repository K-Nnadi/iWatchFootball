import { Link } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useShowAds } from '../../hooks/useShowAds';
import classes from './AdSlot.module.css';

export type AdPlacement = 'rail-left' | 'rail-right' | 'banner';

interface AdSlotProps {
  placement: AdPlacement;
  /** Ad network unit id — wire up when integrating a provider */
  unitId?: string;
  className?: string;
}

export function AdSlot({ placement, unitId, className = '' }: AdSlotProps) {
  const showAds = useShowAds();
  const { t } = useTranslation();

  if (!showAds) {
    return null;
  }

  const isRail = placement === 'rail-left' || placement === 'rail-right';
  const placementCopy =
    placement === 'rail-left'
      ? t('ads.railLeft')
      : placement === 'rail-right'
        ? t('ads.railRight')
        : t('ads.banner');

  return (
    <aside
      className={`${classes.adSlot} ${isRail ? classes.adSlotRail : classes.adSlotBanner} ${className}`}
      data-ad-placement={placement}
      data-ad-unit={unitId}
      aria-label={t('ads.label')}
    >
      <span className={classes.adLabel}>{t('ads.label')}</span>
      <span className={classes.adPlaceholder}>
        {placementCopy}
        {unitId ? ` · ${unitId}` : ''}
      </span>
      <Link to="/logs" className={classes.adUpsell}>
        {t('ads.goAdFree')}
      </Link>
    </aside>
  );
}

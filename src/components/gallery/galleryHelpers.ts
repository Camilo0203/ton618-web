import { Monitor, Shield, Zap, BarChart3 } from 'lucide-react';
import { config, getPublicDashboardUrl } from '../../config';

export type ScreenshotType = 'overview' | 'moderation' | 'automation' | 'analytics';

export function getGradient(type: string) {
  switch (type) {
    case 'overview':
      return 'from-indigo-500/20 via-purple-500/10 to-transparent';
    case 'moderation':
      return 'from-red-500/20 via-orange-500/10 to-transparent';
    case 'automation':
      return 'from-cyan-500/20 via-blue-500/10 to-transparent';
    case 'analytics':
      return 'from-emerald-500/20 via-teal-500/10 to-transparent';
    default:
      return 'from-indigo-500/20 via-purple-500/10 to-transparent';
  }
}

export function getIcon(type: string) {
  switch (type) {
    case 'overview':
      return Monitor;
    case 'moderation':
      return Shield;
    case 'automation':
      return Zap;
    case 'analytics':
      return BarChart3;
    default:
      return Monitor;
  }
}

export function getCTALinks(type: string) {
  const publicDashboardUrl = getPublicDashboardUrl();

  switch (type) {
    case 'overview':
      return { primary: publicDashboardUrl, secondary: config.docsUrl || '#docs' };
    case 'moderation':
      return { primary: '#features', secondary: config.docsUrl || '#docs' };
    case 'automation':
      return { primary: '#features', secondary: config.docsUrl || '#docs' };
    case 'analytics':
      return { primary: '#stats', secondary: config.docsUrl || '#docs' };
    default:
      return { primary: publicDashboardUrl, secondary: config.docsUrl || '#docs' };
  }
}

import { BlogCategory, InfoCategory } from '@/types';
import { Colors } from '@/constants/Colors';

export function formatDistanceToNow(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' });
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function blogCategoryLabel(cat: BlogCategory): string {
  const labels: Record<BlogCategory, string> = {
    'school-life': 'School Life',
    'principal-update': "Principal's Update",
    events: 'Events',
    achievements: 'Achievements',
    general: 'General',
  };
  return labels[cat] ?? cat;
}

export function blogCategoryColor(cat: BlogCategory): { color: string; bg: string } {
  const map: Record<BlogCategory, { color: string; bg: string }> = {
    'school-life': { color: Colors.categorySchoolLife, bg: '#EFF6FF' },
    'principal-update': { color: Colors.categoryPrincipal, bg: '#F5F3FF' },
    events: { color: Colors.categoryEvents, bg: '#FFFBEB' },
    achievements: { color: Colors.categoryAchievements, bg: '#ECFDF5' },
    general: { color: Colors.categoryGeneral, bg: Colors.border },
  };
  return map[cat] ?? { color: Colors.textSecondary, bg: Colors.border };
}

export function infoCategoryLabel(cat: InfoCategory): string {
  const labels: Record<InfoCategory, string> = {
    general: 'General',
    contact: 'Contact',
    schedules: 'Schedules',
    policies: 'Policies',
    facilities: 'Facilities',
    links: 'Links',
  };
  return labels[cat] ?? cat;
}

export function infoCategoryIcon(cat: InfoCategory): string {
  const icons: Record<InfoCategory, string> = {
    general: '📋',
    contact: '📞',
    schedules: '🕐',
    policies: '📜',
    facilities: '🏫',
    links: '🔗',
  };
  return icons[cat] ?? '📄';
}

export function roleLabel(role: string): string {
  if (role === 'admin') return 'Admin';
  if (role === 'teacher') return 'Teacher';
  return 'Parent';
}

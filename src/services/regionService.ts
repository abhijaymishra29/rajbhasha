import { RegionOption } from '../data/defaultData';

export const DEFAULT_10_REGIONS: RegionOption[] = [
  { id: 'patna', nameHindi: 'पटना (Patna)', nameEnglish: 'Patna', officeType: 'क्षेत्रीय कार्यालय पटना' },
  { id: 'muzaffarpur', nameHindi: 'मुजफ्फरपुर (Muzaffarpur)', nameEnglish: 'Muzaffarpur', officeType: 'क्षेत्रीय कार्यालय मुजफ्फरपुर' },
  { id: 'darbhanga', nameHindi: 'दरभंगा (Darbhanga)', nameEnglish: 'Darbhanga', officeType: 'क्षेत्रीय कार्यालय दरभंगा' },
  { id: 'gaya', nameHindi: 'गया (Gaya)', nameEnglish: 'Gaya', officeType: 'क्षेत्रीय कार्यालय गया' },
  { id: 'katihar', nameHindi: 'कटिहार (Katihar)', nameEnglish: 'Katihar', officeType: 'क्षेत्रीय कार्यालय कटिहार' },
  { id: 'purnia', nameHindi: 'पूर्णिया (Purnia)', nameEnglish: 'Purnia', officeType: 'क्षेत्रीय कार्यालय पूर्णिया' },
  { id: 'siwan', nameHindi: 'सीवान (Siwan)', nameEnglish: 'Siwan', officeType: 'क्षेत्रीय कार्यालय सीवान' },
  { id: 'ranchi', nameHindi: 'रांची (Ranchi)', nameEnglish: 'Ranchi', officeType: 'क्षेत्रीय कार्यालय रांची' },
  { id: 'dhanbad', nameHindi: 'धनबाद (Dhanbad)', nameEnglish: 'Dhanbad', officeType: 'क्षेत्रीय कार्यालय धनबाद' },
  { id: 'motihari', nameHindi: 'मोतिहारी (Motihari)', nameEnglish: 'Motihari', officeType: 'क्षेत्रीय कार्यालय मोतिहारी' },
];

const STORAGE_KEY = 'rajbhasha_regions_list';

export function getStoredRegions(): RegionOption[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading regions from storage:', err);
  }
  return DEFAULT_10_REGIONS;
}

export function saveRegions(regions: RegionOption[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(regions));
  } catch (err) {
    console.error('Error saving regions to storage:', err);
  }
}

export function addRegion(newRegion: {
  id?: string;
  nameHindi: string;
  nameEnglish: string;
  officeType?: string;
}): { success: boolean; error?: string; regions: RegionOption[] } {
  const current = getStoredRegions();
  const cleanId = (newRegion.id || newRegion.nameEnglish)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_');

  if (!newRegion.nameHindi.trim() || !newRegion.nameEnglish.trim()) {
    return { success: false, error: 'कृपया क्षेत्र का हिंदी एवं अंग्रेजी नाम दर्ज करें।', regions: current };
  }

  const exists = current.some((r) => r.id === cleanId || r.nameEnglish.toLowerCase() === newRegion.nameEnglish.trim().toLowerCase());
  if (exists) {
    return { success: false, error: 'यह क्षेत्र पहले से सूची में मौजूद है।', regions: current };
  }

  const created: RegionOption = {
    id: cleanId,
    nameHindi: `${newRegion.nameHindi.trim()} (${newRegion.nameEnglish.trim()})`,
    nameEnglish: newRegion.nameEnglish.trim(),
    officeType: newRegion.officeType?.trim() || `क्षेत्रीय कार्यालय ${newRegion.nameHindi.trim()}`,
  };

  const updated = [...current, created];
  saveRegions(updated);
  return { success: true, regions: updated };
}

export function deleteRegion(regionId: string): { success: boolean; regions: RegionOption[] } {
  const current = getStoredRegions();
  const updated = current.filter((r) => r.id !== regionId);
  saveRegions(updated);
  return { success: true, regions: updated };
}

export function resetRegions(): RegionOption[] {
  saveRegions(DEFAULT_10_REGIONS);
  return DEFAULT_10_REGIONS;
}

import { supabase } from './supabase';
import { getSeasons } from './queries';

export async function initUserData() {
  const seasons = await getSeasons();

  let seasonId: number;
  if (seasons.length === 0) {
    const currentYear = new Date().getFullYear();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('seasons').upsert({ id: currentYear, user_id: user.id, label: `Saison ${currentYear}`, active: 1 });
    seasonId = currentYear;
  } else {
    const active = seasons.find(s => s.active === 1) ?? seasons[0];
    seasonId = active.id;
    if (!seasons.find(s => s.active === 1)) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('seasons').update({ active: 1 }).match({ user_id: user.id, id: seasonId });
      }
    }
  }
}

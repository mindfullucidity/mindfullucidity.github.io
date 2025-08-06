import { useSupabaseClient } from '#imports'

export const useHome = () => {
  const supabase = useSupabaseClient()

  const getDreamStreakInfo = async () => {
    try {
      const { data, error } = await supabase.rpc('get_dream_streak_info')
      if (error) {
        console.error('Error fetching dream streak info:', error)
        return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
      }
      return data as { streak_length: number, last_entry_date: string | null, days_since_last_entry: number | null, has_logged_today: boolean }
    } catch (err) {
      console.error('Exception fetching dream streak info:', err)
      return { streak_length: 0, last_entry_date: null, days_since_last_entry: null, has_logged_today: false }
    }
  }

  return {
    getDreamStreakInfo,
  }
}

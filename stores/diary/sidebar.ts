import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { SidebarItem } from '@/components/diary/sidebar';
import { useSupabaseClient } from '#imports';
import { parseISO, isSameDay, subDays, addDays, parse } from 'date-fns';

export const useSidebarStore = defineStore('diary-sidebar', () => {
  const items = ref<SidebarItem[]>([]);
  const isLoaded = ref(false);
  const searchQuery = ref('');
  const supabase = useSupabaseClient();

  async function get_all() {
    if (isLoaded.value) {
      // Data already loaded, no need to fetch again unless explicitly refreshed
      return;
    }
    const { data, error } = await supabase
      .from('journals')
      .select('journal_id, title, date, description')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error loading journal entries overview:', error.message);
      return;
    }
    items.value = data || [];
    isLoaded.value = true;
  }

  const filteredItems = computed(() => {
    if (!items.value) {
      return [];
    }

    let filtered = items.value;
    const query = searchQuery.value.toLowerCase().trim();

    if (query) {
      const today = new Date();
      const yesterday = subDays(today, 1);
      const tomorrow = addDays(today, 1);

      let parsedDate: Date | null = null;

      // --- Existing Date Parsing Logic ---
      // Try to parse as a specific date (e.g., YYYY-MM-DD, MM/DD/YYYY)
      if (!isNaN(Date.parse(query))) {
        parsedDate = new Date(query);
      }

      // Try to parse common date formats
      const dateFormats = ['yyyy-MM-dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'MMM dd, yyyy', 'MMMM dd, yyyy'];
      for (const formatStr of dateFormats) {
        try {
          const parsed = parse(query, formatStr, new Date());
          if (!isNaN(parsed.getTime())) {
            parsedDate = parsed;
            break;
          }
        } catch (e) {
          // Ignore parsing errors, try next format
        }
      }

      // Handle keywords
      if (query.includes('today')) {
        parsedDate = today;
      } else if (query.includes('yesterday') || query.includes('last night')) {
        parsedDate = yesterday;
      } else if (query.includes('tomorrow')) {
        parsedDate = tomorrow;
      }

      // --- Month Name Parsing Logic ---
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ];
      const shortMonthNames = [
        'jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'
      ];

      let matchingMonthIndices: number[] = [];
      for (let i = 0; i < monthNames.length; i++) {
        if (monthNames[i].includes(query) || shortMonthNames[i].includes(query)) {
          matchingMonthIndices.push(i);
        }
      }

      if (matchingMonthIndices.length > 0) {
        const monthFilteredEntries = items.value.filter((entry: SidebarItem) => {
          const entryDate = parseISO(entry.date);
          const entryMonth = entryDate.getMonth(); // 0-indexed

          if (matchingMonthIndices.includes(entryMonth)) {
            const yearMatch = query.match(/\b(\d{4})\b/);
            if (yearMatch) {
              const searchYear = parseInt(yearMatch[1], 10);
              return entryDate.getFullYear() === searchYear;
            }
            return true;
          }
          return false;
        });

        if (monthFilteredEntries.length > 0) {
          return monthFilteredEntries.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            if (dateA < dateB) return 1;
            if (dateB < dateA) return -1;
            return b.journal_id - a.journal_id;
          });
        }
      }

      // --- Main Filtering Logic (now also a fallback for month search with no results) ---
      filtered = items.value.filter((entry: SidebarItem) => {
        const entryDate = parseISO(entry.date);

        // If a specific date was parsed from the query, prioritize date matching
        if (parsedDate && isSameDay(entryDate, parsedDate)) {
          const nonDateQuery = query.replace(/today|yesterday|last night|tomorrow|\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{4}|\w{3} \d{2}, \d{4}|\w+ \d{2}, \d{4}/g, '').trim();
          if (nonDateQuery) {
            const regex = new RegExp(nonDateQuery, 'i');
            return regex.test(entry.title) || regex.test(entry.description);
          }
          return true;
        }

        // Fallback to title and description search if no date was parsed or matched
        const regex = new RegExp(query, 'i');
        const matches = regex.test(entry.title) || regex.test(entry.description);

        return matches;
      });
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return 1;
      if (dateB < dateA) return -1;
      return b.journal_id - a.journal_id;
    });
  });

  function addItem(item: SidebarItem) {
    items.value.push(item);
    items.value.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA < dateB) return 1; // Sort descending by date
      if (dateB < dateA) return -1;
      return b.journal_id - a.journal_id; // Then descending by ID
    });
  }

  function deleteItem(journalId: number) {
    items.value = items.value.filter(item => item.journal_id !== journalId);
  }

  return {
    items,
    isLoaded,
    searchQuery,
    get_all,
    filteredItems,
    addItem,
    deleteItem,
  };
});

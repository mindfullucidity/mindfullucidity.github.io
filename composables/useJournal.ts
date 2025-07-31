import { ref } from 'vue';

const entries = ref([]);
const selectedEntry = ref(null);

const loadEntries = () => {
  entries.value = [
    { id: 1, title: 'My First Dream', date: '2025-07-31', content: 'The clouds were pink and orange, and the city below was made of crystal. I could feel the wind on my face as I soared through the air. It was an incredible feeling of freedom.' },
    { id: 2, title: 'Lucid Adventure', date: '2025-07-30', content: 'I realized I was dreaming when I saw a clock with hands moving backwards. I decided to test my abilities and tried to fly. It took a few tries, but I eventually lifted off the ground and flew towards the moon.' },
    { id: 3, title: 'Strange Encounter', date: '2025-07-29', content: 'The squirrel had a tiny hat and a monocle. He offered me a glowing acorn and told me it would grant me one wish. I wished for the ability to lucid dream whenever I wanted.' },
  ];
};

const selectEntry = (entry) => {
  selectedEntry.value = entry;
};

export const useJournal = () => {
  return {
    entries,
    selectedEntry,
    loadEntries,
    selectEntry,
  };
};

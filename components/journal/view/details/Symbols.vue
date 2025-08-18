<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import { Plus, Sparkles, Activity, PawPrint, Users, Box, MapPin, CloudSun, HelpCircle, BadgePlus } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSymbols } from '@/composables/useSymbols';
import type { Symbol } from '@/composables/useSymbols';

const props = defineProps({
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const { getSymbols } = useSymbols();
const showAddSymbolDialog = ref(false);
const showCreateSymbolCard = ref(false);
const searchTerm = ref('');
const selectedSymbols = ref<Symbol[]>([]);

const allSymbols = ref<any[]>([]); // To store all fetched symbols

onMounted(async () => {
  allSymbols.value = await getSymbols();
});

const categoryIcons: Record<string, any> = {
  'Actions & Events': Activity,
  'Animals & Creatures': PawPrint,
  'Characters & People': Users,
  'Objects & Items': Box,
  'Places & Settings': MapPin,
  'Colors & Weather': CloudSun,
  'Other': HelpCircle,
};

const filteredSymbols = computed(() => {
  if (!searchTerm.value) {
    const grouped = groupSymbolsByCategory(allSymbols.value);
    return grouped;
  }

  const lowerCaseSearchTerm = searchTerm.value.toLowerCase();
  const filtered = allSymbols.value.filter(symbol => {
    return symbol.name.toLowerCase().includes(lowerCaseSearchTerm) ||
           symbol.category.toLowerCase().includes(lowerCaseSearchTerm);
  });
  const grouped = groupSymbolsByCategory(filtered);
  return grouped;
});

const groupedSelectedSymbols = computed(() => {
  const grouped: { [key: string]: Symbol[] } = {};
  selectedSymbols.value.forEach(symbol => {
    if (!grouped[symbol.category]) {
      grouped[symbol.category] = [];
    }
    grouped[symbol.category].push(symbol);
  });

  // Sort categories based on categoryIcons order
  const sortedGrouped: { [key: string]: Symbol[] } = {};
  Object.keys(categoryIcons).forEach(category => {
    if (grouped[category]) {
      sortedGrouped[category] = grouped[category];
    }
  });
  return sortedGrouped;
});

const groupSymbolsByCategory = (symbols: any[]) => {
  const grouped: { [key: string]: any[] } = {};
  symbols.forEach(symbol => {
    if (!grouped[symbol.category]) {
      grouped[symbol.category] = [];
    }
    grouped[symbol.category].push(symbol);
  });
  return grouped;
};

const addSymbol = () => {
  showCreateSymbolCard.value = false;
  showAddSymbolDialog.value = true;
};

const selectSymbol = (symbol: Symbol) => {
  const index = selectedSymbols.value.findIndex(s => s.symbol_id === symbol.symbol_id);
  if (index === -1) {
    selectedSymbols.value.push(symbol);
    toast.success(`Added symbol: ${symbol.name}`);
  } else {
    selectedSymbols.value.splice(index, 1);
    toast.info(`Removed symbol: ${symbol.name}`);
  }
  showAddSymbolDialog.value = false;
};

const newSymbolCategory = ref('');
const newSymbolName = ref('');
const newSymbolDescription = ref('');

const handleSaveNewSymbol = () => {
  if (!newSymbolCategory.value) {
    toast.error('Please specify a category for the new symbol.');
    return;
  }
  if (!newSymbolName.value.trim()) {
    toast.error('Please specify a name for the new symbol.');
    return;
  }
  // For now, just a toast. Later, this will interact with Supabase.
  toast.success(`New Symbol: ${newSymbolName.value} (${newSymbolCategory.value}) saved!`);
  // Reset form
  newSymbolCategory.value = '';
  newSymbolName.value = '';
  newSymbolDescription.value = '';
  showCreateSymbolCard.value = false;
};

const handleCancelNewSymbol = () => {
  // Reset form
  newSymbolCategory.value = '';
  newSymbolName.value = '';
  newSymbolDescription.value = '';
  showCreateSymbolCard.value = false;
};
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">Symbols</h2>
    </div>

    <div v-if="Object.keys(groupedSelectedSymbols).length > 0" class="space-y-4 border p-4 rounded-md bg-card">
      <div v-for="(symbolsInCat, category) in groupedSelectedSymbols" :key="category">
        <h3 class="text-lg font-semibold mb-2 flex items-center">
          <component :is="categoryIcons[category]" class="w-5 h-5 mr-2" />
          {{ category }}
        </h3>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="symbol in symbolsInCat"
            :key="symbol.symbol_id"
            variant="outline"
            @click="selectSymbol(symbol)"
          >
            {{ symbol.name }}
          </Button>
        </div>
      </div>
    </div>

<Card v-if="showCreateSymbolCard" class="bg-transparent text-card-foreground flex flex-col gap-6 rounded-xl shadow-sm border-dashed border-2 border-muted-foreground/30 p-4">
  <CardHeader class="space-y-3 p-0">
    <div class="flex items-center gap-2">
      <BadgePlus class="h-4 w-4 text-purple-200" aria-hidden="true" />
      <span class="text-sm font-medium text-purple-200">New Custom Symbol</span>
    </div>
    <div class="flex flex-col gap-2">
      <Label for="new-symbol-category">Category:</Label>
      <Select v-model="newSymbolCategory">
        <SelectTrigger id="new-symbol-category">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="(icon, category) in categoryIcons" :key="category" :value="category">
            {{ category }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div class="flex flex-col gap-2">
      <Label for="new-symbol-name">Name:</Label>
      <Input id="new-symbol-name" v-model="newSymbolName" placeholder="Symbol Name" />
    </div>
    <div class="flex flex-col gap-2">
      <Label for="new-symbol-description">Description:</Label>
      <Textarea id="new-symbol-description" v-model="newSymbolDescription" placeholder="Describe the symbol (optional, useful for AI detection)" />
    </div>
    <div class="flex flex-wrap gap-2 mt-4">
      <Button variant="ghost" class="border h-8 w-full sm:w-auto" @click="handleSaveNewSymbol">Save Symbol</Button>
      <Button variant="ghost" class="h-8 w-full sm:w-auto" @click="handleCancelNewSymbol">Cancel</Button>
    </div>
  </CardHeader>
</Card>

    <div class="flex flex-col sm:flex-row gap-2 justify-center">
      <Button
        variant="ghost"
        class="border w-full sm:w-auto text-blue-200"
        @click="addSymbol"
        :disabled="props.isLoadingEntry || props.isEnhancingDetails"
      >
        <Plus class="w-4 h-4" /> Add Symbol
      </Button>
      <Button
        variant="ghost"
        class="border w-full sm:w-auto text-green-200"
        @click="showCreateSymbolCard = true"
        :disabled="props.isLoadingEntry || props.isEnhancingDetails"
      >
        <BadgePlus class="w-4 h-4" /> Create Symbol
      </Button>
      <Button
        variant="ghost"
        class="border w-full sm:w-auto"
        @click="detectSymbols"
        :disabled="props.isLoadingEntry || props.isEnhancingDetails"
      >
        <Sparkles class="w-4 h-4" stroke="url(#sparkle-gradient)" /> <span class="bg-gradient-to-r from-[#a78bfa] to-[#60a5fa] text-transparent bg-clip-text"> Detect Symbols</span>
      </Button>
    </div>

    
    <Dialog v-model:open="showAddSymbolDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Symbol</DialogTitle>
          <DialogDescription>
            Search for symbols to add to your journal entry.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4 py-4 w-full">
          <Input
            id="search"
            v-model="searchTerm"
            placeholder="Search symbols..."
            class="col-span-3"
          />
          <ScrollArea class="max-h-60 p-4 w-full">
            <div v-for="(symbolsInCat, category) in filteredSymbols" :key="category" class="mb-4 w-full">
              <h3 class="text-lg font-semibold mb-2 flex items-center">
                <component :is="categoryIcons[category]" class="w-5 h-5 mr-2" />
                {{ category }}
              </h3>
              <div class="flex flex-wrap gap-2">
                <Button
                  v-for="symbol in symbolsInCat"
                  :key="symbol.symbol_id"
                  :class="{ 'bg-input': selectedSymbols.some(s => s.symbol_id === symbol.symbol_id) }"
                  variant="outline"
                  @click="selectSymbol(symbol)"
                >
                  {{ symbol.name }}
                </Button>
              </div>
            </div>
            <div v-if="Object.keys(filteredSymbols).length === 0" class="text-center text-gray-500">
              No symbols found.
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

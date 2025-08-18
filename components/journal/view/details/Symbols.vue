<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { toast } from 'vue-sonner';
import { Plus, Sparkles, Activity, PawPrint, Users, Box, MapPin, CloudSun, HelpCircle, BadgePlus, BookOpenText } from 'lucide-vue-next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSymbols } from '@/composables/useSymbols';
import { useSupabaseUser } from '#imports';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Symbol } from '@/composables/useSymbols';

const props = defineProps({
  isLoadingEntry: { type: Boolean, default: false },
  isEnhancingDetails: { type: Boolean, default: false },
});

const { getSymbols, createSymbol, deleteSymbol } = useSymbols();
const user = useSupabaseUser();
const showAddSymbolDialog = ref(false);
const showCreateSymbolCard = ref(false);
const searchTerm = ref('');
const selectedSymbols = ref<Symbol[]>([]);
const showDeleteConfirmDialog = ref(false);
const symbolToDelete = ref<Symbol | null>(null);
let pressTimer: ReturnType<typeof setTimeout> | null = null;

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
  'Themes': BookOpenText,
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

const handleSaveNewSymbol = async () => {
  if (!newSymbolCategory.value) {
    toast.error('Please specify a category for the new symbol.');
    return;
  }
  if (!newSymbolName.value.trim()) {
    toast.error('Please specify a name for the new symbol.');
    return;
  }

  const newSymbolData = {
    category: newSymbolCategory.value,
    name: newSymbolName.value,
    description: newSymbolDescription.value || null,
  };

  const created = await createSymbol(newSymbolData);

  if (created) {
    toast.success(`New Symbol: ${created.name} (${created.category}) saved!`);
    selectedSymbols.value.push(created);
    // Reset form
    newSymbolCategory.value = '';
    newSymbolName.value = '';
    newSymbolDescription.value = '';
    showCreateSymbolCard.value = false;
  } else {
    toast.error('Failed to create symbol.');
  }
};

const handleCancelNewSymbol = () => {
  // Reset form
  newSymbolCategory.value = '';
  newSymbolName.value = '';
  newSymbolDescription.value = '';
  showCreateSymbolCard.value = false;
};

const onMouseDown = (symbol: Symbol) => {
  if (symbol.user_id === user.value?.id) {
    pressTimer = setTimeout(() => {
      symbolToDelete.value = symbol;
      showDeleteConfirmDialog.value = true;
    }, 500); // 2 seconds
  }
};

const onMouseUp = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

const onMouseLeave = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
  }
};

const handleDeleteSymbol = async () => {
  if (symbolToDelete.value && user.value) {
    const success = await deleteSymbol(symbolToDelete.value.symbol_id, user.value.id);
    if (success) {
      toast.success(`Symbol '${symbolToDelete.value.name}' deleted.`);
      // Remove from selectedSymbols as well
      selectedSymbols.value = selectedSymbols.value.filter(s => s.symbol_id !== symbolToDelete.value?.symbol_id);
    } else {
      toast.error(`Failed to delete symbol '${symbolToDelete.value.name}'.`);
    }
  }
  symbolToDelete.value = null;
  showDeleteConfirmDialog.value = false;
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
            @mousedown="onMouseDown(symbol)"
            @mouseup="onMouseUp()"
            @mouseleave="onMouseLeave()"
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

    <AlertDialog :open="showDeleteConfirmDialog" @update:open="showDeleteConfirmDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the '{{ symbolToDelete?.name }}' symbol.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showDeleteConfirmDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="handleDeleteSymbol">Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

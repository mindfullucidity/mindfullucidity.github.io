<template>
  <div class="flex flex-col h-full">
    <div class="flex-shrink-0">
      <div class="lg:flex items-center p-4 h-12 hidden">
        <h1 class="text-xl  font-semibold">Journal</h1>
      </div>
      <Separator class="hidden lg:block"/>
      <div class="p-4">
        <div class="flex   items-center justify-center  gap-2">                                                                            
            <div class="relative flex-grow lg:max-w-full max-w-lg">                                                                                                                                    
              <Search class="absolute left-2 top-2.5 size-4 text-muted-foreground " />                                                                                                                 
              <Input class="pl-8 " placeholder="Search" v-model="sidebarStore.searchQuery" />                                                                                                          
            </div>                                                                                                                                                                                     
            <Button variant="ghost" size="icon" @click="navigateTo('/journal/new')" class="hidden lg:inline-flex">  
            <Plus class="lucide lucide-plus" />
          </Button>
        </div>
      </div>
      <Separator class="hidden lg:block"/>
    </div>
    <ScrollArea class="flex-grow overflow-y-auto">
      <div class="flex flex-col items-center lg:items-stretch gap-2 px-4 pb-4 pt-0 lg:pt-4">
        <template v-if="sidebarStore.isLoaded === false">
          <SidebarCardSkeleton v-for="i in 3" :key="i" />
        </template>                                                                                           
         <template v-else-if="sidebarStore.filteredItems.length === 0 && sidebarStore.searchQuery">                                                                                                   
           <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">                                                                                                         
             <SearchX class="h-8 w-8 mb-2" />                                                                                                                                                         
             <p>No results found.</p>                                                                                                                                                                 
           </div>                                                                                                                                                                                     
         </template>                                                                                                                                                                                  
         <template v-else-if="sidebarStore.filteredItems.length === 0 && !sidebarStore.searchQuery">                                                                                                  
           <div class="flex flex-col items-center justify-center py-8 text-muted-foreground">                                                                                                         
             <Bed class="h-8 w-8 mb-2" />                                                                                                                                                             
             <p>No entries yet. Start by creating a new one!</p>                                                                                                                                      
           </div>                                                                                                                                                                                     
         </template>         
        <template v-else>
          <SidebarCard 
            v-for="entry in sidebarStore.filteredItems" 
            :key="entry.journal_id" 
            :entry="entry"
            :selected="entry.journal_id === Number(route.params.id)"
            @click="navigateTo(`/journal/${entry.journal_id}${route.hash}`)" 
          />
        </template>
      </div>
    </ScrollArea>
    <FloatingActionButtonSection class="lg:hidden mb-16">
      <FloatingActionButton @click="navigateTo('/journal/new')" class="bg-primary">
        <Plus class="w-6 h-6" />
      </FloatingActionButton>
    </FloatingActionButtonSection>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import SidebarCard from '@/components/diary/sidebar/SidebarCard.vue';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Bed, Search, SearchX } from 'lucide-vue-next';
import SidebarCardSkeleton from '@/components/diary/sidebar/SidebarCardSkeleton.vue';
import { ScrollArea } from '@/components/ui/scroll-area';
import { navigateTo } from '#imports';
import { useSidebarStore } from '@/stores/diary/sidebar';
import FloatingActionButtonSection from '~/components/journal/misc/FloatingActionButtonSection.vue';
import FloatingActionButton from '~/components/journal/misc/FloatingActionButton.vue';

const sidebarStore = useSidebarStore();
const route = useRoute();

onMounted(async () => {
  await sidebarStore.get_all();
});
</script>

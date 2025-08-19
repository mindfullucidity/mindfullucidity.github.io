<script setup lang="ts">
import { Toolbar, ToolbarContent, ToolbarList, ToolbarTrigger } from '@/components/diary/view/toolbar';
import { Entry } from '@/components/diary/view/entry';
import { Analysis } from '@/components/diary/view/analysis';
import { Details } from '@/components/diary/view/details';
import { useDiaryViewActiveStore } from '@/stores/diary/view/active';

const activeStore = useDiaryViewActiveStore();
</script>

<template>
    <Toolbar :disabled="!activeStore.isLoaded || activeStore.isEnhancing">
        <template #toolbar-list>
            <ToolbarList>
                <ToolbarTrigger value="entry">Entry</ToolbarTrigger>
                <ToolbarTrigger value="analysis">Analysis</ToolbarTrigger>
                <ToolbarTrigger value="details">Details</ToolbarTrigger>
            </ToolbarList>
        </template>
        <ToolbarContent value="entry">
            <Entry/>
        </ToolbarContent>
        <ToolbarContent value="analysis">
            <Analysis/>
        </ToolbarContent>
        <ToolbarContent value="details">
            <Details/>
        </ToolbarContent>
    </Toolbar>
</template>
export interface JournalEntry{
    title: string;
    date: string;
    content: string;
}

export interface JournalAnalysis{
    journal_analysis_id: number;
    type: string;
    title: string;
    content: string;
}

export interface JournalDetails{
    lucidity_level: number | null;
    lucidity_trigger: string | null;
    mood: number | null;
    characteristics: string[] | null;
    symbol_ids: number[] | null;
}

export interface Journal{
    journal_id: number;
    entry: JournalEntry;
    analyses: JournalAnalysis[];
    details: JournalDetails;
}
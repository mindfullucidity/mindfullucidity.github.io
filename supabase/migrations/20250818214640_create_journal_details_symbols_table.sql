CREATE TABLE public.journal_details_symbols (
    journal_id BIGINT NOT NULL,
    symbol_id BIGINT NOT NULL,
    PRIMARY KEY (journal_id, symbol_id),
    FOREIGN KEY (journal_id) REFERENCES public.journals(journal_id) ON DELETE CASCADE,
    FOREIGN KEY (symbol_id) REFERENCES public.symbols(symbol_id) ON DELETE CASCADE
);

ALTER TABLE public.journal_details_symbols ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT: User can read if they own the associated journal entry
CREATE POLICY "Allow read access to journal symbols for owner" ON public.journal_details_symbols FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.journals WHERE journal_id = journal_details_symbols.journal_id)
);

-- Policy for INSERT: User can insert if they own the associated journal entry
-- and have access to the symbol (either public or owned by them)
CREATE POLICY "Allow insert of journal symbols for owner" ON public.journal_details_symbols FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.journals WHERE journal_id = journal_details_symbols.journal_id)
    AND (
        (SELECT user_id FROM public.symbols WHERE symbol_id = journal_details_symbols.symbol_id) IS NULL
        OR auth.uid() = (SELECT user_id FROM public.symbols WHERE symbol_id = journal_details_symbols.symbol_id)
    )
);

-- Policy for DELETE: User can delete if they own the associated journal entry
CREATE POLICY "Allow delete of journal symbols for owner" ON public.journal_details_symbols FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.journals WHERE journal_id = journal_details_symbols.journal_id)
);
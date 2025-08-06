--- Context from: ../../.gemini/GEMINI.md ---
## Gemini Added Memories
- The user prefers that I do not run the linter automatically after making changes.
- The user prefers that I do not ask to build the application automatically after making changes.
--- End of Context from: ../../.gemini/GEMINI.md ---

--- Context from: GEMINI.md ---
1. Please always use `shadcn-vue` components
2. This is a `nuxt` project, so please use compatible libibries
3. This project's theme is dracula
4. Please use tailwindcss where needed
5. Dont use `#supabase` imports, supabase imports are always available by default (if expliclty imported import from '#imports')
6. When you need to deploy a edge function use `pnpm dlx supabase functions deploy` rather than the mcp tool (it is broken)
7. Don't run or install this or ask to
8. use nuxt varients/modules of vueuse/core modules
9. When using `vue-sonner` for toasts, always use `toast.success('message')`, `toast.error('message')`, or `toast.info('message')` directly, instead of `toast({ title: 'message', description: '...' })`.
--- End of Context from: GEMINI.md ---
10. don't do git commands without expliclity being told
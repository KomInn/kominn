# Felles kode

Alt som brukes av mer enn én webdel ligger her.

| Mappe | Innhold |
|---|---|
| `models/` | Domenemodeller (Suggestion, Evaluation, Campaign …). Speiler listene i `provisioning/`. |
| `services/` | `IDataService` og implementasjonene `SharePointDataService` (PnPjs) og `MockDataService` (lokal utvikling). |
| `hooks/` | React-hooks, f.eks. `useDataService`, `useSuggestions`. |
| `components/` | Gjenbrukbare komponenter, f.eks. forslagskort, statusmerke, kart. |

Regler: Fluent UI-komponenter først, all tekst via `loc/`, ingen direkte REST-kall utenfor `services/`.

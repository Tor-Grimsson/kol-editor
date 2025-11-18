# LLM Context Memory Protocol

## Why this exists
This repository hosts an experimental React/Vite workspace for trying different image filter UIs (`src/pages`, `src/lib`, external editors under `Graphite-master`, `tui.image-editor-master`, etc.). When multiple LLM agents collaborate here we need consistently structured memories so that the next agent can pick up open threads without rereading the whole tree. The following protocol defines *what* to remember, *how* to store it, and *when* to update or prune it.

## Authoritative memory buckets
Store persistent notes in a JSON object with the following top-level keys. Each bucket describes how to summarize information as compact bullet points (≤240 characters per entry unless noted).

- `project_profile`
  - Snapshot of the product vision, stack, and canonical entry points (e.g. `src/App.jsx`, `src/pages/*`, build via `yarn dev`).
  - Update only when scope, stack, or tooling materially changes.
- `active_objectives`
  - Ordered list of in-flight tasks. Each entry contains `id`, `summary`, `owner`, `status`, `last_updated`.
  - Close the task when merged or explicitly dropped. Keep at most five entries; archive older ones in `decision_log`.
- `implementation_notes`
  - Technical breadcrumbs for tricky areas: how lazy-loaded editors connect, how asset pipelines relate to `public/img`, performance concerns, etc.
  - Prefer declarative statements over play-by-play history.
- `decision_log`
  - Immutable facts or rationale for choices (e.g. “Switched default view to `EnhancedLayerEditorPixi` for GPU-backed filters”).
  - Include reference path + commit/PR if available.
- `communication_style`
  - Preferences expressed by the human partner (tone, verbosity, testing expectations). Helps future agents respond consistently.
- `experiments`
  - Notes about spikes or throwaway prototypes (e.g. “Investigating Pixi.js blending pipeline; located under `src/pages/EnhancedLayerEditorPixi.tsx`”).

## Lifecycle rules
1. **Initialization** – On first run, populate `project_profile` and empty arrays for all other buckets. Use repository facts only; avoid speculation.
2. **Before coding** – Read every bucket; treat `active_objectives` as the single source of truth for priorities.
3. **During work** – As soon as new context appears (new task, resolved decision, updated convention) append or edit the relevant bucket instead of waiting for the end.
4. **Pruning** – When a bucket exceeds five entries, move the oldest or least relevant entry into `decision_log_archive` (optional) or drop it after explicit confirmation from the user.
5. **Handoff** – At the end of a session, ensure `active_objectives` reflects the remaining work and that any “next action” is clearly stated in the entry’s `summary`.

## Usage checklist for agents
1. Load `docs/llm-context-protocol/protocol.md` and `llm-rules.md` at session start.
2. Sync local scratchpad with the JSON memory (no implicit memories).
3. Before responding to the user, confirm whether updates to `active_objectives` or `decision_log` are needed.
4. When unsure about overwriting information, append with a timestamp note instead of deleting.
5. Document any assumptions inside `decision_log` so future agents can question them.

## Example JSON skeleton
```json
{
  "project_profile": [
    "Image filter playground built with React 18 + Vite + Tailwind; entry: src/App.jsx"
  ],
  "active_objectives": [
    {
      "id": "pixi-layer-sync",
      "summary": "Fix Pixi layer editor alpha blending regression; next: reproduce in EnhancedLayerEditorPixi",
      "owner": "assistant",
      "status": "in_progress",
      "last_updated": "2024-05-01T18:42Z"
    }
  ],
  "implementation_notes": [],
  "decision_log": [],
  "communication_style": [],
  "experiments": []
}
```

Agents must keep the JSON human-readable (2-space indentation) and store it alongside outputs that the human can inspect or edit. Save it in the workspace root as `llm-memory.json` unless the user specifies another filename.

---
description: When the user requests a mapping of changes, create a plan file before anything else
globs:
alwaysApply: true
---

# Mapping Requires a Plan

When the user asks for a mapping of changes (e.g. "map the changes needed", "mapeie as alterações", "what needs to change", "mapeie o que precisa mudar"), you MUST create a plan file **before** presenting any findings.

## Plan File Location

Save the plan to:

```
.claude/plans/<YYYY-MM-DD>-<short-description>.md
```

- Date: today's date in `YYYY-MM-DD` format
- Description: brief kebab-case summary of the goal in the same language as the user's request
- Example: `2026-05-06-adicionar-filtro-lista-estadias.md`

## Required Plan Structure

```markdown
# <Title>

## Objective

One or two sentences explaining the goal and why this change is needed.

## Personas

List any personas from `.claude/personas/` that are relevant to this task.
If none exist yet, write "None identified."

## Mapped Changes

For each file that needs modification:

- **File path** — what changes and why

## Tasks

Numbered list of tasks. Each task must declare its dependencies explicitly.

1. **<Task name>** — <what to do>
   - Dependencies: none
2. **<Task name>** — <what to do>
   - Dependencies: task 1
3. **<Task name>** — <what to do>
   - Dependencies: task 1
4. **<Task name>** — <what to do>
   - Dependencies: tasks 2, 3

> Tasks with no shared dependencies can be executed in parallel by multiple agents.
```

## Rules

- Always create the plan file **first**, before presenting the mapping to the user.
- After creating the file, present the mapping summary in the conversation as usual.
- The task dependency list must be accurate — it will be used to decide which tasks can run in parallel with multi-agent execution.
- If a persona relevant to the task does not exist yet in `.claude/personas/`, note it in the plan under Personas.

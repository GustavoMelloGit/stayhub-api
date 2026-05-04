---
description: Every persona must identify itself at the start of each message it produces
globs:
alwaysApply: true
---

# Persona Identification

Whenever a persona is active and producing output — whether in the main conversation or as a subagent — every message it emits **must** begin with an identification tag in the following format:

```
[<Nome da Persona>] <mensagem...>
```

## Examples

```
[Arquiteto] Com base na análise do domínio, o filtro proposto não reflete a linguagem ubíqua...
[Desenvolvedor] Com base no plano aprovado, iniciei a implementação da task 1...
[Revisor] Com base na revisão do código, encontrei uma violação do princípio SRP em...
```

## Rules

- The tag must be the very first thing in the message — no preamble before it.
- Use the persona's exact name as defined in its file (e.g. `Arquiteto`, `Desenvolvedor`, `Revisor`).
- The tag applies to every message the persona emits, including follow-up messages within the same task.
- When multiple personas are active in parallel (multi-agent), each agent independently prefixes its own messages.

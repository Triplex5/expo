# Quiz Orçamento MZ

Aplicação **Expo (React Native + Web)** de quiz gamificado — estilo Duolingo — sobre o
**Controlo da Execução Orçamental em Moçambique**.

Curso em 4 módulos, 13 lições/testes (156 etapas de resposta) **+ Exame Final com 20 perguntas**.
Interface 100% em português, dark mode "Titanium & Neon", XP, níveis, corações, sequências
(*streak*), emblemas de mérito e perguntas multi-partes com etapas sequenciais.

---

## 1. Como jogar

```bash
cd quiz-orcamento-mz
npm install          # só na primeira vez
npm start            # abre o Expo (QR code para telemóvel)
npm run web          # abre no navegador
```

Outros comandos úteis:

```bash
npm run typecheck     # verificação de tipos
npm run validate:bank # valida o banco de perguntas (ver §4)
npm run export:web    # export estático para web-build/
```

---

## 2. Requisitos de conteúdo (cobertura garantida)

| Módulo | Foco | Lições | Base legal usada |
| --- | --- | --- | --- |
| **I. Poderes & Orçamento** | Montesquieu, separação de poderes, circuito OE | 3 + teste | CRM arts. 130.º, 131.º, 228.º–230.º |
| **II. Execução Orçamental** | Receitas, despesas, registo, acompanhamento, prestação de contas | 3 + teste | Lei 9/2002 arts. 15.º, 29.º, 30.º, 31.º, 33.º, 46.º; Lei 14/2020 art. 51.º |
| **III. Modalidades de Controlo** | Interno, externo (AR), prévio, administrativo, financeiro e da legalidade | 3 + teste | Lei 9/2002 arts. 62.º, 64.º; Lei 26/2009; Lei 13/97 |
| **IV. Articulação Institucional** | Executivo ⇄ TA ⇄ AR, prazos da CGE, caso prático | 3 (inclui caso) | Lei 14/2020 arts. 51.º e 82.º |
| **Exame Final** | Todos os módulos · 20 perguntas · aprovação 60% | — | todas as acima |

**Mecânica de perguntas divididas (multi-partes)** — requisito obrigatório, implementado em
`src/types.ts` (`QuestionPart`) e jogado em `src/screens/LessonScreen.tsx`:

- Ex.: *«Circuito de controlo: O Executivo gasta → O TA audita → A AR aprova»*
  → **Parte 1** «O Executivo gasta», **Parte 2** «O TA audita», **Parte 3** «A AR aprova».
- O jogador **só avança depois de completar todas as partes** da mesma pergunta.
- Barra de etapas (*stepper*) mostra ✓ nas partes resolvidas; a barra de progresso global conta
  **cada etapa** como uma unidade.

Perguntas multi-partes existentes: circuito da despesa, circuito da receita, circuito do
orçamento, freios e contrapesos, conformidades internas, momentos do controlo (prévio /
concomitante / sucessivo), ciclo orçamental de 4 etapas e caso prático da estrada.

---

## 3. Funcionalidades de jogo

| Elemento | Detalhe |
| --- | --- |
| **XP** | 10 XP por acerto (+ bónus de 5 XP por resposta rápida), XP próprio nas perguntas difíceis |
| **Corações** | 5 por dia; erro ou tempo esgotado custa 1; recarrega quando fizeres 100% |
| **Níveis** | 9 patamares: *Estagiário do Erário* → *Auditor Supremo* |
| **Emblemas** | 10 medalhas (bronze/prata/ouro/neon), incl. «Zero Erros», «Reflexo de Titânio» e «Certificado» |
| **Streak** | Dias consecutivos de prática guardados localmente |
| **Dicas** | −3 XP, uma linha, opcional |
| **Modos** | Lição (sem cronómetro), Teste cronometrado, Blitz 10 (sprint aleatório), Exame Final (35 s/pergunta) |
| **Progressão** | Módulos desbloqueiam ao completar metade do módulo anterior |
| **Persistência** | `AsyncStorage` (localStorage na web) — chave `quiz-orcamento-mz/progress/v1` |

---

## 4. Nada de blocos de texto (regra de ouro)

O validador `scripts/validate-bank.mjs` percorre **todas** as etapas de resposta e falha se:

- enunciado > 95 caracteres · opção > 46 · feedback > 130 · fonte > 40;
- opções fora do intervalo 2–4, opções repetidas ou resposta correcta inválida.

O único ecrã de leitura é a **Biblioteca de Normas** (`src/screens/LibraryScreen.tsx`):
uma linha por norma + glossário relâmpago de 8 termos, com atalho «PRATICAR →» para o quiz.

```bash
npm run validate:bank
# — Banco de perguntas Quiz Orçamento MZ —
# Módulos: 4 · Lições/Testes: 15 · Etapas de resposta: 156
# ✓ Sem blocos de texto longo: todas as etapas passam nos limites.
```

---

## 5. Design visual

Inspirado em mansões minimalistas de luxo e supercars em estúdio escuro.

- **Paleta** (`src/theme.ts`): preto fosco `#06070A`, titânio `#8B96A8`, branco puro,
  neon azul `#2ED8FF` e violeta `#7A5CFF`/`#C04CFF`.
- **Imagens** (geradas para este projecto, `assets/`):
  - `hero-mansion.png` — mansão de concreto com linhas neon azuis (ecrã inicial);
  - `hero-supercar.png` — supercar com contorno violeta (ecrã de módulo);
  - `icon.png` — ícone da app (hexágono neon com gráfico ascendente).
  > Substitui estes ficheiros pelos teus originais mantendo os mesmos nomes — o código
  > referencia-os em `HomeScreen.tsx` e `ModuleScreen.tsx`.
- Botões em gradiente com brilho subtil, barras de progresso gamificadas, medalhas circulares
  e transições suaves (`Animated`): fade entre ecrãs, «pop» na opção escolhida e XP a subir.

---

## 6. Estrutura

```
quiz-orcamento-mz/
├─ App.tsx                    # navegação em pilha + transição
├─ src/
│  ├─ theme.ts                # design system (cores, gradientes, sombras)
│  ├─ types.ts                # QuestionPart / Question / Lesson / Module / Progress
│  ├─ haptics.ts              # vibração com degradação suave em web
│  ├─ data/                   # banco de perguntas (4 módulos + exame)
│  ├─ game/rules.ts           # regras e cálculo de XP/streak
│  ├─ game/unlock.ts          # desbloqueio de módulos e progresso
│  ├─ store/GameProvider.tsx  # estado persistido do jogador
│  ├─ components/             # UI (botões, opções, stepper, feedback, medalhas…)
│  └─ screens/                # Home, Módulo, Lição/Teste/Exame, Medalhas, Biblioteca
├─ scripts/validate-bank.mjs  # QA do conteúdo («zero texto longo»)
└─ assets/                    # imagens de referência + ícone
```

---

## 7. Nota pedagógica

O conteúdo é formativo e resumido para memorização activa; as normas citadas são
Lei 9/2002 (SISTAFE), Lei 14/2020 (revisão do SISTAFE), Lei 26/2009 (orgânica do Tribunal
Administrativo), Lei 13/97 (fiscalização prévia) e a Constituição da República.
Em caso de divergência, prevalece o texto publicado no *Boletim da República*.

import type { AppData } from "../types/app";

const DEFAULT_SHORTCUT = "Ctrl+Shift+;";

const now = () => new Date().toISOString();

export const createSampleData = (): AppData => ({
  notes: [
    {
      id: crypto.randomUUID(),
      title: "Checklist de deploy",
      content:
        "1. Rodar typecheck\n2. Validar build local\n3. Confirmar variaveis de ambiente\n4. Publicar changelog curto",
      pinned: true,
      updatedAt: now()
    },
    {
      id: crypto.randomUUID(),
      title: "Prompt padrao para bugfix",
      content:
        "Descreva o bug, impacto, passos para reproduzir, expectativa, comportamento atual e criterio de aceite.",
      pinned: false,
      updatedAt: now()
    }
  ],
  shortcuts: [
    {
      id: crypto.randomUUID(),
      title: "Git status resumido",
      command: "git status --short",
      description: "Visao compacta das alteracoes locais.",
      tags: ["git", "status"],
      favorite: true
    },
    {
      id: crypto.randomUUID(),
      title: "Buscar TODOs",
      command: "rg --line-number TODO src",
      description: "Encontra TODOs no codigo com linha.",
      tags: ["busca", "ripgrep"],
      favorite: false
    },
    {
      id: crypto.randomUUID(),
      title: "Build web",
      command: "corepack pnpm build",
      description: "Compila o frontend e valida a pipeline web.",
      tags: ["pnpm", "build"],
      favorite: true
    }
  ],
  settings: {
    launchOnStartup: false,
    globalShortcut: DEFAULT_SHORTCUT,
    defaultView: "combined",
    themeMode: "dark"
  }
});

export const DEFAULT_SHORTCUT_ACCELERATOR = DEFAULT_SHORTCUT;

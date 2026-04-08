# Bizu Sidebar

Aplicacao desktop para Windows com `Tauri 2 + React + Vite + TypeScript`, pensada como uma barra lateral fixa no lado direito para consulta rapida de notas e comandos.

## Stack

- Tauri 2
- React 18
- TypeScript
- Vite
- Zustand
- Tailwind CSS
- Persistencia local em JSON

## O que o MVP entrega

- Janela compacta, escura e sem decoracao nativa, alinhada ao lado direito da tela
- Janela arrastavel pela faixa superior, inclusive entre monitores
- Modos de visualizacao: `Tudo`, `Notas` e `Atalhos`
- CRUD completo para notas e atalhos
- Busca instantanea por titulo, conteudo, comando, descricao e tags
- Agrupamento visual minimo em `Favoritos`, `Notas` e `Atalhos`
- Copia de comandos para a area de transferencia com feedback imediato
- Tray icon com `Mostrar / Ocultar` e `Sair`
- Atalho global para mostrar/ocultar a sidebar
- Opcao para iniciar com o Windows
- Tema claro, escuro e modo para seguir o sistema operacional
- Dados locais persistidos entre execucoes
- Dados iniciais de exemplo para facilitar teste

## Estrutura

- `src/components`: shell e componentes reutilizaveis da UI
- `src/features/notes`: cards e editor de notas
- `src/features/shortcuts`: cards e editor de atalhos
- `src/features/settings`: painel de configuracoes desktop
- `src/store`: estado global com Zustand
- `src/lib`: integracoes desktop e persistencia
- `src/types`: tipos compartilhados
- `src-tauri/src`: backend Tauri, tray e posicionamento da janela

## Pre-requisitos

- Windows 10 ou 11
- Node.js 22+
- `pnpm` via `corepack`
- Rust toolchain MSVC instalado
- Microsoft Visual Studio C++ Build Tools
- WebView2 Runtime instalado no Windows

## Como rodar em desenvolvimento

```powershell
corepack pnpm install
corepack pnpm tauri dev
```

Se quiser subir apenas o frontend no navegador:

```powershell
corepack pnpm dev
```

## Como gerar build para Windows

Release com renomeacao automatica dos instaladores:

```powershell
corepack pnpm tauri:build
```

Build de debug:

```powershell
corepack pnpm tauri:build:debug
```

Se voce rodar o CLI direto com `corepack pnpm tauri build`, o build funciona normalmente, mas a renomeacao pos-build nao roda.
Os scripts `tauri:dev`, `tauri:build` e `tauri:build:debug` tambem regeneram o `icon.ico` a partir dos PNGs transparentes antes do build.

No ambiente validado nesta entrega, o build de debug gerou:

- `src-tauri\target\debug\bizu-sidebar.exe`
- `src-tauri\target\debug\bundle\msi\Bizu-Sidebar_0.1.0_x64_en-US.msi`
- `src-tauri\target\debug\bundle\nsis\Bizu-Sidebar_0.1.0_x64-setup.exe`

## Persistencia local

O app salva tudo em JSON local usando o plugin oficial de filesystem do Tauri.

- Arquivo: `bizu-sidebar.json`
- Caminho logico: `%APPDATA%/<identifier>/state/bizu-sidebar.json`
- Identifier atual: `com.junior.bizu`

Estrutura persistida:

- notas
- atalhos
- configuracoes

Entre as configuracoes persistidas esta o `themeMode`, com os valores:

- `dark`
- `light`
- `system`

Na primeira execucao, o app cria o arquivo com dados de exemplo.

## Atalho global

Padrao atual:

```text
Ctrl+Shift+;
```

Voce pode alterar o atalho dentro da propria UI em `Config`.

Fluxo:

1. Abra a sidebar.
2. Clique em `Config`.
3. Edite o campo `Atalho global`.
4. Clique em `Aplicar`.

O valor fica persistido no JSON local.

## Comandos uteis

```powershell
corepack pnpm typecheck
corepack pnpm build
corepack pnpm tauri dev
corepack pnpm tauri build
```

## Como a janela lateral funciona

O backend Tauri:

- cria uma janela estreita e alta
- remove decoracoes nativas
- mantem `alwaysOnTop`
- posiciona a janela no lado direito ao iniciar
- permite mover a janela livremente depois disso
- oferece uma acao explicita de `Ancorar` na UI e no tray para voltar ao lado direito

O tray icon tambem usa esse comportamento ao mostrar/ocultar a sidebar.

## Limitacoes tecnicas reais no Windows/Tauri

- Isto nao e uma sidebar "dockada" ao sistema como a taskbar do Windows. A janela fica alinhada a direita, mas nao reserva espaco do desktop.
- Outras janelas podem ocupar a mesma area da tela. O app fica por cima por usar `alwaysOnTop`, mas nao reorganiza o layout das demais janelas.
- O app abre ancorado a direita por padrao, mas depois pode ser movido livremente. Se voce quiser voltar ao comportamento lateral, use a acao `Ancorar`.
- O formato exato aceito pelo atalho global depende do parser do plugin do Tauri e da disponibilidade da combinacao no Windows.
- Recursos como tray, autostart e atalho global so funcionam dentro do runtime Tauri; no navegador o frontend abre apenas como fallback visual.

## Validacao executada nesta entrega

Comandos executados:

```powershell
corepack pnpm typecheck
corepack pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
corepack pnpm tauri build --debug
```

Resultado:

- frontend compilando
- backend Rust compilando
- bundle debug para Windows gerado
- persistencia JSON implementada e tipada
- busca instantanea implementada no estado/UI
- copiar comando implementado com plugin oficial de clipboard
- atalho global implementado com plugin oficial
- tray implementado com menu e toggle

## Observacoes

- A validacao de busca, copia, tray e atalho global foi feita por compilacao, integracao de codigo e geracao do executavel; a interacao visual/manual ainda depende de abrir o binario no Windows.

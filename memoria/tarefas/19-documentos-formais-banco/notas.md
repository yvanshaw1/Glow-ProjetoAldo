# Notas: 19-documentos-formais-banco

Registro curto do que outra sessão precisaria saber. Uma entrada por fato, a mais recente embaixo.

## 2026-10-19 – decisão

O desenvolvedor pediu esta tarefa na conversa da #17. No começo, ela incluía atualizar o ESLint 9, mas ele desistiu antes da issue: o ESLint fica no 9. A decisão 0037 já previa isso ("ESLint 9 até a configuração do Next.js aceitar o 10") e aceita o aviso `npm warn deprecated eslint@9.39.5`.

A documentação do Next.js 16.4 instalado confirma que o `eslint-config-next` aceita o ESLint 10, mas `eslint-plugin-react` 7.37.5, `eslint-plugin-import` 2.32.0 e `eslint-plugin-jsx-a11y` 6.10.2 ainda só declaram o 9. O teste de instalação do ESLint 10 foi interrompido a pedido do desenvolvedor e apagado sem resultado.

A issue #19 foi criada com o OK dele. A correção do Kayke no questionário está no commit `97f6d99`, da ramificação local `docs/kayke-collaborator`: foi uma tarefa trivial aprovada na conversa, sem issue nem PR próprios.

## 2026-10-19 – descoberta

O ICM já dispensa a confirmação de e-mail, desde a decisão 0044 da #17. Faltam só os `.docx`. Trechos encontrados no texto extraído (`unzip -p ... word/document.xml`, sem abrir no Word):

- Arquitetura, seção 8.3: "No painel do Supabase, a confirmação de e-mail é desativada, ... o tamanho mínimo de senha é definido em 8 caracteres e é criado o repositório de arquivos service-images".
- Arquitetura, seção 5: "um único arquivo de migration".
- Arquitetura, Quadro 35, RS003: "O mínimo de 8 também é configurado no Supabase Auth."
- Desenvolvimento com IA: a regra "aplica migrations no banco", o exemplo do `.claude/settings.json` e o Quadro 10 ("Supabase CLI e painel").
- A Análise do Sistema não fala do Supabase nem de confirmação de e-mail.

## 2026-10-19 – descoberta

A automação do Word (PowerShell e COM, `Documents.Open` só para leitura, Word invisível) travou mais de 5 minutos sem exportar nada. A instância criada (`WINWORD.EXE /Automation -Embedding`, PID 22320) foi encerrada. Era a da automação, e não um Word aberto pelo desenvolvedor. Na etapa 02, a primeira tentativa abre o Word visível; o caminho alternativo está no plano.

## 2026-10-19 – decisão

Plano aprovado por yvan às 23:03, com a opção 1 da L1: a 0041 entra só no Desenvolvimento com IA. Status em `em_execucao`. A ramificação `docs/19-formal-documents` nasceu da `docs/kayke-collaborator` (`97f6d99` sobre a `origin/main` 7ce6ad0), então já leva a correção do Kayke.

## 2026-10-19 – descoberta

A automação do Word funciona. A trava da etapa 01 veio da exportação para `.txt` (`SaveAs2` no formato 7), que abre uma janela de codificação de arquivo mesmo com `DisplayAlerts = 0`. Abrir, editar, atualizar o sumário, salvar e exportar em PDF funciona com o Word invisível.

Os scripts ficaram no scratchpad da sessão: `word-edit.ps1` (só ASCII) aplica operações de um JSON em UTF-8, porque o PowerShell 5.1 lê `.ps1` sem BOM como ANSI. Os originais foram copiados para o scratchpad antes, e a edição foi feita em cópias, levadas ao repositório só depois da conferência.

Convenção dos `.docx`, por formatação direta e sem estilos de caractere:

- texto em Arial 12, e Arial 10 nos quadros;
- código em Courier New um ponto menor (11 e 9), e os blocos de código em Courier 9;
- termos em inglês em itálico, inclusive *migration*, *backend* e *script*;
- os identificadores de requisito são links para `AnaliseDoSistema.docx`, com o marcador do identificador.

## 2026-10-19 – desvio

A primeira passada substituía frases inteiras com o texto simples: os termos novos ficaram sem Courier e sem itálico, e trechos existentes perderam a formatação, como `staff` e `is_admin` no passo c) da 8.3. Isso foi visto na conferência em imagem, ainda nas cópias. O motor foi refeito:

- marcação `` `código` `` e `*itálico*` no texto novo;
- inserção antes ou depois do trecho, sem regravá-lo;
- link do RS003 criado como os demais;
- hífens não separáveis em `--linked` e `--db-url`, que o Word quebrava entre linhas.

A segunda passada partiu dos originais. O texto de cada item segue o plano, com ajustes de redação. Exemplo: no Quadro 1, a camada se chama *Migrations*.

## 2026-10-19 – descoberta

Conferência da segunda passada:

- **Texto extraído, comparado com o original sem as linhas do sumário:** só mudam os trechos dos itens 1 a 15. O sumário muda os marcadores internos (`_Toc`), e não os títulos nem as páginas.
- **Critérios:** nenhum trecho dos três documentos manda configurar a confirmação de e-mail no painel; a Arquitetura diz duas vezes que a conta nasce com o e-mail confirmado; a 8.3 tem três passos; o Quadro 38 traz a 0042, a 0043 e a 0044; e a 0041 está na árvore e na lista de pastas do Desenvolvimento com IA.
- **Páginas:** a Arquitetura ficou com 67, e o Desenvolvimento com IA, com 33. As páginas alteradas foram renderizadas em PNG pela API de PDF do Windows (`Windows.Data.Pdf`), porque não há `pdftoppm`, e conferidas uma a uma.
- **Abertura:** os dois `.docx` abrem no Word direto do repositório, sem reparo nem modo protegido.

# Procedimento: pull request

## Abrir

1. Durante a construção, o PR pode ser aberto como rascunho para gerar a pré-visualização da Vercel.
2. Na entrega, atualizar com a `main` (`git.md`), rodar `npm run check`, marcar como pronto para revisão e pedir a revisão a outro integrante no próprio PR.
3. Título em Conventional Commits, porque o squash o transforma na mensagem do commit na `main`.
4. Descrição pelo modelo `.github/pull_request_template.md`: issue (`Closes #<issue>`), requisitos atendidos, a lista do que mudou e do que é novo (sem o porquê nem as lacunas decididas), como testar na pré-visualização, capturas de tela se a interface mudar, checklist.

```
gh pr create --draft --title "feat(appointments): allow clients to edit scheduled appointments" --body-file <arquivo>
```

Tamanho: até cerca de 400 linhas alteradas, sem contar testes; maior que isso, dividir antes da revisão.

## Checklist de segurança (OWASP Top 10 aplicado ao sistema)

- [ ] Toda rota nova verifica sessão e permissão (`requireUser`, `requireClient`, `requirePermission`) (RS001, RS008).
- [ ] Dados do cliente filtrados pelo identificador da sessão, nunca por parâmetro (RS009).
- [ ] Toda entrada passa pelos esquemas compartilhados; valores calculados pelo sistema não são aceitos (RS013).
- [ ] Nenhum conteúdo do usuário vira HTML; nenhuma consulta montada por concatenação (RS014).
- [ ] Erros pelo tratamento único, sem detalhe interno (RS017).
- [ ] Nenhuma senha, token ou chave no código, nos testes ou nos registros (RS016, RS018).
- [ ] Envio de arquivo respeita formatos e tamanho (RS015).
- [ ] Chamada a serviço de IA só pelo servidor, com dados agregados e sem dado pessoal, e resposta conferida antes de exibir (RS019, RS020).

Em funcionalidade nova, o revisor percorre também as demais categorias do OWASP Top 10 que se aplicam a ela.

## Telas de demonstração (decisão 0055)

Enquanto `src/lib/demo/` existir, o PR que constrói uma rota confere:

- [ ] A rota nova saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração.

## Revisar

- Qualquer integrante que não seja o autor revisa e aprova (decisão 0039); a proteção da `main` exige uma aprovação.
- Ler o código gerado pela IA como código de terceiros: entender antes de aprovar.
- Conferir o comportamento na pré-visualização e a correspondência entre critérios de aceitação e testes.
- O autor responde a todos os comentários; a `main` só aceita a incorporação com todas as conversas resolvidas.

## Incorporar

Só com CI aprovado, build da Vercel concluído, ramificação atualizada com a `main` e aprovação de outro integrante (a aprovação cai se entrarem commits novos). Incorporação por squash; a ramificação é removida pelo GitHub. Quem incorpora é um integrante, nunca o agente.

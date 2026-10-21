<!-- Título no padrão Conventional Commits, em inglês: ele vira a mensagem do commit na main. -->

Closes #<issue>

## Requisitos atendidos

<!-- RF, RN, RS, UC -->

## O que mudou

<!-- Só a lista do que é novo e do que foi alterado, em "Novo", "Alterado" e "Testes": arquivos, rotas, funções, migrations, testes e documentação. Sem o porquê nem as lacunas decididas no plano: eles ficam no plano e no relatório, em memoria/tarefas/. -->

## Como testar na pré-visualização

<!-- Caso de uso, passos e dados fictícios usados. Capturas de tela se a interface mudou. -->

## Checklist de segurança

- [ ] Toda rota nova verifica sessão e permissão (RS001, RS008).
- [ ] Dados do cliente filtrados pela sessão, nunca por parâmetro (RS009).
- [ ] Toda entrada passa pelos esquemas compartilhados; valores calculados não são aceitos (RS013).
- [ ] Nenhum conteúdo do usuário vira HTML; nenhuma consulta por concatenação (RS014).
- [ ] Erros pelo tratamento único, sem detalhe interno (RS017).
- [ ] Nenhuma senha, token ou chave no código, nos testes ou nos registros (RS016, RS018).
- [ ] Envio de arquivo respeita formatos e tamanho (RS015).

## Critérios de pronto

- [ ] Plano aprovado (ou tarefa trivial aprovada na conversa) e código nos padrões das áreas que a tarefa toca.
- [ ] `npm run check` passa localmente; CI e build da Vercel aprovados.
- [ ] Casos de uso afetados testados na pré-visualização (fluxos principal, alternativos e de exceção).
- [ ] Cada critério de aceitação tem teste automatizado ou passo manual.
- [ ] `02_relatorio.md` gravado (exceto tarefa trivial); módulos de `docs/` e OpenAPI atualizados, se preciso.
- [ ] Até cerca de 400 linhas alteradas, sem contar testes.
- [ ] Rota nova: saiu da lista de `src/lib/demo/`, e a tela ligada a ela não mostra mais o aviso de demonstração (decisão 0055).

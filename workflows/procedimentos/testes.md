# Procedimento: testes

O que testar e com que regras está em `docs/padroes/testes.md`. Aqui ficam os passos.

## Automatizados (Vitest)

```
npm test                  executa a suíte uma vez
npx vitest <arquivo>      executa um arquivo durante o desenvolvimento
npm run check             formatação, tipos, lint e testes, como o CI
```

Ciclo TDD em cada regra ou esquema:

1. Escrever o teste do caso previsto no plano, com o valor esperado tirado da análise (RN, formato ou UC), e ver o teste falhar.
2. Escrever o mínimo de código para passar.
3. Melhorar o código com todos os testes passando.

Defeito corrigido: primeiro um teste que reproduz o defeito e falha; depois a correção.

## Contêiner (Docker)

Quando a tarefa muda o `Dockerfile`, o `.dockerignore`, o `compose.yaml`, o `next.config.ts`, as dependências ou a leitura de variáveis de ambiente, conferir também a aplicação compilada no contêiner (`docs/plataforma/infraestrutura.md`):

```
docker compose up --build -d   constrói a imagem e sobe a aplicação em http://localhost:3000
docker compose top             processos do contêiner, com o usuário (uid 1000, node)
docker compose logs app        saída da aplicação
docker compose down            encerra e remove o contêiner
```

1. Com o contêiner no ar, conferir a página inicial e as rotas da tarefa.
2. Para examinar a imagem por dentro, usar um contêiner novo, sem o `.env.local`: `docker run --rm --entrypoint sh glow-app -c "<comando>"`. Nunca `docker compose config`, `docker inspect`, `docker exec` nem `docker compose exec`, que mostram as variáveis (`guia/regras.md`).
3. Sem o `.env.local`, o agente não o cria: pede ao desenvolvedor que copie o `.env.example`. Sem o Docker na máquina, o teste vira passo manual de um integrante que o tenha, registrado no plano.
4. Registrar o resultado em `notas.md` e no relatório.

## Manuais (pré-visualização)

1. Abrir a pré-visualização da Vercel indicada no pull request.
2. Percorrer o caso de uso afetado: fluxo principal, fluxos alternativos e fluxos de exceção, com os dados fictícios dos dados iniciais.
3. Marcar o resultado no checklist do pull request; anexar captura de tela quando a interface mudar.

## Exploratórios (antes da AV3)

Um integrante que não construiu a funcionalidade tenta usá-la de formas não previstas: dados no limite dos formatos, ações repetidas, navegação fora de ordem. Cada defeito vira issue `tipo:defeito` com passo a passo, resultado esperado (com a RN ou o UC), resultado observado, ambiente e evidência.

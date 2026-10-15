# Procedimento: publicação

A publicação é automática: a Vercel gera uma pré-visualização para cada pull request e publica a `main` em produção a cada incorporação. Ninguém publica à mão, e o agente nunca publica.

## Conferir depois da incorporação

1. No painel da Vercel, confirmar que a publicação da `main` terminou com sucesso.
2. Em produção, percorrer o fluxo principal dos casos de uso citados no relatório da tarefa.
3. Se a tarefa tinha migration, conferir uma tela que dependa dela.

## Se a produção quebrar

1. Na Vercel, republicar a versão anterior; como as migrations só acrescentam, ela continua compatível com o banco.
2. Registrar issue `tipo:defeito` e corrigir pelo ciclo normal, começando por um teste que reproduz o defeito.

## Lembretes

- Variáveis de ambiente ficam só na Vercel e nas máquinas de quem precisa (`docs/plataforma/infraestrutura.md`); nunca no repositório.
- O plano gratuito do Supabase pausa projetos parados por alguns dias: acessar o sistema nos dias antes da apresentação.

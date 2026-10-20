# `src/shared/constants/` – Constantes e enums

Os valores de enum como listas `as const` (status, permissões, formas de pagamento, tipos de veículo e de serviço, portes), com os rótulos em português, e os limites usados pelos dois lados (tamanhos de página, máximo de 50, intervalo de 30 minutos).

## Vai aqui

- listas `as const` que são a fonte dos esquemas Zod e da interface
- rótulos de exibição dos enums e limites nomeados
- o fuso da empresa (`time-zone.ts`), usado pelos formatos e pelas regras do agendamento

## Não vai aqui

- valores que a empresa configura, como percentuais e horários (vêm do banco)
- segredos ou variáveis de ambiente
- constantes usadas só pelo servidor (ficam no módulo de `src/server/`)

## Referências

- `guia/mapa.md` (glossário)
- `docs/padroes/codigo.md`

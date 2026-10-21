---
titulo: Conteúdo das páginas públicas
assunto: catalogo
origem: issue #57, plano memoria/tarefas/57-telas-do-portal/01_plano.md (L2 a L5)
relacionados: [UC01, RF001, RF002, RF004, RF006, RN008, RN028, RN031]
---

# Conteúdo das páginas públicas

Seções e textos da página inicial (`/`) e do catálogo (`/services`) do [UC01](UC01-consultar-portal-publico.md). Cabeçalho e rodapé: [../padroes/layouts.md](../padroes/layouts.md); estilo: [../padroes/design.md](../padroes/design.md); imagens: [../padroes/design-midia.md](../padroes/design-midia.md).

Os textos fixos não citam dado da empresa; o nome, o endereço, o contato e os horários vêm de `GET /api/public/company` (RN028).

## Página inicial

As seções seguem a ordem do UC01 (passo 2). Quem já entrou vê a mesma página, só com o cabeçalho diferente (UC01 FA01).

### Destaque

- Sobretítulo: "Estética automotiva".
- Título: "Cuidado completo para o seu carro".
- Parágrafo: "Escolha o serviço, o dia e o horário pelo site e acompanhe cada etapa até a conclusão."
- Atalhos (RF002): "Criar conta" (`/register`, botão principal) e "Entrar" (`/login`).
- Texto e imagem lado a lado a partir de 1024 px; abaixo disso, o texto primeiro e a imagem embaixo, num cartão de destaque na proporção φ:1, sem texto sobre ela. A imagem é a única da página com `preload`.

### Institucional

- Título: "Sobre nós".
- Parágrafo: "Somos uma empresa de estética automotiva dedicada a deixar cada veículo limpo, protegido e bem cuidado, com atendimento por hora marcada."
- Três destaques, cada um com um ícone de 26 px:

| Ícone | Título | Texto |
|---|---|---|
| `CalendarCheck` | Agendamento pelo site | Escolha o serviço, o veículo, o dia e o horário disponível, sem precisar ligar. (UC06) |
| `ListChecks` | Acompanhamento | Veja em Meus agendamentos a situação de cada serviço, do agendamento à conclusão. (UC07, RN017) |
| `CarFront` | Seus veículos | Cadastre os seus veículos uma vez e use-os em todos os agendamentos. (UC05) |

### Localização

- Título: "Onde estamos".
- O endereço gravado, com o link "Como chegar", que abre a rota até ele no Google Maps (`https://www.google.com/maps/dir/?api=1&destination=` e o endereço codificado), na mesma aba. Sem endereço gravado, a linha e o link não aparecem.
- "Horário de funcionamento", de segunda a domingo, um dia por linha: o nome do dia e "08:00 às 12:00 e 13:00 às 18:00" (com pausa), "08:00 às 12:00" (sem pausa) ou "Fechado".
- Enquanto os dados carregam, o lugar fica reservado; na falha, o aviso com a mensagem e "Tentar novamente" (UC01 FE02).

## Catálogo

Os serviços principais e complementares ativos de categorias ativas (UC01, passo 4; RN008, RN031), de `GET /api/public/services`, em páginas de 12 ([../padroes/api.md](../padroes/api.md)).

- Título: "Serviços".
- Parágrafo, abaixo do título e do aviso de demonstração enquanto a tela usar os dados de demonstração ([../padroes/componentes.md](../padroes/componentes.md)): "Conheça os serviços disponíveis e filtre por categoria."
- Filtro: legenda "Categoria" e a primeira opção "Todas", seguida das categorias de `GET /api/public/categories`.
- Nenhum serviço (UC01 FE01): "Não há serviços disponíveis no momento."
- Enquanto os dados carregam, o lugar fica reservado; na falha, o aviso com a mensagem e "Tentar novamente" (UC01 FE02).

### Cartão

A imagem do serviço no topo, na proporção φ:1; sem imagem, o mesmo lugar rebaixado, com o ícone `CarFront` de 42 px. Abaixo, a categoria como sobretítulo, o nome, a descrição e "Duração média: <duração>".

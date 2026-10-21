---
titulo: Padrões de design – ícones e imagens
origem: issue #25, plano memoria/tarefas/25-base-do-frontend/01_plano.md (L6)
relacionados: [RNF006, RS015, 0041]
---

# Ícones e imagens

Parte de [design.md](design.md), separada pelo tamanho.

## Ícones

- Lucide (licença ISC), a biblioteca que vem com o shadcn/ui; não se usa outra.
- Contorno, traço de 1,5 e pontas arredondadas. O traço vem de uma regra de `src/app/globals.css`, sem repetir a propriedade em cada ícone.
- Tamanhos: 16 px em texto, botões e navegação; 26 px em ícones de destaque; 42 e 68 px só em ilustrações, como estado vazio e seções da página inicial.
- Cor: a do texto; o ícone ativo usa `--link`. Ícone decorativo leva `aria-hidden`.
- O Lucide não tem ícones de marca: as redes sociais aparecem como links de texto.
- `Sparkles` identifica o conteúdo gerado por IA, sempre com o texto que o diz.

## Imagens

- Só de bancos com licença de uso comercial gratuito, como Unsplash e Pexels. A licença é conferida na página de cada imagem, no dia do download.
- Sem marca, placa legível nem pessoa identificável (dado pessoal).
- Formato WebP; proporção de 1:1, φ:1 (1,618:1) ou 16:9; `object-fit: cover`; o raio do contêiner.
- Onde ficam:
  - as fixas, como a da seção de destaque, em `public/images/`, só quando o código as referencia;
  - as dos serviços entram pelo painel no Storage, como dado (RS015), inclusive as da demonstração.
- Texto sobre imagem fica sobre um degradê escuro, com 4,5:1 conferido na imagem escolhida.
- Carregamento pelo `next/image`, com a proporção reservada para não deslocar a página. Só a imagem da seção de destaque carrega com prioridade (`preload`, que substitui o `priority` no Next.js 16); as outras esperam até aparecer na tela (RNF006).
- Cada download é feito na tarefa da página que usa a imagem, com o aval do desenvolvedor para o arquivo (nome, fonte e tamanho).

## Créditos das imagens

| Arquivo | Autor | Fonte | Licença | Endereço | Data |
|---|---|---|---|---|---|
| `public/images/home-hero.webp` | Luay Barani (@luaybarani) | Unsplash | Licença da Unsplash | https://unsplash.com/photos/5SmPnmCjwcU | 21/10/2026 |

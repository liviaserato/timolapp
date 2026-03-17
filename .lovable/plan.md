

## Plano: Indicador de dots no carrossel de hoje

### O que muda

Substituir a barra de rolagem (scrollbar) por **indicadores de bolinhas (dots)** abaixo do carrossel, no estilo da imagem enviada — tracinhos/pontos onde o ativo fica mais escuro e os demais mais claros.

### Detalhes técnicos

No componente `TodayCarousel` (`src/pages/app/Treinamentos.tsx`):

1. **Adicionar estado `activeIndex`** — rastrear qual card está visível usando um `IntersectionObserver` ou calculando pelo `scrollLeft` no evento `onScroll`.
2. **Renderizar dots abaixo do carrossel** — uma fileira de tracinhos/barras curtas (como na referência), onde o dot ativo tem cor escura (`bg-foreground`) e os inativos ficam mais claros (`bg-muted-foreground/30`).
3. **Tornar dots clicáveis** — ao clicar em um dot, o carrossel faz scroll suave até o card correspondente.
4. **Esconder scrollbar** — garantir que a classe `scrollbar-hide` está aplicada e o `overflow-x` permanece funcional mas sem barra visível.
5. **Ocultar dots se houver apenas 1 evento** (mesma lógica dos chevrons).

### Estilo dos dots

Barras horizontais curtas (como na imagem), não círculos. Exemplo: `w-6 h-1 rounded-full` para cada indicador, com transição de opacidade/cor.




## Incorporar YouTube no App — Viabilidade e Plano

### Viabilidade

**Sim, é possível** incorporar tanto o player de vídeo quanto o chat ao vivo do YouTube usando iframes padrão do YouTube:

- **Player**: `https://www.youtube.com/embed/{videoId}` — funciona sem API key
- **Live Chat**: `https://www.youtube.com/live_chat?v={videoId}&embed_domain={domain}` — funciona para lives ativas, mas o YouTube exige que o `embed_domain` corresponda ao domínio real onde o iframe está hospedado (no caso, `lovable.app`)

**Limitação do Live Chat**: O embed do chat do YouTube é restrito por domínio pelo próprio YouTube. Funciona, mas o YouTube pode bloquear em alguns cenários. Uma alternativa confiável é abrir o chat em uma nova aba.

---

### Plano de Implementação

**1. Adicionar campo `youtubeUrl` ao tipo `WeekEvent`**
- Novo campo opcional `youtubeUrl?: string` em `types.ts`
- Adicionar URLs de exemplo nos dados mock em `constants.tsx`

**2. Criar nova página `AssistirAoVivo`** (`src/pages/app/AssistirAoVivo.tsx`)
- Recebe o ID do evento via query param ou route param
- Layout dividido:
  - **Desktop**: player do YouTube à esquerda (~70%) + chat do YouTube à direita (~30%)
  - **Mobile**: player em cima (aspect ratio 16:9) + chat embaixo (ocupa o resto da tela)
- Botão de voltar para `/app/treinamentos`
- Exibe título do evento, host e status "Ao Vivo"
- Fallback: botão para abrir o chat em nova aba caso o embed não funcione

**3. Adicionar rota no `App.tsx`**
- Nova rota: `/app/treinamentos/ao-vivo/:eventId`

**4. Conectar os botões "Assista ao vivo" e "Assistir gravação"**
- No `TodayEventCard` e `ScheduleEventCard`/`ScheduleEventRow`: os botões de "Assista ao vivo" e "Gravação" navegam para a nova tela quando o evento tem `youtubeUrl`
- Usar `useNavigate` do React Router

**5. Detalhes da tela**
- Iframe do player com `allowfullscreen`, `autoplay=1`
- Iframe do chat com altura responsiva
- Para gravações: mesmo layout mas sem o painel de chat
- Header com: botão voltar, título, badge "Ao Vivo" ou "Gravação", nome do host


# Exploração 1.30.0 — relevo e mundo aberto

Base preservada: produto1.29.1, Site115, source8bb0d365c6a29aae86cd40fca5e9c2a546c4ad69; GitHub c7e828ef2b2c7afa528bf12e92926070c8289a4f.

## Resultado
- Escada modular original com quatro degraus, desenho e colisão unidos por transformação uniforme. Percursos curtos nas salas31/32 e portão do castelo; âncora inferior refinada após teste real do raio do pet.
- Câmera alterna somente .65 (distante) e1.15 (próxima) no mesmo atalho circular, em ambas orientações.
- Retirados anéis antigos de vegetação e colisão invisível das salas1–30. Grupos irregulares de árvores/plantas com sementes estáveis, clareiras de missão/portais e colisões na raiz. Cache limitado1024 células; consulta física9 células para evitar custo repetido.
- NPCs opcionais redistribuídos por24 bolsões; adversários de missão e mestres preservados. Migração mantém HP, progresso e itens.
- Abrigos originais de rio/outono distintos; bosque e nascentes preservam suas identidades. Proveniência, prompts, hashes e âncoras em client/public/forest-adventure/biome-shelters/*manifest.json.
- Portais de salas concluídas permanecem abertos ao restaurar e visitar. Navegação automática bidirecional e recompensas sem duplicação mantidas.

## Validação
609 testes /62 arquivos passaram; TypeScript e diff whitespace passaram. Firebase Admin integração excluída por depender de credenciais externas. Teste novo cobre apoio inferior, rota da última placa à escada e piso superior de ambas salas.

Navegador cloud com partida isolada:844×390 e390×844; perto/longe, mapa completo de outono sem anel, missão31 concluída pela simulação real até base da escada, acesso de32 até interior do castelo por clique real no portão. Arte da escada inspecionada no cenário. Não equivale a teste em todos os aparelhos físicos ou revisão manual das32 salas. Anexos citados pelo usuário estavam indisponíveis localmente; não foram inspecionados.

Pesquisa de apoio: https://docs.mapeditor.org/en/stable/manual/objects/ ; https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection .

## Publicação
Publicado: produto1.30.0 / Site116; deploy appgdep_6ad8ade94f908191bdc0319335cd41f1 succeeded. Source26d1509387d5ce1f70cb70588190ff252de8c938. URL https://meupet.aquimeusite.chatgpt.site . Rollback: Site115 /1.29.1.

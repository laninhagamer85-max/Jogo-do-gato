# 🐱 Meu Pet Virtual - Edição Suprema de Minijogos

Um jogo interativo completo em HTML5 onde você cuida de um pet virtual, participa de minijogos e aprende curiosidades educativas a cada novo nível!

## 🎮 Sobre o Jogo

**Meu Pet Virtual** é um projeto lúdico que combina cuidados com um pet estilo Tamagotchi com 10 minijogos diferentes. A cada nível alcançado, você desbloqueia curiosidades fascinantes sobre animais, tecnologia, espaço e muito mais!

### 📊 Sistema de Atributos

O seu pet possui 4 atributos principais que precisam ser gerenciados:

- **Fome** 🍖 - Alimentar reduz a fome e custa moedas
- **Higiene** 🧼 - Dar banho mantém a higiene em 100%
- **Energia** 💤 - Dormir recupera energia rapidamente
- **Felicidade** ❤️ - Fazer carinho e jogar minijogos aumentam a felicidade

### 💰 Sistema de Progressão

- **Moedas**: Ganhe moedas ao terminar minijogos e use para alimentar/banhar seu pet
- **Experiência (XP)**: Acumule XP jogando e cuidando do pet
- **Níveis**: A cada nível atingido, receba bônus de moedas e desbloqueie curiosidades educativas
- **Armazenamento**: Seu progresso é salvo automaticamente no navegador (localStorage)

## 🎯 Os 10 Minijogos

| Minijogo | Descrição | Objetivo |
|----------|-----------|----------|
| 🧠 **Memória** | Encontre pares de emojis iguais | Virar 4 pares corretamente |
| 🐭 **Pega Rato** | Pegue ratinhos que caem | Ganhe 10 pontos por rato |
| 🐸 **Sapinho** | Capture moscas voadoras | Controle o sapo com mouse/toque |
| 🐟 **Peixe** | Pegue peixes, desvie de bombas | Ganhe pontos com peixes, perca com bombas |
| 🏎️ **Corrida** | Pegue moedas e desvie de obstáculos | Máxima pontuação em 60 segundos |
| 🟡 **Pac-Gato** | Coma rações fugindo do cachorro | Limpe o mapa de todas as rações |
| 🐍 **Cobrinha** | Guie a cobra para comer maçãs | Cresça sem bater em si mesmo |
| 🍄 **Super Pet** | Pule para pegar moedas | Timing perfeito no pulo |
| 🏃 **Pet Run** | Pule sobre obstáculos | Desvie das barreiras continuamente |
| 🏢 **Torre** | Empilhe blocos com precisão | Alinhe blocos caindo corretamente |
| 🚀 **Pet Space** | Desvie de asteroides | Sobreviva o máximo de tempo |

## 🎓 Curiosidades Educativas

Ao alcançar cada novo nível, você desbloqueia curiosidades fascinantes:

- Fatos sobre animais (gatos, cães, golfinhos, etc.)
- História dos videogames (Pac-Man, Tetris, Mario)
- Ciência e física (energia, oceanos, oxigênio)
- Astronomia (Vênus, espaço)

## 🎮 Como Jogar

### Começar
1. Clique no botão **"▶️ JOGAR"** na tela inicial
2. O loop de atributos do pet começará automaticamente

### Cuidar do Pet
- **🍖 Comer ($10)** - Reduz fome, ganha 15 XP
- **🧼 Banho ($5)** - Restaura higiene, ganha 10 XP
- **💤 Descansar** - Recupera energia rapidamente
- **❤️ Carinho** - Aumenta felicidade, ganha 5 XP

### Jogar Minijogos
- Clique em qualquer botão de minijogo
- Complete o objetivo para ganhar pontos
- Pontos = Moedas e XP ao sair
- Felicidade aumenta em +20 ao terminar

### Pausar
- Clique no botão **⏸️** no canto superior direito
- Todos os atributos ficam congelados

## 🛠️ Tecnologias Utilizadas

- **HTML5** - Estrutura da página
- **CSS3** - Estilo e design responsivo
- **JavaScript Vanilla** - Lógica do jogo, canvas, Web Audio API
- **LocalStorage** - Persistência de dados
- **Canvas API** - Renderização dos minijogos
- **Web Audio API** - Efeitos sonoros

## 📱 Compatibilidade

- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Responsivo para desktop e mobile
- ✅ Suporte a mouse e toque
- ✅ Funciona offline (salvo em localStorage)

## 📂 Estrutura do Arquivo

O projeto é um **arquivo HTML único** (`index.html`) que contém:
- Toda a estrutura HTML
- Todos os estilos CSS
- Todo o código JavaScript

Não há dependências externas!

## 🚀 Como Executar

### Opção 1: Abrir localmente
1. Baixe o arquivo `index.html`
2. Clique 2x ou abra com seu navegador

### Opção 2: GitHub Pages
1. Ative GitHub Pages nas configurações do repositório
2. Aponte para a branch `main`
3. Acesse via `https://laninhagamer85-max.github.io/Jogo-do-gato/`

## 💾 Dados Salvos

O jogo salva automaticamente:
- Nível atual
- XP acumulada
- Moedas
- Estado do pet

Os dados ficam armazenados no localStorage do navegador.

## 🎨 Customização

Você pode modificar:
- **Cores**: Altere os valores HEX no CSS
- **Emojis**: Troque os ícones dos personagens
- **Dificuldade**: Ajuste velocidades nos minijogos (valores de `setInterval`)
- **Curiosidades**: Edite o array `historiasEducativas`

## 📝 Exemplos de Código

### Ganhar XP
```javascript
ganharXP(15); // Ganha 15 de experiência
```

### Usar Moedas
```javascript
game.moedas -= 10; // Gasta 10 moedas
```

### Tocar Som
```javascript
tocarSom('coin'); // click, coin, levelup
```

## 🐛 Melhorias Futuras

- [ ] Salvar em cloud/servidor
- [ ] Multiplayer online
- [ ] Mais minijogos
- [ ] Customização visual do pet
- [ ] Sistema de achievements
- [ ] Ranking de pontuação
- [ ] Temas escuro/claro
- [ ] Múltiplos idiomas

## 👨‍💻 Autor

Desenvolvido por **laninhagamer85-max**

## 📄 Licença

Este projeto é de uso livre para fins educacionais e recreativos.

---

**Aproveite e cuide bem do seu pet! 🐱✨**

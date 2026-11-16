# 💸 App de Finanças Pessoais do Mauro com Vibe Coding

Aprenda a **criar soluções com IA** de forma criativa, guiando ferramentas como o **Copilot** e o **Lovable** com uma comunicação simples e natural. O foco é desenvolver o conceito de um **App de Organização de Finanças Pessoais**, mas, acima de tudo, aprender o **jeito Vibe de programar com IA**.

## Sobre o Projeto

Muitas pessoas desistem de controlar suas finanças porque os aplicativos tradicionais exigem cadastro manual de informações, telas complexas e pouco acompanhamento.

O objetivo deste projeto é simplificar o processo utilizando linguagem natural, permitindo que o usuário converse com um assistente financeiro em vez de preencher formulários.

Exemplo:

> Gastei R$ 35 com almoço hoje.

O sistema interpreta automaticamente:

- Valor
- Categoria
- Data
- Descrição

E atualiza os relatórios financeiros em tempo real.

---

## Principais Funcionalidades

### Registro de Gastos por Conversa

O usuário informa despesas utilizando linguagem natural.

Exemplos:

- Gastei R$ 20 no ônibus.
- Comprei um livro por R$ 80.
- Paguei R$ 120 de internet.

### Classificação Automática

As despesas são classificadas automaticamente em categorias como:

- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras

### Metas Financeiras

Permite criar objetivos financeiros como:

- Reserva de emergência
- Viagem
- Compra de equipamento
- Cursos

### Agente Financeiro

Assistente responsável por gerar recomendações personalizadas.

Exemplos:

- Você gastou mais do que a média em alimentação.
- Sua meta pode ser alcançada dois meses antes se economizar R$ 100 por mês.

### Dashboard Financeiro

Visualização simplificada de:

- Gastos mensais
- Gastos por categoria
- Evolução financeira
- Progresso das metas

---

## Design Universal

Este projeto segue princípios de Design Universal.

Objetivos:

- Ser utilizável pelo maior número possível de pessoas.
- Possuir interface intuitiva.
- Funcionar bem para iniciantes.
- Possuir acessibilidade desde a concepção.
- Reduzir barreiras cognitivas e tecnológicas.

O produto foi projetado para atender:

- Jovens
- Adultos
- Idosos
- Pessoas com diferentes níveis de alfabetização digital
- Usuários de tecnologias assistivas

---

## Responsividade

A aplicação deve funcionar adequadamente em:

- Smartphones
- Tablets
- Notebooks
- Computadores Desktop

A experiência deve permanecer consistente independentemente do tamanho da tela.

---

## Tecnologias

Frontend:

- React
- TypeScript
- TailwindCSS

Backend:

- Supabase

Inteligência Artificial:

- LLM para interpretação de linguagem natural
- Agente Financeiro Conversacional

---

## Estrutura Inicial do Projeto

```text
src/
├── components/
├── pages/
├── features/
│   ├── chat/
│   ├── dashboard/
│   ├── goals/
│   └── reports/
├── services/
├── hooks/
├── utils/
└── types/
```

---

## Fluxo do Usuário

### Primeiro Acesso

1. Criar conta.
2. Definir objetivo financeiro.
3. Iniciar conversa com o assistente.

### Uso Diário

1. Registrar gasto.
2. Sistema classifica automaticamente.
3. Dashboard é atualizado.
4. Usuário recebe recomendações.

---

## Instalação

Clone o repositório:

```bash
git clone https://github.com/seu-usuario/finance-chat.git
```

Entre na pasta:

```bash
cd finance-chat
```

Instale as dependências:

```bash
npm install
```

Execute o projeto:

```bash
npm run dev
```

---

## Roadmap

### MVP

- [ ] Login
- [ ] Chat financeiro
- [ ] Registro de despesas
- [ ] Dashboard básico
- [ ] Metas financeiras

### Próximas Versões

- [ ] Open Finance
- [ ] Importação de extratos
- [ ] Comandos por voz
- [ ] Notificações inteligentes
- [ ] Planejamento financeiro com IA
- [ ] Aplicativo mobile

---

## Métricas de Sucesso

- Frequência de uso do chat.
- Número de despesas registradas.
- Quantidade de metas criadas.
- Retenção de usuários.
- Satisfação dos usuários.

---

## Contribuição

Contribuições são bem-vindas.

Caso encontre problemas ou tenha sugestões de melhoria, abra uma Issue ou envie um Pull Request.

---

## Licença

Este projeto está licenciado sob a licença MIT.
### 3. Entregando o Desafio na DIO



```
# PRD - Organizador Financeiro Conversacional

## 1. Visão do Produto

Criar um aplicativo de finanças pessoais baseado em conversação que permita aos usuários registrar gastos, acompanhar metas financeiras e receber recomendações personalizadas por meio de uma interface de chat simples e amigável.

O objetivo é reduzir a fricção existente nos aplicativos tradicionais de controle financeiro, eliminando a necessidade de preenchimento constante de formulários e planilhas.

---

## 2. Problema

Muitas pessoas desejam organizar suas finanças, mas abandonam o processo porque:

- O registro manual de despesas é trabalhoso.
- Os aplicativos possuem interfaces complexas.
- Há pouca personalização e orientação prática.
- Os usuários não transformam dados financeiros em ações concretas.

Como consequência, o controle financeiro se torna inconsistente e os usuários perdem visibilidade sobre seus hábitos de consumo.

---

## 3. Público-Alvo

### Público Primário

Pessoas iniciantes em educação financeira que desejam organizar seus gastos de forma simples e intuitiva.

### Público Secundário

- Jovens adultos iniciando sua vida financeira.
- Profissionais que não gostam de planilhas.
- Usuários que já tentaram utilizar aplicativos financeiros e desistiram.

---

## 4. Proposta de Valor

"O jeito mais simples de organizar suas finanças: converse com seu aplicativo como se estivesse falando com um assistente pessoal."

Exemplos:

- Gastei R$ 45 no almoço hoje.
- Paguei R$ 120 de internet.
- Quero guardar R$ 3.000 para viajar em dezembro.
- Quanto gastei com transporte este mês?

---

## 5. Princípios de Design Universal e Acessibilidade

O produto deve seguir princípios de Design Universal desde sua concepção, buscando atender ao maior número possível de usuários sem necessidade de adaptações posteriores.

### Diretrizes

- Interface simples e intuitiva.
- Linguagem clara e livre de jargões financeiros.
- Navegação consistente em todas as telas.
- Contraste adequado entre texto e fundo.
- Compatibilidade com leitores de tela.
- Componentes acessíveis via teclado.
- Ícones acompanhados por texto.
- Feedback claro para todas as ações do usuário.
- Tamanho de fonte ajustável.
- Mensagens de erro compreensíveis.
- Suporte a modo claro e modo escuro.
- Fluxos simplificados para usuários iniciantes.
- Baixa carga cognitiva.
- Boa experiência em dispositivos móveis e desktops.

### Critérios de Aceitação

- Um usuário iniciante deve conseguir registrar uma despesa em menos de 1 minuto.
- Usuários com diferentes níveis de familiaridade tecnológica devem compreender os fluxos principais.
- As funcionalidades críticas devem ser compatíveis com tecnologias assistivas.
- O produto deve seguir as boas práticas de acessibilidade digital baseadas nas WCAG sempre que possível.

---

## 6. Objetivos do MVP

Validar se usuários conseguem:

1. Registrar despesas usando linguagem natural.
2. Entender facilmente sua situação financeira.
3. Receber valor real através de recomendações automáticas.
4. Voltar a utilizar o aplicativo regularmente.

---

## 7. Funcionalidades do MVP

### F1. Registro de Gastos por Chat

Descrição:

O usuário envia mensagens em linguagem natural.

Exemplos:

- Gastei R$ 30 no mercado.
- Paguei R$ 12 de estacionamento.
- Comprei um tênis por R$ 250.

Resultado esperado:

O sistema identifica:

- Valor
- Categoria
- Data
- Descrição

---

### F2. Classificação Automática

Descrição:

Classificar transações automaticamente.

Categorias iniciais:

- Alimentação
- Transporte
- Moradia
- Saúde
- Educação
- Lazer
- Compras
- Outros

Exemplo:

"R$ 50 no restaurante"

Resultado:

Categoria = Alimentação

---

### F3. Metas Financeiras

Descrição:

Permitir criação de metas financeiras.

Exemplos:

- Comprar um notebook.
- Fazer uma viagem.
- Criar reserva de emergência.

Dados da meta:

- Nome
- Valor desejado
- Prazo
- Progresso atual

---

### F4. Agente Financeiro

Descrição:

Assistente virtual que analisa o comportamento financeiro do usuário.

Exemplos de recomendações:

- Você gastou 25% mais em alimentação nesta semana.
- Se reduzir R$ 100 por mês em lazer, atingirá sua meta dois meses antes.
- Seu maior gasto atual está concentrado em transporte.

Tom do assistente:

- Educativo
- Motivador
- Não julgador
- Objetivo

---

### F5. Relatórios Simples

Descrição:

Gerar visualizações acessíveis para usuários iniciantes.

Indicadores:

- Gastos por categoria
- Evolução mensal
- Progresso das metas
- Maiores despesas do período

---

## 8. Fluxo Principal do Usuário

### Primeiro Acesso

1. Criar conta.
2. Informar nome.
3. Definir objetivo financeiro principal.
4. Iniciar conversa com o assistente.

### Uso Diário

1. Registrar gasto por mensagem.
2. Sistema interpreta e salva.
3. Assistente apresenta feedback.
4. Dashboard é atualizado automaticamente.

---

## 9. Principais Telas

### Tela 1 - Onboarding

Objetivo:

Explicar rapidamente como funciona o aplicativo.

Elementos:

- Boas-vindas
- Benefícios
- Cadastro/Login

---

### Tela 2 - Chat Financeiro

Objetivo:

Centralizar toda interação do usuário.

Elementos:

- Histórico de mensagens
- Campo de entrada
- Sugestões rápidas

---

### Tela 3 - Dashboard

Objetivo:

Apresentar a situação financeira atual.

Elementos:

- Total gasto no mês
- Distribuição por categoria
- Alertas
- Resumo financeiro

---

### Tela 4 - Metas

Objetivo:

Criar e acompanhar objetivos financeiros.

Elementos:

- Lista de metas
- Barra de progresso
- Previsão de conclusão

---

### Tela 5 - Perfil e Configurações

Elementos:

- Dados do usuário
- Preferências
- Configurações de notificação
- Acessibilidade

---

## 10. Requisitos Não Funcionais

- Interface mobile-first.
- Design clean e minimalista.
- Linguagem simples e acessível.
- Resposta em menos de 3 segundos.
- Suporte inicial ao português brasileiro.
- Arquitetura escalável para futuras integrações.
- Design Universal como princípio obrigatório.
- Compatibilidade com tecnologias assistivas.
- Modo claro e modo escuro.
- Acessibilidade considerada requisito essencial do produto.

---

## 11. Métricas de Sucesso

### Produto

- Número de gastos registrados por usuário.
- Usuários ativos semanalmente.
- Quantidade de metas criadas.
- Frequência de uso do chat.

### Experiência

- Tempo para registrar uma despesa.
- Taxa de classificação correta.
- Satisfação do usuário.
- Taxa de conclusão do onboarding.

---

## 12. Hipóteses a Validar

1. Usuários preferem conversar em vez de preencher formulários.
2. O registro por linguagem natural aumenta a frequência de uso.
3. Recomendações automáticas aumentam o engajamento.
4. Relatórios simplificados são suficientes para iniciantes.
5. Uma experiência acessível aumenta retenção e satisfação.

---

## 13. Escopo Futuro

- Integração bancária.
- Open Finance.
- Importação de extratos.
- Comandos por voz.
- Planejamento financeiro com IA.
- Notificações proativas.
- Detecção automática de padrões financeiros.
- Sugestões avançadas de economia.
- Gamificação de hábitos financeiros.

---

## Plano de MVP

### Fase 1 - Protótipo Funcional

Construir:

- Login simples.
- Chat principal.
- Registro de gastos por linguagem natural.
- Dashboard básico.
- Cadastro de metas.

### Fase 2 - Inteligência Financeira

Adicionar:

- Classificação automática.
- Recomendações personalizadas.
- Insights financeiros.

### Fase 3 - Validação

Testar:

- Facilidade de uso.
- Clareza dos relatórios.
- Qualidade das recomendações.
- Retenção após 7 dias.

---

## Diretrizes para Geração da Aplicação

Stack desejada:

- React
- TypeScript
- Supabase
- TailwindCSS

Estilo Visual:

- Moderno
- Clean
- Mobile-first
- Inspirado em Nubank e Duolingo

Prioridades:

1. Experiência conversacional.
2. Simplicidade extrema.
3. Design Universal.
4. Acessibilidade.
5. Onboarding rápido.

Princípio Central do Produto:

"Se uma pessoa de 65 anos que nunca utilizou um aplicativo financeiro conseguir registrar sua primeira despesa sem ajuda em menos de 60 segundos, a experiência está no caminho certo."

```
# Finance Chat

Aplicativo de organização financeira pessoal baseado em conversação.

Projeto educacional criado para estudo de Vibe Coding, Design Universal, acessibilidade, UX e desenvolvimento de produtos digitais orientados por IA.

## Aplicação Online

Acesse a versão publicada:

 https://dinheiro-em-dia-20.lovable.app

---
...

> [!TIP]
> Publique seu repositório e compartilhe o link na plataforma da DIO! Sua entrega é a prova de que você domina o raciocínio de Vibe Coding, mesmo sem escrever uma única linha de código.

## 💬 Conclusão

Vibe Coding é sobre clareza, curiosidade e criatividade, não sobre perfeição técnica. O verdadeiro objetivo aqui é aprender a pensar junto com a IA, transformando ideias em conceitos reais e enxergando a tecnologia como uma extensão do seu raciocínio criativo. Cada interação é um experimento, quanto mais clara for sua intenção, mais surpreendente será o resultado.

# AgendeWeb - Sistema de Agendamento para Profissionais Autônomos

## 📋 Descrição

**AgendeWeb** é um protótipo funcional completo de um sistema de agendamento web desenvolvido em **HTML, CSS e JavaScript puro**, sem necessidade de backend. Todos os dados são armazenados localmente no navegador usando **LocalStorage**.

O sistema permite que profissionais autônomos gerenciem sua agenda e que clientes agendem horários de forma simples e intuitiva.

## ✨ Características Principais

### Para Clientes
- ✅ Criar conta e fazer login
- ✅ Visualizar profissionais disponíveis
- ✅ Agendar horários com profissionais
- ✅ Visualizar seus agendamentos
- ✅ Cancelar agendamentos
- ✅ Agendar como convidado (sem cadastro)

### Para Profissionais
- ✅ Criar conta e fazer login
- ✅ Definir horários de funcionamento
- ✅ Configurar duração dos atendimentos
- ✅ Visualizar agenda completa
- ✅ Filtrar agendamentos por data
- ✅ Cancelar agendamentos
- ✅ Gerenciar disponibilidade

## 🚀 Como Usar

### 1. Abrir o Projeto
Simplesmente abra o arquivo `index.html` no seu navegador:
```bash
# No Linux/Mac
open index.html

# No Windows
start index.html

# Ou arraste o arquivo para o navegador
```

### 2. Dados de Demonstração
Para testar o sistema, use as credenciais de demonstração:

**Cliente:**
- Email: `demo@cliente.com`
- Senha: `123456`

**Profissional:**
- Email: `demo@prof.com`
- Senha: `123456`

### 3. Criar Nova Conta
Clique em "Criar Conta" e preencha os dados:
- Nome completo
- Email
- Telefone
- Senha (mínimo 6 caracteres)
- Tipo de conta (Cliente ou Profissional)
- Se profissional: profissão e descrição (opcional)

## 📁 Estrutura de Arquivos

```
AgendeWeb/
├── index.html                 # Página principal com todas as telas
├── README.md                  # Este arquivo
├── assets/
│   ├── style.css             # Estilos CSS (responsivo)
│   └── script.js             # Lógica JavaScript
└── .gitignore               # Arquivo para Git
```

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura das páginas
- **CSS3** - Estilos responsivos e modernos
- **JavaScript (ES6+)** - Lógica da aplicação
- **LocalStorage** - Persistência de dados local

## 💾 Estrutura de Dados

### Usuários
```javascript
{
  id: 1,
  name: "Nome",
  email: "email@example.com",
  phone: "(11) 99999-9999",
  password: "123456",
  type: "cliente" | "profissional",
  profession: "Profissão" (apenas profissional),
  bio: "Descrição" (apenas profissional),
  createdAt: "2024-01-01T10:00:00Z"
}
```

### Agendamentos
```javascript
{
  id: 1,
  clientId: 1,
  clientName: "Nome Cliente",
  clientPhone: "(11) 99999-9999",
  professionalId: 2,
  professionalName: "Nome Profissional",
  date: "2024-01-15",
  time: "14:30",
  notes: "Observações opcionais",
  status: "confirmed" | "cancelled",
  isGuest: false,
  createdAt: "2024-01-01T10:00:00Z"
}
```

### Disponibilidade
```javascript
{
  [professionalId]: {
    startTime: "08:00",
    endTime: "18:00",
    interval: 50
  }
}
```

## 🎨 Design e Responsividade

- **Design Moderno**: Interface limpa e intuitiva com gradientes e sombras
- **Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Cores Personalizadas**: Paleta de cores profissional e acessível
- **Animações Suaves**: Transições agradáveis entre páginas e elementos

## 🔐 Segurança

⚠️ **Nota Importante**: Este é um protótipo de demonstração. Para produção:
- Implemente autenticação no backend
- Use HTTPS para transmissão de dados
- Implemente validação de dados no servidor
- Não armazene senhas em texto plano
- Use tokens JWT ou sessões seguras

## 📱 Funcionalidades Detalhadas

### Sistema de Horários
- Horários gerados automaticamente em intervalos configuráveis (padrão: 50 minutos)
- Horários ocupados não aparecem para agendamento
- Suporte a diferentes durações de atendimento
- Horários futuros apenas (não permite agendar no passado)

### Gerenciamento de Agenda
- Visualização de todos os agendamentos
- Filtro por data
- Cards destacados com informações completas
- Opção de copiar informações do agendamento
- Cancelamento com confirmação

### Agendamento como Convidado
- Sem necessidade de cadastro
- Apenas nome e telefone obrigatórios
- Email opcional
- Dados salvos localmente

## 🐛 Resolução de Problemas

### Dados não aparecem após recarregar
- Verifique se o navegador permite LocalStorage
- Limpe o cache do navegador
- Tente em modo incógnito

### Horários não aparecem
- Certifique-se de que a disponibilidade foi configurada
- Verifique a data selecionada
- Confirme que não há conflitos com agendamentos existentes

### Não consigo fazer login
- Verifique se o email e senha estão corretos
- Confirme o tipo de conta (Cliente ou Profissional)
- Tente criar uma nova conta

## 📊 Casos de Uso

### Cenário 1: Cliente Agendando
1. Cliente faz login
2. Visualiza profissionais disponíveis
3. Seleciona um profissional
4. Escolhe data e horário
5. Adiciona observações (opcional)
6. Confirma agendamento
7. Agendamento aparece em "Meus Agendamentos"

### Cenário 2: Profissional Gerenciando Agenda
1. Profissional faz login
2. Configura horários de funcionamento
3. Visualiza agenda com todos os agendamentos
4. Filtra por data se necessário
5. Pode cancelar agendamentos se necessário

### Cenário 3: Convidado Agendando
1. Clica em "Agendar como Convidado" na página inicial
2. Preenche nome e telefone
3. Seleciona profissional
4. Escolhe data e horário
5. Confirma agendamento
6. Agendamento é salvo localmente

## 🚀 Melhorias Futuras

- [ ] Notificações por email
- [ ] Integração com calendário (Google Calendar, Outlook)
- [ ] Sistema de avaliações e comentários
- [ ] Relatórios de agendamentos
- [ ] Backup e sincronização na nuvem
- [ ] Versão PWA (Progressive Web App)
- [ ] Integração com pagamento
- [ ] Lembretes automáticos

## 📝 Licença

Este projeto é fornecido como está, sem garantias. Sinta-se livre para usar, modificar e distribuir.

## 👨‍💻 Desenvolvimento

Desenvolvido como um protótipo funcional de sistema de agendamento web.

### Requisitos Atendidos
- ✅ Login e Cadastro com validação
- ✅ Dois tipos de usuário (Cliente e Profissional)
- ✅ Agendamento com horários disponíveis
- ✅ Cancelamento de agendamentos
- ✅ Agendamento como convidado
- ✅ Gerenciamento de disponibilidade
- ✅ Visualização de agenda completa
- ✅ LocalStorage para persistência
- ✅ Interface responsiva
- ✅ Design moderno e intuitivo

## 📞 Suporte

Para dúvidas ou sugestões sobre o projeto, consulte a documentação ou revise o código JavaScript.

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Status**: ✅ Completo e Funcional

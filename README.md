# TrajetEla — Tela de Login

## Como rodar localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

```bash
# 1. Entre na pasta do projeto
cd trajetela

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

---

## Estrutura do projeto

```
trajetela/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── components/
    │   └── Logo.jsx          # Logo SVG inline + nome
    └── pages/
        └── Login.jsx         # Tela de login completa
```

## Funcionalidades

- **Google / Microsoft** — botões visuais (sem integração ainda)
- **E-mail ou telefone** — campo de texto com validação básica
- **Senha** — campo com toggle "Exibir / Ocultar"
- **Lembrar dos meus dados** — checkbox
- **Esqueceu a senha** — link (sem rota ainda)
- **Continuar** — botão com validação de campos
- **Cadastre-se agora** — link (sem rota ainda)
- Layout **responsivo para mobile** (max-w-sm centralizado)
- Cores principais: `#291662` (roxo escuro) e `#8F55E9` (roxo vibrante)

## Próximos passos sugeridos

1. Adicionar React Router para navegar entre Login e Cadastro
2. Integrar Google OAuth / Microsoft SSO
3. Criar tela de Cadastro
4. Criar tela de Recuperação de Senha
5. Conectar ao back-end de autenticação

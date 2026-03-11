# Omni.chat — Setup (igual à fritadeira, só pelo dashboard)

---

## 1. Criar o projeto no Cloudflare Pages

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages → Create → Pages**
2. Conecte seu repositório GitHub → selecione o repo `omni-chat`
3. Em **Build settings**: deixe tudo em branco (não há build)
4. Clique em **Save and Deploy**

---

## 2. Criar o KV Namespace

1. Menu lateral → **Workers & Pages → KV**
2. **Create namespace** → nome: `CHAT_KV` → **Add**
3. Copie o ID gerado

---

## 3. Associar o KV ao projeto (igual à sua tela da fritadeira)

No seu projeto Pages → **Settings → Associações → + Adicionar**

| Campo | Valor |
|-------|-------|
| Tipo | Namespace de KV |
| Nome | `CHAT_KV` |
| Namespace | o que você criou |

---

## 4. Adicionar Secrets no GitHub

Repositório → **Settings → Secrets and variables → Actions → New repository secret**

| Nome | Onde pegar |
|------|-----------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare → Meu Perfil → API Tokens → Create Token → **Edit Cloudflare Workers** |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare → home → lado direito (Account ID) |

---

## 5. Pronto

Qualquer push na `main` faz o deploy automático.

```
push na main → GitHub Actions → Pages deploy → ✅
```

---

## Estrutura

```
omni-chat/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← CI/CD automático
├── functions/
│   └── api/
│       └── messages.js         ← API (GET + POST)
└── index.html                  ← Frontend completo
```

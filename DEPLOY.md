# Deploy — VPS + auto-deploy

Runbook pra colocar o app no ar na Vultr (São Paulo) com domínio `ricardordrj.com` via Cloudflare, e deploy automático via GitHub Actions a cada push na `main`.

Assume: instância Ubuntu 24.04 na Vultr, domínio já registrado no Cloudflare. Os comandos abaixo rodam via SSH, direto no servidor — eu não tenho acesso remoto a ele, então esses passos precisam ser executados por você.

## 1. Primeiro acesso e hardening básico

Conecta como root (senha/chave que a Vultr te deu):

```bash
ssh root@SEU_IP_AQUI
```

Atualiza o sistema e cria um usuário não-root pra rodar o app:

```bash
apt update && apt upgrade -y
adduser deploy
usermod -aG sudo deploy
```

Copia sua chave SSH pro novo usuário (pra não depender mais da senha de root):

```bash
rsync --archive --chown=deploy:deploy ~/.ssh /home/deploy
```

Firewall básico — só SSH, HTTP e HTTPS:

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
```

Recomendado: desabilitar login de root por senha, deixando só chave. Edita `/etc/ssh/sshd_config`, define `PermitRootLogin prohibit-password`, depois `systemctl restart ssh`.

## 2. Instalar dependências

Daqui pra frente, entra como `deploy` (`ssh deploy@SEU_IP`):

```bash
# Node 24.x LTS
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs git

# Caddy (proxy reverso com HTTPS automático)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 3. Clonar o repositório

Como `deploy`, na home:

```bash
cd ~
git clone https://github.com/ricardordrj/organizator3000.git
cd organizator3000
npm ci
npm run build:all
npm run db:migrate -w server
```

## 4. Rodar o app como serviço (systemd, sem precisar de root)

Copia o unit que já está no repo:

```bash
mkdir -p ~/.config/systemd/user
cp ~/organizator3000/deploy/organizator3000.service ~/.config/systemd/user/
systemctl --user daemon-reload
systemctl --user enable --now organizator3000
```

Pra esse serviço continuar rodando mesmo depois de você desconectar do SSH, ativa o "linger" (uma vez, precisa de sudo):

```bash
sudo loginctl enable-linger deploy
```

Confere se subiu:

```bash
curl localhost:4000/api/health
# deve responder {"status":"ok"}
```

## 5. Caddy + domínio

Copia o Caddyfile do repo (já configurado pra `ricardordrj.com`):

```bash
sudo cp ~/organizator3000/deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

No painel da Cloudflare:
1. Adiciona um registro **A** apontando `ricardordrj.com` pro IP da VPS
2. Em SSL/TLS, define o modo como **Full** (ou **Full (strict)** depois que o Caddy emitir o certificado Let's Encrypt automaticamente)

Espera a propagação de DNS (geralmente minutos) e testa `https://ricardordrj.com`.

## 6. Deploy automático (GitHub Actions)

Na sua máquina local, gera um par de chaves SSH dedicado só pro deploy (não reaproveita sua chave pessoal):

```bash
ssh-keygen -t ed25519 -f deploy_key -C "github-actions-deploy" -N ""
```

Isso gera `deploy_key` (privada) e `deploy_key.pub` (pública).

Copia a **pública** pro servidor, no usuário `deploy`:

```bash
ssh-copy-id -i deploy_key.pub deploy@SEU_IP
```

No GitHub, no repositório `organizator3000` → **Settings → Secrets and variables → Actions → New repository secret**, cria:
- `VPS_HOST`: o IP da sua VPS
- `VPS_SSH_KEY`: o conteúdo do arquivo `deploy_key` (a chave **privada**, o arquivo inteiro)

O workflow `.github/workflows/deploy.yml` (já commitado neste repo) já usa esses secrets: a cada push na `main`, ele entra via SSH e roda `deploy/deploy.sh`, que faz `git pull` + build + migração + restart do serviço.

## 7. Testar

```bash
git commit --allow-empty -m "test: dispara deploy"
git push origin main
```

Acompanha em **Actions**, no GitHub — se rodar verde, o site já deve refletir a mudança em `https://ricardordrj.com`.

## 8. Proteger o acesso (Cloudflare Access)

Autenticação sem escrever código — tudo configurado no painel da Cloudflare (Zero Trust), na frente do domínio. Ninguém chega no servidor sem antes passar por aqui.

### 8.1 Ativar o Zero Trust

Na primeira vez, a Cloudflare pede pra escolher um **team name** (vira `SEUTIME.cloudflareaccess.com` — é só um identificador interno deles, não afeta seu domínio real). Escolhe qualquer nome disponível.

### 8.2 Método de login 1 — One-Time PIN (fallback, zero configuração)

Zero Trust → **Settings → Authentication** (ou "Identity providers", dependendo da versão do painel) → **Add new** → **One-time PIN** → Save.

Esse método já funciona pra qualquer e-mail que você colocar na política de acesso (passo 8.4) — sem cadastro externo nenhum. É o que seu amigo vai usar, se um dia você liberar acesso pra ele.

### 8.3 Método de login 2 — Google (seu uso do dia a dia)

Precisa criar um client OAuth no Google Cloud Console primeiro:

1. Acessa [console.cloud.google.com](https://console.cloud.google.com), cria um projeto novo (ou usa um existente)
2. **APIs & Services → OAuth consent screen** → configura como **External**, preenche nome do app e e-mail de suporte
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → tipo **Web application**
4. Em **Authorized redirect URIs**, adiciona:
   ```
   https://SEUTIME.cloudflareaccess.com/cdn-cgi/access/callback
   ```
   (troca `SEUTIME` pelo team name do passo 8.1)
5. Copia o **Client ID** e o **Client Secret** gerados

Volta pro Cloudflare: Zero Trust → **Identity providers** → **Add new** → **Google** → cola o Client ID e Client Secret → **Save**. Testa a conexão com o botão **Test** ao lado do provider.

### 8.4 Criar a Access Application

Zero Trust → **Access → Applications → Add an application → Self-hosted**:

1. **Application domain**: `ricardordrj.com`
2. Em **Identity providers**, marca **One-Time PIN** e **Google** (os dois que configuramos)
3. **Session duration**: pode deixar algo confortável tipo 24h ou 1 semana, já que é uso pessoal
4. Cria a **Access Policy**:
   - Nome: `Só eu`
   - Action: **Allow**
   - Include: **Emails** → seu e-mail (`ricardordrj@gmail.com` ou o que você usa no Google)
5. Salva

### 8.5 Testar

Abre uma aba anônima e acessa `https://ricardordrj.com` — deve aparecer a tela de login da Cloudflare (com as opções Google e One-Time PIN) **antes** de qualquer coisa do seu app. Só entra quem estiver na política.

### 8.6 Liberar um amigo depois (fallback)

Edita a Access Policy do passo 8.4 → adiciona o e-mail da pessoa na lista de **Emails** incluídos → salva. Na próxima vez que essa pessoa acessar o site, ela recebe um código por e-mail (One-Time PIN) e entra — sem precisar configurar nada do lado dela. Pra revogar, é só tirar o e-mail da lista.

## Notas de segurança

- O usuário `deploy` roda o app sem privilégios de root — se o app for comprometido, o estrago fica bem mais contido.
- A chave SSH usada pelo GitHub Actions é dedicada só pra isso — se vazar, revoga só ela (remove do `authorized_keys` do servidor) sem afetar seu acesso pessoal.
- Considerar, mais pra frente, restringir o Caddy/firewall pra só aceitar tráfego vindo dos IPs da Cloudflare nas portas 80/443 (hardening extra, não obrigatório pra começar).

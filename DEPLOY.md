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

## Notas de segurança

- O usuário `deploy` roda o app sem privilégios de root — se o app for comprometido, o estrago fica bem mais contido.
- A chave SSH usada pelo GitHub Actions é dedicada só pra isso — se vazar, revoga só ela (remove do `authorized_keys` do servidor) sem afetar seu acesso pessoal.
- Considerar, mais pra frente, restringir o Caddy/firewall pra só aceitar tráfego vindo dos IPs da Cloudflare nas portas 80/443 (hardening extra, não obrigatório pra começar).

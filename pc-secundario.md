# PC secundário — rascunho

Montado com as peças que sobram do upgrade do PC principal (ver plano em Compras → Upgrade PC).

## Hardware atual do PC principal (lido em 2026-10-12)

| Peça | Modelo | Destino |
|---|---|---|
| CPU | AMD Ryzen 5 3600 (6c/12t, sem vídeo integrado) | → PC secundário (Fase 2) |
| Placa-mãe | Gigabyte B450M DS3H-CF, BIOS F41 (2019) | → PC secundário (Fase 4) |
| RAM | 2x 16GB ADATA XPG `AX4U320016G16A` (3200 CL16) | fica no principal |
| RAM | 1x 16GB Corsair Vengeance `CMK32GX4M2Z2400C16` (2400 CL16) | → PC secundário |
| GPU | NVIDIA RTX 3060 | fica no principal |
| Fonte | antiga (serve pra RX 590) | → PC secundário (Fase 1) |
| SSD SATA | 120GB | → PC secundário, se o Ubuntu for pro NVMe novo (Fase 5) |

Hoje tudo roda a 2400MHz por causa do pente Corsair, e os canais estão desbalanceados (1 pente no A, 2 no B). Tirando ele, ficam os 2 ADATA nos slots A2/B2 (conferir no manual) com XMP a 3200.

## Peças do secundário

- [x] Ryzen 5 3600 + cooler box
- [x] B450M DS3H
- [x] 16GB DDR4 2400 (single channel)
- [x] AMD RX 590 8GB — ~225W, conectores 8+6 pinos
- [x] SSD SATA 120GB
- [ ] Gabinete
- [x] Fonte antiga
- [ ] (opcional) Mais armazenamento — 120GB é pouco pra qualquer coisa além do SO

## Possibilidades

### 1. PC gamer 1080p (família / sala)
A RX 590 equivale mais ou menos a uma GTX 1060 6GB. Roda bem a maioria dos jogos em 1080p no médio/alto e com folga jogos mais leves e indies.
- Precisa: fonte boa, gabinete, SSD maior (~500GB–1TB)
- Variante: PC de sala com Steam Big Picture / emuladores até PS2/GameCube/Switch leve

### 2. Homelab / servidor caseiro
6c/12t + 16GB dá conta de muita coisa: Docker, Proxmox com algumas VMs, NAS, Jellyfin, Home Assistant, Pi-hole, backups.
- Dá pra hospedar o próprio organizator3000 em casa (Cloudflare Tunnel) e avaliar se ainda vale pagar a VPS da Vultr
- A RX 590 é desperdício de energia aqui. Ryzen sem vídeo integrado precisa de uma GPU pra instalar/configurar, mas muitas placas B450 ligam sem GPU depois (testar). Uma GPU barata e fraca também resolve
- Ponto de atenção: consumo ligado 24/7 e o fato de a internet residencial não ter IP fixo (o tunnel resolve)
- O HD de 2TB das fotos poderia morar aqui como backup/NAS

### 3. Máquina Linux de dev
Desktop Ubuntu/Fedora dedicado. Libera o principal de ficar com dual boot (a Fase 3 inteira vira opcional).

### 4. IA local (experimento)
A RX 590 (Polaris) não tem suporte oficial ao ROCm, mas o llama.cpp via Vulkan funciona. Com 8GB de VRAM dá pra rodar modelos pequenos (7B–8B quantizados). Serve pra brincar, não pra produtividade séria.

### 5. Vender as peças
Usar o dinheiro de 3600 + B450M + RX 590 + pente pra abater o upgrade. Provavelmente cobre boa parte da Fase 4 ou 5.

## Escolhido: "Steam machine" de sala

Jogos casuais/leves no sofá, na TV, com controle: Stardew Valley, indies (Replaced, Dave the Diver, Vampire Survivors, Marvel Cosmic Invasion), retro e emulação (Digimon World PS1, Bushido Blade, Marvel vs Capcom, SNK/Neo Geo).

O hardware sobra pra isso: a RX 590 roda todos com folga e o 3600 dá conta de emular PS1/arcade de olhos fechados (e até PS2/GameCube).

### Sistema: Bazzite
Distro Linux baseada no Fedora que replica o SteamOS: liga direto no modo Big Picture (Game Mode) como um Steam Deck, mas roda em PC comum. Tem driver AMD pronto (a RX 590 vai bem com Mesa) e é atualizada de forma atômica (se uma atualização quebrar, é só voltar pra anterior).
- O SteamOS oficial pra PC ainda é focado em handhelds; o Bazzite é o caminho seguro
- Alternativa: Windows + Steam Big Picture + Playnite (mais compatível, menos "console")

### Como cada jogo roda

| Jogo / tipo | Como |
|---|---|
| Stardew, Dave the Diver, Vampire Survivors, Replaced, Cosmic Invasion | Steam nativo ou Proton |
| PS1 (Digimon World, Bushido Blade) | DuckStation |
| Arcade (MvC, SNK/Neo Geo) | FBNeo / MAME via RetroArch; Fightcade pra jogar online |
| Retro em geral | RetroDECK ou EmuDeck (instalam e organizam tudo, integram na Steam) |

### O que muda nas peças
- **SSD maior**: 500GB–1TB NVMe. ROMs retro são pequenas, mas os jogos Steam + sistema não cabem nos 120GB. O 120GB pode sobrar
- **Bluetooth**: a B450M DS3H não tem Wi-Fi nem Bluetooth. Precisa de um adaptador USB BT (ou placa Wi-Fi+BT PCIe) pros controles, ou usar os dongles dos controles. Se não der pra passar cabo de rede até a TV, precisa de Wi-Fi também
- **Controles**: 2 controles (Xbox ou 8BitDo). Opcional: arcade stick pros jogos de luta
- **Gabinete**: algo compacto e bonito pra ficar na sala, com bom fluxo de ar
- **Barulho**: o cooler box do 3600 e a RX 590 esquentam e fazem barulho. Vale fazer undervolt na 590 e, se incomodar, trocar o cooler box por um barato (o AK400 do principal seria um ótimo modelo)

### Alternativa sem montar nada
Steam Link / Moonlight numa TV box ou Chromecast, transmitindo do PC principal (RTX 3060). Custa quase nada, mas depende do PC principal ligado e de rede boa. Pode servir de teste antes de montar.

## Pendências pra decidir

- [x] Escolher o uso principal → Steam machine de sala
- [ ] Orçar: gabinete, SSD NVMe 500GB–1TB, adaptador Bluetooth (+ Wi-Fi se não tiver cabo), controles
- [ ] Só dá pra montar depois da Fase 4 (é quando a B450M sai do principal)
- [ ] Depois: levar pro app (pente Corsair na Fase 2 + Fase 6 / projetos paralelos)

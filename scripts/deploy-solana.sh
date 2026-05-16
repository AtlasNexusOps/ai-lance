#!/usr/bin/env bash
# =============================================================================
# AI Lance — Solana Program Deployment (Anchor)
# =============================================================================
# Compile et déploie a Lance-core sur Solana devnet/mainnet.
#
# PRÉREQUIS :
#   1. Solana CLI  : sh -c "$(curl -sSfL https://release.anza.xyz/v2.1.0/install)"
#   2. Anchor CLI  : cargo install anchor-cli --version 0.30.1
#   3. Wallet Solana avec SOL pour le déploiement
#
# USAGE :
#   1. Configurer le wallet Solana : solana-keygen new -o ~/.config/solana/id.json
#   2. Fund le wallet : solana airdrop 2 (devnet) ou transférer SOL (mainnet)
#   3. Lancer : bash scripts/deploy-solana.sh [devnet|mainnet]
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SOLANA_DIR="$(dirname "$SCRIPT_DIR")/solana"
NETWORK="${1:-devnet}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  AI Lance — Déploiement Solana (${NETWORK})${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════${NC}"

# ── Vérifications ──────────────────────────────────────────────────

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor n'est pas installé.${NC}"
    echo "   cargo install anchor-cli --version 0.30.1"
    exit 1
fi

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI n'est pas installé.${NC}"
    echo "   sh -c \"\$(curl -sSfL https://release.anza.xyz/v2.1.0/install)\""
    exit 1
fi

# ── Config réseau ───────────────────────────────────────────────────

case "$NETWORK" in
    devnet)
        SOLANA_CLUSTER="devnet"
        RPC_URL="https://api.devnet.solana.com"
        ;;
    mainnet|mainnet-beta)
        SOLANA_CLUSTER="mainnet-beta"
        RPC_URL="https://api.mainnet-beta.solana.com"
        ;;
    *)
        echo -e "${RED}❌ Réseau inconnu : ${NETWORK}${NC}"
        echo "   Usage : bash deploy-solana.sh [devnet|mainnet]"
        exit 1
        ;;
esac

solana config set --url "$RPC_URL"

# ── Vérifier le wallet ─────────────────────────────────────────────

WALLET=$(solana address 2>/dev/null || echo "")
if [ -z "$WALLET" ]; then
    echo -e "${RED}❌ Aucun wallet Solana configuré.${NC}"
    echo "   solana-keygen new -o ~/.config/solana/id.json"
    exit 1
fi

BALANCE=$(solana balance 2>/dev/null | awk '{print $1}')
echo -e "${YELLOW}Wallet : ${WALLET}${NC}"
echo -e "${YELLOW}Balance: ${BALANCE} SOL${NC}"

# ── Build ──────────────────────────────────────────────────────────

echo -e "\n${BLUE}[1/3] Compilation du programme...${NC}"
cd "$SOLANA_DIR"

anchor build 2>&1 | tail -5

if [ ! -f "target/deploy/ailance_core.so" ]; then
    echo -e "${RED}❌ Échec de la compilation.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Compilation OK${NC}"

# ── Récupérer le Program ID ────────────────────────────────────────

PROGRAM_ID=$(solana address -k "target/deploy/ailance_core-keypair.json" 2>/dev/null || echo "")
if [ -z "$PROGRAM_ID" ]; then
    echo -e "${YELLOW}Génération d'une nouvelle keypair...${NC}"
    solana-keygen new -o "target/deploy/ailance_core-keypair.json" --no-bip39-passphrase --force
    PROGRAM_ID=$(solana address -k "target/deploy/ailance_core-keypair.json")
fi
echo -e "${YELLOW}Program ID: ${PROGRAM_ID}${NC}"

# Mettre à jour le program ID dans lib.rs et Anchor.toml
if [ -f "programs/ailance-core/src/lib.rs" ]; then
    OLD_ID=$(grep "declare_id!" programs/ailance-core/src/lib.rs | grep -oP '"\K[^"]+' || echo "")
    if [ -n "$OLD_ID" ] && [ "$OLD_ID" != "$PROGRAM_ID" ]; then
        sed -i "s/declare_id!(\"$OLD_ID\")/declare_id!(\"$PROGRAM_ID\")/" programs/ailance-core/src/lib.rs
        echo -e "${YELLOW}✓ Program ID mis à jour dans lib.rs${NC}"
    fi
fi

if [ -f "Anchor.toml" ]; then
    sed -i "s/ailance_core = \".*\"/ailance_core = \"$PROGRAM_ID\"/" Anchor.toml
    echo -e "${YELLOW}✓ Program ID mis à jour dans Anchor.toml${NC}"
fi

# Rebuild avec le bon program ID
anchor build 2>&1 | tail -3

# ── Deploy ─────────────────────────────────────────────────────────

echo -e "\n${BLUE}[2/3] Déploiement sur ${NETWORK}...${NC}"
echo -e "${YELLOW}Coût estimé : ~2-4 SOL${NC}"

anchor deploy --provider.cluster "$SOLANA_CLUSTER" 2>&1

echo -e "${GREEN}✓ Programme déployé !${NC}"

# ── Initialiser les comptes on-chain ────────────────────────────────

echo -e "\n${BLUE}[3/3] Initialisation des comptes...${NC}"

echo -e "${YELLOW}Création du compte Stats...${NC}"
# La création des PDAs se fait automatiquement lors du premier appel à chaque instruction.
# Pour le MVP, le compte Stats sera créé lors du premier postBounty.

# ── Résumé ─────────────────────────────────────────────────────────

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  SOLANA ${NETWORK} DÉPLOYÉ ✓${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo "  Program ID:  ${PROGRAM_ID}"
echo "  Network:     ${NETWORK}"
echo "  Explorer:    https://explorer.solana.com/address/${PROGRAM_ID}?cluster=${NETWORK}"
echo ""
echo "Prochaine étape : renseigner le Program ID dans :"
echo "  apps/web/lib/chain/solana-adapter.ts → AILANCE_PROGRAM_ID"

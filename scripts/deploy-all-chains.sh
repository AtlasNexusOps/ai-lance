#!/usr/bin/env bash
# =============================================================================
# AI Lance — Multi-Chain Deployment Script (Foundry)
# =============================================================================
# Déploie ClaudelanceCore + MockIdentityRegistry sur Arbitrum, Base, Polygon.
#
# PRÉREQUIS :
#   1. Foundry installé : curl -L https://foundry.paradigm.xyz | bash && foundryup
#   2. OpenZeppelin : cd contracts && forge install OpenZeppelin/openzeppelin-contracts
#   3. Fonds sur le wallet de déploiement (adresse ci-dessous)
#   4. RPC endpoints dans les variables d'environnement
#
# WALLET DE DÉPLOIEMENT :
#   Adresse : 0x93a96A14209aDAC1C1540f1164a854E5844ee39F
#   Clé privée : voir variable PRIVATE_KEY ci-dessous
#
# FONDS NÉCESSAIRES (estimation) :
#   - Arbitrum : ~0.005 ETH
#   - Base     : ~0.003 ETH
#   - Polygon  : ~5 MATIC
#
# USAGE :
#   1. Remplacer PRIVATE_KEY par la vraie clé
#   2. Configurer les RPCs dans l'environnement
#   3. Lancer : bash scripts/deploy-all-chains.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CONTRACTS_DIR="$(dirname "$SCRIPT_DIR")/contracts"

# ⚠️ REMPLACER par la clé privée de déploiement
export PRIVATE_KEY="${PRIVATE_KEY:-0x8cd12359ae19e76c38f7f3d09cac56eac407ca1913c229765b2050348af77109}"

# ── RPC Endpoints ──────────────────────────────────────────────────

ARBITRUM_RPC="${ARBITRUM_RPC:-https://arb1.arbitrum.io/rpc}"
BASE_RPC="${BASE_RPC:-https://mainnet.base.org}"
POLYGON_RPC="${POLYGON_RPC:-https://polygon-rpc.com}"

# ── Couleurs ───────────────────────────────────────────────────────

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ── Fonctions ──────────────────────────────────────────────────────

deploy_chain() {
    local CHAIN_NAME="$1"
    local CHAIN_ID="$2"
    local RPC_URL="$3"

    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  Déploiement sur ${CHAIN_NAME} (chainId=${CHAIN_ID})${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    cd "$CONTRACTS_DIR"

    # 1. Déployer MockIdentityRegistry
    echo -e "${YELLOW}[1/3] Déploiement MockIdentityRegistry...${NC}"
    IDENTITY_ADDR=$(forge create \
        --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --optimize --optimizer-runs 200 \
        src/mocks/MockIdentityRegistry.sol:MockIdentityRegistry \
        2>&1 | grep "Deployed to:" | awk '{print $3}')

    if [ -z "$IDENTITY_ADDR" ]; then
        echo "❌ Échec du déploiement MockIdentityRegistry"
        return 1
    fi
    echo -e "${GREEN}✓ MockIdentityRegistry: ${IDENTITY_ADDR}${NC}"

    # On utilise la même adresse pour identityRegistry et reputationRegistry
    # (le reputation registry est juste stocké pour Phase 2, pas utilisé directement)
    REPUTATION_ADDR="$IDENTITY_ADDR"

    # L'adresse du déployeur sert de owner, treasury, et ciRelayer pour le MVP
    DEPLOYER_ADDR="0x93a96A14209aDAC1C1540f1164a854E5844ee39F"

    # 2. Déployer ClaudelanceCore
    echo -e "${YELLOW}[2/3] Déploiement ClaudelanceCore...${NC}"
    CORE_ADDR=$(forge create \
        --rpc-url "$RPC_URL" \
        --private-key "$PRIVATE_KEY" \
        --optimize --optimizer-runs 200 \
        --via-ir \
        src/ClaudelanceCore.sol:ClaudelanceCore \
        --constructor-args \
            "$DEPLOYER_ADDR" \
            "$DEPLOYER_ADDR" \
            "$DEPLOYER_ADDR" \
            "$IDENTITY_ADDR" \
            "$REPUTATION_ADDR" \
        2>&1 | grep "Deployed to:" | awk '{print $3}')

    if [ -z "$CORE_ADDR" ]; then
        echo "❌ Échec du déploiement ClaudelanceCore"
        return 1
    fi
    echo -e "${GREEN}✓ ClaudelanceCore: ${CORE_ADDR}${NC}"

    # 3. Whitelist USDC (adresse standard sur la chaîne) — si dispo
    echo -e "${YELLOW}[3/3] Whitelist des tokens...${NC}"

    case "$CHAIN_ID" in
        42161) USDC="0xaf88d065e77c8cC2239327C5EDb3A432268e5831" ;; # Arbitrum USDC
        8453)  USDC="0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" ;; # Base USDC
        137)   USDC="0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" ;; # Polygon USDC
        *)     USDC="" ;;
    esac

    if [ -n "$USDC" ]; then
        cast send --rpc-url "$RPC_URL" --private-key "$PRIVATE_KEY" \
            "$CORE_ADDR" "allowToken(address,uint256)" "$USDC" 1000000 \
            2>&1 | tail -1
        echo -e "${GREEN}✓ USDC whitelisté${NC}"
    fi

    # ── Résumé ─────────────────────────────────────────────────
    echo ""
    echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  ${CHAIN_NAME} DÉPLOYÉ ✓${NC}"
    echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
    echo "  ClaudelanceCore:    ${CORE_ADDR}"
    echo "  IdentityRegistry:   ${IDENTITY_ADDR}"
    echo "  Chain ID:           ${CHAIN_ID}"
    echo ""

    # Sauvegarder dans un fichier JSON
    TIMESTAMP=$(date +%s)
    cat > "$CONTRACTS_DIR/deployments/chain-${CHAIN_ID}.json" << JSONEOF
{
  "chainId": ${CHAIN_ID},
  "chainName": "${CHAIN_NAME}",
  "core": "${CORE_ADDR}",
  "identityRegistry": "${IDENTITY_ADDR}",
  "reputationRegistry": "${REPUTATION_ADDR}",
  "treasury": "${DEPLOYER_ADDR}",
  "ciRelayer": "${DEPLOYER_ADDR}",
  "owner": "${DEPLOYER_ADDR}",
  "deployedAt": ${TIMESTAMP},
  "tokens": {
    "USDC": "${USDC}"
  }
}
JSONEOF
    echo -e "${GREEN}✓ Déploiement sauvegardé dans contracts/deployments/chain-${CHAIN_ID}.json${NC}"
}

# ── Main ───────────────────────────────────────────────────────────

echo "=============================================================================="
echo "  AI Lance — Déploiement Multi-Chain"
echo "=============================================================================="
echo "  Deployer: 0x93a96A14209aDAC1C1540f1164a854E5844ee39F"
echo ""

# Vérifier Foundry
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry n'est pas installé."
    echo "   curl -L https://foundry.paradigm.xyz | bash && foundryup"
    exit 1
fi

# Créer le dossier deployments
mkdir -p "$CONTRACTS_DIR/deployments"

# Déployer sur chaque chaîne
deploy_chain "Arbitrum" 42161 "$ARBITRUM_RPC"
deploy_chain "Base"     8453  "$BASE_RPC"
deploy_chain "Polygon"  137   "$POLYGON_RPC"

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  DÉPLOIEMENT TERMINÉ — 3 chaînes${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════${NC}"
echo ""
echo "Prochaine étape : renseigner les adresses dans :"
echo "  apps/web/lib/chain/evm-adapter.ts → DEPLOYMENTS"
echo "  apps/web/lib/chain.ts → CHAIN_META (status: live)"

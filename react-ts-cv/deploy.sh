#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   CV Generator - Auto Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ ! -f .env ]; then
    echo -e "${RED}Błąd: Plik .env nie istnieje!${NC}"
    echo "Utwórz plik .env na podstawie .env.example"
    exit 1
fi

export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)

echo -e "${BLUE}Konfiguracja deploymentu:${NC}"
echo "  Host: $SSH_USER@$SSH_HOST:$SSH_PORT"
echo "  Ścieżka zdalna: $REMOTE_PATH"
echo "  Ścieżka lokalna: $LOCAL_BUILD_PATH"
echo ""

resolve_auth() {
    if [ -n "$SSH_KEY_PATH" ] && [ -f "$SSH_KEY_PATH" ]; then
        AUTH_METHOD="key"
        return 0
    fi

    if [ -n "$SSH_PASSWORD" ]; then
        if command -v sshpass &>/dev/null; then
            AUTH_METHOD="password"
            return 0
        fi

        echo -e "${RED}Błąd: SSH_PASSWORD jest ustawione, ale sshpass nie jest zainstalowany.${NC}"
        echo ""
        echo -e "${YELLOW}Opcja 1 — Zainstaluj sshpass (macOS):${NC}"
        echo "  brew install hudochenkov/sshpass/sshpass"
        echo ""
        echo -e "${YELLOW}Opcja 2 — Użyj klucza SSH (zalecane):${NC}"
        echo "  1. Wygeneruj klucz: ssh-keygen -t ed25519"
        echo "  2. Skopiuj na serwer: ssh-copy-id -p $SSH_PORT $SSH_USER@$SSH_HOST"
        echo "  3. Dodaj do .env: SSH_KEY_PATH=~/.ssh/id_ed25519"
        echo "  4. Usuń SSH_PASSWORD z .env"
        exit 1
    fi

    echo -e "${RED}Błąd: Brak konfiguracji uwierzytelnienia.${NC}"
    echo "Ustaw SSH_KEY_PATH lub SSH_PASSWORD w pliku .env"
    exit 1
}

run_ssh() {
    local cmd="$1"
    if [ "$AUTH_METHOD" = "key" ]; then
        ssh -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    else
        sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "$cmd"
    fi
}

run_scp() {
    local src_dir="$1"
    local dst="$2"
    if [ "$AUTH_METHOD" = "key" ]; then
        scp -i "$SSH_KEY_PATH" -o StrictHostKeyChecking=no -P "$SSH_PORT" -r "$src_dir/." "$SSH_USER@$SSH_HOST:$dst"
    else
        sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no -P "$SSH_PORT" -r "$src_dir/." "$SSH_USER@$SSH_HOST:$dst"
    fi
}

resolve_auth

echo -e "${BLUE}[1/4] Budowanie aplikacji...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Błąd: Build nie powiódł się!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build zakończony pomyślnie${NC}"
echo ""

echo -e "${BLUE}[2/4] Czyszczenie folderu na serwerze...${NC}"
run_ssh "rm -rf $REMOTE_PATH/*"
if [ $? -ne 0 ]; then
    echo -e "${RED}Błąd: Nie udało się wyczyścić folderu na serwerze!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Folder wyczyszczony${NC}"
echo ""

echo -e "${BLUE}[3/4] Wgrywanie plików na serwer...${NC}"
run_scp "$LOCAL_BUILD_PATH" "$REMOTE_PATH"
if [ $? -ne 0 ]; then
    echo -e "${RED}Błąd: Nie udało się wgrać plików!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Pliki wgryte pomyślnie${NC}"
echo ""

echo -e "${BLUE}[4/4] Przeładowanie nginx...${NC}"
run_ssh "systemctl reload nginx"
if [ $? -ne 0 ]; then
    echo -e "${RED}Błąd: Nie udało się przeładować nginx!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Nginx przeładowany pomyślnie${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ Deployment zakończony pomyślnie!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Aplikacja dostępna pod: http://$SSH_HOST/"
echo ""
#!/bin/bash

CLUSTER_NAME="gitops-lab"
CONTEXT="kind-$CLUSTER_NAME"

# --- Funções ---

function show_help() {
    echo "Usage: ./lab.sh [start|stop|status]"
    echo ""
    echo "Commands:"
    echo "  start   - Inicia (ou acorda) o cluster e abre as conexões."
    echo "  stop    - Mata as conexões e pausa o cluster (economiza bateria)."
    echo "  status  - Mostra o estado dos pods e containers."
}

function start_lab() {
    echo "🚀 Iniciando o Laboratório WireSense..."

    # 1. Verifica estado do Cluster
    if ! kind get clusters | grep -q "$CLUSTER_NAME"; then
        echo "📦 Cluster não encontrado. Criando..."
        kind create cluster --name $CLUSTER_NAME
    else
        # Verifica se está pausado (Status=Exited)
        if docker ps -a --filter "name=${CLUSTER_NAME}-control-plane" --filter "status=exited" | grep -q "$CLUSTER_NAME"; then
            echo "💤 O cluster estava dormindo. Acordando..."
            docker start ${CLUSTER_NAME}-control-plane
            echo "⏳ Aguardando o cluster acordar (15s)..."
            sleep 15
        else
            echo "✅ Cluster já está rodando."
        fi
    fi

    # 2. Garante o contexto e aplica YAMLs
    kubectl config use-context $CONTEXT
    echo "📄 Garantindo estado do K8s (Manifestos)..."
    kubectl apply -f k8s/

    # 3. Abre terminais auxiliares (macOS)
    echo "🌐 Abrindo Frontend (Port 3000)..."
    osascript -e 'tell application "Terminal" to do script "kubectl port-forward svc/wiresense-frontend-svc 3000:80"'

    echo "🔌 Abrindo Backend (Port 8000)..."
    osascript -e 'tell application "Terminal" to do script "kubectl port-forward svc/wiresense-backend-svc 8000:80"'

    echo "🚇 Iniciando Cloudflare Tunnel..."
    osascript -e 'tell application "Terminal" to do script "cloudflared tunnel --url http://localhost:8000"'

    echo "✅ Tudo online! Acesse http://localhost:3000"
}

function stop_lab() {
    echo "🛑 Iniciando desligamento..."

    # 1. Mata processos "pendurados"
    echo "🔪 Cortando conexões (Port-Forwards e Túneis)..."
    pkill -f "kubectl port-forward"
    pkill -f "cloudflared tunnel"

    # 2. Pausa o container do Kind
    if docker ps | grep -q "${CLUSTER_NAME}-control-plane"; then
        echo "💤 Pausando o Cluster (Docker)..."
        docker stop ${CLUSTER_NAME}-control-plane
        echo "✅ Cluster pausado. Dados salvos."
    else
        echo "⚠️  Cluster já parece estar parado."
    fi
    
    echo "👋 Até mais!"
}

function check_status() {
    echo "📊 Status do Laboratório:"
    echo "--- Docker Container ---"
    docker ps -a --filter "name=${CLUSTER_NAME}-control-plane" --format "table {{.Names}}\t{{.Status}}"
    
    # Só tenta rodar kubectl se o docker estiver rodando
    if docker ps | grep -q "${CLUSTER_NAME}-control-plane"; then
        echo ""
        echo "--- Kubernetes Pods ---"
        kubectl get pods
    else
        echo ""
        echo "⚠️  O Kubernetes está desligado/pausado."
    fi
}

# --- Lógica Principal (Switch) ---

case "$1" in
    start)
        start_lab
        ;;
    stop)
        stop_lab
        ;;
    status)
        check_status
        ;;
    *)
        show_help
        exit 1
        ;;
esac
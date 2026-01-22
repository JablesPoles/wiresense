# Gera uma tag baseada na data/hora (ex: 20260122-1630)
TAG := $(shell date +%Y%m%d-%H%M%S)
# Define sua branch de trabalho (confirmamos que é a wiresense-ops)
BRANCH := wiresense-ops
CLUSTER := gitops-lab

# Declaração de comandos que não são arquivos
.PHONY: all deploy-backend deploy-frontend push help

help:
	@echo "🛠️  WireSense DevOps Toolkit"
	@echo "Use: make [comando]"
	@echo ""
	@echo "Comandos:"
	@echo "  deploy-all      -> Builda Front + Back, atualiza YAMLs e manda pro Git."
	@echo "  deploy-backend  -> Só atualiza a API (Python)."
	@echo "  deploy-frontend -> Só atualiza o Site (React)."

deploy-all: deploy-backend deploy-frontend push
	@echo "🚀 Release v-$(TAG) completa enviada para o ArgoCD!"

deploy-backend:
	@echo "🐍 [Backend] Buildando imagem v-$(TAG)..."
	docker build -t wiresense-backend:$(TAG) backend/
	
	@echo "📦 [Backend] Carregando no Kind..."
	kind load docker-image wiresense-backend:$(TAG) --name $(CLUSTER)
	
	@echo "📝 [Backend] Atualizando Manifesto K8s..."
	# Sintaxe do sed para macOS (-i '')
	sed -i '' 's|image: wiresense-backend:.*|image: wiresense-backend:$(TAG)|' k8s/backend.yaml

deploy-frontend:
	@echo "⚛️  [Frontend] Buildando imagem v-$(TAG)..."
	docker build -t wiresense-frontend:$(TAG) frontend/
	
	@echo "📦 [Frontend] Carregando no Kind..."
	kind load docker-image wiresense-frontend:$(TAG) --name $(CLUSTER)
	
	@echo "📝 [Frontend] Atualizando Manifesto K8s..."
	# Sintaxe do sed para macOS (-i '')
	sed -i '' 's|image: wiresense-frontend:.*|image: wiresense-frontend:$(TAG)|' k8s/frontend.yaml

push:
	@echo "🐙 Enviando mudanças para o GitHub..."
	git add .
	git commit -m "ci: release version $(TAG)"
	git push origin $(BRANCH)

# WireSense

O **WireSense** é um sistema de monitoramento de energia em tempo real desenvolvido como uma solução IoT completa.
Seu objetivo é coletar, armazenar e exibir dados elétricos com precisão e clareza, fornecendo uma visão consolidada do consumo energético, tanto em tempo real quanto em períodos diários e mensais.

---

## 📘 Visão Geral

O projeto foi idealizado para demonstrar a integração entre hardware IoT, armazenamento em nuvem e uma interface web moderna, explorando boas práticas de arquitetura distribuída e automação de infraestrutura.

O fluxo geral do sistema é o seguinte:

1. **Coleta de dados** — Um dispositivo IoT (sensor de corrente não invasivo) mede continuamente o consumo elétrico e envia os dados para a nuvem.
2. **Processamento e Armazenamento** — Funções **AWS Lambda** processam os dados recebidos e os gravam em um banco de dados **InfluxDB**, otimizando o armazenamento de séries temporais.
3. **Visualização** — O **frontend React** consome os dados via API e os exibe em uma dashboard interativa, com gráficos e indicadores de consumo em tempo real, histórico diário e mensal.
4. **Infraestrutura** — Toda a estrutura é provisionada na **AWS** via **Terraform**, garantindo reprodutibilidade, escalabilidade e controle de custos.
5. **Integração Contínua (CI/CD)** — O projeto utiliza **GitHub Actions** para automatizar o deploy e o controle de versões.

---

## 🧩 Estrutura do Projeto

A organização do repositório segue uma separação lógica entre as camadas de frontend, backend e infraestrutura.

```
wiresense/
│
├── .github/                 # Configurações de CI/CD (GitHub Actions)
│
├── frontend/                # Aplicação web (React + Vite + TailwindCSS)
│   ├── src/                 # Código-fonte principal do frontend
│   ├── public/              # Arquivos estáticos
│   ├── Dockerfile           # Imagem Docker do frontend
│   ├── vite.config.js       # Configuração do Vite e PWA
│   └── ...                  # Demais arquivos de configuração
│
├── infra/                   # Código Terraform da infraestrutura AWS
│   ├── terraform/           # Módulos e variáveis de provisionamento
│   ├── lambda_function/     # Código da função Lambda de gravação de dados
│   └── lambda_read_data/    # Função Lambda de leitura e consulta
│
├── .env                     # Variáveis de ambiente do projeto
├── docker-compose.yml       # Orquestração local (se aplicável)
├── nginx.conf               # Configuração do servidor NGINX
└── README.md                # Este documento
```

---

## ☁️ Arquitetura e Tecnologias

O *WireSense* combina múltiplos serviços e tecnologias para oferecer uma solução robusta e escalável.

### Infraestrutura na AWS

A arquitetura do WireSense foi projetada para operar de forma escalável, segura e com custos otimizados, aproveitando serviços nativos da AWS:

* **S3** — Armazena os arquivos estáticos do frontend React. O conteúdo é automaticamente sincronizado para esse bucket durante o processo de deploy.
* **CloudFront** — Distribui o frontend globalmente com baixa latência, cache inteligente e suporte a HTTPS, garantindo alta disponibilidade e desempenho.
* **Lambda** — Funções serverless responsáveis por processar as medições enviadas pelo dispositivo IoT e consultar dados do InfluxDB.
* **ECR (Elastic Container Registry)** — Armazena imagens Docker de serviços auxiliares, como utilitários de ingestão de dados.
* **DynamoDB** — Utilizado como mecanismo de *state locking* para o Terraform, evitando conflitos em atualizações simultâneas de infraestrutura.
* **CloudWatch** — Centraliza logs e métricas das funções Lambda, permitindo monitoramento contínuo e geração de alertas.
* **API Gateway** — Expõe endpoints REST que conectam o frontend às funções Lambda de leitura e gravação.

### Banco de Dados

* **InfluxDB** — Banco de dados de séries temporais, ideal para medições contínuas de energia elétrica.

### Frontend

* **React** — Framework JavaScript para construção da interface interativa.
* **Vite** — Ferramenta de build rápida e moderna.
* **TailwindCSS** — Estilização baseada em utilitários, garantindo leveza e consistência visual.
* **PWA (Progressive Web App)** — Permite uso offline e instalação em dispositivos móveis.

### Integração e Deploy

* **Docker** — Empacotamento e isolamento dos serviços.
* **GitHub Actions** — Pipeline CI/CD para automação do build e deploy contínuo.
* **Terraform** — Provisionamento automatizado de toda a infraestrutura.

---

## 📊 Funcionalidades Principais

* Monitoramento de energia em **tempo real**.
* Exibição de **gráficos diários e mensais** com base no consumo acumulado.
* Cálculo automático de **custo estimado** com base na tarifa de kWh configurada.
* **Dashboard responsiva**, desenvolvida com foco em clareza e usabilidade.
* **Configurações persistentes** do usuário (tensão, moeda e tarifa de energia).
* Sistema de **alertas e métricas AWS** para acompanhar falhas ou anomalias.

---

## 🧠 Estrutura Lógica Simplificada

                                  Internet
                                     │
                        +------------┴------------+
                        │   CloudFront (frontend) │
                        │  -> origin: S3 bucket   │
                        +------------┬------------+
                                     │
                                     │ (HTTPS)
                                     │
                               Users / Browser
                                     │
                                     ▼
                           +----------------------+
                           |  API Gateway (/data) |
                           +----┬------------┬----+
                                │            │
                     GET /data  │            │ POST /data (api_key)
                                │            │
                    +-----------▼---+        +-▼-------------+
                    | Lambda (read) |        | Lambda (write)|
                    | - handler:    |        | - handler:    |
                    |   read_data   |        |   index       |
                    | - reads secret|        | - reads secret|
                    |   (SecretsMgr)|        |   (SecretsMgr)|
                    +------+---+----+        +------+---+----+
                           |   |                     |   |
                           |   |                     |   |
                           |   |                     |   |
                           |   |   (queries / reads) |   | (writes)
                           |   +---------------------+   |
                           |        InfluxDB (ECS)       |
                           |   - bucket: influxdb_data   |
                           |   - longterm bucket         |
                           +-----------------------------+

Outros componentes de infraestrutura (auxiliares):

Bucket S3 -> arquivos estáticos do frontend (origem para o CloudFront)

CloudWatch -> logs/métricas para Lambdas e ECS (alarmes)

SNS -> tópico de alarmes (inscrições por e-mail)

Secrets Manager -> armazena credenciais do INFLUXDB (usado tanto por Lambdas quanto pelo ECS)

ECR/ECS -> hospeda o serviço InfluxDB (com EFS para armazenamento persistente)

VPC Endpoints / Security Groups / NAT / Subnets -> rede e isolamento

Estado do Terraform armazenado no S3 com bloqueio (locking) via DynamoDB (terraform_state / locks)

---

## 👥 Autores

* **Matheus Poles Nunes**
* **Marciel Soares Silva**

---

## 🏗️ Considerações Técnicas

O projeto foi desenvolvido com foco em modularidade e reprodutibilidade, possibilitando que todo o ambiente possa ser criado ou removido com poucos comandos Terraform, garantindo controle de custos em ambientes de teste e produção.

A estrutura de diretórios segue boas práticas de organização e separação de responsabilidades, permitindo manutenção facilitada e rápida escalabilidade futura.

---

## ⚙️ Status

Projeto em estágio funcional completo, com infraestrutura e frontend integrados.
A arquitetura e o código foram desenvolvidos de modo a permitir futuras expansões, como integração de novos sensores, suporte a múltiplas unidades de consumo e análises preditivas de demanda energética.

// URL base da API, usando variável de ambiente definida no Vite
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/data`; 

// Função auxiliar que faz fetch na API e trata erros básicos
async function fetchData(params = {}) {
  const url = new URL(API_BASE_URL);

  // Adiciona parâmetros de query na URL
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    // Requisição GET com header para JSON
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json', 
      },
    });

    // Tratamento de erro caso status não seja 2xx
    if (!response.ok) {
      let errorBody = null;
      try {
        // Tenta extrair JSON de erro, se houver
        errorBody = await response.json();
      } catch (e) { /* Ignora se não for JSON */ }
      
      throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorBody ? JSON.stringify(errorBody) : 'Sem detalhes'}`);
    }

    // Retorna JSON da resposta
    return await response.json();

  } catch (error) {
    // Log de erro para debug
    console.error("Falha ao buscar dados da API:", error);

    // Retorna valores padrão caso a API falhe
    if (params.type === 'latest') return null; 
    return [];
  }
}

// Funções públicas que chamam fetchData com parâmetros específicos

// Pega o último ponto de dados
export async function getLatestDataPoint() {
  return fetchData({ type: 'latest' }); 
}

// Pega dados em tempo real de um intervalo definido (ex: 5m)
export async function getRealtimeData(range = '5m') {
  return fetchData({ type: 'range', range: `-${range}` });
}

// Pega resumo diário/mensal de energia
export async function getEnergySummary() {
  return fetchData({ type: 'summary' });
}

// Histórico diário limitado (padrão 7 dias)
export async function getDailyEnergyHistory(limit = 7) {
  return fetchData({ type: 'history', period: 'daily', limit: limit });
}

// Histórico mensal limitado (padrão 6 meses)
export async function getMonthlyEnergyHistory(limit = 6) {
  return fetchData({ type: 'history', period: 'monthly', limit: limit });
}

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/data`; 

// Função auxiliar para fazer as chamadas fetch e tratar erros básicos
async function fetchData(params = {}) {
  const url = new URL(API_BASE_URL);
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json', 
      },
    });

    if (!response.ok) {
      let errorBody = null;
      try {
        errorBody = await response.json();
      } catch (e) { /* Ignora se o corpo não for JSON */ }
      
      throw new Error(`Erro na API: ${response.status} ${response.statusText} - ${errorBody ? JSON.stringify(errorBody) : 'Sem detalhes'}`);
    }
    return await response.json();

  } catch (error) {
    console.error("Falha ao buscar dados da API:", error);
    if (params.type === 'latest') return null; 
    return [];
  }
}
export async function getLatestDataPoint() {
  return fetchData({ type: 'latest' }); 
}

export async function getRealtimeData(range = '5m') {
  return fetchData({ type: 'range', range: `-${range}` });
}

export async function getEnergySummary() {
  return fetchData({ type: 'summary' });
}

export async function getDailyEnergyHistory(limit = 7) {
  return fetchData({ type: 'history', period: 'daily', limit: limit });
}
export async function getMonthlyEnergyHistory(limit = 6) {
  return fetchData({ type: 'history', period: 'monthly', limit: limit });
}
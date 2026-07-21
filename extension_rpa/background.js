const CATEGORIES = {
  "noticias": [
    "https://g1.globo.com",
    "https://www.uol.com.br",
    "https://www.cnnbrasil.com.br",
    "https://www.metropoles.com",
    "https://www.correiobraziliense.com.br",
    "https://www.bbc.com/portuguese",
    "https://agenciabrasil.ebc.com.br",
    "https://www.poder360.com.br",
    "https://www.gazetadopovo.com.br",
    "https://www.estadao.com.br",
    "https://www.folha.uol.com.br",
    "https://www.terra.com.br",
    "https://www.r7.com"
  ],
  "tecnologia": [
    "https://www.canaltech.com.br",
    "https://www.techtudo.com.br",
    "https://www.tecmundo.com.br",
    "https://tecnoblog.net",
    "https://www.olhardigital.com.br",
    "https://br.ign.com",
    "https://www.gizmodo.uol.com.br"
  ],
  "esportes": [
    "https://ge.globo.com",
    "https://www.espn.com.br",
    "https://www.lance.com.br",
    "https://trivela.com.br",
    "https://www.uol.com.br/esporte/",
    "https://www.gazetaesportiva.com"
  ],
  "ecommerce_leve": [
    "https://www.mercadolivre.com.br",
    "https://www.magazineluiza.com.br",
    "https://www.amazon.com.br",
    "https://www.olx.com.br",
    "https://www.kabum.com.br",
    "https://www.netshoes.com.br",
    "https://www.dafiti.com.br",
    "https://www.casasbahia.com.br",
    "https://www.decathlon.com.br"
  ],
  "receitas_saude": [
    "https://www.tudogostoso.com.br",
    "https://www.minhavida.com.br",
    "https://www.receitasnestle.com.br",
    "https://www.sabornamesa.com.br",
    "https://www.tuasaude.com",
    "https://www.anamariabraga.com.br"
  ],
  "marketing_digital": [
    "https://resultadosdigitais.com.br",
    "https://www.ecommercebrasil.com.br",
    "https://www.sebrae.com.br",
    "https://nuvemshop.com.br",
    "https://hotmart.com",
    "https://rockcontent.com/br/blog",
    "https://www.hubspot.com/pt",
    "https://mlabs.com.br"
  ],
  "negocios_financas": [
    "https://www.infomoney.com.br",
    "https://exame.com",
    "https://www.suno.com.br",
    "https://valorinveste.globo.com",
    "https://economia.uol.com.br",
    "https://www.contabilizei.com.br/contabilidade-online"
  ]
};

const PERSONAS = [
  { name: "leitor_noticias", primary: ["noticias"], secondary: ["esportes", "negocios_financas"] },
  { name: "entusiasta_tech", primary: ["tecnologia"], secondary: ["noticias", "ecommerce_leve"] },
  { name: "comprador_casual", primary: ["ecommerce_leve"], secondary: ["noticias", "tecnologia"] },
  { name: "anunciante_digital", primary: ["marketing_digital"], secondary: ["negocios_financas", "tecnologia"] },
  { name: "cozinheiro", primary: ["receitas_saude"], secondary: ["noticias"] },
  { name: "navegador_geral", primary: ["noticias", "tecnologia"], secondary: ["esportes", "ecommerce_leve", "receitas_saude"] }
];

const SEARCH_QUERIES = [
  "ultimas noticias brasil hoje",
  "review notebook custo beneficio 2025",
  "tabela brasileirao serie a",
  "ofertas de hoje mercado livre",
  "como anunciar no tiktok e google ads",
  "receita facil de jantar rapido",
  "melhores celulares em promocao",
  "noticias economia brasil hoje"
];

function gerarRotaLonga(personaKey) {
  let persona = PERSONAS.find(p => p.name === personaKey);
  if (!persona) {
    persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  }

  let sites = [];
  persona.primary.forEach(cat => {
    if (CATEGORIES[cat]) sites.push(...CATEGORIES[cat]);
  });
  persona.secondary.forEach(cat => {
    if (CATEGORIES[cat]) sites.push(...CATEGORIES[cat]);
  });

  sites.sort(() => Math.random() - 0.5);

  // Sessão LONGA: 25 a 35 sites/buscas
  let quantidade = Math.floor(Math.random() * 10) + 25;
  let selecionados = sites.slice(0, quantidade);

  let rotaFinal = [];
  selecionados.forEach((url, i) => {
    // Intercala pesquisas no Google a cada 2 acessos
    if (i % 2 === 0) {
      let q = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
      rotaFinal.push(`https://www.google.com.br/search?q=${encodeURIComponent(q)}`);
    }
    rotaFinal.push(url);
  });

  return { persona: persona.name, rota: rotaFinal };
}

// -----------------------------------------------------------------------------
// GERENCIAMENTO DE ESTADO E PERSISTÊNCIA CONTÍNUA (Evita suspensão do Chrome)
// -----------------------------------------------------------------------------

async function getState() {
  const data = await chrome.storage.local.get(["rpaState"]);
  return data.rpaState || { isRunning: false, currentIndex: 0, urlList: [], currentTabId: null };
}

async function saveState(state) {
  await chrome.storage.local.set({ rpaState: state });
}

// Escuta mensagens da interface Popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_RPA") {
    const { persona, rota } = gerarRotaLonga(request.persona);
    const newState = {
      isRunning: true,
      currentIndex: 0,
      urlList: rota,
      currentTabId: null,
      persona: persona
    };
    saveState(newState).then(() => {
      sendResponse({ status: "STARTED", total: rota.length });
      processarProximoPasso();
    });
    return true;
  } else if (request.action === "STOP_RPA") {
    chrome.alarms.clear("RPA_NEXT_STEP");
    getState().then(state => {
      state.isRunning = false;
      saveState(state).then(() => {
        sendResponse({ status: "STOPPED" });
      });
    });
    return true;
  } else if (request.action === "GET_STATUS") {
    getState().then(state => {
      sendResponse({
        isRunning: state.isRunning,
        currentIndex: state.currentIndex,
        total: state.urlList.length,
        currentUrl: state.urlList[state.currentIndex] || ""
      });
    });
    return true;
  }
});

// Chrome Alarms - Mantém a extensão ativa mesmo se o Service Worker for suspenso
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "RPA_NEXT_STEP") {
    processarProximoPasso();
  }
});

async function processarProximoPasso() {
  const state = await getState();

  if (!state.isRunning) {
    console.log("[RPA] Automação parada.");
    return;
  }

  if (state.currentIndex >= state.urlList.length) {
    state.isRunning = false;
    await saveState(state);
    console.log("[RPA] Longa sessão de aquecimento concluída com sucesso!");
    return;
  }

  const targetUrl = state.urlList[state.currentIndex];
  console.log(`[RPA Step ${state.currentIndex + 1}/${state.urlList.length}] Acessando: ${targetUrl}`);

  // 1. Abre ou Atualiza a aba
  let tabId = state.currentTabId;
  if (!tabId) {
    let tab = await chrome.tabs.create({ url: targetUrl, active: true });
    tabId = tab.id;
  } else {
    try {
      await chrome.tabs.update(tabId, { url: targetUrl, active: true });
    } catch (e) {
      let tab = await chrome.tabs.create({ url: targetUrl, active: true });
      tabId = tab.id;
    }
  }

  state.currentTabId = tabId;
  await saveState(state);

  // 2. Aguarda 3.5 segundos para a página carregar e injeta o script de cookies + rolagem
  setTimeout(async () => {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["accept_cookies.js"]
      });
    } catch (err) {
      console.log("[RPA] Aviso na injeção do script:", err.message);
    }
  }, 3500);

  // 3. Sorteia o tempo de leitura do site (20 a 35 segundos)
  const tempoPermanenciaSegundos = Math.floor(Math.random() * 15) + 20;
  console.log(`[RPA] Aguardando ${tempoPermanenciaSegundos}s no site...`);

  state.currentIndex++;
  await saveState(state);

  // Agenda o próximo passo usando chrome.alarms (Garante execução sem congelamento)
  chrome.alarms.create("RPA_NEXT_STEP", { delayInMinutes: tempoPermanenciaSegundos / 60 });
}

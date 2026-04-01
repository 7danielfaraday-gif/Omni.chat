/**
 * Fingerprint Engine - Motor de coleta de dados inspirado no CreepJS
 *
 * Coleta sinais de fingerprinting do navegador e analisa anomalias.
 * Os dados brutos sao processados pelo algoritmo de pontuacao proprio.
 *
 * ===== INTEGRACAO COM CREEPJS =====
 * Para usar o motor real do CreepJS em producao:
 *
 * 1. Clone o repositorio: git clone https://github.com/nicedone/nicedone-creepjs-src
 *    Ou use o CDN: <script src="https://nicedone.github.io/nicedone-creepjs-src/creep.js"></script>
 *
 * 2. O CreepJS expoe um objeto global `creep` apos execucao. Substitua as funcoes
 *    de coleta abaixo pelo output real:
 *
 *    const creepData = await window.creep;
 *    // creepData.lies        -> mentiras detectadas
 *    // creepData.trash       -> dados lixo/inconsistentes
 *    // creepData.headless    -> deteccao de headless
 *    // creepData.webgl       -> dados de WebGL
 *    // creepData.canvas2d    -> fingerprint do Canvas
 *    // creepData.navigator_  -> dados do navigator
 *
 * 3. Passe creepData para `calculateScore(creepData)` ao inves de usar
 *    `collectFingerprint()` que faz coleta nativa.
 * ================================
 */

// ---------- TIPOS ----------

export interface LieDetail {
  category: string;
  property: string;
  description: string;
}

export interface FingerprintCategory {
  name: string;
  status: "ok" | "warning" | "error";
  score: number;       // 0-100 parcial
  maxScore: number;
  details: string[];
  lies: LieDetail[];
}

export interface FingerprintResult {
  overallScore: number;         // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  categories: {
    identity: FingerprintCategory;
    hardware: FingerprintCategory;
    leaks: FingerprintCategory;
    automation: FingerprintCategory;
  };
  rawData: Record<string, unknown>;
  timestamp: number;
}

// ---------- COLETA NATIVA (substitua pelo CreepJS em producao) ----------

async function collectUserAgent(): Promise<{
  ua: string;
  platform: string;
  vendor: string;
  appVersion: string;
  lies: LieDetail[];
}> {
  const nav = navigator;
  const ua = nav.userAgent;
  const platform = nav.platform;
  const vendor = nav.vendor;
  const appVersion = nav.appVersion;
  const lies: LieDetail[] = [];

  // Detecta inconsistencias no User-Agent
  const isChrome = ua.includes("Chrome");
  const isFirefox = ua.includes("Firefox");
  const isSafari = ua.includes("Safari") && !isChrome;

  if (isChrome && vendor !== "Google Inc.") {
    lies.push({
      category: "User-Agent",
      property: "vendor",
      description: `Vendor "${vendor}" inconsistente com Chrome UA`,
    });
  }

  if (isFirefox && vendor !== "") {
    lies.push({
      category: "User-Agent",
      property: "vendor",
      description: `Firefox nao deveria ter vendor "${vendor}"`,
    });
  }

  // Verifica se platform bate com UA
  const uaHasWin = ua.includes("Windows");
  const uaHasMac = ua.includes("Macintosh");
  const uaHasLinux = ua.includes("Linux");
  const platWin = platform.startsWith("Win");
  const platMac = platform.startsWith("Mac");
  const platLinux = platform.includes("Linux");

  if (uaHasWin && !platWin) {
    lies.push({
      category: "User-Agent",
      property: "platform",
      description: `UA diz Windows mas platform = "${platform}"`,
    });
  }
  if (uaHasMac && !platMac) {
    lies.push({
      category: "User-Agent",
      property: "platform",
      description: `UA diz Mac mas platform = "${platform}"`,
    });
  }
  if (uaHasLinux && !platLinux && !ua.includes("Android")) {
    lies.push({
      category: "User-Agent",
      property: "platform",
      description: `UA diz Linux mas platform = "${platform}"`,
    });
  }

  // Checa se navigator.languages e consistente
  const lang = nav.language;
  const langs = nav.languages;
  if (langs && langs.length > 0 && langs[0] !== lang) {
    lies.push({
      category: "User-Agent",
      property: "languages",
      description: `language "${lang}" nao bate com languages[0] "${langs[0]}"`,
    });
  }

  return { ua, platform, vendor, appVersion, lies };
}

async function collectHardware(): Promise<{
  gpu: string;
  cpuCores: number;
  memory: number;
  maxTouchPoints: number;
  screen: { width: number; height: number; colorDepth: number };
  lies: LieDetail[];
}> {
  const lies: LieDetail[] = [];
  let gpu = "Desconhecido";

  // WebGL GPU detection
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "Desconhecido";
        const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "";

        // Checa GPU suspeita (VMs comuns)
        const suspectGPUs = [
          "swiftshader",
          "llvmpipe",
          "virtualbox",
          "vmware",
          "microsoft basic render",
        ];
        if (suspectGPUs.some((s) => gpu.toLowerCase().includes(s) || vendor.toLowerCase().includes(s))) {
          lies.push({
            category: "Hardware",
            property: "gpu",
            description: `GPU suspeita detectada: "${gpu}" (possivel VM/emulador)`,
          });
        }
      }
    } else {
      lies.push({
        category: "Hardware",
        property: "webgl",
        description: "WebGL nao disponivel - possivel bloqueio ou ambiente headless",
      });
    }
  } catch {
    lies.push({
      category: "Hardware",
      property: "webgl",
      description: "Erro ao acessar WebGL",
    });
  }

  const cpuCores = navigator.hardwareConcurrency || 0;
  const memory = (navigator as unknown as Record<string, unknown>).deviceMemory as number || 0;

  // Cores e memoria suspeitos
  if (cpuCores === 1) {
    lies.push({
      category: "Hardware",
      property: "cpu",
      description: "Apenas 1 core de CPU - possivel VM minima",
    });
  }
  if (memory > 0 && memory < 2) {
    lies.push({
      category: "Hardware",
      property: "memory",
      description: `Apenas ${memory}GB de RAM reportado - suspeito`,
    });
  }

  const screen = {
    width: window.screen.width,
    height: window.screen.height,
    colorDepth: window.screen.colorDepth,
  };

  // Resolucao incomum
  if (screen.width === 0 || screen.height === 0) {
    lies.push({
      category: "Hardware",
      property: "screen",
      description: "Resolucao de tela 0x0 - ambiente headless",
    });
  }

  return { gpu, cpuCores, memory, maxTouchPoints: navigator.maxTouchPoints || 0, screen, lies };
}

async function collectLeaks(): Promise<{
  webrtcLeaked: boolean;
  webrtcIPs: string[];
  lies: LieDetail[];
}> {
  const lies: LieDetail[] = [];
  let webrtcLeaked = false;
  const webrtcIPs: string[] = [];

  // Verifica WebRTC leak
  try {
    const RTCPeerConnection =
      window.RTCPeerConnection ||
      (window as unknown as Record<string, unknown>).webkitRTCPeerConnection as typeof window.RTCPeerConnection;

    if (RTCPeerConnection) {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      pc.createDataChannel("");

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Espera breve para coletar candidates
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => resolve(), 2000);
        pc.onicecandidate = (e) => {
          if (!e.candidate) {
            clearTimeout(timeout);
            resolve();
            return;
          }
          const parts = e.candidate.candidate.split(" ");
          const ip = parts[4];
          if (ip && !ip.includes(":") && !ip.startsWith("0.")) {
            // IPv4 valido
            if (!webrtcIPs.includes(ip)) {
              webrtcIPs.push(ip);
              // IPs privados nao sao leak real, mas publicos sim
              if (
                !ip.startsWith("10.") &&
                !ip.startsWith("192.168.") &&
                !ip.startsWith("172.") &&
                ip !== "0.0.0.0"
              ) {
                webrtcLeaked = true;
              }
            }
          }
        };
      });

      pc.close();
    }
  } catch {
    // WebRTC nao disponivel - sem leak
  }

  if (webrtcLeaked) {
    lies.push({
      category: "Vazamentos",
      property: "webrtc",
      description: `IP publico vazado via WebRTC: ${webrtcIPs.join(", ")}`,
    });
  }

  // Verifica se timezone bate com locale
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const locale = navigator.language;
  if (locale.startsWith("en-US") && tz && !tz.includes("America")) {
    lies.push({
      category: "Vazamentos",
      property: "timezone",
      description: `Locale "${locale}" nao combina com timezone "${tz}"`,
    });
  }

  return { webrtcLeaked, webrtcIPs, lies };
}

async function collectAutomation(): Promise<{
  isAutomated: boolean;
  signals: string[];
  lies: LieDetail[];
}> {
  const lies: LieDetail[] = [];
  const signals: string[] = [];
  let isAutomated = false;

  // WebDriver
  if (navigator.webdriver) {
    isAutomated = true;
    signals.push("navigator.webdriver = true");
    lies.push({
      category: "Automacao",
      property: "webdriver",
      description: "navigator.webdriver esta ativo - Selenium/Puppeteer detectado",
    });
  }

  // Variaveis Puppeteer / Playwright / Selenium
  const automationGlobals = [
    "_phantom",
    "__nightmare",
    "_selenium",
    "callSelenium",
    "_Recaptcha",
    "domAutomation",
    "domAutomationController",
    "__webdriver_evaluate",
    "__selenium_evaluate",
    "__webdriver_script_function",
    "__webdriver_script_func",
    "__webdriver_script_fn",
    "__fxdriver_evaluate",
    "__driver_unwrapped",
    "__webdriver_unwrapped",
    "__driver_evaluate",
    "__lastWatirAlert",
    "__lastWatirConfirm",
    "__lastWatirPrompt",
    "cdc_adoQpoasnfa76pfcZLmcfl_Array",
    "cdc_adoQpoasnfa76pfcZLmcfl_Promise",
    "cdc_adoQpoasnfa76pfcZLmcfl_Symbol",
  ];

  for (const g of automationGlobals) {
    if (g in window) {
      isAutomated = true;
      signals.push(`window.${g} encontrado`);
      lies.push({
        category: "Automacao",
        property: g,
        description: `Variavel de automacao "${g}" detectada no window`,
      });
    }
  }

  // Checa document properties
  const docProps = ["$cdc_asdjflasutopfhvcZLmcfl_", "$chrome_asyncScriptInfo"];
  for (const p of docProps) {
    if (p in document) {
      isAutomated = true;
      signals.push(`document.${p} encontrado`);
      lies.push({
        category: "Automacao",
        property: p,
        description: `Propriedade de automacao "${p}" encontrada no document`,
      });
    }
  }

  // Chrome sem chrome runtime
  if (
    navigator.userAgent.includes("Chrome") &&
    !(window as unknown as Record<string, unknown>).chrome
  ) {
    signals.push("Chrome UA sem window.chrome");
    lies.push({
      category: "Automacao",
      property: "chrome",
      description: "UA indica Chrome mas window.chrome ausente - possivel headless",
    });
  }

  // Permissions API
  try {
    const permStatus = await navigator.permissions.query({
      name: "notifications" as PermissionName,
    });
    if (permStatus.state === "denied" && Notification.permission === "default") {
      signals.push("Permissions API inconsistente");
      lies.push({
        category: "Automacao",
        property: "permissions",
        description: "Estado de permissao inconsistente - possivel spoofing",
      });
    }
  } catch {
    // ignore
  }

  // Plugins vazios
  if (navigator.plugins.length === 0 && navigator.userAgent.includes("Chrome")) {
    signals.push("Chrome sem plugins");
    lies.push({
      category: "Automacao",
      property: "plugins",
      description: "Nenhum plugin detectado em Chrome - possivel headless",
    });
  }

  return { isAutomated, signals, lies };
}

// ---------- CANVAS FINGERPRINT ----------

async function collectCanvasFingerprint(): Promise<{ hash: string; lies: LieDetail[] }> {
  const lies: LieDetail[] = [];
  let hash = "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("OmniMKT-FP", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("OmniMKT-FP", 4, 17);
      hash = canvas.toDataURL().slice(-32);
    }
  } catch {
    lies.push({
      category: "Hardware",
      property: "canvas",
      description: "Canvas fingerprint falhou - possivel bloqueio",
    });
  }
  return { hash, lies };
}

// ---------- ALGORITMO DE PONTUACAO ----------

/**
 * Converte os sinais coletados em uma pontuacao de 0 a 100%.
 *
 * Distribuicao de pesos:
 * - Identidade (User-Agent)    : 25 pontos max
 * - Hardware (GPU/CPU/RAM)     : 25 pontos max
 * - Vazamentos (WebRTC/IP)     : 20 pontos max
 * - Automacao/Bot              : 30 pontos max
 *
 * Cada "lie" detectada em uma categoria subtrai pontos proporcionalmente:
 * - Lie critico (automacao):     -15 pontos
 * - Lie serio (inconsistencia):  -10 pontos
 * - Lie leve (aviso):            -5 pontos
 */
function calculateCategoryScore(
  categoryName: string,
  maxScore: number,
  lies: LieDetail[]
): FingerprintCategory {
  const criticalCategories = ["Automacao"];
  const penaltyPerLie = criticalCategories.includes(categoryName) ? 15 : 8;

  const totalPenalty = Math.min(lies.length * penaltyPerLie, maxScore);
  const score = maxScore - totalPenalty;

  let status: "ok" | "warning" | "error" = "ok";
  const ratio = score / maxScore;
  if (ratio < 0.5) status = "error";
  else if (ratio < 0.8) status = "warning";

  return {
    name: categoryName,
    status,
    score: Math.max(0, score),
    maxScore,
    details: lies.map((l) => l.description),
    lies,
  };
}

// ---------- API PUBLICA ----------

export async function collectFingerprint(): Promise<FingerprintResult> {
  const [uaData, hwData, leakData, autoData, canvasData] = await Promise.all([
    collectUserAgent(),
    collectHardware(),
    collectLeaks(),
    collectAutomation(),
    collectCanvasFingerprint(),
  ]);

  // Combina lies do canvas no hardware
  hwData.lies.push(...canvasData.lies);

  const identity = calculateCategoryScore("Identidade do Navegador", 25, uaData.lies);
  const hardware = calculateCategoryScore("Hardware (GPU/CPU/RAM)", 25, [
    ...hwData.lies,
  ]);
  const leaks = calculateCategoryScore("Vazamentos (WebRTC/IP)", 20, leakData.lies);
  const automation = calculateCategoryScore("Deteccao de Automacao/Bot", 30, autoData.lies);

  const overallScore = identity.score + hardware.score + leaks.score + automation.score;

  let grade: "A" | "B" | "C" | "D" | "F" = "A";
  if (overallScore < 40) grade = "F";
  else if (overallScore < 55) grade = "D";
  else if (overallScore < 70) grade = "C";
  else if (overallScore < 85) grade = "B";

  return {
    overallScore,
    grade,
    categories: { identity, hardware, leaks, automation },
    rawData: {
      userAgent: uaData.ua,
      platform: uaData.platform,
      vendor: uaData.vendor,
      gpu: hwData.gpu,
      cpuCores: hwData.cpuCores,
      memory: hwData.memory,
      screenResolution: `${hwData.screen.width}x${hwData.screen.height}`,
      colorDepth: hwData.screen.colorDepth,
      maxTouchPoints: hwData.maxTouchPoints,
      webrtcIPs: leakData.webrtcIPs,
      canvasHash: canvasData.hash,
      automationSignals: autoData.signals,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: [...navigator.languages],
      cookiesEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      pluginCount: navigator.plugins.length,
    },
    timestamp: Date.now(),
  };
}

(function(){
  // 1. ACEITAR COOKIES (Algoritmo AdsPower com pontuação e busca em Shadow DOM/iFrames)
  var knownSelectors = [
    'button[id*=accept]', 'button[id*=aceitar]', 'button[id*=consent]',
    '[class*=cookie-accept]', '[class*=consent-accept]', '[class*=lgpd-accept]',
    '[data-testid*=accept]', '[data-action=accept]',
    'button[aria-label*=aceitar]', 'button[aria-label*=accept]', 'button[aria-label*=concordo]',
    '#lgpd-accept', '#cookie-accept', '#onetrust-accept-btn-handler',
    '.cookie-accept', '.lgpd-accept', '.cc-accept', '.cc-dismiss',
    '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
    '[class*=cookie] button[class*=primary]', '[class*=consent] button[class*=primary]',
    '[id*=cookie] button[class*=primary]', '#hs-eu-confirmation-button',
    '#cn-accept-cookie', '[id*=cookie-consent]', '[class*=cookie-consent]',
    'button[class*=accept]', 'a[class*=accept]', 'button[class*=aceitar]', 'a[class*=aceitar]',
    '.fc-primary-button', '.fc-cta-consent', 'button.fc-primary-button'
  ];

  var textRegex = /^(aceitar|accept|concordo|ok|entendi|permitir|allow|gotit|prosseguir|continuar|fechar|aceito|agree|sim|yes|understood|autorizar|habilitar|consentir|dismiss|close)$/i;
  var phraseRegex = /(aceitar|accept|permitir|allow|concordar|agree|habilitar|autorizar)\s+(todos|cookies|tudo|all|termos|terms)/i;

  var phrases = [
    'aceitar todos', 'aceitar tudo', 'aceitar cookies', 'permitir todos', 'permitir tudo', 'permitir cookies',
    'concordar e fechar', 'concordar e prosseguir', 'concordar e continuar', 'salvar e continuar', 'salvar e aceitar',
    'accept all', 'accept cookies', 'accept everything', 'allow all', 'allow cookies', 'agree and close', 'agree and proceed',
    'agree & close', 'accept & close', 'sim, aceito', 'sim, concordo', 'entendi e aceito', 'entendi e concordo',
    'ok, entendi', 'ok, aceito'
  ];

  function matchesCookieText(el) {
    var text = (el.textContent || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').toLowerCase().trim();
    text = text.replace(/\s+/g, ' ');
    if (!text) return false;
    if (textRegex.test(text) || phraseRegex.test(text)) return true;
    for (var i = 0; i < phrases.length; i++) {
      if (text.indexOf(phrases[i]) !== -1) return true;
    }
    return false;
  }

  function isVisible(el) {
    if (el.__clicked) return false;
    var r = el.getBoundingClientRect();
    if (r.width <= 10 || r.height <= 10) return false;
    try {
      var style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    } catch(e) {}
    return true;
  }

  function findButtons(doc) {
    var found = [];
    function traverse(node) {
      if (!node) return;
      if (node.nodeType === 1) {
        var tagName = node.tagName.toLowerCase();
        var isInteractive = tagName === 'button' || tagName === 'a' || node.getAttribute('role') === 'button';
        if (isInteractive && isVisible(node)) {
          if (matchesCookieText(node)) found.push(node);
        }
        if (node.shadowRoot) traverse(node.shadowRoot);
      }
      var child = node.firstChild;
      while (child) { traverse(child); child = child.nextSibling; }
    }
    traverse(doc);
    return found;
  }

  var buttons = findButtons(document);
  if (buttons.length > 0) {
    buttons[0].__clicked = true;
    try {
      buttons[0].click();
      console.log('[RPA] Cookie aceito automaticamente.');
    } catch(e) {}
  }

  // 2. SIMULAÇÃO DE NAVEGAÇÃO HUMANA (ROLAGEM SUAVE EM ETAPAS)
  function rolarPaginaHumano(etapasRestantes) {
    if (etapasRestantes <= 0) return;

    var direcao = Math.random() > 0.2 ? 1 : -0.5; // 80% rola para baixo, 20% sobe um pouco lendo
    var distancia = (Math.floor(Math.random() * 350) + 200) * direcao;

    window.scrollBy({
      top: distancia,
      behavior: 'smooth'
    });

    var proximoIntervalo = Math.floor(Math.random() * 3000) + 2500; // Pausa de 2.5s a 5.5s por rolagem
    setTimeout(function() {
      rolarPaginaHumano(etapasRestantes - 1);
    }, proximoIntervalo);
  }

  // Inicia 5 a 8 etapas de rolagem humana durante a leitura do site
  var totalEtapas = Math.floor(Math.random() * 4) + 5;
  rolarPaginaHumano(totalEtapas);
})();

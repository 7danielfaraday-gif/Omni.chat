// ==================================================
    // 1. UTILITÁRIOS E COMPATIBILIDADE
    // ==================================================
    
    // Dados do Produto
    const PRODUCT_CONTENT = {
        contents: [{ content_id: 'AFON-12L-BI', id: 'AFON-12L-BI', quantity: 1, price: 197.99, item_price: 197.99 }],
        content_id: 'AFON-12L-BI',
        content_ids: ['AFON-12L-BI'],
        content_name: 'Fritadeira ElÃ©trica Forno Oven 12L Mondial',
        description: 'Fritadeira ElÃ©trica Forno Oven 12L Mondial AFON-12L-BI',
        content_type: 'product',
        category: 'EletroportÃ¡teis',
        quantity: 1,
        price: 197.99,
        value: 197.99,
        currency: 'BRL'
    };
    window.PRODUCT_CONTENT = window.PRODUCT_CONTENT || PRODUCT_CONTENT;
    const LP_VIEW_CONTENT_KEY = '__landing_viewcontent';

    // --- HELPER FUNCTIONS ---

    function setCookie(name, value, days) {
        if (window.__LAB_MODE) return;
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax";
    }
    
    function getCookie(name) {
        if (window.__LAB_MODE) return null;
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function generateEventId() {
        return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    window.generateEventId = generateEventId;
    // trackViaZaraz permanece como no-op para compatibilidade

    function getExternalId() {
        let eid = localStorage.getItem('user_external_id');
        if (!eid) eid = getCookie('user_external_id'); 
        
        if (!eid) {
            eid = 'user_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('user_external_id', eid);
            setCookie('user_external_id', eid, 365); 
        }
        return eid;
    }

    
    function saveUTMs() {
        const urlParams = new URLSearchParams(window.location.search);
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        utmKeys.forEach(key => {
            const val = urlParams.get(key);
            if (val) setCookie(key, val, 30);
        });
    }

    function getStoredUTMs() {
        const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
        let utms = {};
        utmKeys.forEach(key => {
            const val = getCookie(key);
            if (val) utms[key] = val;
        });
        return utms;
    }

    // Compatibilidade após remoção do pixel
    function trackViaZaraz() {
        return;
    }
    window.trackViaZaraz = trackViaZaraz;


    // --- TRIGGERS ---

    // 1. PageView
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    window.addEventListener('load', function() {
        saveUTMs();
    });

    // 2. ViewContent da LP
    // O checkout só dispara ViewContent como fallback em entrada direta.
    (function triggerLandingViewContent() {
        if (/^\/c(?:\/|$)/i.test(window.location.pathname)) return;
        try {
            var now = Date.now();
            var existing = null;
            try { existing = JSON.parse(sessionStorage.getItem(LP_VIEW_CONTENT_KEY) || 'null'); } catch (e) {}
            if (existing && existing.at && (now - existing.at) < (30 * 60 * 1000)) return;

            var eventId = generateEventId();
            try {
                sessionStorage.setItem(LP_VIEW_CONTENT_KEY, JSON.stringify({ event_id: eventId, at: now, source: 'lp' }));
            } catch (e) {}

            trackViaZaraz('ViewContent', {
                ...PRODUCT_CONTENT,
                event_id: eventId,
                content_name: PRODUCT_CONTENT.content_name
            });
        } catch (e) {}
    })();

    // 3. CTA Comprar Agora (WebView-safe: nÃ£o bloqueia navegaÃ§Ã£o)
    // Monta o link com parÃ¢metros (utm/eid) ANTES do clique, evitando redirect com delay.
    window.buildCheckoutUrl = function(baseHref) {
        try {
            const urlObj = new URL(baseHref, window.location.origin);

            // 1) MantÃ©m parÃ¢metros atuais da URL (UTMs etc.)
            const currentParams = new URLSearchParams(window.location.search);
            currentParams.forEach((value, key) => {
                urlObj.searchParams.set(key, value);
            });

            // 2) Completa com UTMs salvos (se faltarem)
            try {
                const stored = (typeof getStoredUTMs === 'function') ? getStoredUTMs() : {};
                Object.keys(stored || {}).forEach((k) => {
                    if (!urlObj.searchParams.has(k)) urlObj.searchParams.set(k, stored[k]);
                });
            } catch (e) {}

            // 3) External ID (eid)
            try {
                const eid = (typeof getExternalId === 'function') ? getExternalId() : null;
                if (eid && !urlObj.searchParams.has('eid')) urlObj.searchParams.set('eid', eid);
            } catch (e) {}

            return urlObj.toString();
        } catch (e) {
            return baseHref;
        }
    };

    (function setupBuyNowButton() {
        const btn = document.getElementById('buy-now') || document.querySelector('.buy-btn');
        if (!btn) return;
        const baseCheckoutPath = '/c/';
        window.__buyNowJsReady = true;

        // Modo 100% SPA: nunca redireciona por href.
        btn.href = 'javascript:void(0)';

        // MantÃ©m a URL de checkout com parÃ¢metros em data-attribute.
        try {
            btn.dataset.checkoutTarget = window.buildCheckoutUrl(baseCheckoutPath);
        } catch (e) {}

        // Setup SPA Checkout instead of redirecting
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (btn.classList) btn.classList.remove('is-opening');
            const target = btn.dataset.checkoutTarget || baseCheckoutPath;
            if (typeof window.spaOpenCheckout === 'function') window.spaOpenCheckout(target);

            const trackAddToCart = () => {
                try {
                    trackViaZaraz('AddToCart', {
                        ...PRODUCT_CONTENT,
                        event_id: generateEventId()
                    }, true);
                } catch (err) {}
            };

            // Evita custo extra no frame do clique (sensaÃ§Ã£o de "botÃ£o travado")
            if ('requestIdleCallback' in window) {
                requestIdleCallback(trackAddToCart, { timeout: 1200 });
            } else {
                setTimeout(trackAddToCart, 0);
            }
        });
    })();
    // ==================================================
    // 4. MICRO-CONVERSÃ•ES (NOVO: ALIMENTA O ALGORITMO)
    // ==================================================

    // A) Scroll Profundo (Leitura)
    let scroll50Fired = false;
    window.addEventListener('scroll', function() {
        if (scroll50Fired) return;
        const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
        if (scrollPercentage >= 50) {
            scroll50Fired = true;
            trackViaZaraz('ScrollDepth', {
                event_id: generateEventId(),
                depth: '50%'
            });
        }
    }, { passive: true });

// ==================================================
  // 2. FUNÃ‡Ã•ES VISUAIS DA LOJA (UI/UX)
  // ==================================================
  
  function showTab(tabName) {
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    const targetContent = document.getElementById(tabName);
    if (targetContent) targetContent.classList.add('active');
    
    const targetTab = document.querySelector(`.tabs .tab[onclick="showTab('${tabName}')"]`);
    if (targetTab) targetTab.classList.add('active');
  }

  const variantLinks = {
    'preto': '/c/',
    'rosa-pink': '/c/',
    'roxo-claro': '/c/',
    'rosa-claro': '/c/'
  };
  const buyBtn = document.querySelector('.buy-btn');

  document.addEventListener("DOMContentLoaded", () => {
    
    // CronÃ´metro Persistente (Anti-Fake)
    function startCountdown() {
      const countdownEl = document.getElementById('countdown-timer');
      if (!countdownEl) return;
      
      // Tenta recuperar o tempo do localStorage ou usa 300 (5 min)
      let savedTime = localStorage.getItem('offer_timer_v4');
      let timeLeft = savedTime ? parseInt(savedTime) : 900;
      
      // Se o tempo acabou ou Ã© invÃ¡lido, reseta
      if(isNaN(timeLeft) || timeLeft <= 0) timeLeft = 900;

      const updateDisplay = () => {
          const minutes = Math.floor(timeLeft / 60);
          const seconds = timeLeft % 60;
          countdownEl.textContent = `Termina em ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      };

      updateDisplay(); // Atualiza imediatamente

      const timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
          // Quando acaba, reinicia discretamente para manter a pressÃ£o (loop infinito sutil)
          timeLeft = 900; 
        } else {
          timeLeft--;
        }
        localStorage.setItem('offer_timer_v4', timeLeft);
        updateDisplay();
      }, 1000);
    }
    
    // Data de Entrega
    function updateShippingDate() {
      const shippingEl = document.getElementById('shipping-date');
      if (!shippingEl) return;

      const getDeliveryDate = (addDays) => {
        const date = new Date();
        date.setDate(date.getDate() + addDays);
        const day = date.getDate();
        const month = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
        return `${day} de ${month}`;
      };

      const startDate = getDeliveryDate(3);
      const endDate = getDeliveryDate(5);
      shippingEl.textContent = `Receba entre ${startDate} e ${endDate}`;
    }

    // Galeria de Imagens
    const totalImages = 8;
    const variantStartIndex = {
      'preto': 1,
      'rosa-pink': 2,
      'roxo-claro': 3,
      'rosa-claro': 4
    };
    let currentVariant = 'preto';
    let currentImageIndex = variantStartIndex[currentVariant];

    const mainImage = document.getElementById('main-product-image');
    const imageCounter = document.getElementById('image-counter');
    const imageDots = document.getElementById('image-dots');
    const imageThumbnails = document.getElementById('image-thumbnails');
    const swatches = document.querySelectorAll('.color-swatch');
    const viewReviewsBtn = document.querySelector('.add-cart-btn');
    const reviewsSection = document.querySelector('.reviews-section');
    
    // CORREÃ‡ÃƒO: Remover loader ao carregar imagem
    if (mainImage) {
        mainImage.onload = function() {
            const loader = document.getElementById('image-loading');
            if(loader) loader.style.display = 'none';
        }
    }

    // FIX INP: OtimizaÃ§Ã£o do botÃ£o "Ver AvaliaÃ§Ãµes"
    // â­ï¸ NOVO: Rastreamento de Micro-ConversÃ£o (Click em AvaliaÃ§Ãµes)
    if (viewReviewsBtn && reviewsSection) {
      viewReviewsBtn.addEventListener('click', (e) => {
        
        // Dispara evento de interesse
        if(window.trackViaZaraz) {
            window.trackViaZaraz('Check_Reviews', { event_id: window.generateEventId() });
        }

        // Envolve em requestAnimationFrame para nÃ£o bloquear o clique inicial
        requestAnimationFrame(() => {
            // FIX: Alterado de 'smooth' para 'auto' para garantir scroll em mobile (navegador embutido)
            reviewsSection.scrollIntoView({ behavior: 'auto', block: 'start' });
            showTab('overview');
        });
      }, { passive: true });
    }

    const padZero = n => n.toString().padStart(2, '0');

    function createImageDots() {
      imageDots.innerHTML = '';
      for (let i = 1; i <= totalImages; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        dot.dataset.index = i;
        dot.addEventListener('click', () => {
          currentImageIndex = i;
          updateImageDisplay();
        });
        imageDots.appendChild(dot);
      }
    }
    
   function createThumbnails() {
      imageThumbnails.innerHTML = '';
      for (let i = 1; i <= totalImages; i++) {
        const thumbWrapper = document.createElement('div');
        thumbWrapper.classList.add('thumbnail');
        thumbWrapper.dataset.index = i;
        
        const thumbImg = document.createElement('img');
        const imgName = 'thumb_' + padZero(i) + '.webp'; 
        
        thumbImg.src = '/assets/img/' + imgName;
        thumbImg.alt = `Miniatura ${i}`;
        thumbImg.loading = 'lazy';
        
        thumbWrapper.appendChild(thumbImg);
        thumbWrapper.addEventListener('click', () => {
          currentImageIndex = i;
          updateImageDisplay();
        });
        imageThumbnails.appendChild(thumbWrapper);
      }
    }

    function updateImageDisplay() {
        // FIX INP: ManipulaÃ§Ã£o de DOM pesada movida para requestAnimationFrame
        requestAnimationFrame(() => {
          const imgName = padZero(currentImageIndex) + '.webp';
          mainImage.src = '/assets/img/' + imgName;
          imageCounter.textContent = `${currentImageIndex}/${totalImages}`;

          imageDots.querySelectorAll('.dot').forEach((d, i) =>
            d.classList.toggle('active', i + 1 === currentImageIndex));

          imageThumbnails.querySelectorAll('.thumbnail').forEach((t, i) =>
            t.classList.toggle('active', i + 1 === currentImageIndex));
      });
    }

    // â­ï¸ CORREÃ‡ÃƒO 1: Tornando a funÃ§Ã£o GLOBAL para o HTML encontrar â­ï¸
    window.changeImage = function(dir) {
      currentImageIndex += dir;
      if (currentImageIndex > totalImages) currentImageIndex = 1;
      if (currentImageIndex < 1) currentImageIndex = totalImages;
      updateImageDisplay();
    };

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        swatches.forEach(s => s.classList.remove('selected'));
        swatch.classList.add('selected');
        const color = swatch.dataset.color;
        
        if (variantLinks[color]) {
          buyBtn.href = "javascript:void(0)";
          buyBtn.dataset.checkoutTarget = window.buildCheckoutUrl ? window.buildCheckoutUrl(variantLinks[color]) : variantLinks[color];
          buyBtn.removeAttribute('onclick');
        }
        
        currentVariant = color;
        currentImageIndex = variantStartIndex[color] || 1;
        updateImageDisplay();
      });
    });

    const defaultSwatch = document.querySelector(`.color-swatch[data-color="${currentVariant}"]`);
    if (defaultSwatch) {
        defaultSwatch.classList.add('selected');
        if (variantLinks[currentVariant]) {
            buyBtn.href = "javascript:void(0)";
            buyBtn.dataset.checkoutTarget = window.buildCheckoutUrl ? window.buildCheckoutUrl(variantLinks[currentVariant]) : variantLinks[currentVariant];
            buyBtn.removeAttribute('onclick');
        }
    }

    createImageDots();
    createThumbnails();
    updateImageDisplay();
    startCountdown();     
    updateShippingDate(); 
    
    // â­ï¸ CORREÃ‡ÃƒO 2: SWIPE com verificaÃ§Ã£o de eixo Y (Scroll) â­ï¸
    const imgContainer = document.querySelector('.image-container');
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    // Controle de disparo Ãºnico para evento de Galeria
    let galleryEventFired = false;

    if (imgContainer) {
        imgContainer.addEventListener('touchstart', (e) => {
          touchStartX = e.changedTouches[0].screenX;
          touchStartY = e.changedTouches[0].screenY;
        }, {passive: true});

        imgContainer.addEventListener('touchend', (e) => {
          touchEndX = e.changedTouches[0].screenX;
          touchEndY = e.changedTouches[0].screenY;
          handleSwipe();
        }, {passive: true});
    }

    function handleSwipe() {
      const xDiff = touchEndX - touchStartX;
      const yDiff = touchEndY - touchStartY;
      
      // SÃ³ muda imagem se movimento horizontal for maior que vertical (para nÃ£o atrapalhar o scroll)
      if (Math.abs(xDiff) > 50 && Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff < 0) window.changeImage(1); // Swipe Esquerda -> PrÃ³xima
        else window.changeImage(-1); // Swipe Direita -> Anterior
        
        // â­ï¸ NOVO: Rastreia interaÃ§Ã£o com galeria (Micro-ConversÃ£o)
        if (!galleryEventFired && window.trackViaZaraz) {
            galleryEventFired = true;
            window.trackViaZaraz('Interact_Gallery', { event_id: window.generateEventId() });
        }
      }
    }
    
    // Pop-up de Vendas
    const buyers = [
        { name: "Fernanda Maia", city: "Rio de Janeiro, RJ", img: "/assets/img/foto1.webp" },
        { name: "Bruna Lima", city: "SÃ£o Paulo, SP", img: "/assets/img/foto2.webp" },
        { name: "Marilia Lima", city: "Belo Horizonte, MG", img: "/assets/img/foto3.webp" },
        { name: "Karina Andrade", city: "Curitiba, PR", img: "/assets/img/foto4.webp" },
        { name: "Bruna Silva", city: "Salvador, BA", img: "/assets/img/foto5.webp" },
        { name: "Kailane Cristina", city: "Fortaleza, CE", img: "/assets/img/foto6.webp" },
        { name: "Mariana Lemos", city: "Porto Alegre, RS", img: "/assets/img/foto7.webp" }
    ];

    const actions = [
        "Comprou agora mesmo",
        "Acabou de comprar",
        "Comprou hÃ¡ 2 minutos",
        "Garantiu a oferta",
        "Comprou 2 unidades"
    ];

    function showSalesPopup() {
        const popup = document.getElementById('sales-popup');
        const imgEl = document.getElementById('popup-img');
        const nameEl = document.getElementById('popup-name');
        const cityEl = document.getElementById('popup-city');
        const actionEl = document.getElementById('popup-action');

        if (!popup) return;

        const randomBuyer = buyers[Math.floor(Math.random() * buyers.length)];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        nameEl.textContent = randomBuyer.name;
        cityEl.textContent = randomBuyer.city;
        actionEl.textContent = randomAction;
        if(randomBuyer.img) imgEl.src = randomBuyer.img;

        popup.classList.add('visible');

        setTimeout(() => {
            popup.classList.remove('visible');
        }, 4000);
    }

    // Show popup only once per session, after 15 seconds
    if (!sessionStorage.getItem('popup_shown')) {
        setTimeout(() => {
            showSalesPopup();
            sessionStorage.setItem('popup_shown', '1');
        }, 15000);
    }
    
  });

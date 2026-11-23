        // --- Global mouse tracker for precise hover positioning ---
        (function(){
            if (!window.__YGO_MOUSE__) {
                window.__YGO_MOUSE__ = { x: 0, y: 0 };
                window.addEventListener('mousemove', function(e){
                    window.__YGO_MOUSE__.x = e.clientX;
                    window.__YGO_MOUSE__.y = e.clientY;
                }, { passive: true });
            }
        })();

        // --- Starfield generator for export background ---
        function __hashSeed(s){ s=String(s||''); var h=2166136261>>>0; for(var i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0;} return h>>>0; }
        function __rng(seed){ var x=(seed>>>0)||1; return function(){ x^=x<<13; x^=x>>>17; x^=x<<5; return ((x>>>0)/4294967296);} }
        function generateStarfieldDataURL(host){
            try{
                host=host||document.querySelector('.export-onewm'); if(!host) return null;
                var r=host.getBoundingClientRect(); var W=Math.max(320,Math.floor(r.width)), H=Math.max(320,Math.floor(r.height));
                var salt = host && host.dataset ? (host.dataset.starSalt || '') : '';
                var key=salt+'|'+W+'x'+H; if(host.dataset.starKey===key && host.dataset.starUrl){ return host.dataset.starUrl; }
                var seedStr=(host.getAttribute('data-wm-text')||'')+'|'+key; var rand=__rng(__hashSeed(seedStr));
                var c=document.createElement('canvas'); c.width=W; c.height=H; var ctx=c.getContext('2d',{willReadFrequently:true});
                var g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0a0f1a'); g.addColorStop(1,'#0b1020'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
                function neb(cx,cy,r,rgba){ var rg=ctx.createRadialGradient(cx,cy,0,cx,cy,r); rg.addColorStop(0,rgba.replace(',1)',',0.18)')); rg.addColorStop(0.4,rgba.replace(',1)',',0.10)')); rg.addColorStop(1,'rgba(0,0,0,0)'); ctx.globalCompositeOperation='lighter'; ctx.fillStyle=rg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over'; }
                var nN=2+Math.floor(rand()*2); var hues=[[168,246,1],[200,180,1],[286,180,1]];
                for(var i=0;i<nN;i++){ var cx=(0.2+0.6*rand())*W, cy=(0.2+0.6*rand())*H, rr=(0.25+0.35*rand())*Math.max(W,H), pick=hues[Math.floor(rand()*hues.length)]; var col='rgba('+pick[0]+','+pick[1]+','+Math.floor(200+55*rand())+',1)'; neb(cx,cy,rr,col); }
                function star(x,y,s,a,b){ ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(255,255,255,1)'; ctx.shadowColor='rgba(255,255,255,0.9)'; ctx.shadowBlur=b; ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill(); ctx.restore(); }
                var area=W*H, base=Math.floor(area/18000), bright=Math.floor(base*0.18), mid=Math.floor(base*0.55), faint=Math.floor(base*0.90);
                for(var i=0;i<faint;i++){ star(rand()*W,rand()*H,0.4+rand()*0.6,0.35+rand()*0.2,0.3+rand()*0.6); }
                for(var i=0;i<mid;i++){ star(rand()*W,rand()*H,0.7+rand()*0.9,0.55+rand()*0.25,0.8+rand()*1.2); }
                for(var i=0;i<bright;i++){ star(rand()*W,rand()*H,1.2+rand()*1.1,0.85+rand()*0.15,1.6+rand()*2.2); }
                var vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.2,W/2,H/2,Math.max(W,H)*0.75); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(0,0,0,0.45)'); ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
                var url=c.toDataURL('image/png'); host.dataset.starKey=key; host.dataset.starUrl=url; return url;
            }catch(e){ return null; }
        }
        function setSmartExportBackground(host){
            try{
                host=host||document.querySelector('.export-onewm'); if(!host) return;
                var url=generateStarfieldDataURL(host);
                if(url){ host.style.backgroundImage='url('+url+')'; host.style.backgroundSize='cover'; host.style.backgroundPosition='center'; host.style.backgroundColor='#0a0f1a'; }
            }catch(e){}
        }

        window.__YGO_DRAGGING__ = false;

        const { useState, useEffect, useRef, useCallback, memo, useMemo, useLayoutEffect } = window.React;
        const { createRoot, createPortal } = window.ReactDOM;

        // Fondo animado o quieto (se recuerda; si el sistema pide menos movimiento, empieza quieto)
        window.__ygoBgAnimated = (() => { try { const v = localStorage.getItem('ygo_bg_anim'); if (v !== null) return v === '1'; } catch (e) {} return !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches); })();
        if (window.__ygoBgAnimated === false) document.documentElement.classList.add('bg-static');
        const StarfieldBackground = () => {
            useEffect(() => {
                const canvas = document.createElement('canvas');
                canvas.id = 'bg-canvas';
                document.body.prepend(canvas);
                const ctx = canvas.getContext('2d');
                let stars;
                let animationFrameId;

                function resizeCanvas() {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }

                class Star {
                    constructor() {
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.z = Math.random() * canvas.width;
                    }

                    update() {
                        this.z -= 2;
                        if (this.z < 1) {
                            this.z = canvas.width;
                            this.x = Math.random() * canvas.width;
                            this.y = Math.random() * canvas.height;
                        }
                    }

                    show() {
                        let sx = (this.x - canvas.width / 2) * (canvas.width / this.z) + canvas.width / 2;
                        let sy = (this.y - canvas.height / 2) * (canvas.width / this.z) + canvas.height / 2;
                        let r = (canvas.width / this.z);
                        
                        if (sx > 0 && sx < canvas.width && sy > 0 && sy < canvas.height) {
                            ctx.beginPath();
                            ctx.arc(sx, sy, r, 0, Math.PI * 2);
                            const theme = document.documentElement.getAttribute('data-theme');
                            const starColor = theme === 'dark' ? '255, 255, 255' : '0, 0, 0';
                            ctx.fillStyle = `rgba(${starColor}, ${1 - this.z / canvas.width})`;
                            ctx.fill();
                        }
                    }
                }

                function setupStars() {
                    stars = [];
                    const starCount = Math.floor((canvas.width + canvas.height) / 4);
                    for (let i = 0; i < starCount; i++) {
                        stars.push(new Star());
                    }
                }

                function draw() {
                    const theme = document.documentElement.getAttribute('data-theme');
                    const animated = window.__ygoBgAnimated !== false;
                    const bgColor = theme === 'dark' ? (animated ? 'rgba(2, 6, 23, 0.5)' : 'rgb(2, 6, 23)') : (animated ? 'rgba(241, 245, 249, 0.5)' : 'rgb(241, 245, 249)');
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    for (const star of stars) {
                        if (animated) star.update();
                        star.show();
                    }
                    if (animated) animationFrameId = requestAnimationFrame(draw);
                }

                function init() {
                    resizeCanvas();
                    setupStars();
                    draw();
                }

                const handleResize = () => {
                    cancelAnimationFrame(animationFrameId);
                    init();
                };
                
                init();
                window.addEventListener('resize', handleResize);
                const onBgChange = () => { cancelAnimationFrame(animationFrameId); draw(); };
                window.addEventListener('ygo-bg-change', onBgChange);
                
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                           if (window.__ygoBgAnimated === false) onBgChange(); // con el fondo quieto hay que repintarlo
                        }
                    });
                });
                observer.observe(document.documentElement, { attributes: true });


                return () => {
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('ygo-bg-change', onBgChange);
                    cancelAnimationFrame(animationFrameId);
                    observer.disconnect();
                    document.body.removeChild(canvas);
                };
            }, []);

            return null; // The canvas is managed directly in the DOM
        };

        // YGOPRODeck ya permite llamadas directas desde el navegador; no hace falta el proxy de Vercel.
        const YGOPRODECK_API_BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

        // Enlaces de compartir: JSON -> comprimido (pako) -> base64 apto para URL (sin + / =).
        // Formato v2: las cartas de YGOPRODeck viajan solo como {número, instanceId, notas, nombre};
        // al abrir el enlace se piden sus datos a la API. Las cartas personalizadas viajan completas.
        const SHARE_FORMAT_VERSION = 2;
        const isApiCardObject = (o) => o && typeof o === 'object' && !Array.isArray(o) && o.instanceId && o.ygoprodeck_id && !o.isCustom;
        const mapComboTree = (node, fn) => {
            if (Array.isArray(node)) return node.map(n => mapComboTree(n, fn));
            if (node && typeof node === 'object') {
                const replaced = fn(node);
                if (replaced !== undefined) return replaced;
                return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, mapComboTree(v, fn)]));
            }
            return node;
        };
        const compactCombo = (state) => mapComboTree(state, (o) => isApiCardObject(o)
            ? { $c: o.ygoprodeck_id, i: o.instanceId, n: o.name, ...(o.notes ? { o: o.notes } : {}) }
            : undefined);
        const hydrateCombo = async (state, imageProxy) => {
            const ids = new Set();
            mapComboTree(state, (o) => { if (o.$c) { ids.add(o.$c); return o; } });
            const byId = {};
            if (ids.size) {
                try {
                    const res = await fetch(`${YGOPRODECK_API_BASE_URL}?id=${[...ids].join(',')}`);
                    if (res.ok) ((await res.json()).data || []).forEach(c => { byId[c.id] = c; });
                } catch (e) { console.error("No se pudieron recuperar las cartas del enlace:", e); }
            }
            return mapComboTree(state, (o) => {
                if (!o.$c) return undefined;
                const card = createComboCardInstance(byId[o.$c] || { id: o.$c, name: o.n || '?' }, imageProxy);
                return { ...card, instanceId: o.i, notes: o.o || '' };
            });
        };
        const encodeComboForUrl = (state) => {
            const bytes = pako.deflate(JSON.stringify({ v: SHARE_FORMAT_VERSION, s: compactCombo(state) }));
            let bin = '';
            for (let i = 0; i < bytes.length; i += 0x8000) {
                bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
            }
            return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        };
        const decodeComboFromUrl = async (encoded, imageProxy) => {
            let b64 = encoded.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+');
            while (b64.length % 4) b64 += '=';
            const bin = atob(b64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            const parsed = JSON.parse(pako.inflate(bytes, { to: 'string' }));
            // Enlaces v1 (noviembre 2026) traían el combo completo, sin envoltorio.
            if (parsed && parsed.v === SHARE_FORMAT_VERSION) return hydrateCombo(parsed.s, imageProxy);
            return parsed;
        };
        const CARD_TYPES = ["Effect Monster", "Flip Effect Monster", "Fusion Monster", "Link Monster", "Normal Monster", "Pendulum Effect Monster", "Ritual Effect Monster", "Spell Card", "Synchro Monster", "Token", "Trap Card", "Tuner Monster", "Union Effect Monster", "Xyz Monster"];
        const ATTRIBUTES = ["DARK", "DIVINE", "EARTH", "FIRE", "LIGHT", "WATER", "WIND"];
        const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        const CARDS_PER_PAGE = 18;
        const YGO_ZONES = ["Extra Monster 1", "Extra Monster 2", "Main Monster 1", "Main Monster 2", "Main Monster 3", "Main Monster 4", "Main Monster 5", "Spell/Trap 1", "Spell/Trap 2", "Spell/Trap 3", "Spell/Trap 4", "Spell/Trap 5", "Field Zone", "Graveyard", "Banish Pile"];
        const ZONE_ABBREVIATIONS = {
            "Extra Monster 1": "EMZ1", "Extra Monster 2": "EMZ2",
            "Main Monster 1": "MMZ1", "Main Monster 2": "MMZ2", "Main Monster 3": "MMZ3", "Main Monster 4": "MMZ4", "Main Monster 5": "MMZ5",
            "Spell/Trap 1": "S/T1", "Spell/Trap 2": "S/T2", "Spell/Trap 3": "S/T3", "Spell/Trap 4": "S/T4", "Spell/Trap 5": "S/T5",
            "Field Zone": "Field", "Graveyard": "GY", "Banish Pile": "Banish"
        };
        const LOCAL_STORAGE_PREFIX = 'ygo_combo_';
        const AUTO_SAVE_KEY = 'ygo_combo_autosave';
        const debounce = (func, delay) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); }; };
        const generateId = () => crypto.randomUUID();
        // La página usa body { zoom: 0.9 }: las coordenadas del mouse hay que dividirlas por esto para posicionar cosas fijas
        const getBodyZoom = () => { const z = parseFloat(getComputedStyle(document.body).zoom); return z && !isNaN(z) ? z : 1; };
        const sanitizeHTML = (str) => window.DOMPurify ? window.DOMPurify.sanitize(str, {ALLOWED_TAGS: ['b', 'i', 'u', 'br', 'ul', 'ol', 'li', 'p', 'div', 'span'], ALLOWED_ATTR: ['style']}) : str;
        const createComboCardInstance = (apiCard, imageProxy) => {
            if (!apiCard) return null;
            if (apiCard.isCustom) {
                return { ...apiCard, instanceId: generateId(), notes: '' };
            }
            const getImageUrl = (url) => {
                if (!url) return 'https://placehold.co/100x150/1e293b/a78bfa?text=No+Img';
                const bareUrl = url.replace(/^https?:\/\//, '');
                return `${imageProxy}${bareUrl}`;
            };
            const imageUrl = getImageUrl(apiCard.card_images?.[0]?.image_url);
            const imageUrlSmall = getImageUrl(apiCard.card_images?.[0]?.image_url_small);
            const imageUrlCropped = getImageUrl(apiCard.card_images?.[0]?.image_url_cropped);
            return {
                instanceId: generateId(), ygoprodeck_id: apiCard.id, name: apiCard.name, type: apiCard.type, desc: apiCard.desc,
                atk: apiCard.atk, def: apiCard.def, level: apiCard.level, race: apiCard.race, attribute: apiCard.attribute, scale: apiCard.scale, linkval: apiCard.linkval, linkmarkers: apiCard.linkmarkers,
                card_prices: apiCard.card_prices,
                image_url: imageUrl, image_url_small: imageUrlSmall, image_url_cropped: imageUrlCropped, isCustom: false, notes: '',
            };
        };
        // Nombres de acciones, zonas, tipos y atributos en cada idioma. Lo que se guarda sigue en inglés.
        const YGO_TERMS = {"es": {"Normal Summon": "Invocación Normal", "Special Summon": "Invocación Especial", "Set": "Colocar", "Activate Spell/Trap": "Activar Mágica/Trampa", "Activate Effect": "Activar efecto", "Attack": "Atacar", "Send to GY": "Enviar al Cementerio", "Discard": "Descartar", "Banish": "Desterrar", "Add to Hand": "Añadir a la mano", "Search": "Buscar del Deck", "Fusion Summon": "Invocación por Fusión", "Synchro Summon": "Invocación por Sincronía", "Xyz Summon": "Invocación Xyz", "Pendulum Summon": "Invocación por Péndulo", "Link Summon": "Invocación por Enlace", "Other": "Otra", "Field Zone": "Zona de Campo", "Graveyard": "Cementerio", "Banish Pile": "Desterradas", "Effect Monster": "Monstruo de Efecto", "Flip Effect Monster": "Monstruo de Efecto de Volteo", "Fusion Monster": "Monstruo de Fusión", "Link Monster": "Monstruo de Enlace", "Normal Monster": "Monstruo Normal", "Pendulum Effect Monster": "Monstruo de Efecto de Péndulo", "Ritual Effect Monster": "Monstruo de Ritual de Efecto", "Spell Card": "Carta Mágica", "Synchro Monster": "Monstruo de Sincronía", "Token": "Ficha", "Trap Card": "Carta de Trampa", "Tuner Monster": "Monstruo Cantante", "Union Effect Monster": "Monstruo de Unión", "Xyz Monster": "Monstruo Xyz", "DARK": "OSCURIDAD", "DIVINE": "DIVINIDAD", "EARTH": "TIERRA", "FIRE": "FUEGO", "LIGHT": "LUZ", "WATER": "AGUA", "WIND": "VIENTO", "Extra Monster 1": "Zona de Monstruo Extra 1", "Extra Monster 2": "Zona de Monstruo Extra 2", "Main Monster 1": "Zona de Monstruo 1", "Main Monster 2": "Zona de Monstruo 2", "Main Monster 3": "Zona de Monstruo 3", "Main Monster 4": "Zona de Monstruo 4", "Main Monster 5": "Zona de Monstruo 5", "Spell/Trap 1": "Zona de Mágicas/Trampas 1", "Spell/Trap 2": "Zona de Mágicas/Trampas 2", "Spell/Trap 3": "Zona de Mágicas/Trampas 3", "Spell/Trap 4": "Zona de Mágicas/Trampas 4", "Spell/Trap 5": "Zona de Mágicas/Trampas 5"}, "pt": {"Normal Summon": "Invocação-Normal", "Special Summon": "Invocação-Especial", "Set": "Baixar", "Activate Spell/Trap": "Ativar Magia/Armadilha", "Activate Effect": "Ativar efeito", "Attack": "Atacar", "Send to GY": "Enviar ao Cemitério", "Discard": "Descartar", "Banish": "Banir", "Add to Hand": "Adicionar à mão", "Search": "Buscar no Deck", "Fusion Summon": "Invocação-Fusão", "Synchro Summon": "Invocação-Sincro", "Xyz Summon": "Invocação-Xyz", "Pendulum Summon": "Invocação-Pêndulo", "Link Summon": "Invocação-Link", "Other": "Outra", "Field Zone": "Zona de Campo", "Graveyard": "Cemitério", "Banish Pile": "Banidas", "Effect Monster": "Monstro de Efeito", "Flip Effect Monster": "Monstro de Efeito de Virar", "Fusion Monster": "Monstro de Fusão", "Link Monster": "Monstro Link", "Normal Monster": "Monstro Normal", "Pendulum Effect Monster": "Monstro de Efeito Pêndulo", "Ritual Effect Monster": "Monstro de Ritual de Efeito", "Spell Card": "Card de Magia", "Synchro Monster": "Monstro Sincro", "Token": "Ficha", "Trap Card": "Card de Armadilha", "Tuner Monster": "Monstro Regulador", "Union Effect Monster": "Monstro de União", "Xyz Monster": "Monstro Xyz", "DARK": "TREVAS", "DIVINE": "DIVINO", "EARTH": "TERRA", "FIRE": "FOGO", "LIGHT": "LUZ", "WATER": "ÁGUA", "WIND": "VENTO", "Extra Monster 1": "Zona de Monstro Adicional 1", "Extra Monster 2": "Zona de Monstro Adicional 2", "Main Monster 1": "Zona de Monstro 1", "Main Monster 2": "Zona de Monstro 2", "Main Monster 3": "Zona de Monstro 3", "Main Monster 4": "Zona de Monstro 4", "Main Monster 5": "Zona de Monstro 5", "Spell/Trap 1": "Zona de Magias e Armadilhas 1", "Spell/Trap 2": "Zona de Magias e Armadilhas 2", "Spell/Trap 3": "Zona de Magias e Armadilhas 3", "Spell/Trap 4": "Zona de Magias e Armadilhas 4", "Spell/Trap 5": "Zona de Magias e Armadilhas 5"}, "fr": {"Normal Summon": "Invocation Normale", "Special Summon": "Invocation Spéciale", "Set": "Poser", "Activate Spell/Trap": "Activer Magie/Piège", "Activate Effect": "Activer un effet", "Attack": "Attaquer", "Send to GY": "Envoyer au Cimetière", "Discard": "Défausser", "Banish": "Bannir", "Add to Hand": "Ajouter à la main", "Search": "Chercher dans le Deck", "Fusion Summon": "Invocation Fusion", "Synchro Summon": "Invocation Synchro", "Xyz Summon": "Invocation Xyz", "Pendulum Summon": "Invocation Pendule", "Link Summon": "Invocation Lien", "Other": "Autre", "Field Zone": "Zone Terrain", "Graveyard": "Cimetière", "Banish Pile": "Bannies", "Effect Monster": "Monstre à Effet", "Flip Effect Monster": "Monstre à Effet Flip", "Fusion Monster": "Monstre Fusion", "Link Monster": "Monstre Lien", "Normal Monster": "Monstre Normal", "Pendulum Effect Monster": "Monstre à Effet Pendule", "Ritual Effect Monster": "Monstre Rituel à Effet", "Spell Card": "Carte Magie", "Synchro Monster": "Monstre Synchro", "Token": "Jeton", "Trap Card": "Carte Piège", "Tuner Monster": "Monstre Syntoniseur", "Union Effect Monster": "Monstre Union", "Xyz Monster": "Monstre Xyz", "DARK": "TÉNÈBRES", "DIVINE": "DIVIN", "EARTH": "TERRE", "FIRE": "FEU", "LIGHT": "LUMIÈRE", "WATER": "EAU", "WIND": "VENT", "Extra Monster 1": "Zone Monstre Extra 1", "Extra Monster 2": "Zone Monstre Extra 2", "Main Monster 1": "Zone Monstre 1", "Main Monster 2": "Zone Monstre 2", "Main Monster 3": "Zone Monstre 3", "Main Monster 4": "Zone Monstre 4", "Main Monster 5": "Zone Monstre 5", "Spell/Trap 1": "Zone Magie/Piège 1", "Spell/Trap 2": "Zone Magie/Piège 2", "Spell/Trap 3": "Zone Magie/Piège 3", "Spell/Trap 4": "Zone Magie/Piège 4", "Spell/Trap 5": "Zone Magie/Piège 5"}, "it": {"Normal Summon": "Evocazione Normale", "Special Summon": "Evocazione Speciale", "Set": "Posizionare", "Activate Spell/Trap": "Attivare Magia/Trappola", "Activate Effect": "Attivare effetto", "Attack": "Attaccare", "Send to GY": "Mandare al Cimitero", "Discard": "Scartare", "Banish": "Bandire", "Add to Hand": "Aggiungere alla mano", "Search": "Cercare nel Deck", "Fusion Summon": "Evocazione Fusione", "Synchro Summon": "Evocazione Synchro", "Xyz Summon": "Evocazione Xyz", "Pendulum Summon": "Evocazione Pendulum", "Link Summon": "Evocazione Link", "Other": "Altro", "Field Zone": "Zona Terreno", "Graveyard": "Cimitero", "Banish Pile": "Bandite", "Effect Monster": "Mostro con Effetto", "Flip Effect Monster": "Mostro con Effetto Scoperta", "Fusion Monster": "Mostro Fusione", "Link Monster": "Mostro Link", "Normal Monster": "Mostro Normale", "Pendulum Effect Monster": "Mostro con Effetto Pendulum", "Ritual Effect Monster": "Mostro Rituale con Effetto", "Spell Card": "Carta Magia", "Synchro Monster": "Mostro Synchro", "Token": "Segna-Mostro", "Trap Card": "Carta Trappola", "Tuner Monster": "Mostro Tuner", "Union Effect Monster": "Mostro Unione", "Xyz Monster": "Mostro Xyz", "DARK": "OSCURITÀ", "DIVINE": "DIVINO", "EARTH": "TERRA", "FIRE": "FUOCO", "LIGHT": "LUCE", "WATER": "ACQUA", "WIND": "VENTO", "Extra Monster 1": "Zona Mostri Extra 1", "Extra Monster 2": "Zona Mostri Extra 2", "Main Monster 1": "Zona Mostri 1", "Main Monster 2": "Zona Mostri 2", "Main Monster 3": "Zona Mostri 3", "Main Monster 4": "Zona Mostri 4", "Main Monster 5": "Zona Mostri 5", "Spell/Trap 1": "Zona Magie/Trappole 1", "Spell/Trap 2": "Zona Magie/Trappole 2", "Spell/Trap 3": "Zona Magie/Trappole 3", "Spell/Trap 4": "Zona Magie/Trappole 4", "Spell/Trap 5": "Zona Magie/Trappole 5"}, "de": {"Normal Summon": "Normalbeschwörung", "Special Summon": "Spezialbeschwörung", "Set": "Setzen", "Activate Spell/Trap": "Zauber/Falle aktivieren", "Activate Effect": "Effekt aktivieren", "Attack": "Angreifen", "Send to GY": "Auf den Friedhof legen", "Discard": "Abwerfen", "Banish": "Verbannen", "Add to Hand": "Zur Hand hinzufügen", "Search": "Aus dem Deck suchen", "Fusion Summon": "Fusionsbeschwörung", "Synchro Summon": "Synchrobeschwörung", "Xyz Summon": "Xyz-Beschwörung", "Pendulum Summon": "Pendelbeschwörung", "Link Summon": "Linkbeschwörung", "Other": "Andere", "Field Zone": "Spielfeldzone", "Graveyard": "Friedhof", "Banish Pile": "Verbannt", "Effect Monster": "Effektmonster", "Flip Effect Monster": "Flipeffektmonster", "Fusion Monster": "Fusionsmonster", "Link Monster": "Linkmonster", "Normal Monster": "Normales Monster", "Pendulum Effect Monster": "Pendeleffektmonster", "Ritual Effect Monster": "Ritualeffektmonster", "Spell Card": "Zauberkarte", "Synchro Monster": "Synchromonster", "Token": "Spielmarke", "Trap Card": "Fallenkarte", "Tuner Monster": "Empfängermonster", "Union Effect Monster": "Unionmonster", "Xyz Monster": "Xyz-Monster", "DARK": "FINSTERNIS", "DIVINE": "GÖTTLICH", "EARTH": "ERDE", "FIRE": "FEUER", "LIGHT": "LICHT", "WATER": "WASSER", "WIND": "WIND", "Extra Monster 1": "Extra-Monsterzone 1", "Extra Monster 2": "Extra-Monsterzone 2", "Main Monster 1": "Monsterzone 1", "Main Monster 2": "Monsterzone 2", "Main Monster 3": "Monsterzone 3", "Main Monster 4": "Monsterzone 4", "Main Monster 5": "Monsterzone 5", "Spell/Trap 1": "Zauber-/Fallenzone 1", "Spell/Trap 2": "Zauber-/Fallenzone 2", "Spell/Trap 3": "Zauber-/Fallenzone 3", "Spell/Trap 4": "Zauber-/Fallenzone 4", "Spell/Trap 5": "Zauber-/Fallenzone 5"}, "ru": {"Normal Summon": "Обычный призыв", "Special Summon": "Особый призыв", "Set": "Выставить", "Activate Spell/Trap": "Активировать заклинание/ловушку", "Activate Effect": "Активировать эффект", "Attack": "Атака", "Send to GY": "Отправить на кладбище", "Discard": "Сбросить", "Banish": "Изгнать", "Add to Hand": "Добавить в руку", "Search": "Найти в колоде", "Fusion Summon": "Призыв слиянием", "Synchro Summon": "Синхро-призыв", "Xyz Summon": "Икс-призыв", "Pendulum Summon": "Призыв маятником", "Link Summon": "Призыв связью", "Other": "Другое", "Field Zone": "Зона поля", "Graveyard": "Кладбище", "Banish Pile": "Изгнанные", "Effect Monster": "Монстр с эффектом", "Flip Effect Monster": "Монстр с эффектом переворота", "Fusion Monster": "Монстр слияния", "Link Monster": "Монстр связи", "Normal Monster": "Обычный монстр", "Pendulum Effect Monster": "Маятниковый монстр с эффектом", "Ritual Effect Monster": "Ритуальный монстр с эффектом", "Spell Card": "Карта заклинания", "Synchro Monster": "Синхро-монстр", "Token": "Жетон", "Trap Card": "Карта ловушки", "Tuner Monster": "Монстр-тюнер", "Union Effect Monster": "Монстр-союз", "Xyz Monster": "Икс-монстр", "DARK": "ТЬМА", "DIVINE": "БОЖЕСТВЕННЫЙ", "EARTH": "ЗЕМЛЯ", "FIRE": "ОГОНЬ", "LIGHT": "СВЕТ", "WATER": "ВОДА", "WIND": "ВЕТЕР", "Extra Monster 1": "Доп. зона монстров 1", "Extra Monster 2": "Доп. зона монстров 2", "Main Monster 1": "Зона монстров 1", "Main Monster 2": "Зона монстров 2", "Main Monster 3": "Зона монстров 3", "Main Monster 4": "Зона монстров 4", "Main Monster 5": "Зона монстров 5", "Spell/Trap 1": "Зона заклинаний/ловушек 1", "Spell/Trap 2": "Зона заклинаний/ловушек 2", "Spell/Trap 3": "Зона заклинаний/ловушек 3", "Spell/Trap 4": "Зона заклинаний/ловушек 4", "Spell/Trap 5": "Зона заклинаний/ловушек 5"}, "ja": {"Normal Summon": "通常召喚", "Special Summon": "特殊召喚", "Set": "セット", "Activate Spell/Trap": "魔法・罠を発動", "Activate Effect": "効果を発動", "Attack": "攻撃", "Send to GY": "墓地へ送る", "Discard": "捨てる", "Banish": "除外", "Add to Hand": "手札に加える", "Search": "デッキからサーチ", "Fusion Summon": "融合召喚", "Synchro Summon": "シンクロ召喚", "Xyz Summon": "エクシーズ召喚", "Pendulum Summon": "ペンデュラム召喚", "Link Summon": "リンク召喚", "Other": "その他", "Field Zone": "フィールドゾーン", "Graveyard": "墓地", "Banish Pile": "除外ゾーン", "Effect Monster": "効果モンスター", "Flip Effect Monster": "リバース効果モンスター", "Fusion Monster": "融合モンスター", "Link Monster": "リンクモンスター", "Normal Monster": "通常モンスター", "Pendulum Effect Monster": "ペンデュラム効果モンスター", "Ritual Effect Monster": "儀式効果モンスター", "Spell Card": "魔法カード", "Synchro Monster": "シンクロモンスター", "Token": "トークン", "Trap Card": "罠カード", "Tuner Monster": "チューナーモンスター", "Union Effect Monster": "ユニオンモンスター", "Xyz Monster": "エクシーズモンスター", "DARK": "闇", "DIVINE": "神", "EARTH": "地", "FIRE": "炎", "LIGHT": "光", "WATER": "水", "WIND": "風", "Extra Monster 1": "エクストラモンスターゾーン1", "Extra Monster 2": "エクストラモンスターゾーン2", "Main Monster 1": "メインモンスターゾーン1", "Main Monster 2": "メインモンスターゾーン2", "Main Monster 3": "メインモンスターゾーン3", "Main Monster 4": "メインモンスターゾーン4", "Main Monster 5": "メインモンスターゾーン5", "Spell/Trap 1": "魔法・罠ゾーン1", "Spell/Trap 2": "魔法・罠ゾーン2", "Spell/Trap 3": "魔法・罠ゾーン3", "Spell/Trap 4": "魔法・罠ゾーン4", "Spell/Trap 5": "魔法・罠ゾーン5"}, "ko": {"Normal Summon": "일반 소환", "Special Summon": "특수 소환", "Set": "세트", "Activate Spell/Trap": "마법/함정 발동", "Activate Effect": "효과 발동", "Attack": "공격", "Send to GY": "묘지로 보내기", "Discard": "버리기", "Banish": "제외", "Add to Hand": "패에 넣기", "Search": "덱에서 서치", "Fusion Summon": "융합 소환", "Synchro Summon": "싱크로 소환", "Xyz Summon": "엑시즈 소환", "Pendulum Summon": "펜듈럼 소환", "Link Summon": "링크 소환", "Other": "기타", "Field Zone": "필드 존", "Graveyard": "묘지", "Banish Pile": "제외 존", "Effect Monster": "효과 몬스터", "Flip Effect Monster": "리버스 효과 몬스터", "Fusion Monster": "융합 몬스터", "Link Monster": "링크 몬스터", "Normal Monster": "일반 몬스터", "Pendulum Effect Monster": "펜듈럼 효과 몬스터", "Ritual Effect Monster": "의식 효과 몬스터", "Spell Card": "마법 카드", "Synchro Monster": "싱크로 몬스터", "Token": "토큰", "Trap Card": "함정 카드", "Tuner Monster": "튜너 몬스터", "Union Effect Monster": "유니온 몬스터", "Xyz Monster": "엑시즈 몬스터", "DARK": "어둠", "DIVINE": "신", "EARTH": "땅", "FIRE": "화염", "LIGHT": "빛", "WATER": "물", "WIND": "바람", "Extra Monster 1": "엑스트라 몬스터 존 1", "Extra Monster 2": "엑스트라 몬스터 존 2", "Main Monster 1": "메인 몬스터 존 1", "Main Monster 2": "메인 몬스터 존 2", "Main Monster 3": "메인 몬스터 존 3", "Main Monster 4": "메인 몬스터 존 4", "Main Monster 5": "메인 몬스터 존 5", "Spell/Trap 1": "마법 & 함정 존 1", "Spell/Trap 2": "마법 & 함정 존 2", "Spell/Trap 3": "마법 & 함정 존 3", "Spell/Trap 4": "마법 & 함정 존 4", "Spell/Trap 5": "마법 & 함정 존 5"}, "zh": {"Normal Summon": "通常召唤", "Special Summon": "特殊召唤", "Set": "盖放", "Activate Spell/Trap": "发动魔法/陷阱", "Activate Effect": "发动效果", "Attack": "攻击", "Send to GY": "送去墓地", "Discard": "丢弃", "Banish": "除外", "Add to Hand": "加入手卡", "Search": "从卡组检索", "Fusion Summon": "融合召唤", "Synchro Summon": "同调召唤", "Xyz Summon": "超量召唤", "Pendulum Summon": "灵摆召唤", "Link Summon": "连接召唤", "Other": "其他", "Field Zone": "场地区", "Graveyard": "墓地", "Banish Pile": "除外区", "Effect Monster": "效果怪兽", "Flip Effect Monster": "反转效果怪兽", "Fusion Monster": "融合怪兽", "Link Monster": "连接怪兽", "Normal Monster": "通常怪兽", "Pendulum Effect Monster": "灵摆效果怪兽", "Ritual Effect Monster": "仪式效果怪兽", "Spell Card": "魔法卡", "Synchro Monster": "同调怪兽", "Token": "衍生物", "Trap Card": "陷阱卡", "Tuner Monster": "调整怪兽", "Union Effect Monster": "同盟怪兽", "Xyz Monster": "超量怪兽", "DARK": "暗", "DIVINE": "神", "EARTH": "地", "FIRE": "炎", "LIGHT": "光", "WATER": "水", "WIND": "风", "Extra Monster 1": "额外怪兽区1", "Extra Monster 2": "额外怪兽区2", "Main Monster 1": "主要怪兽区1", "Main Monster 2": "主要怪兽区2", "Main Monster 3": "主要怪兽区3", "Main Monster 4": "主要怪兽区4", "Main Monster 5": "主要怪兽区5", "Spell/Trap 1": "魔法与陷阱区1", "Spell/Trap 2": "魔法与陷阱区2", "Spell/Trap 3": "魔法与陷阱区3", "Spell/Trap 4": "魔法与陷阱区4", "Spell/Trap 5": "魔法与陷阱区5"}};
        Object.entries({"es": {"Hand": "Mano", "Deck": "Deck", "Extra Deck": "Extra Deck", "Pendulum Left": "Péndulo izq.", "Pendulum Right": "Péndulo der."}, "pt": {"Hand": "Mão", "Deck": "Deck", "Extra Deck": "Deck Adicional", "Pendulum Left": "Pêndulo esq.", "Pendulum Right": "Pêndulo dir."}, "fr": {"Hand": "Main", "Deck": "Deck", "Extra Deck": "Extra Deck", "Pendulum Left": "Pendule gauche", "Pendulum Right": "Pendule droite"}, "it": {"Hand": "Mano", "Deck": "Deck", "Extra Deck": "Extra Deck", "Pendulum Left": "Pendulum sin.", "Pendulum Right": "Pendulum des."}, "de": {"Hand": "Hand", "Deck": "Deck", "Extra Deck": "Extra-Deck", "Pendulum Left": "Pendel links", "Pendulum Right": "Pendel rechts"}, "ru": {"Hand": "Рука", "Deck": "Колода", "Extra Deck": "Доп. колода", "Pendulum Left": "Маятник (лев.)", "Pendulum Right": "Маятник (прав.)"}, "ja": {"Hand": "手札", "Deck": "デッキ", "Extra Deck": "エクストラデッキ", "Pendulum Left": "左ペンデュラム", "Pendulum Right": "右ペンデュラム"}, "ko": {"Hand": "패", "Deck": "덱", "Extra Deck": "엑스트라 덱", "Pendulum Left": "왼쪽 펜듈럼", "Pendulum Right": "오른쪽 펜듈럼"}, "zh": {"Hand": "手卡", "Deck": "卡组", "Extra Deck": "额外卡组", "Pendulum Left": "左灵摆区", "Pendulum Right": "右灵摆区"}}).forEach(([l, d]) => { YGO_TERMS[l] = Object.assign(YGO_TERMS[l] || {}, d); });
        let CURRENT_LANG = 'en';
        const trTerm = (name) => (name && YGO_TERMS[CURRENT_LANG] && YGO_TERMS[CURRENT_LANG][name]) || name;
        // Íconos de movimiento de las cartas afectadas: ícono del lugar + flecha/modificador (origen → destino)
        const MOVES = {draw: { base: 'fa-hand', mod: 'fa-arrow-down', group: 'hand', es: "Robar (del Deck, robo normal)", en: "Draw (from the Deck)" }, search: { base: 'fa-hand', mod: 'fa-magnifying-glass', group: 'hand', es: "Buscar (del Deck a la mano)", en: "Search (Deck to hand)" }, recover: { base: 'fa-hand', mod: 'fa-recycle', group: 'hand', es: "Recuperar (del Cementerio o desterradas a la mano)", en: "Add back (from GY or banished to hand)" }, bounce: { base: 'fa-hand', mod: 'fa-arrow-rotate-left', group: 'hand', es: "Devolver (del campo a la mano)", en: "Return (from the field to hand)" }, toGy: { base: 'fa-skull', mod: 'fa-arrow-down', group: 'gy', es: "Mandar al Cementerio (cualquier lugar)", en: "Send to the GY" }, mill: { base: 'fa-skull', mod: 'fa-layer-group', group: 'gy', es: "Del Deck al Cementerio (mill)", en: "Mill (Deck to GY)" }, discard: { base: 'fa-skull', mod: 'fa-hand', group: 'gy', es: "Descartar (de la mano)", en: "Discard" }, destroy: { base: 'fa-skull', mod: 'fa-burst', group: 'gy', es: "Destruir (del campo)", en: "Destroy" }, tribute: { base: 'fa-skull', mod: 'fa-hand-holding', group: 'gy', es: "Sacrificar", en: "Tribute" }, material: { base: 'fa-skull', mod: 'fa-plus', group: 'gy', es: "Usar como material", en: "Use as material" }, detach: { base: 'fa-skull', mod: 'fa-link-slash', group: 'gy', es: "Desacoplar material", en: "Detach material" }, banish: { base: 'fa-ban', mod: 'fa-arrow-down', group: 'ban', es: "Desterrar", en: "Banish" }, banishFd: { base: 'fa-ban', mod: 'fa-eye-slash', group: 'ban', es: "Desterrar boca abajo", en: "Banish face-down" }, shuffle: { base: 'fa-layer-group', mod: 'fa-shuffle', group: 'deck', es: "Barajar en el Deck", en: "Shuffle into the Deck" }, deckTop: { base: 'fa-layer-group', mod: 'fa-arrows-up-to-line', group: 'deck', es: "Al tope del Deck", en: "Top of the Deck" }, deckBottom: { base: 'fa-layer-group', mod: 'fa-arrows-down-to-line', group: 'deck', es: "Al fondo del Deck", en: "Bottom of the Deck" }, excavate: { base: 'fa-layer-group', mod: 'fa-eye', group: 'deck', es: "Excavar", en: "Excavate" }, toExtra: { base: 'fa-box-archive', mod: 'fa-arrow-down', group: 'extra', es: "Devolver al Deck Extra (boca abajo)", en: "Return to the Extra Deck" }, pendExtra: { base: 'fa-box-archive', mod: 'fa-eye', group: 'extra', es: "Al Deck Extra boca arriba", en: "To the Extra Deck face-up" }, ssHand: { base: 'fa-hand', mod: 'fa-arrow-up', group: 'summon', es: "Invocar de la mano", en: "Summon from the hand" }, ssDeck: { base: 'fa-layer-group', mod: 'fa-arrow-up', group: 'summon', es: "Invocar del Deck", en: "Summon from the Deck" }, revive: { base: 'fa-skull', mod: 'fa-arrow-up', group: 'summon', es: "Invocar del Cementerio", en: "Summon from the GY" }, ssBanish: { base: 'fa-ban', mod: 'fa-arrow-up', group: 'summon', es: "Invocar de desterradas", en: "Summon from banished" }, ssExtra: { base: 'fa-box-archive', mod: 'fa-arrow-up', group: 'summon', es: "Invocar del Deck Extra", en: "Summon from the Extra Deck" }, set: { base: 'fa-hand', mod: 'fa-eye-slash', group: 'field', es: "Colocar", en: "Set" }, attach: { base: 'fa-link', mod: 'fa-arrow-down', group: 'field', es: "Acoplar como material Xyz", en: "Attach as Xyz material" }, equip: { base: 'fa-shield-halved', mod: 'fa-link', group: 'field', es: "Equipar", en: "Equip" }, control: { base: 'fa-hand-holding', mod: 'fa-rotate', group: 'field', es: "Tomar el control", en: "Take control" }, effect: { base: 'fa-wand-sparkles', mod: null, group: 'other', es: "Afectada por el efecto", en: "Affected by the effect" }, negate: { base: 'fa-wand-sparkles', mod: 'fa-xmark', group: 'other', es: "Negar", en: "Negate" }, reveal: { base: 'fa-eye', mod: null, group: 'other', es: "Revelar", en: "Reveal" }};
        const MOVE_GROUPS = [['hand', 'groupHand'], ['gy', 'groupGy'], ['ban', 'groupBanish'], ['deck', 'groupDeck'], ['extra', 'groupExtra'], ['summon', 'groupSummon'], ['field', 'groupField'], ['other', 'groupOther']];
        const moveLabel = (k) => { const m = MOVES[k] || MOVES.effect; return CURRENT_LANG === 'es' ? m.es : m.en; };
        const defaultMoveFor = (action) => ({ 'Search': 'search', 'Add to Hand': 'search', 'Send to GY': 'toGy', 'Discard': 'discard', 'Banish': 'banish', 'Fusion Summon': 'material', 'Synchro Summon': 'material', 'Link Summon': 'material', 'Xyz Summon': 'attach', 'Pendulum Summon': 'ssHand', 'Set': 'set' }[action] || 'effect');
        const targetMove = (step, target) => (target && target.move) || defaultMoveFor(step && step.actionType);
        const MoveBadge = ({ k, className = '', onClick, title, wiggle }) => {
            const m = MOVES[k] || MOVES.effect;
            const Tag = onClick ? 'button' : 'span';
            return (
                <Tag type={onClick ? 'button' : undefined} onClick={onClick} title={title || moveLabel(k)} aria-label={title || moveLabel(k)} className={`mv-badge mv-${m.group} ${wiggle ? 'mv-wiggle' : ''} ${onClick ? 'mv-clickable' : ''} ${className}`}>
                    <i className={`fas ${m.base}`} aria-hidden="true"></i>
                    {m.mod && <i className={`fas ${m.mod} mv-mod`} aria-hidden="true"></i>}
                </Tag>
            );
        };
        const YGO_ACTIONS = [ { name: "Normal Summon", emoji: "⬆️" }, { name: "Special Summon", emoji: "⭐" }, { name: "Set", emoji: "⬇️" }, { name: "Activate Spell/Trap", emoji: "🌀" }, { name: "Activate Effect", emoji: "⚡" }, { name: "Attack", emoji: "⚔️" }, { name: "Send to GY", emoji: "🪦" }, { name: "Discard", emoji: "👋" }, { name: "Banish", emoji: "🌌" }, { name: "Add to Hand", emoji: "✋" }, { name: "Search", emoji: "🔍" }, { name: "Fusion Summon", emoji: "⚛️" }, { name: "Synchro Summon", emoji: "🟢" }, { name: "Xyz Summon", emoji: "💫" }, { name: "Pendulum Summon", emoji: "⚖️" }, { name: "Link Summon", emoji: "🔻" }, { name: "Other", emoji: "..." } ];
        
        const Spinner = () => <div className="spinner"></div>;

        const useHistoryState = (initialState) => {
            const [history, setHistory] = useState([{ state: initialState, description: "Initial State" }]);
            const [currentIndex, setCurrentIndex] = useState(0);
            const state = history[currentIndex].state;
            const canUndo = currentIndex > 0;
            const canRedo = currentIndex < history.length - 1;
            const setState = (newState, description) => { const newHistory = history.slice(0, currentIndex + 1); newHistory.push({ state: newState, description }); setHistory(newHistory); setCurrentIndex(newHistory.length - 1); };
            const loadState = (loadedState, description = "Loaded State") => { const newState = { state: loadedState, description }; setHistory([newState]); setCurrentIndex(0); };
            const undo = () => { if (canUndo) setCurrentIndex(currentIndex - 1); };
            const redo = () => { if (canRedo) setCurrentIndex(currentIndex + 1); };
            return { state, setState, loadState, undo, redo, canUndo, canRedo };
        };

        const CardDisplay = memo(({ card, onClick, onRemove, onEdit, draggable = false, onDragStart, onDragEnd, onTouchStart, size = 'normal', isAdded = false, onContextMenu, t, isHighlighted, quantity, onQuantityChange, useCropped = false, isNew = false, onMouseEnter, onMouseLeave, onMouseMove, children }) => {
            if (!card) return null;
            const [isImageLoaded, setIsImageLoaded] = useState(false);
            const sizeClasses = { large: 'w-36', medium: 'w-32', normal: 'w-28', small: 'w-24', tiny: 'w-16' };
            const cardRef = useRef(null);
            
            useEffect(() => {
                if (isNew && cardRef.current) {
                    cardRef.current.classList.add('card-enter');
                    requestAnimationFrame(() => {
                        cardRef.current.classList.add('card-enter-active');
                    });
                }
            }, [isNew]);

            const clickHandler = onClick ? (e) => { e.stopPropagation(); onClick(card, e); } : null;
            const contextMenuHandler = onContextMenu ? (e) => { e.preventDefault(); e.stopPropagation(); onContextMenu(card, e); } : null;
            const removeHandler = onRemove ? (e) => { e.stopPropagation(); onRemove(); } : null;
            const imageUrl = useCropped ? card.image_url_cropped : (card.image_url_small || card.image_url);

            return (
                <div 
                    ref={cardRef}
                    draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd} onTouchStart={onTouchStart}
                    onContextMenu={contextMenuHandler} data-instance-id={card.instanceId} 
                    className={`card-display relative group flex flex-col items-center rounded-lg shadow-md p-1 border border-[var(--color-border)] ${sizeClasses[size]} ${isAdded ? 'opacity-50' : 'cursor-pointer hover:opacity-90 hover:scale-105'} ${isHighlighted ? 'card-highlight' : ''} bg-[var(--color-surface)]`}
                    onClick={clickHandler}
                    onMouseEnter={(e) => onMouseEnter && onMouseEnter(card, e)}
                    onMouseLeave={(e) => onMouseLeave && onMouseLeave(e)}
                    onMouseMove={(e) => onMouseMove && onMouseMove(e)}
                >
                    {children}
                    <div className="absolute top-0 right-0 z-20 flex">
                        {onEdit && card.isCustom && (<button onClick={(e) => { e.stopPropagation(); onEdit(card); }} className="btn touch-hit w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-blue-700 -mt-2 -mr-1" aria-label="Editar" data-tooltip="Editar"><i className="fas fa-pencil-alt"></i></button>)}
                        {onRemove && (<button onClick={removeHandler} className="btn touch-hit w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-700 -mt-2 -mr-2" aria-label="Eliminar" data-tooltip="Eliminar"><i className="fas fa-times"></i></button>)}
                    </div>
                    {quantity > 1 && (<div className="absolute top-1 left-1 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">x{quantity}</div>)}
                    <div className="relative w-full" style={{ aspectRatio: useCropped ? '1' : '0.686' }}>
                        {!isImageLoaded && <div className="absolute inset-0 card-skeleton"></div>}
                        <img 
                            src={imageUrl} 
                            alt={card.name} 
                            className={`w-full object-cover rounded-md shadow-lg transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                            onLoad={() => setIsImageLoaded(true)}
                            crossOrigin="anonymous" 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x150/1e293b/a78bfa?text=Error'; setIsImageLoaded(true); }} 
                        />
                    </div>
                    {(!useCropped && (size === 'normal' || size === 'medium' || size === 'large')) && (<p className="w-full text-xs font-medium text-center truncate mt-1 px-1">{card.name}</p>)}
                    {onQuantityChange && (<div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center bg-black/50 rounded-full px-1 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={(e) => {e.stopPropagation(); onQuantityChange(card.instanceId, -1)}} className="btn text-white font-bold text-lg leading-none px-2">-</button><button onClick={(e) => {e.stopPropagation(); onQuantityChange(card.instanceId, 1)}} className="btn text-white font-bold text-lg leading-none px-2">+</button></div>)}
                </div>
            );
        });

        const CardZoomModal = ({ card, onClose, t, onSaveNotes }) => {
            const [isClosing, setIsClosing] = useState(false);
            
            useEffect(() => {
                if (!card) setIsClosing(false);
            }, [card]);

            if (!card) return null;

            const handleClose = () => {
                setIsClosing(true);
                setTimeout(() => {
                    onClose();
                }, 110); // Match animation duration
            };

            const displayImageSrc = card?.image_url || 'https://placehold.co/300x450/1e293b/a78bfa?text=No+Image';
            
            return (
                <div className={`fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`} onClick={handleClose}>
                    <div className="modal-content bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl p-6 max-w-4xl w-full relative max-h-[calc(100dvh-2rem)] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button onClick={handleClose} aria-label="Cerrar" className="absolute top-2 right-2 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 text-gray-300 hover:text-white text-2xl font-bold">×</button>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-shrink-0 flex justify-center"><img src={displayImageSrc} alt={card?.name} className="w-full max-w-[200px] md:max-w-[300px] h-auto rounded-lg shadow-lg" crossOrigin="anonymous" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x450/1e293b/a78bfa?text=Error'; }} /></div>
                            <div className="flex-grow text-[var(--color-text)] flex flex-col">
                                <h2 className="text-3xl font-bold mb-2 text-[var(--color-secondary)]">{card?.name}</h2>
                                <p className="text-lg mb-1"><span className="font-semibold text-[var(--color-text-muted)]">{t('cardType')}:</span> {card?.type}</p>
                                {card?.race && <p className="text-lg mb-1"><span className="font-semibold text-[var(--color-text-muted)]">{t('cardRace')}:</span> {card.race}</p>}
                                <p className="text-md mt-4 whitespace-pre-wrap bg-[var(--color-background)] p-3 rounded-md border border-[var(--color-border)] max-h-48 overflow-y-auto">{card?.desc}</p>
                                {onSaveNotes && (<div className="mt-4 flex-grow flex flex-col"><label className="text-lg font-semibold mb-2 text-[var(--color-text)]">{t('cardNotes')}</label><textarea value={card.notes || ''} onChange={e => onSaveNotes(card.instanceId, e.target.value)} className="w-full flex-grow p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-sm" rows="4"></textarea></div>)}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };
        
        const CardHoverPreview = ({ card }) => {
            const [show, setShow] = useState(false);
            const timerRef = useRef(null);
        
            useEffect(() => {
                clearTimeout(timerRef.current);
                if (card) {
                    timerRef.current = setTimeout(() => setShow(true), 250); // Delay before showing
                } else {
                    setShow(false);
                }
                return () => clearTimeout(timerRef.current);
            }, [card]);
        
            if (!card || !show) return null;
        
            const container = document.getElementById('card-hover-preview-container');
            if (!container) return null;
        
            const mx = window.__YGO_MOUSE__?.x || 0;
            const my = window.__YGO_MOUSE__?.y || 0;
        
            const zf = getBodyZoom();
            const pad = 16, boxW = 320 * zf, boxH = 280 * zf;
            let left = mx + 24;
            let top = my - boxH / 2;
            if (left + boxW > window.innerWidth - pad) {
                left = mx - boxW - 24;
            }
            top = Math.max(pad, Math.min(top, window.innerHeight - boxH - pad));
            // body tiene zoom 0.9: el mouse da píxeles visibles; left/top van en píxeles de la página
            const style = { position: 'fixed', top: `${top / zf}px`, left: `${left / zf}px` };
        
            const previewContent = (
                <div id="card-hover-preview" style={style} className={card ? 'visible' : ''}>
                    <div className="flex gap-4">
                        <div className="w-28 flex-shrink-0">
                            <img src={card.image_url_small || card.image_url} alt={card.name} className="w-full h-auto rounded-md" crossOrigin="anonymous" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x150/1e293b/a78bfa?text=Error'; }} />
                        </div>
                        <div className="flex-grow min-w-0">
                            <h3 className="text-lg font-bold text-violet-300 truncate">{card.name}</h3>
                            <p className="text-sm text-slate-400 mb-2">{card.type}</p>
                            <p className="text-xs text-slate-200 max-h-36 overflow-y-auto">{card.desc}</p>
                        </div>
                    </div>
                </div>
            );
            return createPortal(previewContent, container);
        };

        const ConfirmationModal = ({ show, title, message, onConfirm, onCancel, t }) => { 
            const [isClosing, setIsClosing] = useState(false);
            
            useEffect(() => {
                if (!show) setIsClosing(false);
            }, [show]);

            if (!show) return null;

            const handleConfirm = () => {
                setIsClosing(true);
                setTimeout(() => onConfirm(), 300);
            };
            const handleCancel = () => {
                setIsClosing(true);
                setTimeout(() => onCancel(), 300);
            };

            return (
                <div className={`fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isClosing ? 'modal-exit' : 'modal-enter'}`}>
                    <div className="modal-content bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg shadow-xl p-8 max-w-sm w-full relative text-center">
                        <h3 className="text-xl font-bold mb-4 text-[var(--color-danger)]">{title}</h3>
                        <p className="text-[var(--color-text)] mb-6">{message}</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleConfirm} className="btn px-5 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-md">{t('confirm')}</button>
                            <button onClick={handleCancel} className="btn px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-md">{t('cancel')}</button>
                        </div>
                    </div>
                </div>
            ); 
        };
        
        const ZonePickerModal = ({ show, onClose, onSelect, t }) => {
            if (!show) return null;

            const handleSelect = (zone) => {
                onSelect(zone);
                onClose();
            };

            const zones = [
                { name: "Extra Monster 1", gridClass: "grid-pos-emz1" },
                { name: "Extra Monster 2", gridClass: "grid-pos-emz2" },
                { name: "Field Zone", gridClass: "grid-pos-fz" },
                { name: "Main Monster 1", gridClass: "grid-pos-mmz1" },
                { name: "Main Monster 2", gridClass: "grid-pos-mmz2" },
                { name: "Main Monster 3", gridClass: "grid-pos-mmz3" },
                { name: "Main Monster 4", gridClass: "grid-pos-mmz4" },
                { name: "Main Monster 5", gridClass: "grid-pos-mmz5" },
                { name: "Graveyard", gridClass: "grid-pos-gy" },
                { name: "Spell/Trap 1", gridClass: "grid-pos-stz1" },
                { name: "Spell/Trap 2", gridClass: "grid-pos-stz2" },
                { name: "Spell/Trap 3", gridClass: "grid-pos-stz3" },
                { name: "Spell/Trap 4", gridClass: "grid-pos-stz4" },
                { name: "Spell/Trap 5", gridClass: "grid-pos-stz5" },
                { name: "Banish Pile", gridClass: "grid-pos-bp" },
                { name: "Extra Deck", gridClass: "grid-pos-ed zone-extra" },
                { name: "Pendulum Left", gridClass: "grid-pos-pl zone-extra" },
                { name: "Hand", gridClass: "grid-pos-hand zone-extra" },
                { name: "Pendulum Right", gridClass: "grid-pos-pr zone-extra" },
                { name: "Deck", gridClass: "grid-pos-deck zone-extra" },
            ];

            return (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 modal-enter" onClick={onClose}>
                    <div className="modal-content bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 max-w-lg w-full relative" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6 text-violet-300 text-center">{t('selectZone')}</h3>
                        <div className="ygo-field-grid">
                            {zones.map(zone => (
                                <button 
                                    key={zone.name} 
                                    className={`ygo-field-zone ${zone.gridClass}`}
                                    onClick={() => handleSelect(zone.name)}
                                >
                                    {ZONE_ABBREVIATIONS[zone.name] || trTerm(zone.name)}
                                </button>
                            ))}
                        </div>
                         <div className="flex justify-end mt-6">
                            <button onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">{t('cancel')}</button>
                        </div>
                    </div>
                </div>
            );
        };

        const CardSelector = ({ cardPool, onCardSelected, buttonText, displayAs = 'button', t, wrapperClassName = '', onMouseEnter, onMouseLeave, onMouseMove, preferredDirection = 'down', mode = 'pool', allowNote = false }) => {
            const allMode = mode === 'all'; // «todas las cartas»: primero la base de datos, sin pool ni notas, y no agrega al pool
            const [isOpen, setIsOpen] = useState(false);
            const [quickPicks, setQuickPicks] = useState(handTrapCache.data);
            useEffect(() => { if (isOpen && allMode && !quickPicks) { let alive = true; loadHandTraps().then(list => { if (alive) setQuickPicks(list); }); return () => { alive = false; }; } }, [isOpen, allMode]);
            const inputRef = useRef(null);
            const [filter, setFilter] = useState('');
            const containerRef = useRef(null);
            const menuRef = useRef(null);
            const [fixedPos, setFixedPos] = useState(null);
            const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
            const [positionClasses, setPositionClasses] = useState('');
            const [apiResults, setApiResults] = useState([]);
            const [apiLoading, setApiLoading] = useState(false);
            useEffect(() => {
                const q = filter.trim();
                if (!isOpen || !cardSourceRef.current || q.length < 3) { setApiResults([]); setApiLoading(false); return; }
                let cancelled = false;
                setApiLoading(true);
                const timer = setTimeout(() => {
                    fetch(`${YGOPRODECK_API_BASE_URL}?fname=${encodeURIComponent(q)}&num=12&offset=0`)
                        .then(r => r.ok ? r.json() : { data: [] })
                        .then(j => { if (!cancelled) setApiResults(Array.isArray(j.data) ? j.data : []); })
                        .catch(() => { if (!cancelled) setApiResults([]); })
                        .finally(() => { if (!cancelled) setApiLoading(false); });
                }, 350);
                return () => { cancelled = true; clearTimeout(timer); };
            }, [filter, isOpen]);

            useEffect(() => {
                const checkMobile = () => setIsMobile(window.innerWidth <= 1024);
                window.addEventListener('resize', checkMobile);
                return () => window.removeEventListener('resize', checkMobile);
            }, []);

            useEffect(() => {
                const handleClickOutside = (event) => {
                    if (containerRef.current && !containerRef.current.contains(event.target) && !(menuRef.current && menuRef.current.contains(event.target))) {
                        setIsOpen(false);
                    }
                };
                document.addEventListener('mousedown', handleClickOutside);
                return () => document.removeEventListener('mousedown', handleClickOutside);
            }, []);

            useEffect(() => {
                if (isOpen && inputRef.current) {
                    setTimeout(() => {
                        inputRef.current?.focus();
                    }, 0);
                }
            }, [isOpen, filter]);
            
            useLayoutEffect(() => {
                if (!isOpen) { setFixedPos(null); return; }
                const place = (e) => {
                    if (e && e.target && menuRef.current && menuRef.current.contains && e.target.nodeType === 1 && menuRef.current.contains(e.target)) return;
                    if (!containerRef.current) return;
                    const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
                    const r = containerRef.current.getBoundingClientRect();
                    const mw = (menuRef.current ? menuRef.current.offsetWidth : 288) * z;
                    const mh = (menuRef.current ? menuRef.current.offsetHeight : 320) * z;
                    let left = r.left;
                    if (left + mw > window.innerWidth - 8) left = Math.max(8, window.innerWidth - mw - 8);
                    let top = r.bottom + 6;
                    if (top + mh > window.innerHeight - 8 && r.top - mh - 6 > 8) top = r.top - mh - 6;
                    setFixedPos({ top: top / z, left: left / z });
                };
                place();
                const raf = requestAnimationFrame(() => place());
                window.addEventListener('scroll', place, true);
                window.addEventListener('resize', place);
                return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place); };
            }, [isOpen]);
            useLayoutEffect(() => {
                if (isOpen && containerRef.current) {
                    const buttonRect = containerRef.current.getBoundingClientRect();
                    const menuWidth = 300; 
                    const menuHeight = 320; 

                    let classes = 'top-full mt-2 left-0'; 

                    if (preferredDirection === 'side') {
                        if (buttonRect.right + menuWidth > window.innerWidth) {
                            classes = 'top-0 right-full mr-2';
                        } else {
                            classes = 'top-0 left-full ml-2';
                        }
                    } else if (preferredDirection === 'up') {
                        if (buttonRect.top - menuHeight < 0) {
                            classes = 'top-full mt-2 left-0';
                        } else {
                            classes = 'bottom-full mb-2 left-0';
                        }
                    }
                    setPositionClasses(classes);
                }
            }, [isOpen, preferredDirection]);


            const filteredPool = cardPool.filter(card => !card.isWildcard && card.name.toLowerCase().includes(filter.toLowerCase()));
            const buttonClasses = { 'side-add': "side-add-btn", 'menu-item': "step-menu-item", 'button': "w-full px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-md disabled:bg-violet-800 disabled:cursor-not-allowed", 'small-button': "p-2 bg-violet-600 text-white font-bold rounded-full hover:bg-violet-700 transition-colors shadow-md disabled:bg-violet-800 disabled:cursor-not-allowed flex items-center justify-center", 'card-placeholder': "w-24 h-[8.5rem] flex items-center justify-center border-2 border-dashed border-slate-600 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors" };
            const buttonContent = { 'side-add': <i className="fas fa-plus"></i>, 'menu-item': <><i className="fas fa-plus w-5 text-center"></i>{buttonText}</>, 'button': buttonText || t('addStep'), 'small-button': <i className="fas fa-plus"></i>, 'card-placeholder': <i className="fas fa-plus"></i> };
            
            const handleSelect = (card) => {
                if (!card) return;
                onCardSelected(card);
                setIsOpen(false);
                setFilter('');
            };
            const poolIdSet = (cardSourceRef.current && cardSourceRef.current.poolIds) || new Set(cardPool.map(c => c.ygoprodeck_id));
            const apiVisible = allMode ? apiResults : apiResults.filter(c => !poolIdSet.has(c.id));
            const pickApiCard = (apiCard) => handleSelect(allMode ? createComboCardInstance(apiCard, 'https://images.weserv.nl/?url=') : (cardSourceRef.current ? cardSourceRef.current.prepareApiCard(apiCard) : null));
            const apiThumb = (c) => { const u = c.card_images?.[0]?.image_url_small; return u ? 'https://images.weserv.nl/?url=' + u.replace(/^https?:\/\//, '') : ''; };
            const renderApiList = (list, mobile) => mobile ? (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
                    {list.map(c => <CardDisplay key={`api-${c.id}`} card={createComboCardInstance(c, 'https://images.weserv.nl/?url=')} size="small" onClick={() => pickApiCard(c)} />)}
                </div>
            ) : (
                <div>
                    {list.map(c => (
                        <div key={`api-${c.id}`} onMouseDown={() => pickApiCard(c)} className="flex items-center p-2 hover:bg-slate-700 cursor-pointer text-sm">
                            <img src={apiThumb(c)} alt={c.name} className="w-10 h-14 object-cover rounded-sm mr-2" />
                            <span className="truncate">{c.name}</span>
                        </div>
                    ))}
                </div>
            );
            const renderApiSection = (mobile) => {
                if (!cardSourceRef.current && !allMode) return null;
                const q = filter.trim();
                const msgCls = mobile ? 'text-slate-400 p-3 text-center text-sm' : 'p-2 text-gray-400 text-xs';
                const headCls = `${mobile ? 'text-sm px-1 mb-2' : 'px-2 pt-2 text-xs'} font-semibold text-violet-300 uppercase tracking-wide`;
                if (allMode && q.length < 3) {
                    return (
                        <div className={mobile ? 'mt-1' : ''}>
                            <div className={msgCls}>{t('typeToSearchAll')}</div>
                            {quickPicks === null ? <div className={msgCls}>{t('searchingCards')}</div> : quickPicks.length > 0 && (
                                <React.Fragment>
                                    <div className={headCls}>{t('commonHandTraps')}</div>
                                    {renderApiList(quickPicks, mobile)}
                                </React.Fragment>
                            )}
                        </div>
                    );
                }
                let body;
                if (q.length < 3) body = <div className={msgCls}>{t('typeToSearchAll')}</div>;
                else if (apiLoading) body = <div className={msgCls}>{t('searchingCards')}</div>;
                else if (apiVisible.length === 0) body = <div className={msgCls}>{t('cardSelectorNoMatch')}</div>;
                else body = renderApiList(apiVisible, mobile);
                return (
                    <div className={mobile ? 'mt-3' : (allMode ? '' : 'border-t border-slate-700')}>
                        <div className={headCls}>{t('allCardsSection')}</div>
                        {body}
                    </div>
                );
            };

            const DesktopMenu = () => {
                const isTwoColumn = !allMode && filteredPool.length > 7;
                const menuWidthClass = isTwoColumn ? 'w-[30rem]' : 'w-72';
                return createPortal(
                     <div ref={menuRef} data-card-selector-menu="1" style={fixedPos ? { top: fixedPos.top, left: fixedPos.left } : { top: 0, left: 0, visibility: 'hidden' }} className={`fixed ${menuWidthClass} bg-slate-800 rounded-md shadow-lg border border-slate-700 z-[75] flex flex-col max-h-80`}>
                        <input
                            type="text"
                            key="card-selector-desktop-input"
                            placeholder={t('cardSelectorSearch')}
                            value={filter}
                            onChange={e => { setFilter(e.target.value); }}
                            onKeyDown={e => { if (e.key === 'Enter') { if (!allMode && filteredPool.length > 0) { e.preventDefault(); handleSelect(filteredPool[0]); } else if (apiVisible.length > 0) { e.preventDefault(); pickApiCard(apiVisible[0]); } } }}
                            ref={inputRef}
                            autoFocus
                            className="p-2 bg-slate-900 text-white placeholder-gray-400 focus:ring-0 outline-none sticky top-0"
                        />
                        {!allMode && cardSourceRef.current && cardSourceRef.current.prepareWildcard && (<div
                            onMouseDown={() => handleSelect(cardSourceRef.current.prepareWildcard())}
                            className="flex items-center p-2 hover:bg-slate-700 cursor-pointer text-sm text-violet-300 font-semibold border-b border-slate-700"
                        >
                            <img src={WILDCARD_IMG} alt="" className="w-10 h-14 object-cover rounded-sm mr-2" />
                            <span>{t('anyCard')}</span>
                        </div>)}
                        {!allMode && cardSourceRef.current && cardSourceRef.current.pickToken && (<div
                            onMouseDown={() => { const f = onCardSelected; setIsOpen(false); setFilter(''); cardSourceRef.current.pickToken(f); }}
                            className="flex items-center p-2 hover:bg-slate-700 cursor-pointer text-sm text-sky-300 font-semibold border-b border-slate-700"
                        >
                            <i className="fas fa-coins w-10 text-center mr-2"></i>
                            <span>{t('addToken')}</span>
                        </div>)}
                        {!allMode && allowNote && (<div
                            onMouseDown={() => handleSelect({ isNote: true })}
                            className="flex items-center p-2 hover:bg-slate-700 cursor-pointer text-sm text-amber-300 font-semibold border-b border-slate-700"
                        >
                            <i className="fas fa-sticky-note w-10 text-center mr-2"></i>
                            <span>{t('addNote')}</span>
                        </div>)}
                        <div className="overflow-y-auto"><div className={isTwoColumn ? 'grid grid-cols-2 gap-1 p-1' : ''}>
                            {!allMode && filteredPool.length > 0 ? filteredPool.map(card => (
                                <div
                                    key={card.instanceId}
                                    onMouseDown={() => handleSelect(card)}
                                    className={`flex items-center p-2 hover:bg-slate-700 cursor-pointer text-sm ${isTwoColumn ? 'w-full' : ''}`}
                                    onMouseEnter={(e) => onMouseEnter && onMouseEnter(card, e)}
                                    onMouseLeave={(e) => onMouseLeave && onMouseLeave(e)}
                                    onMouseMove={(e) => onMouseMove && onMouseMove(e)}
                                >
                                    <img src={card.image_url_small || card.image_url} alt={card.name} className="w-10 h-14 object-cover rounded-sm mr-2" crossOrigin="anonymous" />
                                    <span className="truncate">{card.name}</span>
                                </div>
                            )) : (cardSourceRef.current ? null : <div className="p-2 text-gray-400">{t('cardSelectorNoMatch')}</div>)}
                        </div>{renderApiSection(false)}</div>
                    </div>
                , document.body);
            };

            const MobileOverlay = () => (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex flex-col p-4">
                    <div className="flex-shrink-0 mb-4 flex items-center gap-4">
                        <input
                            type="text"
                            key="card-selector-mobile-input"
                            placeholder={t('cardSelectorSearch')}
                            value={filter}
                            onChange={e => { setFilter(e.target.value); }}
                            ref={inputRef}
                            autoFocus
                            onKeyDown={e => { if (e.key === 'Enter') { if (!allMode && filteredPool.length > 0) { e.preventDefault(); handleSelect(filteredPool[0]); } else if (apiVisible.length > 0) { e.preventDefault(); pickApiCard(apiVisible[0]); } } }}
                            className="w-full min-w-0 flex-1 p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none"
                        />
                        <button onClick={() => setIsOpen(false)} aria-label="Cerrar" className="flex-shrink-0 p-3 bg-red-600 text-white rounded-full"><i className="fas fa-times"></i></button>
                    </div>
                    {!allMode && cardSourceRef.current && cardSourceRef.current.prepareWildcard && (<div className="flex-shrink-0 mb-2">
                        <button onClick={() => handleSelect(cardSourceRef.current.prepareWildcard())} className="w-full p-3 bg-violet-700 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors flex items-center justify-center gap-2">
                            <img src={WILDCARD_IMG} alt="" className="w-6 h-9 rounded-sm" />{t('anyCard')}
                        </button>
                    </div>)}
                    {!allMode && cardSourceRef.current && cardSourceRef.current.pickToken && (<div className="flex-shrink-0 mb-2">
                        <button onClick={() => { const f = onCardSelected; setIsOpen(false); setFilter(''); cardSourceRef.current.pickToken(f); }} className="w-full p-3 bg-sky-700 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"><i className="fas fa-coins mr-2"></i>{t('addToken')}</button>
                    </div>)}
                    {!allMode && allowNote && (<div className="flex-shrink-0 mb-2">
                        <button
                            onClick={() => handleSelect({ isNote: true })}
                            className="w-full p-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            <i className="fas fa-sticky-note mr-2"></i>
                            {t('addNote')}
                        </button>
                    </div>)}
                    <div className="flex-grow overflow-y-auto bg-slate-900/50 rounded-lg p-2">
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(6rem,1fr))] gap-2">
                            {!allMode && filteredPool.length > 0 ? filteredPool.map(card => (
                                <CardDisplay key={card.instanceId} card={card} size="small" onClick={() => handleSelect(card)} />
                            )) : (cardSourceRef.current ? null : <p className="text-slate-400 p-4 text-center w-full col-span-full">{t('cardSelectorNoMatch')}</p>)}
                        </div>
                        {renderApiSection(true)}
                    </div>
                </div>
            );

            return (
                <div ref={containerRef} className={`relative ${wrapperClassName}`}>
                    <button onClick={() => setIsOpen(prev => !prev)} className={buttonClasses[displayAs]} disabled={cardPool.length === 0 && !cardSourceRef.current}>
                        {buttonContent[displayAs]}
                    </button>
                    {isOpen && (isMobile ? MobileOverlay() : DesktopMenu())}
                </div>
            );
        };

        const PngPreviewModal = ({ imageUrl, onDownload, onClose, t, onShare, comboTitle, shareUrl }) => {
            if (!imageUrl) return null;
            

            return (
                <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 max-w-5xl w-full relative text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold mb-4 text-violet-400">{t('pngPreviewTitle')}</h3>
                        <div className="bg-slate-900/50 p-4 rounded-md max-h-[70vh] overflow-auto">
                           <img src={imageUrl} alt="Combo preview" className="max-w-full h-auto mx-auto shadow-2xl" />
                        </div>
                        <div className="flex justify-center flex-wrap gap-4 mt-6">
                            <button onClick={onDownload} className="btn px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md">{t('download')}</button>
                            <button onClick={onClose} className="btn px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors shadow-md">{t('cancel')}</button>
                        </div>
                    </div>
                </div>
            );
        };
        // Campo final dibujado como tablero (en la app y en la exportación)
        const FINAL_BOARD_LAYOUT = [
            ["Extra Monster 1", 1, 3], ["Extra Monster 2", 1, 5],
            ["Main Monster 1", 2, 2], ["Main Monster 2", 2, 3], ["Main Monster 3", 2, 4], ["Main Monster 4", 2, 5], ["Main Monster 5", 2, 6], ["Graveyard", 2, 7],
            ["Field Zone", 3, 1], ["Spell/Trap 1", 3, 2], ["Spell/Trap 2", 3, 3], ["Spell/Trap 3", 3, 4], ["Spell/Trap 4", 3, 5], ["Spell/Trap 5", 3, 6], ["Banish Pile", 3, 7],
        ];
        const FinalBoardMini = ({ items, imgSrc, className = '', onCardClick }) => {
            const byZone = {};
            (items || []).forEach(it => { if (it && it.card) (byZone[it.zone] = byZone[it.zone] || []).push(it); });
            const src = imgSrc || ((card) => card.image_url_small || card.image_url);
            return (
                <div className={`final-board-mini ${className}`}>
                    {FINAL_BOARD_LAYOUT.map(([zone, row, col]) => {
                        const list = byZone[zone] || [];
                        const top = list[list.length - 1];
                        const disrupt = list.some(i => i.isDisruption);
                        const abbr = ZONE_ABBREVIATIONS[zone] || zone;
                        return (
                            <div key={zone} className={`fbm-slot${top ? ' filled' : ''}${disrupt ? ' disruption' : ''}${top && onCardClick ? ' clickable' : ''}`} style={{ gridRow: row, gridColumn: col }} title={top ? `${abbr}: ${list.map(i => i.card.name).join(', ')}` : abbr} onClick={top && onCardClick ? () => onCardClick(top.card) : undefined}>
                                {top ? <img src={src(top.card)} alt={top.card.name} crossOrigin="anonymous" /> : <span className="fbm-label">{abbr}</span>}
                                {list.length > 1 && <span className="fbm-count">{list.length}</span>}
                                {disrupt && <span className="fbm-shield"><i className="fas fa-shield-alt"></i></span>}
                            </div>
                        );
                    })}
                </div>
            );
        };
        // Zona inicial de una carta nueva en el campo final, según su tipo
        const pickFinalBoardZone = (card, board) => {
            const used = new Set((board || []).map(i => i.zone));
            const firstFree = (zones) => zones.find(z => !used.has(z));
            const type = (card && card.type) || '';
            const EMZ = YGO_ZONES.slice(0, 2), MMZ = YGO_ZONES.slice(2, 7), STZ = YGO_ZONES.slice(7, 12);
            if (/Spell|Trap/.test(type)) return card.race === 'Field' ? 'Field Zone' : (firstFree(STZ) || STZ[0]);
            if (/Link/.test(type)) return firstFree(EMZ) || firstFree(MMZ) || MMZ[0];
            return firstFree(MMZ) || MMZ[0];
        };
        // Cartas rápidas para «vulnerable a…»: hand traps comunes, pedidas una sola vez
        const HAND_TRAP_NAMES = ["Ash Blossom & Joyous Spring", "Maxx \"C\"", "Effect Veiler", "Infinite Impermanence", "Nibiru, the Primal Being", "Ghost Belle & Haunted Mansion", "Ghost Ogre & Snow Rabbit", "Droll & Lock Bird", "D.D. Crow", "Called by the Grave"];
        const handTrapCache = { data: null, promise: null };
        const loadHandTraps = () => {
            if (handTrapCache.data) return Promise.resolve(handTrapCache.data);
            if (!handTrapCache.promise) {
                handTrapCache.promise = fetch(`${YGOPRODECK_API_BASE_URL}?name=${encodeURIComponent(HAND_TRAP_NAMES.join('|'))}`)
                    .then(r => r.ok ? r.json() : { data: [] })
                    .then(j => { const list = Array.isArray(j.data) ? j.data : []; list.sort((a, b) => HAND_TRAP_NAMES.indexOf(a.name) - HAND_TRAP_NAMES.indexOf(b.name)); handTrapCache.data = list; return list; })
                    .catch(() => { handTrapCache.promise = null; return []; });
            }
            return handTrapCache.promise;
        };
        // La app le presta a los selectores de cartas la forma de agregar cualquier carta de la base de datos
        const cardSourceRef = { current: null };
        // Carta comodín («cualquier carta»): una carta propia con dibujo de «?»
        const WILDCARD_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 59 86'><rect width='59' height='86' rx='3' fill='#4c1d95'/><rect x='4' y='4' width='51' height='78' rx='2' fill='none' stroke='#c4b5fd' stroke-width='1.5' stroke-dasharray='3 2'/><text x='29.5' y='55' font-size='36' text-anchor='middle' fill='#ede9fe' font-family='Arial' font-weight='bold'>?</text></svg>");
        const makeWildcardCard = (name) => ({ instanceId: generateId(), isCustom: true, isWildcard: true, name, type: 'Wildcard', desc: '', atk: '', def: '', image_url: WILDCARD_IMG, image_url_small: WILDCARD_IMG, image_url_cropped: WILDCARD_IMG, notes: '' });

        const ExportLayout = ({ comboTitle, startingHand, comboSteps, finalBoardCards, notes, findCard, t, exportOptions, imageMap, isPreview = false, meta = {}, shareUrlFn = null }) => {
            const theme = exportOptions.theme || 'dark';
            const cardFilter = exportOptions.cardFilter || 'color';
            const nbsp = (str) => String(str || '').replace(/ /g, '\u00A0');
            const nbspHtml = (str) => String(str || '').replace(/ /g, '&nbsp;');

            const backgroundStyle = theme === 'dark'
                ? { backgroundColor: '#020617', backgroundImage: `radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(167, 139, 250, 0.15) 0%, transparent 40%)`, position: 'relative', overflow: 'hidden' }
                : { backgroundColor: theme === 'light' ? '#f8fafc' : '#ffffff', position: 'relative', overflow: 'hidden' };
            const ExportCard = ({ card, size = 'normal', quantity, useCropped = false, children, location }) => { 
                if (!card) return null; 
                const src = imageMap[useCropped ? card.image_url_cropped : card.image_url_small] || (useCropped ? card.image_url_cropped : card.image_url_small); 
                const sizeClass = { large: 'w-40', medium: 'w-36', normal: 'w-32', small: 'w-24', tiny: 'w-16', micro: 'w-12' }[size]; 
                return ( 
                    <div className={`relative ${sizeClass} flex-shrink-0 flex flex-col items-center`}> 
                        {children} 
                        <img src={src} alt={card.name} className="w-full rounded-md shadow-lg border-2 border-slate-600" style={{ aspectRatio: useCropped ? '1' : '0.686' }}/> 
                        {quantity > 1 && <div className="absolute -top-2 -right-2 bg-slate-900 text-white text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-400">x{quantity}</div>} 
                        {location && <div className="mt-1 text-xs font-bold text-amber-300 bg-black/50 px-2 py-0.5 rounded-full">{nbsp(location)}</div>}
                    </div> 
                ); 
            }; 
            const stepsPerRow = exportOptions.stepsPerRow || 4;
            const quick = exportOptions.layout === 'quick';
            const hasHandX = exportOptions.include.startingHand && startingHand.length > 0 && startingHand.some(g => g.length > 0);
            const showNotesX = !quick && exportOptions.include.notes && notes;
            const showBoardTopX = quick && exportOptions.include.finalBoard && finalBoardCards.length > 0;
            const boardImg = (c) => imageMap[c.image_url_small] || c.image_url_small;
            const boardView = exportOptions.boardView || 'board';
            // Código QR con el enlace del combo (solo si el enlace cabe en un QR que se pueda escanear)
            const shareUrlX = useMemo(() => (shareUrlFn ? shareUrlFn() : ''), [shareUrlFn, comboSteps, startingHand, finalBoardCards, comboTitle, notes, meta]);
            const qr = useMemo(() => {
                if (!exportOptions.include || exportOptions.include.qr === false || !shareUrlX || !window.qrcode) return null;
                try { const q = window.qrcode(0, 'L'); q.addData(shareUrlX); q.make(); const mc = q.getModuleCount(); if (mc > 105) return null; return { src: q.createDataURL(4, 2), size: mc > 61 ? 176 : 128 }; }
                catch (e) { return null; }
            }, [shareUrlX, exportOptions.include && exportOptions.include.qr]);
            const metaLineX = [FORMAT_LABEL[meta.format], meta.author ? `${t('metaBy')} ${meta.author}` : '', meta.updated, meta.source].filter(Boolean).join('  ·  ');
            const renderBoardCards = (size) => (
                <div className="flex flex-wrap justify-center gap-4">
                    {finalBoardCards.map(item => (
                        <div key={item.id} className="flex flex-col items-center gap-2">
                            <ExportCard card={item.card} size={size} />
                            <div className="text-center">
                                <p className="font-bold text-sm text-slate-300">{nbsp(trTerm(item.zone))}</p>
                                {item.isDisruption && <p className="text-xs text-red-400 font-bold">{nbsp(t('finalBoardDisruption'))}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            );
            const renderFinalBoardContent = (compact) => (
                <>
                    {boardView !== 'cards' && <FinalBoardMini items={finalBoardCards} imgSrc={boardImg} className={`fbm-export${boardView === 'both' ? ' mb-6' : ''}`} />}
                    {boardView !== 'board' && renderBoardCards(compact ? 'small' : 'normal')}
                </>
            );
            
            const renderStepRows = () => {
                const elements = [];
                let currentStepRow = [];

                const flushStepRow = () => {
                    if (currentStepRow.length > 0) {
                        elements.push(
                            <div key={`row-${elements.length}`} className="grid items-stretch gap-4" style={{gridTemplateColumns: `repeat(${stepsPerRow}, minmax(0, 1fr))`}}>
                                {currentStepRow}
                            </div>
                        );
                        currentStepRow = [];
                    }
                };
                
                const actualStepCounter = comboSteps.filter(s => s.type === 'step');

                comboSteps.forEach(step => {
                    if (step.type === 'group') {
                        flushStepRow();
                        elements.push(
                            <div key={step.id} className="col-span-full flex items-center gap-2 mt-4 mb-2">
                                <div className="h-px flex-grow bg-amber-700/50"></div>
                                <h4 className="font-bold text-amber-300 text-lg">{nbsp(step.title)}</h4>
                                <div className="h-px flex-grow bg-amber-700/50"></div>
                            </div>
                        );
                    } else {
                        let itemJsx = null;
                        if (step.type === 'note') {
                             itemJsx = (
                                <div key={step.id} className="bg-yellow-900/30 p-3 rounded-lg border border-yellow-700/50 flex flex-col items-start gap-2 text-left h-full">
                                    <div className="flex items-center gap-2 self-start">
                                        <i className="fas fa-sticky-note text-yellow-300"></i>
                                        <h3 className="font-semibold text-base text-yellow-300">{nbsp(t('addNote'))}</h3>
                                    </div>
                                    <p className="text-yellow-200 text-sm mt-2 flex-grow break-words whitespace-pre-wrap text-left w-full">{nbsp(step.text)}</p>
                                </div>
                            );
                        } else if (step.type === 'step') {
                            const mainCard = findCard(step.mainCardInstanceId);
                            const action = YGO_ACTIONS.find(a => a.name === step.actionType) || {};
                            const isVulnerable = step.vulnerability?.text || (step.vulnerability?.cards && step.vulnerability.cards.length > 0);
                            const stepNumber = actualStepCounter.findIndex(s => s.id === step.id) + 1;

                            itemJsx = (
                                <div key={step.id} className={`bg-slate-900/50 p-3 rounded-lg border ${isVulnerable ? 'border-red-500' : 'border-slate-700'} flex flex-col items-center gap-2 text-center h-full`}>
                                    <span className="font-bold text-lg text-slate-300">{nbsp(t('step'))} {stepNumber}</span>
                                    <h3 className="font-semibold text-base text-yellow-300 h-12 flex items-center justify-center">{action.emoji} {nbsp(step.actionType === 'Other' ? (step.customActionText || trTerm('Other')) : trTerm(step.actionType))}</h3>
                                    <div className="relative">
                                        <ExportCard card={mainCard} size="medium" location={step.location ? (ZONE_ABBREVIATIONS[step.location] || trTerm(step.location)) : null} />
                                        {step.vulnerability?.cards && step.vulnerability.cards.length > 0 && (
                                            <div className="absolute -right-3 -top-3 z-10 flex flex-col gap-1">
                                                {step.vulnerability.cards.map(vCard => (
                                                    <ExportCard key={vCard.instanceId} card={vCard.card || findCard(vCard.instanceId)} size="micro" useCropped={true}>
                                                        <span className="absolute top-0 right-0 text-lg z-10 -mt-1 -mr-1" style={{textShadow: '0 0 3px black'}}>⚠️</span>
                                                    </ExportCard>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-300 text-xs mt-2 uppercase flex-grow break-all min-h-[2.5rem]">{nbsp(step.actionDescription)}</p>
                                    {step.vulnerability?.text && <p className="text-red-400 text-xs font-bold mt-1">{nbsp(step.vulnerability.text)}</p>}
                                    {step.targetCards.length > 0 && (
                                        <div className="flex flex-wrap justify-center items-center gap-1 w-full mt-2 relative z-10">
                                            {step.targetCards.map((target, ti) => <ExportCard key={`target-${target.instanceId}-${ti}`} card={findCard(target.instanceId)} size="tiny" quantity={target.quantity}><MoveBadge k={targetMove(step, target)} className="mv-export" /></ExportCard>)}
                                        </div>
                                    )}
                                    {step.branch && step.branch.steps && step.branch.steps.length > 0 && (
                                        <div className="w-full mt-2 text-left rounded border-l-4 border-red-500 bg-red-900/20 p-2">
                                            <p className="text-red-300 text-xs font-bold break-all">↳ {nbsp(step.branch.title || t('branchLabel'))}</p>
                                            {step.branch.steps.map((bs, bi) => { const bc = findCard(bs.mainCardInstanceId); const bact = bs.actionType === 'Other' ? (bs.customActionText || trTerm('Other')) : trTerm(bs.actionType); return <p key={bs.id} className="text-slate-200 text-xs mt-1 break-all">{nbsp(`${stepNumber}.${bi + 1} ${bact}: ${bc ? bc.name : '?'}${bs.actionDescription ? ' — ' + bs.actionDescription : ''}`)}</p>; })}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (itemJsx) {
                            currentStepRow.push(itemJsx);
                            if (currentStepRow.length === stepsPerRow) {
                                flushStepRow();
                            }
                        }
                    }
                });

                flushStepRow();
                return elements;
            };
            // Plantilla vertical para Discord (720 px de ancho)
            if (exportOptions.layout === 'discord') {
                let dn = 0;
                return (
                    <div className={`p-6 text-white export-onewm export-theme-${theme} export-ink-${cardFilter} ${isPreview && cardFilter !== 'color' ? `export-filter-${cardFilter}` : ''}`} data-watermark={'YGOH-ComboMaker'} style={{ ...backgroundStyle, width: 720 }}>
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-3xl font-bold text-violet-300 font-yugioh break-all">{nbsp(comboTitle || t('untitledCombo'))}</h1>
                                    {metaLineX && <p className="text-slate-300 text-sm mt-1 break-all">{nbsp(metaLineX)}</p>}
                                </div>
                                {qr && <div className="flex flex-col items-center shrink-0"><img src={qr.src} alt="" style={{ width: 112, height: 112 }} className="bg-white p-1 rounded" /><span className="text-[10px] text-slate-300 mt-1">{nbsp(t('qrCaption'))}</span></div>}
                            </div>
                            {hasHandX && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h2 className="text-lg font-semibold mb-2 text-violet-400 font-yugioh">{nbsp(t('startingHandTitle'))}</h2>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {startingHand.filter(g => g && g.length).map((group, gi, arr) => (
                                            <React.Fragment key={gi}>
                                                {group.map(item => <ExportCard key={`dh-${item.instanceId}`} card={findCard(item.instanceId)} size="tiny" quantity={item.quantity} />)}
                                                {gi < arr.length - 1 && <span className="font-bold text-violet-400 px-1">{nbsp(t('or'))}</span>}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {exportOptions.include.comboSteps && comboSteps.length > 0 && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h2 className="text-lg font-semibold mb-2 text-violet-400 font-yugioh">{nbsp(t('comboStepsTitle'))}</h2>
                                    {comboSteps.map(s => {
                                        if (s.type === 'group') return <p key={s.id} className="text-amber-400 font-bold text-xs uppercase mt-3 mb-1 break-all">{nbsp(s.title || '')}</p>;
                                        if (s.type !== 'step') return null;
                                        dn++;
                                        const c = findCard(s.mainCardInstanceId);
                                        const act = YGO_ACTIONS.find(a => a.name === s.actionType) || {};
                                        const tg = (s.targetCards || []).map(tc => (findCard(tc.instanceId) || {}).name).filter(Boolean);
                                        const isVul = s.vulnerability && (s.vulnerability.text || (s.vulnerability.cards || []).length);
                                        return (
                                            <div key={s.id} className={`flex items-start gap-2 py-1 border-b border-slate-700/50 ${isVul ? 'bg-red-900/20' : ''}`}>
                                                <span className="w-8 text-right font-bold text-slate-400 shrink-0">{dn}.</span>
                                                {c && <ExportCard card={c} size="micro" />}
                                                <div className="min-w-0 text-sm">
                                                    <p className="break-all">{nbsp(`${act.emoji || ''} ${s.actionType === 'Other' ? (s.customActionText || trTerm('Other')) : trTerm(s.actionType)}: ${c ? c.name : '?'}${tg.length ? ' → ' + tg.join(', ') : ''}${isVul ? ' ⚠️' : ''}`)}</p>
                                                    {s.actionDescription && <p className="text-slate-400 text-xs break-all">{nbsp(stripMentions(s.actionDescription))}</p>}
                                                    {s.branch && s.branch.steps && s.branch.steps.length > 0 && (
                                                        <div className="mt-1 border-l-4 border-red-500 pl-2">
                                                            <p className="text-red-300 text-xs font-bold break-all">↳ {nbsp(s.branch.title || t('branchLabel'))}</p>
                                                            {s.branch.steps.map((bs, bi) => { const bc = findCard(bs.mainCardInstanceId); return <p key={bs.id} className="text-slate-200 text-xs break-all">{nbsp(`${dn}.${bi + 1} ${trTerm(bs.actionType)}: ${bc ? bc.name : '?'}${bs.actionDescription ? ' — ' + bs.actionDescription : ''}`)}</p>; })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {exportOptions.include.finalBoard && finalBoardCards.length > 0 && (
                                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                    <h2 className="text-lg font-semibold mb-2 text-violet-400 font-yugioh">{nbsp(t('finalBoardTitle'))}</h2>
                                    {renderFinalBoardContent(true)}
                                </div>
                            )}
                        </div>
                    </div>
                );
            }


            return ( 
                <div className={`p-8 text-white export-onewm export-theme-${theme} export-ink-${cardFilter} ${isPreview && cardFilter !== 'color' ? `export-filter-${cardFilter}` : ''}`} data-watermark={'YGOH-ComboMaker'} style={backgroundStyle}>
                    <div className="relative z-10">
                        {qr && <div className="absolute top-0 right-0 flex flex-col items-center"><img src={qr.src} alt="" style={{ width: qr.size, height: qr.size }} className="bg-white p-1 rounded" /><span className="text-[11px] text-slate-300 mt-1">{nbsp(t('qrCaption'))}</span></div>}
                        <h1 className="text-5xl font-bold text-center text-violet-300 mb-8 font-yugioh" style={qr ? { paddingLeft: qr.size + 16, paddingRight: qr.size + 16 } : undefined}>{nbsp(comboTitle || t('untitledCombo'))}</h1>
                        {metaLineX && <p className="text-center text-slate-300 -mt-6 mb-6 text-sm" style={qr ? { paddingLeft: qr.size + 16, paddingRight: qr.size + 16 } : undefined}>{nbsp(metaLineX)}</p>} 
                        <div className="flex flex-col gap-6"> 
                            {(hasHandX || showNotesX || showBoardTopX) && (
                                <div className="flex flex-row gap-6 items-stretch">
                                    {hasHandX && (
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex flex-col" style={{ width: showNotesX ? '33.33%' : (showBoardTopX ? '50%' : '100%') }}>
                                            <h2 className="text-2xl font-semibold mb-4 text-violet-400 font-yugioh">{nbsp(t('startingHandTitle'))}</h2>
                                            <div className="flex-grow flex flex-row flex-wrap items-center justify-center gap-3">
                                                {startingHand.map((group, groupIndex) => (
                                                    <React.Fragment key={groupIndex}>
                                                        <div className="p-2 bg-slate-900/50 rounded-lg flex flex-wrap justify-center items-center gap-2 border border-dashed border-slate-600">
                                                            {group.map(item => <ExportCard key={`hand-${item.instanceId}`} card={findCard(item.instanceId)} size="small" quantity={item.quantity} />)}
                                                        </div>
                                                        {groupIndex < startingHand.length - 1 && <span className="font-bold text-violet-400 text-2xl">{nbsp(t('or'))}</span>}
                                                    </React.Fragment>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {showNotesX && (
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-grow min-w-0">
                                            <h2 className="text-2xl font-semibold mb-4 text-violet-400 font-yugioh">{nbsp(t('notesTitle'))}</h2>
                                            <div className="text-sm whitespace-pre-wrap break-words" style={{ direction: 'ltr', textAlign: 'left' }} dangerouslySetInnerHTML={{ __html: nbspHtml(notes).replace(MENTION_RE, '<b>$1</b>') }} />
                                        </div>
                                    )}
                                    {showBoardTopX && (
                                        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-grow min-w-0 flex flex-col">
                                            <h2 className="text-2xl font-semibold mb-4 text-violet-400 font-yugioh">{nbsp(t('finalBoardTitle'))}</h2>
                                            <div className="flex-grow flex flex-col justify-center">{renderFinalBoardContent(true)}</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            {exportOptions.include.comboSteps && comboSteps.length > 0 && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h2 className="text-2xl font-semibold mb-4 text-violet-400 font-yugioh">{nbsp(t('comboStepsTitle'))}</h2>
                                    <div className="space-y-4">
                                        {renderStepRows()}
                                    </div>
                                </div>
                            )}
                            {!quick && exportOptions.include.finalBoard && finalBoardCards.length > 0 && (
                                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <h2 className="text-2xl font-semibold mb-4 text-violet-400 font-yugioh">{nbsp(t('finalBoardTitle'))}</h2>
                                    {renderFinalBoardContent(false)}
                                </div>
                            )}
                        </div>
                    </div>
                </div> 
            ); 
        };
        const RichTextEditor = ({ value, onChange }) => { 
            const editorRef = useRef(null);
            // Lo último que escribió la propia persona. Si el valor que llega es ese, NO se reescribe
            // el contenido: reescribirlo manda el cursor al inicio y el texto sale al revés.
            const lastEmittedRef = useRef(null);
            useEffect(() => {
                const el = editorRef.current;
                if (!el || value === lastEmittedRef.current) return;
                if (el.innerHTML !== (value || '')) el.innerHTML = value || '';
            }, [value]);

            const handleInput = () => {
                if (!editorRef.current) return;
                const html = sanitizeHTML(editorRef.current.innerHTML);
                lastEmittedRef.current = html;
                onChange(html);
            };
            
            const execCmd = (command, val = null) => { 
                document.execCommand('styleWithCSS', false, true); // Force spans over font tags
                document.execCommand(command, false, val); 
                editorRef.current.focus(); 
                // Manually trigger update to ensure state is saved after command
                handleInput();
            }; 
            
            return ( 
                <div className="rich-text-editor bg-[var(--color-surface-light)] rounded-lg"> 
                    <div className="toolbar flex items-center gap-2 mb-2 p-2 bg-slate-900/50 rounded-t-md border-b border-[var(--color-border)]"> 
                        <button onClick={() => execCmd('bold')} className="w-8 h-8 rounded hover:bg-slate-700"><b>B</b></button> 
                        <button onClick={() => execCmd('italic')} className="w-8 h-8 rounded hover:bg-slate-700"><i>I</i></button> 
                        <button onClick={() => execCmd('underline')} className="w-8 h-8 rounded hover:bg-slate-700"><u>U</u></button> 
                        <button onClick={() => execCmd('insertUnorderedList')} className="w-8 h-8 rounded hover:bg-slate-700">•</button> 
                        <input type="color" onChange={(e) => execCmd('foreColor', e.target.value)} title="Text Color" className="w-8 h-8 p-1 bg-transparent border-none rounded cursor-pointer" /> 
                    </div> 
                    <div
  ref={editorRef}
  contentEditable={true}
  className="p-3 min-h-[8rem] outline-none rounded-b-md leading-relaxed focus:ring-2 focus:ring-[var(--color-primary)]"
  onInput={handleInput}
  onBlur={handleInput}
  style={{ direction: 'ltr', unicodeBidi: 'plaintext', textAlign: 'left', transform: 'none' }}
></div> 
                </div> 
            ); 
        };

        // Filtro de cartas para exportar/imprimir: 'gray' = escala de grises; 'ink' = grises claros (gasta mucha menos tinta).
        // La fórmula de 'ink' es la misma que la vista previa en CSS: grayscale(1) contrast(0.5) brightness(1.4).
        const applyCardFilterToCanvas = (ctx, w, h, filter) => {
            if (!filter || filter === 'color' || !w || !h) return;
            const data = ctx.getImageData(0, 0, w, h);
            const p = data.data;
            for (let i = 0; i < p.length; i += 4) {
                const g = (0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]) / 255;
                const v = filter === 'ink' ? Math.min(1, (0.25 + 0.5 * g) * 1.4) : g;
                p[i] = p[i + 1] = p[i + 2] = Math.round(v * 255);
            }
            ctx.putImageData(data, 0, 0);
        };

        // Imprimir / PDF: parte la imagen en hojas (cortando, si se puede, en una franja lisa
        // para no partir cartas a la mitad) y abre el diálogo de impresión del navegador.
        // Hojas (en mm, vertical). «Automática»: Carta en los países que la usan; A4 en el resto.
        const PAPER_MM = { letter: [215.9, 279.4], a4: [210, 297], oficio: [216, 330], legal: [215.9, 355.6] };
        const autoPaperKey = () => {
            const langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
            const withRegion = langs.find(l => /-[a-z]{2}$/i.test(l || ''));
            const region = withRegion ? withRegion.split('-').pop().toUpperCase() : '';
            return ['US', 'CA', 'MX', 'CL', 'CO', 'VE', 'PH', 'PR', 'GT', 'CR', 'DO', 'PA', 'SV', 'NI', 'HN', 'BZ'].includes(region) ? 'letter' : 'a4';
        };
        const resolvePaper = (o = {}) => {
            let k = o.paper || 'auto';
            if (k === 'auto') k = autoPaperKey();
            if (k === 'custom') {
                const f = o.paperUnit === 'in' ? 25.4 : 10;
                return { w: Math.min(1000, Math.max(60, (parseFloat(o.paperW) || 21.6) * f)), h: Math.min(2000, Math.max(60, (parseFloat(o.paperH) || 33) * f)) };
            }
            const [w, h] = PAPER_MM[k] || PAPER_MM.letter;
            return { w, h };
        };
        const printCanvasInPages = (canvas, title, paper = { w: 215.9, h: 279.4 }) => {
            const W = canvas.width, H = canvas.height;
            const MARGIN = 8; // mm
            const pageH = Math.floor(W * ((paper.h - 2 * MARGIN) / (paper.w - 2 * MARGIN)) * 0.985); // alto de cada hoja según el papel elegido
            const ctx = canvas.getContext('2d');
            const isQuietRow = (y) => {
                const row = ctx.getImageData(0, y, W, 1).data;
                const r0 = row[0], g0 = row[1], b0 = row[2];
                let outliers = 0, samples = 0;
                for (let x = 0; x < W; x += 6) {
                    const i = x * 4; samples++;
                    if (Math.abs(row[i] - r0) + Math.abs(row[i + 1] - g0) + Math.abs(row[i + 2] - b0) > 30) outliers++;
                }
                return outliers <= samples * 0.02;
            };
            const pieces = [];
            let start = 0;
            while (start < H) {
                let end = Math.min(H, start + pageH);
                if (end < H) {
                    const minEnd = end - Math.floor(pageH * 0.3);
                    for (let y = end; y > minEnd; y -= 2) { if (isQuietRow(y)) { end = y; break; } }
                }
                const piece = document.createElement('canvas');
                piece.width = W; piece.height = end - start;
                piece.getContext('2d').drawImage(canvas, 0, start, W, end - start, 0, 0, W, end - start);
                pieces.push(piece.toDataURL('image/png'));
                start = end;
            }
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
            document.body.appendChild(iframe);
            const doc = iframe.contentWindow.document;
            doc.open();
            doc.write('<!doctype html><html><head><meta charset="utf-8"><style>@page{size:' + paper.w + 'mm ' + paper.h + 'mm;margin:' + MARGIN + 'mm}html,body{margin:0}img{display:block;width:100%;break-after:page;page-break-after:always}img:last-child{break-after:auto;page-break-after:auto}</style></head><body></body></html>');
            doc.close();
            doc.title = title || 'Combo';
            const loads = pieces.map(src => new Promise(res => { const img = doc.createElement('img'); img.onload = res; img.onerror = res; img.src = src; doc.body.appendChild(img); }));
            Promise.all(loads).then(() => {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
                setTimeout(() => iframe.remove(), 1000);
            });
            return pieces.length;
        };

        // Vista previa en vivo: el diseño de exportación real (1280 px de ancho) reducido al espacio disponible.
        const ExportPreview = ({ layoutProps, exportOptions }) => {
            const outerRef = useRef(null);
            const innerRef = useRef(null);
            const [box, setBox] = useState({ scale: 0.4, height: 300 });
            useLayoutEffect(() => {
                const update = () => {
                    if (!outerRef.current || !innerRef.current) return;
                    const scale = outerRef.current.clientWidth / (exportOptions.layout === 'discord' ? 720 : 1280);
                    setBox({ scale, height: Math.ceil(innerRef.current.offsetHeight * scale) });
                };
                update();
                const ro = new ResizeObserver(update);
                ro.observe(outerRef.current);
                ro.observe(innerRef.current);
                return () => ro.disconnect();
            }, []);
            return (
                <div ref={outerRef} className="w-full overflow-hidden rounded-md border border-slate-700" style={{ height: box.height }}>
                    <div ref={innerRef} style={{ width: exportOptions.layout === 'discord' ? 720 : 1280, transform: `scale(${box.scale})`, transformOrigin: 'top left' }}>
                        <ExportLayout {...layoutProps} exportOptions={exportOptions} imageMap={{}} isPreview={true} />
                    </div>
                </div>
            );
        };

        const ExportOptionsModal = ({ show, onClose, onConfirm, onPrint, onCopyText, exportOptions, setExportOptions, layoutProps, t }) => {
            if (!show) return null;
            const optionRow = (label, key, choices) => (
                <div className="border-t border-slate-600 pt-4">
                    <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
                    <div className="flex gap-2">
                        {choices.map(([value, text]) => (
                            <button key={value} onClick={() => setExportOptions(p => ({ ...p, [key]: value }))}
                                className={`flex-1 py-2 px-1 text-sm rounded-md ${(exportOptions[key] ?? (key === 'theme' ? 'dark' : key === 'cardFilter' ? 'color' : undefined)) === value ? 'bg-violet-600' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                {text}
                            </button>
                        ))}
                    </div>
                </div>
            );
            return (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 w-full max-w-6xl max-h-[92vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row gap-6 relative">
                        <div className="md:w-80 flex-shrink-0 md:overflow-y-auto">
                            <h3 className="text-xl font-bold mb-6 text-violet-300 text-center">{t('exportOptionsTitle')}</h3>
                            <div className="space-y-4 mb-6">
                                {Object.keys(exportOptions.include).map(key => (
                                    <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                                        <input type="checkbox" checked={exportOptions.include[key]} onChange={e => setExportOptions(prev => ({ ...prev, include: { ...prev.include, [key]: e.target.checked } }))} className="h-5 w-5 bg-slate-600 border-slate-500 text-violet-500 focus:ring-violet-500 rounded" />
                                        <span className="text-slate-200">{t(key + 'Title')}</span>
                                    </label>
                                ))}
                                {optionRow(t('exportContent'), 'layout', [['full', t('exportContentFull')], ['quick', t('exportContentQuick')], ['discord', t('exportContentDiscord')]])}
                                {optionRow(t('exportBoardView'), 'boardView', [['board', t('boardViewBoard')], ['cards', t('boardViewCards')], ['both', t('boardViewBoth')]])}
                                {optionRow(t('exportStyle'), 'theme', [['dark', t('styleDark')], ['light', t('styleLight')], ['white', t('styleWhite')]])}
                                {optionRow(t('exportCardColor'), 'cardFilter', [['color', t('filterColor')], ['gray', t('filterGray')], ['ink', t('filterInk')]])}
                                {optionRow(t('exportLayout'), 'stepsPerRow', [3, 4, 5, 6].map(n => [n, `${n}xN`]))}
                                {optionRow(t('exportQuality'), 'scale', [[1, t('qualityLow')], [2, t('qualityMedium')], [3, t('qualityHigh')]])}
                                <div className="border-t border-slate-600 pt-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2" htmlFor="paper-size">{t('paperSize')}</label>
                                    <select id="paper-size" value={exportOptions.paper || 'auto'} onChange={e => setExportOptions(p => ({ ...p, paper: e.target.value }))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm text-white">
                                        <option value="auto">{t('paperAuto')} ({t('paper_' + autoPaperKey())})</option>
                                        {['letter', 'a4', 'oficio', 'legal', 'custom'].map(k => <option key={k} value={k}>{t('paper_' + k)}</option>)}
                                    </select>
                                    {exportOptions.paper === 'custom' && (
                                        <div className="flex flex-wrap gap-2 mt-2 items-center text-sm text-slate-300">
                                            <input type="number" min="5" step="0.1" value={exportOptions.paperW ?? 21.6} onChange={e => setExportOptions(p => ({ ...p, paperW: e.target.value }))} className="w-20 p-2 bg-slate-700 border border-slate-600 rounded-md text-white" aria-label="ancho" />
                                            <span>×</span>
                                            <input type="number" min="5" step="0.1" value={exportOptions.paperH ?? 33} onChange={e => setExportOptions(p => ({ ...p, paperH: e.target.value }))} className="w-20 p-2 bg-slate-700 border border-slate-600 rounded-md text-white" aria-label="alto" />
                                            <select value={exportOptions.paperUnit || 'cm'} onChange={e => setExportOptions(p => ({ ...p, paperUnit: e.target.value }))} className="p-2 bg-slate-700 border border-slate-600 rounded-md text-white"><option value="cm">cm</option><option value="in">in</option></select>
                                        </div>
                                    )}
                                    <p className="text-xs text-slate-400 mt-1">{t('paperHint')}</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-end gap-3">
                                <button onClick={onClose} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">{t('cancel')}</button>
                                {onCopyText && <button onClick={onCopyText} className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500"><i className="fas fa-copy mr-2"></i>{t('copyText')}</button>}
                       <button onClick={onPrint} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"><i className="fas fa-print mr-2"></i>{t('printPdf')}</button>
                                <button onClick={onConfirm} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">{t('confirmAndExport')}</button>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 md:overflow-y-auto">
                            <p className="text-sm text-slate-400 mb-2">{t('livePreview')}</p>
                            <ExportPreview layoutProps={layoutProps} exportOptions={exportOptions} />
                        </div>
                    </div>
                </div>
            );
        };
        
        const SaveComboModal = ({ show, onClose, onSave, onDownload, t, isOnlineSaveEnabled }) => { const [name, setName] = useState(''); if (!show) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"> <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-8 max-w-sm w-full relative"> <h3 className="text-xl font-bold mb-6 text-violet-300 text-center">{t('saveComboTitle')}</h3> <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('comboName')} className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none mb-6" /> <div className="flex justify-end gap-4"> <button onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">{t('cancel')}</button> <button onClick={() => onSave(name)} disabled={!name} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">{t('save')}</button> </div> <div className="mt-6 pt-4 border-t border-slate-700"> <p className="text-sm text-slate-400 mb-3">{t('orSaveAsFile')}</p> <button onClick={() => onDownload(name)} className="w-full px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"><i className="fas fa-file-arrow-down mr-2"></i>{t('downloadFile')}</button> </div> </div> </div> ); };
        const LoadComboModal = ({ show, onClose, onSelect, onDelete, onOpenFile, t, db, user, appId, isOnlineSaveEnabled }) => { const [savedCombos, setSavedCombos] = useState([]); const [deleteConfirm, setDeleteConfirm] = useState({ show: false, name: null }); 
            useEffect(() => { 
                if (show) { 
                    if (isOnlineSaveEnabled && db && user) {
                        const combosCol = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('combos');
                        const unsubscribe = combosCol.orderBy("createdAt", "desc").onSnapshot(snapshot => {
                            const combos = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));
                            setSavedCombos(combos);
                        });
                        return () => unsubscribe();
                    } else {
                        const combos = Object.keys(localStorage).filter(key => key.startsWith(LOCAL_STORAGE_PREFIX)).map(key => ({ id: key.replace(LOCAL_STORAGE_PREFIX, '') })); 
                        setSavedCombos(combos); 
                    }
                } 
            }, [show, isOnlineSaveEnabled, db, user, appId]); 
            const handleDeleteClick = (name) => { setDeleteConfirm({ show: true, name }); }; 
            const confirmDelete = () => { onDelete(deleteConfirm.name); setSavedCombos(list => list.filter(c => c.id !== deleteConfirm.name)); setDeleteConfirm({ show: false, name: null }); }; if (!show) return null;
            return ( <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4"> <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl w-full relative"> <h3 className="text-xl font-bold mb-6 text-violet-300 text-center">{t('openSavedTooltip')}</h3> <div className="space-y-2 max-h-96 overflow-y-auto mb-6"> {savedCombos.length > 0 ? savedCombos.map(combo => ( <div key={combo.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg hover:bg-slate-700/50"> <div className="flex-grow"> <p className="font-medium text-slate-200">{combo.id}</p> {combo.authorId && <p className="text-xs text-slate-400 truncate">{t('author')}: {combo.authorId}</p>} </div> <div className="flex gap-2 flex-shrink-0"> <button onClick={() => onSelect(combo.id)} className="px-3 py-1 text-sm bg-violet-600 text-white font-semibold rounded-md hover:bg-violet-700">{t('load')}</button> {((user && combo.authorId === user.uid) || !isOnlineSaveEnabled) && <button onClick={() => handleDeleteClick(combo.id)} className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700"><i className="fas fa-trash"></i></button>} </div> </div> )) : <p className="text-center text-slate-400 py-4">{t('noCombosSaved')}</p>} </div> <div className="flex justify-between gap-4"> <label className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 cursor-pointer"><i className="fas fa-file-arrow-up mr-2"></i>{t('openFile')}<input type="file" accept=".json,application/json" className="hidden" onChange={(e) => { onOpenFile(e.target.files[0]); e.target.value = ''; }} /></label> <button onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">{t('cancel')}</button> </div> </div> <ConfirmationModal show={deleteConfirm.show} title={t('delete')} message={t('deleteConfirmMessage', { comboName: deleteConfirm.name })} onConfirm={confirmDelete} onCancel={() => setDeleteConfirm({ show: false, name: null })} t={t} /> </div> ); };

        const Tutorial = ({ steps, onEnd, t, onStepChange }) => {
            const [stepIndex, setStepIndex] = useState(0);
            const [style, setStyle] = useState({ opacity: 0 });
            const [tooltipStyle, setTooltipStyle] = useState({ opacity: 0 });
            const currentStep = steps[stepIndex];
            const tooltipRef = useRef(null);

            const calculatePositions = useCallback(() => {
                if (!currentStep) return;
                const target = document.querySelector(currentStep.targetSelector);
                if (!target) {
                    console.warn(`Tutorial target not found: ${currentStep.targetSelector}`);
                    setStyle({ opacity: 0 });
                    setTooltipStyle({ opacity: 0 });
                    return;
                }
                const rect = target.getBoundingClientRect();
                const padding = 10;
                const zoomVal = getComputedStyle(document.body).zoom;
                const zoom = (zoomVal && !isNaN(parseFloat(zoomVal))) ? parseFloat(zoomVal) : 1;
                const top = (rect.top - padding / 2) / zoom;
                const left = (rect.left - padding / 2) / zoom;
                const width = (rect.width + padding) / zoom;
                const height = (rect.height + padding) / zoom;
                setStyle({ width: `${width}px`, height: `${height}px`, top: `${top}px`, left: `${left}px`, opacity: 1 });
                const tooltipRect = tooltipRef.current ? tooltipRef.current.getBoundingClientRect() : { width: 300, height: 150 };
                let ttTop, ttLeft;
                if (rect.bottom + 15 + tooltipRect.height < window.innerHeight) {
                  ttTop = (rect.bottom + 15) / zoom;
                } else if (rect.top - 15 - tooltipRect.height > 0) {
                  ttTop = (rect.top - 15 - tooltipRect.height) / zoom;
                } else {
                  ttTop = (window.innerHeight - tooltipRect.height) / (2 * zoom);
                }
                ttLeft = (rect.left + (rect.width / 2) - (tooltipRect.width / 2)) / zoom;
                const maxL = (window.innerWidth - tooltipRect.width - 10) / zoom;
                ttLeft = Math.max(10 / zoom, Math.min(ttLeft, maxL));
                setTooltipStyle({ top: `${ttTop}px`, left: `${ttLeft}px`, opacity: 1 });
            }, [currentStep]);

            useEffect(() => {
                if (!currentStep) return;

                let observer;
                let resizeHandler;
                let scrollHandler;
                let intervalId;
                let ro;

                const cleanup = () => {
                    window.removeEventListener('resize', resizeHandler);
                    window.removeEventListener('scroll', scrollHandler, true);
                    if (observer) observer.disconnect();
                    if (ro) ro.disconnect();
                    if (intervalId) clearInterval(intervalId);
                };

                const setupTutorialStep = () => {
                    calculatePositions();
                    
                    ro = new ResizeObserver(calculatePositions);
                    const tgt = document.querySelector(currentStep.targetSelector);
                    if (tgt) ro.observe(tgt);
                    resizeHandler = calculatePositions;
                    scrollHandler = calculatePositions;
                    window.addEventListener('resize', resizeHandler);
                    window.addEventListener('scroll', scrollHandler, true);
                    observer = new MutationObserver(calculatePositions);
                    if (document.body) {
                        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
                    }
                };
                
                let attempts = 0;
                const maxAttempts = 20; // Try for 2 seconds (20 * 100ms)
                intervalId = setInterval(() => {
                    const target = document.querySelector(currentStep.targetSelector);
                    if (target) {
                        clearInterval(intervalId);
                        intervalId = null;
                        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                        setTimeout(setupTutorialStep, 300);
                    } else {
                        attempts++;
                        if (attempts > maxAttempts) {
                            clearInterval(intervalId);
                            intervalId = null;
                            console.warn(`Tutorial target not found after ${maxAttempts} attempts: ${currentStep.targetSelector}`);
                        }
                    }
                }, 100);

                return cleanup;
            }, [stepIndex, currentStep, calculatePositions]);


            if (!currentStep) return null;
            const handleNext = () => {
                if (onStepChange) onStepChange(stepIndex + 1);
                if (stepIndex < steps.length - 1) {
                    setStepIndex(stepIndex + 1);
                } else {
                    onEnd();
                }
            };
            return (
                <div className="tutorial-overlay">
                    <div className="tutorial-spotlight" style={style}></div>
                    <div ref={tooltipRef} className="tutorial-tooltip" style={tooltipStyle}>
                        <h4 className="text-lg font-bold text-violet-400 mb-2">{currentStep.title}</h4>
                        <p className="text-sm mb-4">{currentStep.content}</p>
                        <div className="flex justify-between items-center">
                            <button onClick={onEnd} className="text-sm text-slate-400 hover:text-white">{t('tutorialSkip')}</button>
                            <button onClick={handleNext} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700">
                                {stepIndex === steps.length - 1 ? t('tutorialFinish') : t('tutorialNext')}
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
        const Notification = ({ message, show, t }) => { const elRef = useRef(null); useEffect(() => { if (show) { elRef.current.classList.add('show'); elRef.current.classList.remove('hide'); } else { elRef.current.classList.add('hide'); elRef.current.classList.remove('show'); } }, [show]); return ( <div ref={elRef} className="notification hide fixed top-5 left-1/2 -translate-x-1/2 bg-green-500/80 text-white font-bold px-6 py-2 rounded-full shadow-lg z-50"> {message} </div> ); };
        

        // Dibuja una carta personalizada con el marco de su tipo (como una carta real) y devuelve una imagen
        const CARD_FRAME_COLORS = { 'Normal Monster': '#e3bd67', 'Effect Monster': '#d07945', 'Flip Effect Monster': '#d07945', 'Union Effect Monster': '#d07945', 'Tuner Monster': '#d07945', 'Ritual Effect Monster': '#5582cc', 'Fusion Monster': '#8a57b5', 'Synchro Monster': '#e6e6e6', 'Xyz Monster': '#232323', 'Link Monster': '#285c9e', 'Pendulum Effect Monster': '#d07945', 'Spell Card': '#14917a', 'Trap Card': '#a43f6d', 'Token': '#a3a3a3' };
        const ATTRIBUTE_COLORS = { DARK: '#5b2a86', LIGHT: '#c9a417', EARTH: '#76562b', WATER: '#1f6fbf', FIRE: '#cc3a1e', WIND: '#2b9444', DIVINE: '#a8821a' };
        const loadImg = (src) => new Promise(res => { if (!src) return res(null); const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
        const renderCustomCardFace = async (card) => {
            const W = 300, H = 437, c = document.createElement('canvas'); c.width = W; c.height = H;
            const g = c.getContext('2d');
            const type = card.type || 'Effect Monster';
            const isSpell = type === 'Spell Card', isTrap = type === 'Trap Card', isST = isSpell || isTrap;
            const isLink = type === 'Link Monster', isXyz = type === 'Xyz Monster', isPend = /Pendulum/.test(type);
            const frame = CARD_FRAME_COLORS[type] || '#d07945';
            const rr = (x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
            g.fillStyle = '#111'; rr(0, 0, W, H, 12); g.fill();
            g.fillStyle = frame; rr(5, 5, W - 10, H - 10, 9); g.fill();
            const art = { x: 30, y: 72, s: W - 60 };
            if (isPend) { g.fillStyle = '#1d9e75'; g.fillRect(5, art.y + art.s * 0.55, W - 10, H - art.y - art.s * 0.55 - 5); }
            // Nombre
            g.fillStyle = 'rgba(255,255,255,.9)'; rr(14, 14, W - 28, 32, 4); g.fill();
            g.fillStyle = '#111'; let fs = 19; g.font = `800 ${fs}px Inter, Arial, sans-serif`;
            const name = (card.name || '?').slice(0, 60);
            while (g.measureText(name).width > W - 76 && fs > 10) { fs--; g.font = `800 ${fs}px Inter, Arial, sans-serif`; }
            g.textBaseline = 'middle'; g.fillText(name, 22, 30);
            // Atributo
            const attr = isST ? (isSpell ? 'SPELL' : 'TRAP') : (card.attribute || 'DARK');
            g.fillStyle = isSpell ? '#14917a' : isTrap ? '#a43f6d' : (ATTRIBUTE_COLORS[attr] || '#555');
            g.beginPath(); g.arc(W - 30, 30, 13, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 2; g.stroke();
            g.fillStyle = '#fff'; g.font = '800 11px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.fillText(attr[0], W - 30, 31); g.textAlign = 'left';
            // Estrellas / tipo de Magia-Trampa
            const lvl = Math.max(0, Math.min(13, parseInt(card.level, 10) || 0));
            if (isST) { g.fillStyle = '#111'; g.font = '700 12px Inter, Arial, sans-serif'; g.textAlign = 'right'; g.fillText(isSpell ? '[SPELL CARD]' : '[TRAP CARD]', W - 18, 59); g.textAlign = 'left'; }
            else if (!isLink && lvl > 0) {
                g.font = '16px Arial'; g.textAlign = 'center';
                for (let i = 0; i < lvl; i++) { const x = isXyz ? 26 + i * 19 : W - 26 - i * 19; g.fillStyle = isXyz ? '#111' : '#f2b705'; g.strokeStyle = isXyz ? '#f2c94c' : '#7a4a00'; g.lineWidth = 1; g.fillText('★', x, 60); g.strokeText('★', x, 60); }
                g.textAlign = 'left';
            }
            // Ilustración
            g.fillStyle = '#0b0b0b'; g.fillRect(art.x - 3, art.y - 3, art.s + 6, art.s + 6);
            const im = await loadImg(card.art);
            if (im) { const k = Math.max(art.s / im.width, art.s / im.height); const w = im.width * k, h = im.height * k; g.save(); g.beginPath(); g.rect(art.x, art.y, art.s, art.s); g.clip(); g.drawImage(im, art.x + (art.s - w) / 2, art.y + (art.s - h) / 2, w, h); g.restore(); }
            else { g.fillStyle = '#3b2f63'; g.fillRect(art.x, art.y, art.s, art.s); g.fillStyle = 'rgba(255,255,255,.35)'; g.font = '800 70px Inter, Arial, sans-serif'; g.textAlign = 'center'; g.fillText('?', art.x + art.s / 2, art.y + art.s / 2 + 4); g.textAlign = 'left'; }
            // Caja de texto
            const ty = art.y + art.s + 10;
            g.fillStyle = 'rgba(250,244,226,.95)'; rr(14, ty, W - 28, H - ty - 14, 4); g.fill();
            g.fillStyle = '#111'; g.font = '700 10px Inter, Arial, sans-serif'; g.textBaseline = 'top';
            g.fillText(`[ ${trTerm(type)} ]`.slice(0, 48), 20, ty + 5);
            g.font = '9px Inter, Arial, sans-serif';
            const words = String(card.desc || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean);
            let line = '', y = ty + 19; const maxW = W - 40, lastY = H - (isST ? 22 : 38);
            for (const wd of words) { const test = line ? line + ' ' + wd : wd; if (g.measureText(test).width > maxW) { g.fillText(line, 20, y); line = wd; y += 11; if (y > lastY) { line = '…'; break; } } else line = test; }
            if (line && y <= lastY + 11) g.fillText(line, 20, y);
            if (!isST) {
                g.strokeStyle = '#111'; g.lineWidth = 1; g.beginPath(); g.moveTo(20, H - 32); g.lineTo(W - 20, H - 32); g.stroke();
                g.font = '700 11px Inter, Arial, sans-serif'; g.textAlign = 'right';
                const atk = card.atk !== undefined && card.atk !== '' ? card.atk : '?';
                const second = isLink ? `LINK-${lvl || '?'}` : `DEF/${card.def !== undefined && card.def !== '' ? card.def : '?'}`;
                g.fillText(`ATK/${atk}   ${second}`, W - 20, H - 28); g.textAlign = 'left';
            }
            const face = c.toDataURL('image/jpeg', 0.82);
            const crop = document.createElement('canvas'); crop.width = 140; crop.height = 140;
            crop.getContext('2d').drawImage(c, art.x, art.y, art.s, art.s, 0, 0, 140, 140);
            return { face, crop: crop.toDataURL('image/jpeg', 0.82) };
        };

        const CustomCardModal = ({ show, onClose, onSave, t, existingCard }) => {
            const [cardData, setCardData] = useState({
                name: '', type: 'Effect Monster', desc: '', atk: '', def: '', image_url: '', attribute: 'DARK', level: 4, art: '',
            });
            const [imagePreview, setImagePreview] = useState('');

            useEffect(() => {
                if (existingCard) {
                    setCardData({ attribute: 'DARK', level: 4, ...existingCard, art: existingCard.art || (existingCard.faceGenerated ? '' : existingCard.image_url) || '' });
                } else {
                    setCardData({ name: '', type: 'Effect Monster', desc: '', atk: '', def: '', image_url: '', attribute: 'DARK', level: 4, art: '' });
                }
                setImagePreview('');
            }, [existingCard, show]);
            // Vista previa: la carta dibujada con su marco
            useEffect(() => {
                if (!show) return;
                let alive = true;
                const tm = setTimeout(async () => { const r = await renderCustomCardFace(cardData); if (alive) setImagePreview(r.face); }, 150);
                return () => { alive = false; clearTimeout(tm); };
            }, [show, cardData.name, cardData.type, cardData.desc, cardData.atk, cardData.def, cardData.attribute, cardData.level, cardData.art]);

            if (!show) return null;

            const handleInputChange = (e) => {
                const { name, value } = e.target;
                setCardData(prev => ({ ...prev, [name]: sanitizeHTML(value) }));
            };

            const handleImageUpload = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setCardData(prev => ({ ...prev, art: reader.result }));
                    };
                    reader.readAsDataURL(file);
                }
            };

            const handleSave = async () => {
                const drawn = await renderCustomCardFace(cardData);
                const finalCard = {
                    ...cardData,
                    image_url: drawn.face, image_url_small: drawn.face, image_url_cropped: drawn.crop, faceGenerated: true,
                    linkval: cardData.type === 'Link Monster' ? (parseInt(cardData.level, 10) || undefined) : undefined,
                    isCustom: true,
                    instanceId: existingCard ? existingCard.instanceId : generateId(),
                    ygoprodeck_id: existingCard ? existingCard.ygoprodeck_id : `custom_${Date.now()}`
                };
                onSave(finalCard);
                onClose();
            };

            return (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl w-full relative" onClick={e => e.stopPropagation()}>
                        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold">×</button>
                        <h3 className="text-xl font-bold mb-6 text-violet-300 text-center">{t('customCardTitle')}</h3>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                                <input type="text" name="name" value={cardData.name} onChange={handleInputChange} placeholder={t('cardName')} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:outline-none" />
                                <select name="type" value={cardData.type} onChange={handleInputChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg">
                                    {CARD_TYPES.map(type => <option key={type} value={type}>{trTerm(type)}</option>)}
                                </select>
                                {!['Spell Card', 'Trap Card'].includes(cardData.type) && (
                                    <div className="flex gap-4">
                                        <label className="flex-1 text-xs text-slate-400">{t('cardAttribute')}
                                            <select name="attribute" value={cardData.attribute || 'DARK'} onChange={handleInputChange} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white">
                                                {ATTRIBUTES.map(a => <option key={a} value={a}>{trTerm(a)}</option>)}
                                            </select>
                                        </label>
                                        <label className="w-36 text-xs text-slate-400">{t('cardLevel')}
                                            <input type="number" name="level" min="0" max="13" value={cardData.level ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white" />
                                        </label>
                                    </div>
                                )}
                                <textarea name="desc" value={cardData.desc} onChange={handleInputChange} placeholder={t('cardDescription')} rows="5" className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg"></textarea>
                                <div className="flex gap-4">
                                    <input type="text" name="atk" value={cardData.atk} onChange={handleInputChange} placeholder={t('attack')} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg" />
                                    <input type="text" name="def" value={cardData.def} onChange={handleInputChange} placeholder={t('defense')} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-lg" />
                                </div>
                                <label className="block text-xs text-slate-400 -mb-3">{t('cardArt')}</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                            </div>
                            <div className="flex-shrink-0 w-48">
                                <p className="text-center mb-2">{t('preview')}</p>
                                {imagePreview ? <img src={imagePreview} alt="Preview" className="w-full rounded-lg shadow-md custom-face-preview" /> : <div className="w-full aspect-[300/437] rounded-lg bg-slate-800 animate-pulse"></div>}
                            </div>
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button onClick={onClose} className="px-5 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-700">{t('cancel')}</button>
                            <button onClick={handleSave} className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">{t('create')}</button>
                        </div>
                    </div>
                </div>
            );
        };

        const PopularCardsCarousel = ({ onCardClick, t, cardPool }) => {
            const popularCardNames = ["Ash Blossom & Joyous Spring", "Maxx \"C\"", "Infinite Impermanence", "Effect Veiler", "Nibiru, the Primal Being", "Pot of Prosperity", "Called by the Grave", "Accesscode Talker", "Divine Arsenal AA-ZEUS - Sky Thunder", "Baronne de Fleur", "Spright Elf", "Tearlaments Kitkallos", "Change of Heart", "Monster Reborn", "Raigeki", "Harpie's Feather Duster", "Pot of Desires", "Forbidden Droplet"];
            const [cards, setCards] = useState([]);
            const [isCarouselOpen, setIsCarouselOpen] = useState(true);
            const scrollRef = useRef(null);

            useEffect(() => {
                const fetchCards = async () => {
                    try {
                        const cardData = await Promise.all(
                            popularCardNames.map(name => 
                                fetch(`${YGOPRODECK_API_BASE_URL}?fname=${encodeURIComponent(name)}`)
                                    .then(res => res.json())
                                    .then(data => data.data[0])
                            )
                        );
                        setCards(cardData.filter(Boolean));
                    } catch (error) {
                        console.error("Failed to fetch popular cards:", error);
                    }
                };
                fetchCards();
            }, []);

            const scroll = (direction) => {
                if (scrollRef.current) {
                    scrollRef.current.scrollBy({ left: direction * 300, behavior: 'smooth' });
                }
            };
            
            if (cards.length === 0) return <div className="flex justify-center p-4"><Spinner /></div>;
            
            const availableCards = cards.filter(card => !cardPool.some(poolCard => poolCard.ygoprodeck_id === card.id));

            return (
                <div className="relative my-4 popular-cards-carousel">
                    <h4 onClick={() => setIsCarouselOpen(!isCarouselOpen)} className="text-sm font-semibold text-slate-400 mb-2 flex justify-between items-center cursor-pointer">
                        <span>Popular Cards</span>
                        <i className={`fas fa-chevron-down transition-transform duration-300 ${isCarouselOpen ? '' : '-rotate-90'}`}></i>
                    </h4>
                    <div className={`collapse-box ${isCarouselOpen ? 'is-open' : ''}`}>
                        <div className="relative pt-2 collapse-clip">
                            <button onClick={() => scroll(-1)} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-700/50 hover:bg-slate-600 rounded-full p-1 text-white">
                                <i className="fas fa-chevron-left"></i>
                            </button>
                            <div ref={scrollRef} className="flex overflow-x-auto gap-3 pb-2 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                                {availableCards.map(card => (
                                    <div key={card.id} className="flex-shrink-0">
                                        <CardDisplay card={createComboCardInstance(card, 'https://images.weserv.nl/?url=')} size="small" onClick={() => onCardClick(card)} />
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => scroll(1)} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-700/50 hover:bg-slate-600 rounded-full p-1 text-white">
                                <i className="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            );
        };
        
        const EmptyState = ({ icon, title, message, action }) => (
            <div className="empty-state">
                <i className={`fas ${icon}`}></i>
                <h4>{title}</h4>
                <p className="text-sm">{message}</p>
                {action && <div className="mt-4">{action}</div>}
            </div>
        );

        const RestoreNotification = ({ onRestore, onDismiss, t }) => (
            <div className="fixed bottom-5 inset-x-0 mx-auto bg-slate-800 border border-slate-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 w-max max-w-[calc(100vw-1.5rem)] animate-fadeInUp">
                <span>{t('autosaveRestore')}</span>
                <button onClick={onRestore} className="btn text-sm bg-green-600 px-3 py-1 rounded-md hover:bg-green-700">{t('restore')}</button>
                <button onClick={onDismiss} className="btn text-sm bg-slate-600 px-3 py-1 rounded-md hover:bg-slate-500">{t('dismiss')}</button>
            </div>
        );

        const Toast = ({ message, onUndo, onClose, t }) => {
            useEffect(() => {
                const timer = setTimeout(onClose, 5000);
                return () => clearTimeout(timer);
            }, [onClose]);

            return (
                <div className="fixed bottom-5 inset-x-0 mx-auto bg-slate-800 border border-slate-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg z-50 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 w-max max-w-[calc(100vw-1.5rem)] animate-fadeInUp">
                    <span>{message}</span>
                    <button onClick={onUndo} className="btn text-sm text-amber-300 hover:underline">{t('undo')}</button>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
                </div>
            );
        };

        // Selector de fichas (Token): antes se añadía una al azar
        // Leer un mazo: enlace ydke:// (Main!Extra!Side en base64) o texto de un .ydk (#main, #extra, !side)
        const parseDeckIds = (text) => {
            const s = String(text || '').trim();
            const ids = [];
            const m = s.match(/ydke:\/\/([A-Za-z0-9+\/=]*)!([A-Za-z0-9+\/=]*)!/);
            if (m) {
                [m[1], m[2]].forEach(b64 => {
                    if (!b64) return;
                    let bin = '';
                    try { bin = atob(b64); } catch (e) { return; }
                    for (let i = 0; i + 3 < bin.length; i += 4) ids.push(((bin.charCodeAt(i)) | (bin.charCodeAt(i + 1) << 8) | (bin.charCodeAt(i + 2) << 16) | (bin.charCodeAt(i + 3) << 24)) >>> 0);
                });
                return ids;
            }
            for (const line of s.split(/\r?\n/)) {
                const l = line.trim();
                if (/^!side/i.test(l)) break;
                if (/^\d{3,10}$/.test(l)) ids.push(parseInt(l, 10));
            }
            return ids;
        };
        const ImportDeckModal = ({ show, onClose, onImport, t }) => {
            const [text, setText] = useState('');
            const [busy, setBusy] = useState(false);
            const [msg, setMsg] = useState('');
            if (!show) return null;
            const run = async (value) => {
                const ids = parseDeckIds(value);
                if (!ids.length) { setMsg(t('importDeckNone')); return; }
                setBusy(true); setMsg('');
                try { const n = await onImport(ids); setMsg(t('importDeckDone', { n })); setText(''); }
                catch (e) { console.error(e); setMsg(t('importDeckError')); }
                setBusy(false);
            };
            const onFile = (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => run(String(r.result || '')); r.readAsText(f); e.target.value = ''; };
            return (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-5 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-violet-300 flex-1">{t('importDeck')}</h3>
                            <button onClick={onClose} aria-label={t('closeLabel')} className="w-10 h-10 rounded-full bg-black/30 text-gray-300 hover:text-white text-2xl">×</button>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{t('importDeckHelp')}</p>
                        <textarea value={text} onChange={e => setText(e.target.value)} rows="5" placeholder="ydke://..." className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white" />
                        <div className="flex flex-wrap items-center gap-2 mt-3">
                            <button onClick={() => run(text)} disabled={busy || !text.trim()} className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">{busy ? '…' : t('importDeckButton')}</button>
                            <label className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 cursor-pointer"><i className="fas fa-file-import mr-2"></i>{t('importDeckFile')}<input type="file" accept=".ydk,.txt,text/plain" onChange={onFile} className="hidden" /></label>
                        </div>
                        {msg && <p className="text-sm mt-3 text-amber-300">{msg}</p>}
                    </div>
                </div>
            );
        };

        const TokenPickerModal = ({ show, tokens, onPick, onClose, t }) => {
            const [q, setQ] = useState('');
            if (!show) return null;
            const list = tokens.filter(tk => !q || (tk.name || '').toLowerCase().includes(q.toLowerCase())).slice(0, 150);
            const img = (tk) => { const u = tk.card_images && tk.card_images[0] && tk.card_images[0].image_url_small; return u ? 'https://images.weserv.nl/?url=' + u.replace(/^https?:\/\//, '') : ''; };
            return (
                <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
                    <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-5 w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-bold text-violet-300 flex-1">{t('tokenPickTitle')}</h3>
                            <button onClick={onClose} aria-label={t('closeLabel')} className="w-10 h-10 rounded-full bg-black/30 text-gray-300 hover:text-white text-2xl">×</button>
                        </div>
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('tokenSearch')} autoFocus className="w-full p-2 mb-3 bg-slate-700 border border-slate-600 rounded-lg text-white" />
                        <div className="overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(5.5rem,1fr))] gap-2">
                            {list.map(tk => (
                                <button key={tk.id} onClick={() => onPick(tk)} title={tk.name} className="flex flex-col items-center gap-1 p-1 rounded hover:bg-slate-700 text-xs text-slate-200">
                                    <img src={img(tk)} alt={tk.name} loading="lazy" crossOrigin="anonymous" className="w-full rounded" />
                                    <span className="text-center leading-tight">{tk.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        };


        const AutoResizeTextarea = ({ value, ...props }) => {
            const textareaRef = useRef(null);
            useLayoutEffect(() => {
                const textarea = textareaRef.current;
                if (textarea) {
                    textarea.style.height = 'auto';
                    textarea.style.height = `${textarea.scrollHeight}px`;
                }
            }, [value]);
            return <textarea ref={textareaRef} value={value} {...props} />;
        };

        const ComboStats = ({ stats, t }) => {
            if (!stats) return null;

            const totalCards = stats.types.Monster + stats.types.Spell + stats.types.Trap;
            const typeDistribution = [
                { name: t('monster'), value: stats.types.Monster, color: 'bg-amber-500' },
                { name: t('spell'), value: stats.types.Spell, color: 'bg-teal-500' },
                { name: t('trap'), value: stats.types.Trap, color: 'bg-fuchsia-600' },
            ].filter(item => item.value > 0);

            const attributeColors = {
                DARK: 'bg-purple-600', LIGHT: 'bg-yellow-300 text-black', FIRE: 'bg-red-600',
                WATER: 'bg-blue-500', WIND: 'bg-green-500', EARTH: 'bg-orange-800', DIVINE: 'bg-yellow-500'
            };
            const activeAttributes = Object.entries(stats.attributes).filter(([_, value]) => value > 0);
            
            return (
                <div className="p-4 pt-0">
                    <div className="p-4 bg-black/20 rounded-lg space-y-4">
                        <div>
                            <h4 className="font-semibold mb-2 text-lg text-[var(--color-text)]">{t('statsCardTypes')} ({totalCards})</h4>
                            <div className="w-full flex h-6 rounded-md overflow-hidden bg-[var(--color-surface-light)]">
                                {typeDistribution.map(type => (
                                    <div key={type.name} style={{ width: `${(type.value / totalCards) * 100}%` }} className={`${type.color} flex items-center justify-center text-xs font-bold text-white`} data-tooltip={`${type.name}: ${type.value}`}>
                                        {Math.round((type.value / totalCards) * 100)}%
                                    </div>
                                ))}
                            </div>
                        </div>
                        {activeAttributes.length > 0 && (
                             <div>
                                <h4 className="font-semibold mb-2 text-lg text-[var(--color-text)]">{t('statsAttributes')}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {activeAttributes.map(([name, value]) => (
                                        <div key={name} className={`flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm font-medium ${attributeColors[name]}`}>
                                            <span>{name}</span>
                                            <span className="bg-black/20 w-5 h-5 text-xs flex items-center justify-center rounded-full">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        // ===================== Tablero virtual «Probar combo» (fase 1) =====================
        // Siguientes pasos: fase 2 = flechas animadas entre zonas y ramas («si te interrumpen…»); fase 3 = exportar la jugada como GIF.
        // Estado del tablero (solo datos, sin funciones):
        //   slots   { 'Extra Monster 1' … 'Spell/Trap 5', 'Field Zone': carta | null }
        //   hand, deck, extra, gy, banish: listas de cartas (la última es la de arriba)
        //   info    { instanceId: { type, race } }: lo que las reglas necesitan saber de cada carta
        //   nextUid contador para crear copias nuevas siempre con el mismo nombre
        //   last    { uids, mainUid, dest }: qué tocó el último paso (para resaltarlo)
        // Cada carta física es { uid, id: instanceId, faceDown?, materials?: [cartas] }.
        const PLAY_EMZ = ["Extra Monster 1", "Extra Monster 2"];
        const PLAY_MMZ = ["Main Monster 1", "Main Monster 2", "Main Monster 3", "Main Monster 4", "Main Monster 5"];
        const PLAY_STZ = ["Spell/Trap 1", "Spell/Trap 2", "Spell/Trap 3", "Spell/Trap 4", "Spell/Trap 5"];
        const PLAY_SLOTS = [...PLAY_EMZ, ...PLAY_MMZ, ...PLAY_STZ, "Field Zone"];
        const PLAY_PILE_LABEL = { hand: 'playHand', deck: 'playDeck', extra: 'playExtraDeck', gy: 'playGraveyard', banish: 'playBanished' };
        const playIsExtraType = (info) => /fusion|synchro|xyz|link/i.test((info && info.type) || '');
        const playIsToken = (info) => /token/i.test((info && info.type) || '');
        const playIsSpellTrap = (info) => /spell|trap/i.test((info && info.type) || '');
        const playIsMonsterZone = (z) => PLAY_EMZ.includes(z) || PLAY_MMZ.includes(z);

        // Estado inicial: Mano = grupo elegido de la mano inicial; Fusión/Sincronía/Xyz/Enlace del pool → Extra Deck;
        // el resto del pool que no está en la mano → Deck (las fichas no van a ningún sitio: aparecen al invocarlas).
        const createInitialBoard = (cardPool, handGroup) => {
            const info = {};
            cardPool.forEach(c => { info[c.instanceId] = { type: c.type || '', race: c.race || '' }; });
            let n = 0;
            const make = (id) => ({ uid: 'c' + (n++), id });
            const hand = [], extra = [], deck = [], inHand = new Set();
            (handGroup || []).forEach(item => {
                if (!info[item.instanceId]) return;
                inHand.add(item.instanceId);
                for (let i = 0; i < Math.max(1, item.quantity || 1); i++) hand.push(make(item.instanceId));
            });
            cardPool.forEach(c => {
                if (inHand.has(c.instanceId) || playIsToken(info[c.instanceId])) return;
                (playIsExtraType(info[c.instanceId]) ? extra : deck).push(make(c.instanceId));
            });
            const slots = {};
            PLAY_SLOTS.forEach(z => { slots[z] = null; });
            return { slots, hand, deck, extra, gy: [], banish: [], info, nextUid: n, last: null };
        };

        // Busca una copia de la carta en los lugares indicados (en orden), la quita de ahí y la devuelve.
        // 'field' = cualquier zona del campo (también debajo de un Xyz). Si no hay ninguna, se asume otra copia que sale del Deck.
        const playTake = (s, id, sources) => {
            for (const src of sources) {
                if (src === 'field') {
                    for (const z of PLAY_SLOTS) { const c = s.slots[z]; if (c && c.id === id) { s.slots[z] = null; return { card: c, from: z }; } }
                    for (const z of PLAY_SLOTS) { const mats = (s.slots[z] && s.slots[z].materials) || []; const i = mats.findIndex(m => m.id === id); if (i >= 0) return { card: mats.splice(i, 1)[0], from: null }; }
                } else {
                    const pile = s[src];
                    for (let i = pile.length - 1; i >= 0; i--) if (pile[i].id === id) return { card: pile.splice(i, 1)[0], from: src };
                }
            }
            return { card: { uid: 'c' + (s.nextUid++), id }, from: null };
        };

        // Busca una carta sin moverla (para resaltarla).
        const playFind = (s, id) => {
            for (const z of PLAY_SLOTS) { const c = s.slots[z]; if (c && c.id === id) return c; }
            for (const z of PLAY_SLOTS) { const m = ((s.slots[z] && s.slots[z].materials) || []).find(x => x.id === id); if (m) return m; }
            for (const k of ['hand', 'gy', 'banish', 'extra', 'deck']) { const pile = s[k]; for (let i = pile.length - 1; i >= 0; i--) if (pile[i].id === id) return pile[i]; }
            return null;
        };

        // Elige la zona: la del paso (si es del tipo correcto y está libre), la zona de donde venía la carta, o la primera libre.
        // Si todo está lleno, la del paso (o la primera); lo que hubiera ahí se va al Cementerio.
        const playPickZone = (s, kind, preferred, from) => {
            const valid = (kind === 'st' || kind === 'pend') ? PLAY_STZ : kind === 'field' ? ['Field Zone'] : [...PLAY_EMZ, ...PLAY_MMZ];
            const ok = (z) => z && valid.includes(z);
            if (ok(preferred) && !s.slots[preferred]) return preferred;
            if (ok(from) && !s.slots[from]) return from;
            const order = kind === 'st' ? PLAY_STZ
                : kind === 'pend' ? ['Spell/Trap 1', 'Spell/Trap 5', 'Spell/Trap 2', 'Spell/Trap 3', 'Spell/Trap 4']
                : kind === 'field' ? ['Field Zone']
                : (kind === 'extra' && PLAY_EMZ.every(z => !s.slots[z])) ? [...PLAY_EMZ, ...PLAY_MMZ] : [...PLAY_MMZ, ...PLAY_EMZ];
            return order.find(z => !s.slots[z]) || (ok(preferred) ? preferred : order[0]);
        };

        // Deja una carta en una zona del campo o en 'hand' / 'deck' / 'extra' / 'gy' / 'banish'.
        // Devuelve dónde quedó, o null si desapareció (una ficha que deja el campo).
        const playPut = (s, card, dest) => {
            const info = s.info[card.id];
            const mats = card.materials || [];
            if (mats.length && !playIsMonsterZone(dest)) { card = { ...card, materials: [] }; mats.forEach(m => playPut(s, m, 'gy')); }
            if (PLAY_SLOTS.includes(dest)) {
                const old = s.slots[dest];
                if (old && old.uid !== card.uid) { s.slots[dest] = null; playPut(s, old, 'gy'); }
                s.slots[dest] = card;
                return dest;
            }
            if (playIsToken(info)) return null;
            if ((dest === 'hand' || dest === 'deck') && playIsExtraType(info)) dest = 'extra';
            s[dest].push({ uid: card.uid, id: card.id });
            return dest;
        };

        // applyStep(boardState, step) → nuevo estado. Función pura: no cambia boardState.
        // ---- Reglas simples de movimiento (fase 1; se pueden afinar más adelante) ----
        // • Normal Summon → de la Mano a una Zona de Monstruo (step.location si es zona de monstruo; si no, la primera libre).
        // • Set → un monstruo va boca abajo a una Zona de Monstruo; una Magia/Trampa, boca abajo a Magia/Trampa (Magia de Campo → Zona de Campo).
        // • Special Summon → desde donde esté (Mano, Cementerio, Desterradas, Deck; las de Fusión/Sincronía/Xyz/Enlace, del Extra Deck)
        //   a la Zona de Monstruo o a la Zona Extra (step.location o la primera libre).
        // • Pendulum Summon → igual que Special Summon, para la principal y las afectadas (si la principal es una escala ya colocada, solo se resalta).
        // • Fusion / Synchro / Xyz / Link Summon → las targetCards (materiales) van al Cementerio (en Xyz quedan debajo como material);
        //   la principal sale del Extra Deck a la Zona Extra (si ya usas una, a la primera Zona de Monstruo libre) o a step.location.
        //   Si la principal es una Magia (p. ej. Polymerization), se activa y se invoca la primera carta de Extra Deck de las afectadas.
        // • Activate Spell/Trap → a Magia/Trampa (o se activa donde estaba colocada); Normal, Quick-Play, Ritual y Counter se ven ahí durante ese paso y van al Cementerio al empezar el siguiente.
        //   Un monstruo Péndulo va a la Zona de Péndulo (Magia/Trampa 1 o 5). Cualquier otro monstruo se trata como Activate Effect.
        // • Activate Effect / Attack / Other → nada se mueve; se resaltan la principal y las afectadas.
        // • Search / Add to Hand → las targetCards (si no hay, la principal) van a la Mano (desde Deck, Cementerio, Desterradas o el campo).
        // • Send to GY / Discard / Banish → las targetCards (si no hay, la principal) van al Cementerio o a Desterradas.
        // • Los pasos de tipo 'note' y 'group' no cambian el tablero.
        // Detalles: si una carta no está donde debería, se asume otra copia que sale del Deck (el Deck real tiene más copias que el pool);
        // si la zona pedida está ocupada se usa la primera libre; las fichas desaparecen al dejar el campo; las cartas del Extra Deck
        // que irían a la Mano o al Deck vuelven al Extra Deck; los materiales Xyz van al Cementerio si su monstruo deja la Zona de Monstruo.
        const applyStep = (boardState, step) => {
            const s = JSON.parse(JSON.stringify(boardState));
            s.last = { uids: [], mainUid: null, dest: null };
            if (!step || step.type !== 'step') return s;
            if (step.location === 'Pendulum Left') step = { ...step, location: 'Spell/Trap 1' };
            else if (step.location === 'Pendulum Right') step = { ...step, location: 'Spell/Trap 5' };
            else if (['Hand', 'Deck', 'Extra Deck'].includes(step.location)) step = { ...step, location: null };
            // Las Magias/Trampas Normales, Rápidas, de Ritual o Contraataque activadas en el paso anterior ya resolvieron: van al Cementerio.
            PLAY_SLOTS.forEach(z => { const c = s.slots[z]; if (c && c.resolveToGy) { s.slots[z] = null; delete c.resolveToGy; playPut(s, c, 'gy'); } });
            const known = (id) => !!(id && s.info[id]);
            const mainId = known(step.mainCardInstanceId) ? step.mainCardInstanceId : null;
            const mainInfo = (mainId && s.info[mainId]) || {};
            const targetIds = [];
            (step.targetCards || []).forEach(tc => { if (known(tc.instanceId)) for (let i = 0; i < Math.max(1, tc.quantity || 1); i++) targetIds.push(tc.instanceId); });
            const mark = (card, isMain) => { s.last.uids.push(card.uid); if (isMain) s.last.mainUid = card.uid; };
            const highlight = (id, isMain) => { const c = id && playFind(s, id); if (c) mark(c, isMain); };
            const summon = (id, sources, kind, opts = {}) => {
                const { card, from } = playTake(s, id, sources);
                card.faceDown = !!opts.faceDown;
                if (opts.materials) card.materials = [...(card.materials || []), ...opts.materials];
                s.last.dest = playPut(s, card, playPickZone(s, kind, step.location, from));
                mark(card, opts.isMain);
                return card;
            };
            const summonSources = (id) => playIsExtraType(s.info[id]) ? ['extra', 'gy', 'banish', 'hand', 'deck'] : ['hand', 'gy', 'banish', 'deck', 'extra'];
            const summonKind = (id) => playIsExtraType(s.info[id]) ? 'extra' : 'monster';
            const toPile = (sources, pile) => {
                const ids = targetIds.length ? targetIds : [mainId].filter(Boolean);
                if (targetIds.length && !targetIds.includes(mainId)) highlight(mainId, true);
                ids.forEach(id => { const { card } = playTake(s, id, sources); s.last.dest = playPut(s, card, pile); mark(card, !targetIds.length); });
            };
            const activateSpell = (id, isMain) => {
                const info = s.info[id] || {};
                if (!playIsSpellTrap(info)) {
                    if (/pendulum/i.test(info.type || '')) summon(id, ['field', 'hand', 'extra'], 'pend', { isMain });
                    else highlight(id, isMain);
                    return;
                }
                const card = summon(id, ['field', 'hand', 'deck', 'gy', 'banish'], /field/i.test(info.race || '') ? 'field' : 'st', { isMain });
                if (/^(normal|quick-play|ritual|counter)$/i.test(info.race || '')) {
                    // Se queda en su zona mientras se activa; al pasar al siguiente paso resuelve y va al Cementerio.
                    const z = PLAY_SLOTS.find(k => s.slots[k] && s.slots[k].uid === card.uid);
                    if (z) s.slots[z].resolveToGy = true;
                }
            };
            switch (step.actionType) {
                case 'Normal Summon':
                    if (mainId) summon(mainId, ['hand'], 'monster', { isMain: true });
                    break;
                case 'Set':
                    if (!mainId) break;
                    if (playIsSpellTrap(mainInfo)) summon(mainId, ['hand', 'deck', 'gy', 'banish'], /field/i.test(mainInfo.race || '') ? 'field' : 'st', { isMain: true, faceDown: true });
                    else summon(mainId, ['hand'], 'monster', { isMain: true, faceDown: true });
                    break;
                case 'Special Summon':
                    if (mainId) summon(mainId, summonSources(mainId), summonKind(mainId), { isMain: true });
                    break;
                case 'Pendulum Summon': {
                    const scale = mainId && playFind(s, mainId);
                    const scaleOnField = scale && PLAY_STZ.some(z => s.slots[z] && s.slots[z].uid === scale.uid);
                    if (scaleOnField) mark(scale, true);
                    [scaleOnField ? null : mainId, ...targetIds].filter(Boolean).forEach(id => summon(id, ['hand', 'extra'], 'monster', { isMain: id === mainId }));
                    break;
                }
                case 'Fusion Summon': case 'Synchro Summon': case 'Xyz Summon': case 'Link Summon': {
                    const isXyz = step.actionType === 'Xyz Summon';
                    let summonId = mainId, materialIds = targetIds;
                    if (mainId && playIsSpellTrap(mainInfo)) {
                        activateSpell(mainId, false);
                        const i = targetIds.findIndex(id => playIsExtraType(s.info[id]));
                        summonId = i >= 0 ? targetIds[i] : null;
                        materialIds = targetIds.filter((_, j) => j !== i);
                    }
                    const xyzMaterials = [];
                    materialIds.forEach(id => {
                        const { card } = playTake(s, id, ['field', 'hand', 'deck', 'gy', 'banish']);
                        mark(card, false);
                        if (isXyz) { (card.materials || []).forEach(m => xyzMaterials.push(m)); xyzMaterials.push({ uid: card.uid, id: card.id }); }
                        else playPut(s, card, 'gy');
                    });
                    if (summonId) summon(summonId, ['extra', 'gy', 'banish', 'hand', 'deck'], 'extra', { isMain: true, materials: isXyz ? xyzMaterials : null });
                    else xyzMaterials.forEach(m => playPut(s, m, 'gy'));
                    break;
                }
                case 'Activate Spell/Trap':
                    if (mainId) activateSpell(mainId, true);
                    break;
                case 'Search': case 'Add to Hand':
                    toPile(['deck', 'gy', 'banish', 'field'], 'hand');
                    break;
                case 'Send to GY':
                    toPile(['field', 'hand', 'deck', 'extra'], 'gy');
                    break;
                case 'Discard':
                    toPile(['hand'], 'gy');
                    break;
                case 'Banish':
                    toPile(['gy', 'field', 'hand', 'deck', 'extra'], 'banish');
                    break;
                default: // Activate Effect, Attack, Other…
                    highlight(mainId, true);
                    targetIds.forEach(id => highlight(id, false));
            }
            // Movimientos elegidos a mano en las cartas afectadas (pasos cuya acción no mueve las afectadas)
            const MOVE_DEST = { draw: 'hand', search: 'hand', recover: 'hand', bounce: 'hand', toGy: 'gy', mill: 'gy', discard: 'gy', destroy: 'gy', tribute: 'gy', material: 'gy', detach: 'gy', banish: 'banish', banishFd: 'banish', shuffle: 'deck', deckTop: 'deck', deckBottom: 'deck', toExtra: 'extra', pendExtra: 'extra' };
            const MOVE_SUMMON = { ssHand: 'hand', ssDeck: 'deck', revive: 'gy', ssBanish: 'banish', ssExtra: 'extra' };
            if (['Activate Effect', 'Activate Spell/Trap', 'Special Summon', 'Normal Summon', 'Set', 'Attack', 'Other'].includes(step.actionType)) {
                (step.targetCards || []).forEach(tc => {
                    if (!tc.moveSet || !known(tc.instanceId)) return;
                    if (MOVE_DEST[tc.move]) {
                        const { card } = playTake(s, tc.instanceId, ['field', 'hand', 'deck', 'gy', 'banish', 'extra']);
                        if (card) { mark(card, false); playPut(s, card, MOVE_DEST[tc.move]); }
                    } else if (MOVE_SUMMON[tc.move]) {
                        summon(tc.instanceId, [MOVE_SUMMON[tc.move], 'hand', 'deck', 'gy', 'banish', 'extra'], tc.move === 'ssExtra' ? 'extra' : 'monster', { isMain: false });
                    }
                });
            }
            return s;
        };

        // Nombres cortos para la lista de jugadas: se quita el prefijo de arquetipo compartido («Salamangreat Spinny» → «Spinny»).
        const playShortNames = (cardPool) => {
            const out = {}, groups = {};
            cardPool.forEach(c => {
                const words = (c.name || '?').split(' ');
                out[c.instanceId] = c.name || '?';
                if (words.length > 1) (groups[words[0]] = groups[words[0]] || []).push({ id: c.instanceId, words });
            });
            Object.values(groups).forEach(list => {
                if (list.length < 2) return;
                let n = 0;
                while (list.every(x => x.words.length > n + 1 && x.words[n] === list[0].words[n])) n++;
                if (n > 0) list.forEach(x => { out[x.id] = x.words.slice(n).join(' '); });
            });
            return out;
        };
        const playDestLabel = (dest, t) => !dest ? '' : dest === 'gy' ? ZONE_ABBREVIATIONS['Graveyard'] : dest === 'banish' ? ZONE_ABBREVIATIONS['Banish Pile'] : (ZONE_ABBREVIATIONS[dest] || t(PLAY_PILE_LABEL[dest]));
        const playActionText = (step) => step.actionType === 'Other' ? (step.customActionText || trTerm('Other')) : trTerm(step.actionType || '');
        const playActionEmoji = (step) => (YGO_ACTIONS.find(a => a.name === step.actionType) || {}).emoji || '';

        const PlayComboBoard = ({ comboState, onClose, t }) => {
            const { cardPool = [], startingHand = [], comboSteps = [], comboTitle } = comboState;
            const cardById = useMemo(() => { const m = {}; cardPool.forEach(c => { m[c.instanceId] = c; }); return m; }, [cardPool]);
            const shortNames = useMemo(() => playShortNames(cardPool), [cardPool]);
            const handOptions = useMemo(() => (startingHand || []).filter(g => Array.isArray(g) && g.length > 0), [startingHand]);
            const [handIdx, setHandIdx] = useState(0);
            const [pos, setPos] = useState(0);
            const [pileOpen, setPileOpen] = useState(null);
            const [zoomCard, setZoomCard] = useState(null);
            // Modo práctica: adivinar la carta del siguiente paso
            const [practice, setPractice] = useState(false);
            const [answer, setAnswer] = useState(null); // instanceId elegido o 'reveal'
            const [score, setScore] = useState({ ok: 0, wrong: [] });
            const listRef = useRef(null);

            // Rama elegida: la línea principal hasta ese paso y luego los pasos de la rama
            const [branchFrom, setBranchFrom] = useState(null);
            const timeline = useMemo(() => {
                const main = comboSteps || [];
                if (!branchFrom) return main;
                const idx = main.findIndex(s => s && s.id === branchFrom);
                const src = idx >= 0 ? main[idx] : null;
                if (!src || !src.branch) return main;
                return [...main.slice(0, idx + 1), { type: 'group', id: 'branch-' + src.id, title: '↳ ' + (src.branch.title || t('branchLabel')) }, ...(src.branch.steps || []).map(bs => ({ ...bs, type: 'step', vulnerability: { text: '', cards: [] }, targetCards: bs.targetCards || [] }))];
            }, [branchFrom, comboSteps, t]);
            // Línea de tiempo: solo los pasos de verdad avanzan; las notas se muestran con el paso anterior y los grupos como títulos.
            const { steps, notesAt, groupAt, rows } = useMemo(() => {
                const steps = [], notesAt = [[]], groupAt = [null], rows = [];
                let group = null;
                timeline.forEach((e, i) => {
                    if (!e) return;
                    if (e.type === 'group') { group = e.title || ''; rows.push({ kind: 'group', key: e.id || 'g' + i, text: e.title || '' }); }
                    else if (e.type === 'note') { if (e.text) { notesAt[steps.length].push(e.text); rows.push({ kind: 'note', key: e.id || 'n' + i, text: e.text }); } }
                    else if (e.type === 'step') { steps.push(e); notesAt.push([]); groupAt.push(group); rows.push({ kind: 'step', key: e.id || 's' + i, step: e, pos: steps.length }); }
                });
                return { steps, notesAt, groupAt, rows };
            }, [timeline]);
            const total = steps.length;

            // boards[k] = estado tras k pasos, calculado siempre desde el inicio: avanzar y retroceder dan el mismo tablero.
            const boards = useMemo(() => {
                const list = [createInitialBoard(cardPool, handOptions[handIdx] || [])];
                steps.forEach(st => list.push(applyStep(list[list.length - 1], st)));
                return list;
            }, [cardPool, handOptions, handIdx, steps]);
            const p = Math.min(pos, total);
            const board = boards[p];
            const go = useCallback((n) => setPos(Math.max(0, Math.min(total, n))), [total]);
            // Reproducción automática (▶) con velocidad lenta / normal / rápida
            const PLAY_DELAYS = { slow: 3000, normal: 1700, fast: 800 };
            const [playing, setPlaying] = useState(false);
            const [speed, setSpeed] = useState(() => { try { const v = localStorage.getItem('ygo_play_speed'); return PLAY_DELAYS[v] ? v : 'normal'; } catch (e) { return 'normal'; } });
            useEffect(() => { try { localStorage.setItem('ygo_play_speed', speed); } catch (e) {} }, [speed]);
            useEffect(() => {
                if (!playing) return;
                if (p >= total) { setPlaying(false); return; }
                const timer = setTimeout(() => go(p + 1), PLAY_DELAYS[speed]);
                return () => clearTimeout(timer);
            }, [playing, p, total, speed, go]);
            const togglePlay = () => { if (playing) { setPlaying(false); return; } if (total === 0) return; if (p >= total) go(0); setPlaying(true); };
            const manualGo = (n) => { setPlaying(false); go(n); };
            // GIF animado: una foto del tablero por paso (html2canvas) y se unen en el navegador con gifenc
            const [gifState, setGifState] = useState(null); // null | {phase:'options'} | {phase:'working',done,total} | {phase:'ready',url,bytes} | {phase:'error'}
            const [gifSize, setGifSize] = useState('small');
            const makeGif = async () => {
                setPlaying(false);
                const target = document.querySelector('[data-gif-capture]');
                if (!target || !window.html2canvas) { setGifState({ phase: 'error' }); return; }
                const overlay = target.closest('.play-overlay');
                const startPos = p;
                const width = gifSize === 'large' ? 800 : 480;
                const bg = document.documentElement.getAttribute('data-theme') === 'light' ? '#f1f5f9' : '#0b1020';
                const frames = [];
                try {
                    const mod = await (new Function('u', 'return import(u)'))('https://unpkg.com/gifenc@1.0.3/dist/gifenc.esm.js');
                    const { GIFEncoder, quantize, applyPalette } = mod;
                    if (overlay) overlay.classList.add('gif-capturing');
                    for (let i = 0; i <= total; i++) {
                        setGifState({ phase: 'working', done: i, total: total + 1 });
                        go(i);
                        await new Promise(r => setTimeout(r, 180));
                        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
                        const shot = await window.html2canvas(target, { useCORS: true, backgroundColor: bg, scale: 1, logging: false,
                            onclone: (doc) => { const c = doc.querySelector('[data-gif-capture]'); if (c) { c.style.overflow = 'visible'; c.style.height = 'auto'; c.style.maxHeight = 'none'; } } });
                        const k = width / shot.width;
                        const small = document.createElement('canvas');
                        small.width = width; small.height = Math.max(1, Math.round(shot.height * k));
                        const sctx = small.getContext('2d');
                        sctx.imageSmoothingQuality = 'high';
                        sctx.drawImage(shot, 0, 0, small.width, small.height);
                        frames.push(small);
                    }
                    const H = Math.max(...frames.map(f => f.height));
                    const enc = GIFEncoder();
                    const out = document.createElement('canvas');
                    out.width = width; out.height = H;
                    const octx = out.getContext('2d', { willReadFrequently: true });
                    const delay = PLAY_DELAYS[speed];
                    frames.forEach((f, idx) => {
                        octx.fillStyle = bg; octx.fillRect(0, 0, width, H);
                        octx.drawImage(f, 0, 0);
                        const { data } = octx.getImageData(0, 0, width, H);
                        const palette = quantize(data, 256);
                        const index = applyPalette(data, palette);
                        enc.writeFrame(index, width, H, { palette, delay: idx === frames.length - 1 ? delay * 2 : delay, repeat: 0 });
                    });
                    enc.finish();
                    const bytes = enc.bytes();
                    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/gif' }));
                    setGifState({ phase: 'ready', url, bytes: bytes.length });
                } catch (e) {
                    console.error('No se pudo crear el GIF', e);
                    setGifState({ phase: 'error' });
                } finally {
                    if (overlay) overlay.classList.remove('gif-capturing');
                    go(startPos);
                }
            };
            const startPractice = () => { setPlaying(false); setPractice(true); setAnswer(null); setScore({ ok: 0, wrong: [] }); go(0); };
            const stopPractice = () => { setPractice(false); setAnswer(null); };
            const quizStep = practice && p < total ? steps[p] : null;
            const quizOptions = useMemo(() => {
                if (!practice || p >= total) return [];
                const correct = steps[p].mainCardInstanceId;
                const correctName = (cardById[correct] || {}).name;
                const seen = new Set(), others = [];
                cardPool.forEach(c => { if (!c || c.instanceId === correct || c.name === correctName || seen.has(c.name)) return; seen.add(c.name); others.push(c.instanceId); });
                let seed = (p + 1) * 9301 + total * 49297;
                const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
                const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
                return shuffle([correct, ...shuffle(others).slice(0, 3)]);
            }, [practice, p, total, steps, cardPool, cardById]);
            const answerQuiz = (id) => {
                if (answer || !quizStep) return;
                const ok = id === quizStep.mainCardInstanceId;
                setAnswer(id);
                setScore(sc => ok ? { ...sc, ok: sc.ok + 1 } : { ...sc, wrong: [...sc.wrong, p + 1] });
            };
            const nextQuiz = () => { setAnswer(null); go(p + 1); };
            useEffect(() => {
                if (!practice || !answer || !quizStep || answer !== quizStep.mainCardInstanceId) return;
                const tm = setTimeout(() => { setAnswer(null); go(p + 1); }, 900);
                return () => clearTimeout(tm);
            }, [practice, answer, p, quizStep, go]);

            useEffect(() => {
                const onKey = (e) => {
                    if (e.ctrlKey || e.metaKey || e.altKey) return;
                    if (practice && e.key !== 'Escape') return;
                    let handled = true;
                    if (e.key === 'Escape') { if (zoomCard) setZoomCard(null); else if (pileOpen) setPileOpen(null); else onClose(); }
                    else if (e.key === 'ArrowRight') manualGo(p + 1);
                    else if (e.key === 'ArrowLeft') manualGo(p - 1);
                    else if (e.key === 'Home') manualGo(0);
                    else if (e.key === 'End') manualGo(total);
                    else if (e.key === ' ' && !(e.target && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(e.target.tagName))) togglePlay();
                    else handled = false;
                    if (handled) { e.preventDefault(); e.stopPropagation(); }
                };
                window.addEventListener('keydown', onKey, true);
                return () => window.removeEventListener('keydown', onKey, true);
            }, [p, total, go, zoomCard, pileOpen, onClose, playing, practice]);

            useEffect(() => {
                const prev = document.body.style.overflow;
                document.body.style.overflow = 'hidden';
                return () => { document.body.style.overflow = prev; };
            }, []);

            // Mantiene visible la jugada actual en la lista (solo cuando la lista tiene su propia barra, en pantallas grandes).
            useEffect(() => {
                const box = listRef.current;
                const row = box && box.querySelector('[data-active="true"]');
                if (!row || box.scrollHeight <= box.clientHeight) return;
                if (row.offsetTop < box.scrollTop) box.scrollTop = row.offsetTop - 8;
                else if (row.offsetTop + row.offsetHeight > box.scrollTop + box.clientHeight) box.scrollTop = row.offsetTop + row.offsetHeight - box.clientHeight + 8;
            }, [p]);

            const hl = new Set((board.last && board.last.uids) || []);
            const mainUid = board.last && board.last.mainUid;
            const cardButton = (card) => {
                const c = cardById[card.id];
                const isHl = hl.has(card.uid), isMain = card.uid === mainUid;
                const mats = card.materials || [];
                return (
                    <button type="button" key={isHl ? card.uid + '@' + p : card.uid} onClick={(e) => { e.stopPropagation(); if (c) setZoomCard(c); }} title={c ? c.name : '?'} aria-label={c ? c.name : '?'}
                        className={`play-card ${card.faceDown ? 'play-down' : ''} ${isMain ? 'play-main' : isHl ? 'play-hl' : ''}`}>
                        {c && c.image_url_small ? <img src={c.image_url_small} alt="" draggable={false} /> : <span className="play-noimg">{c ? c.name : '?'}</span>}
                        {card.faceDown && <span className="play-badge"><i className="fas fa-eye-slash"></i></span>}
                        {mats.length > 0 && <span className="play-count"><i className="fas fa-layer-group"></i> {mats.length}</span>}
                    </button>
                );
            };
            const slot = (zone, kind, style) => (
                <div key={zone} className={`play-slot play-slot-${kind}`} style={style}>
                    {board.slots[zone] ? cardButton(board.slots[zone]) : <span className="play-slot-label">{ZONE_ABBREVIATIONS[zone]}</span>}
                </div>
            );
            const pile = (key, style) => {
                const list = board[key];
                const top = list[list.length - 1];
                const faceDown = key === 'deck' || key === 'extra';
                const isHl = list.some(c => hl.has(c.uid));
                const topCard = top && cardById[top.id];
                return (
                    <button type="button" key={key + (isHl ? '@' + p : '')} style={style} onClick={() => setPileOpen(key)} title={t(PLAY_PILE_LABEL[key])} aria-label={`${t(PLAY_PILE_LABEL[key])}: ${list.length}`}
                        className={`play-slot play-slot-pile ${isHl ? 'play-pile-hl' : ''}`}>
                        {faceDown ? (list.length > 0 && <span className="play-back"></span>) : (topCard && topCard.image_url_small && <img className="play-pile-img" src={topCard.image_url_small} alt="" draggable={false} />)}
                        <span className="play-slot-label play-pile-label">{t(PLAY_PILE_LABEL[key])}</span>
                        {list.length > 0 && <span className="play-count">{list.length}</span>}
                    </button>
                );
            };

            const curStep = p > 0 ? steps[p - 1] : null;
            const curCard = curStep && cardById[curStep.mainCardInstanceId];
            const rowClass = (active) => `w-full flex items-start gap-2 text-left px-2 py-2 min-h-[2.75rem] rounded-md text-sm ${active ? 'bg-[var(--color-primary)] text-white' : 'hover:bg-[var(--color-surface-light)]'}`;
            const navClass = 'w-16 h-14 sm:w-20 rounded-xl bg-[var(--color-primary)] text-white text-2xl flex items-center justify-center hover:bg-[var(--color-primary-hover)] disabled:opacity-30 disabled:cursor-not-allowed';

            return (
                <div className="play-overlay fixed inset-0 z-[60] flex flex-col text-[var(--color-text)]" role="dialog" aria-modal="true" aria-label={t('playCombo')}>
                    <header className="shrink-0 flex flex-wrap items-center gap-2 px-3 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                        <i className="fas fa-play text-amber-500"></i>
                        <h2 className="font-bold truncate flex-1 min-w-0">{comboTitle || t('untitledCombo')} <span className="hidden sm:inline font-normal text-[var(--color-text-muted)]">· {t('playCombo')}</span><span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[10px] font-bold uppercase tracking-wide align-middle">Beta</span></h2>
                        {branchFrom && <button type="button" onClick={() => setBranchFrom(null)} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm font-semibold"><i className="fas fa-undo mr-1"></i>{t('branchBack')}</button>}
                        {handOptions.length > 1 && pos === 0 && (
                            <div className="flex flex-wrap gap-1 order-last sm:order-none w-full sm:w-auto">
                                {handOptions.map((_, i) => (
                                    <button key={i} type="button" onClick={() => setHandIdx(i)} className={`px-3 py-2 rounded-md text-sm font-semibold ${i === handIdx ? 'bg-amber-500 text-slate-900' : 'bg-[var(--color-surface-light)] hover:opacity-80'}`}>{t('playHandOption', { n: i + 1 })}</button>
                                ))}
                            </div>
                        )}
                        <div className="flex rounded-md overflow-hidden border border-[var(--color-border)]" role="group">
                            <button type="button" onClick={stopPractice} aria-pressed={!practice} className={`px-3 py-2 text-sm font-semibold ${!practice ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-light)]'}`}><i className="fas fa-eye mr-1"></i>{t('playModeWatch')}</button>
                            <button type="button" onClick={startPractice} disabled={total === 0} aria-pressed={practice} className={`px-3 py-2 text-sm font-semibold disabled:opacity-40 ${practice ? 'bg-amber-500 text-slate-900' : 'bg-[var(--color-surface-light)]'}`}><i className="fas fa-graduation-cap mr-1"></i>{t('playModePractice')}</button>
                        </div>
                        <button type="button" onClick={onClose} title={t('playClose')} aria-label={t('playClose')} className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-[var(--color-surface-light)] hover:bg-red-600 hover:text-white"><i className="fas fa-times"></i></button>
                    </header>

                    <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
                        <section data-gif-capture="1" className="flex-none lg:flex-1 lg:min-h-0 lg:overflow-y-auto p-3 flex flex-col items-center gap-3">
                            {practice ? (
                            <div className="w-full max-w-[42rem] rounded-lg p-3 bg-[var(--color-surface)] border-2 border-amber-500/60">
                                {quizStep ? (
                                    <React.Fragment>
                                        <div className="font-semibold">{t('practiceQuestion', { n: p + 1, total })}</div>
                                        {!answer && <p className="text-xs text-[var(--color-text-muted)] mt-1">{t('practiceHint')}</p>}
                                        <div className="grid grid-cols-4 gap-2 mt-3">
                                            {quizOptions.map(id => {
                                                const c = cardById[id];
                                                const isRight = id === quizStep.mainCardInstanceId;
                                                const look = !answer ? 'hover:ring-2 hover:ring-amber-400' : isRight ? 'ring-4 ring-green-500' : (answer === id ? 'ring-4 ring-red-500 opacity-80' : 'opacity-40');
                                                return (
                                                    <button key={id} type="button" onClick={() => answerQuiz(id)} disabled={!!answer} title={c ? c.name : ''} className={`rounded-md overflow-hidden bg-black/20 text-[0.7rem] leading-tight text-center p-1 ${look}`}>
                                                        {c && c.image_url_small ? <img src={c.image_url_small} alt="" className="w-full rounded" draggable="false" /> : null}
                                                        <span className="block mt-1">{c ? c.name : '?'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            {!answer && <button type="button" onClick={() => answerQuiz('reveal')} className="px-3 py-2 rounded-md bg-[var(--color-surface-light)] text-sm font-semibold">{t('practiceDontKnow')}</button>}
                                            {answer && answer === quizStep.mainCardInstanceId && <span className="text-green-400 font-bold">✓ {t('practiceCorrect')}</span>}
                                            {answer && answer !== quizStep.mainCardInstanceId && (
                                                <React.Fragment>
                                                    <span className="text-red-400 font-semibold">✗ {t('practiceWrong')} <b className="text-[var(--color-text)]">{(cardById[quizStep.mainCardInstanceId] || {}).name || '?'}</b> · {playActionEmoji(quizStep)} {playActionText(quizStep)}</span>
                                                    <button type="button" onClick={nextQuiz} className="ml-auto px-4 py-2 rounded-md bg-amber-500 text-slate-900 font-bold">{t('practiceNext')} →</button>
                                                </React.Fragment>
                                            )}
                                        </div>
                                        {answer && answer !== quizStep.mainCardInstanceId && quizStep.actionDescription && <p className="text-sm mt-2 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: sanitizeHTML(quizStep.actionDescription) }}></p>}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <div className="font-bold text-lg">🎉 {t('practiceDone')}</div>
                                        <p className="mt-1">{t('practiceScore', { ok: score.ok, total })}</p>
                                        {score.wrong.length ? (
                                            <div className="mt-2 text-sm">
                                                <div className="font-semibold">{t('practiceReview')}</div>
                                                <ul className="list-disc pl-5">{score.wrong.map(n => { const st = steps[n - 1]; const c = st && cardById[st.mainCardInstanceId]; return <li key={n}>{n}. {c ? c.name : '?'} · {st ? playActionText(st) : ''}</li>; })}</ul>
                                            </div>
                                        ) : <p className="mt-1 text-green-400 font-semibold">{t('practicePerfect')}</p>}
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <button type="button" onClick={startPractice} className="px-4 py-2 rounded-md bg-amber-500 text-slate-900 font-bold">{t('practiceAgain')}</button>
                                            <button type="button" onClick={stopPractice} className="px-4 py-2 rounded-md bg-[var(--color-surface-light)] font-semibold">{t('playModeWatch')}</button>
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                            ) : (
                            <div className="w-full max-w-[42rem] rounded-lg p-3 bg-[var(--color-surface)] border border-[var(--color-border)]">
                                {groupAt[p] && <div className="text-xs font-bold uppercase tracking-wide text-amber-500 mb-1">{groupAt[p]}</div>}
                                {curStep ? (
                                    <React.Fragment>
                                        <div className="font-semibold flex flex-wrap items-center gap-x-2">
                                            <span className="text-[var(--color-accent)]">{playActionEmoji(curStep)} {playActionText(curStep)}</span>
                                            <span>{curCard ? curCard.name : '?'}</span>
                                            {board.last && board.last.dest && <span className="text-[var(--color-text-muted)]">→ {playDestLabel(board.last.dest, t)}</span>}
                                        </div>
                                        {curStep.actionDescription && <p className="text-sm mt-1 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: sanitizeHTML(curStep.actionDescription) }}></p>}
                                        {curStep.branch && curStep.branch.steps && curStep.branch.steps.length > 0 && !branchFrom && (
                                            <button type="button" onClick={() => setBranchFrom(curStep.id)} className="mt-2 px-3 py-2 rounded-md bg-red-600/80 hover:bg-red-600 text-white text-sm font-semibold"><i className="fas fa-code-branch mr-2"></i>{t('branchView')}: {curStep.branch.title || t('branchLabel')}</button>
                                        )}
                                        {curStep.vulnerability && (() => { const vNames = (curStep.vulnerability.cards || []).map(vc => (vc.card || cardById[vc.instanceId] || {}).name).filter(Boolean).join(', '); if (vNames) return <p className="text-xs mt-1 text-red-500">⚠️ {vNames}</p>; return curStep.vulnerability.text ? <p className="text-xs mt-1 text-red-500">⚠️ <span dangerouslySetInnerHTML={{ __html: sanitizeHTML(curStep.vulnerability.text) }}></span></p> : null; })()}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <div className="font-semibold">{t('startingHandTitle')}</div>
                                        <p className="text-sm mt-1 text-[var(--color-text-muted)]">{total ? t('playStartHint') : t('playNoSteps')}</p>
                                    </React.Fragment>
                                )}
                                {notesAt[p].map((n, i) => <p key={i} className="text-sm mt-2 p-2 rounded border-l-4 border-yellow-500 bg-yellow-500/15 whitespace-pre-wrap break-words"><i className="fas fa-sticky-note mr-1 text-yellow-500"></i>{n}</p>)}
                            </div>
                            )}
                            <div className="w-full max-w-[42rem] play-field">
                                {slot('Extra Monster 1', 'emz', { gridColumn: 3, gridRow: 1 })}
                                {slot('Extra Monster 2', 'emz', { gridColumn: 5, gridRow: 1 })}
                                {pile('banish', { gridColumn: 7, gridRow: 1 })}
                                {slot('Field Zone', 'fieldzone', { gridColumn: 1, gridRow: 2 })}
                                {PLAY_MMZ.map((z, i) => slot(z, 'monster', { gridColumn: i + 2, gridRow: 2 }))}
                                {pile('gy', { gridColumn: 7, gridRow: 2 })}
                                {pile('extra', { gridColumn: 1, gridRow: 3 })}
                                {PLAY_STZ.map((z, i) => slot(z, 'st', { gridColumn: i + 2, gridRow: 3 }))}
                                {pile('deck', { gridColumn: 7, gridRow: 3 })}
                            </div>

                            <div className="w-full max-w-[42rem]">
                                <div className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">{t('playHand')} ({board.hand.length})</div>
                                <div className="flex gap-1.5 overflow-x-auto pt-1 pb-2 px-1 min-h-[4rem]">
                                    {board.hand.length > 0
                                        ? board.hand.map(c => <div key={c.uid} className="play-cardbox play-hand-w">{cardButton(c)}</div>)
                                        : <span className="text-sm text-[var(--color-text-muted)] self-center">{t('playEmpty')}</span>}
                                </div>
                            </div>
                        </section>

                        <aside className="flex-none lg:w-80 lg:min-h-0 flex flex-col border-t lg:border-t-0 lg:border-l border-[var(--color-border)] bg-[var(--color-surface)]">
                            <h3 className="px-3 pt-3 pb-1 font-semibold text-[var(--color-secondary)]">{t('playMoves')}</h3>
                            <div ref={listRef} className="relative px-2 pb-3 lg:flex-1 lg:min-h-0 lg:overflow-y-auto">
                                <button type="button" data-active={p === 0} onClick={() => { if (!practice) manualGo(0); }} className={rowClass(p === 0)}>
                                    <span className="w-7 shrink-0 text-right font-bold opacity-70">0.</span><span>{t('startingHandTitle')}</span>
                                </button>
                                {rows.map(r => {
                                    if (r.kind === 'group') return <div key={r.key} className="px-2 pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-amber-500">{r.text}</div>;
                                    if (r.kind === 'note' && practice) return null;
                                    if (r.kind === 'step' && practice && r.pos > p) return <div key={r.key} className={rowClass(false) + ' opacity-50'}><span className="w-7 shrink-0 text-right font-bold opacity-70">{r.pos}.</span><span>? ? ?</span></div>;
                                    if (r.kind === 'note') return <div key={r.key} className="pl-11 pr-2 py-1 text-xs italic text-[var(--color-text-muted)] line-clamp-2 break-words">📝 {r.text}</div>;
                                    const st = r.step;
                                    const dest = boards[r.pos].last && boards[r.pos].last.dest;
                                    const card = cardById[st.mainCardInstanceId];
                                    return (
                                        <button key={r.key} type="button" data-active={p === r.pos} onClick={() => { if (!practice) manualGo(r.pos); }} className={rowClass(p === r.pos)} title={card ? card.name : ''}>
                                            <span className="w-7 shrink-0 text-right font-bold opacity-70">{r.pos}.</span>
                                            <span className="min-w-0 break-words"><b>{shortNames[st.mainCardInstanceId] || '?'}</b> {playActionEmoji(st)} {playActionText(st)}{dest ? ` → ${playDestLabel(dest, t)}` : ''}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>
                    </div>

                    <footer className="shrink-0 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 pt-2 border-t border-[var(--color-border)] bg-[var(--color-surface)]" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
                        <button type="button" onClick={() => manualGo(p - 1)} disabled={p === 0} title={t('playPrev')} aria-label={t('playPrev')} className={`${navClass} ${practice ? 'hidden' : ''}`}><i className="fas fa-chevron-left"></i></button>
                        <button type="button" onClick={togglePlay} disabled={total === 0} title={playing ? t('playPause') : t('playPlay')} aria-label={playing ? t('playPause') : t('playPlay')} className={`${navClass} !bg-amber-500 !text-slate-900 hover:!bg-amber-400 ${practice ? 'hidden' : ''}`}><i className={`fas ${playing ? 'fa-pause' : 'fa-play'}`}></i></button>
                        <div className="min-w-[8.5rem] text-center font-semibold" aria-live="polite">{t('stepBreadcrumb', { current: p, total })}</div>
                        <button type="button" onClick={() => manualGo(p + 1)} disabled={p >= total} title={t('playNext')} aria-label={t('playNext')} className={`${navClass} ${practice ? 'hidden' : ''}`}><i className="fas fa-chevron-right"></i></button>
                        <button type="button" onClick={() => setGifState({ phase: 'options' })} disabled={total === 0} title={t('gifTitle')} aria-label={t('gifTitle')} className={`h-14 px-4 rounded-xl bg-[var(--color-surface-light)] text-[var(--color-text)] font-bold flex items-center gap-2 hover:bg-[var(--color-primary)] hover:text-white disabled:opacity-30 ${practice ? 'hidden' : ''}`}><i className="fas fa-film"></i> GIF</button>
                        <label className={`flex items-center gap-2 text-sm text-[var(--color-text-muted)] ${practice ? 'hidden' : ''}`}>
                            <i className="fas fa-tachometer-alt" aria-hidden="true"></i>
                            <select value={speed} onChange={e => setSpeed(e.target.value)} aria-label={t('playSpeed')} title={t('playSpeed')} className="bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-md p-2 text-sm text-[var(--color-text)]">
                                <option value="slow">{t('speedSlow')}</option>
                                <option value="normal">{t('speedNormal')}</option>
                                <option value="fast">{t('speedFast')}</option>
                            </select>
                        </label>
                    </footer>

                    {gifState && (
                        <div className="absolute inset-0 z-20 bg-black/70 flex items-center justify-center p-4" onClick={() => { if (gifState.phase !== 'working') { if (gifState.url) URL.revokeObjectURL(gifState.url); setGifState(null); } }}>
                            <div className="w-full max-w-md max-h-[90%] overflow-y-auto bg-[var(--color-surface)] rounded-2xl shadow-xl p-4" onClick={e => e.stopPropagation()}>
                                <h3 className="font-semibold mb-2"><i className="fas fa-film mr-2"></i>{t('gifTitle')}</h3>
                                {gifState.phase === 'options' && (
                                    <React.Fragment>
                                        <p className="text-sm text-[var(--color-text-muted)] mb-3">{t('gifHelp')}</p>
                                        <div className="flex gap-2 mb-3">
                                            {[['small', t('gifSmall')], ['large', t('gifLarge')]].map(([k, l]) => <button key={k} type="button" onClick={() => setGifSize(k)} className={`flex-1 py-2 rounded-md text-sm font-semibold ${gifSize === k ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface-light)]'}`}>{l}</button>)}
                                        </div>
                                        <p className="text-xs text-[var(--color-text-muted)] mb-3">{t('gifSpeedNote')}: {t(speed === 'slow' ? 'speedSlow' : speed === 'fast' ? 'speedFast' : 'speedNormal')}</p>
                                        <div className="flex justify-end gap-2">
                                            <button type="button" onClick={() => setGifState(null)} className="px-4 py-2 rounded-md bg-[var(--color-surface-light)]">{t('cancel')}</button>
                                            <button type="button" onClick={makeGif} className="px-4 py-2 rounded-md bg-amber-500 text-slate-900 font-bold">{t('gifCreate')}</button>
                                        </div>
                                    </React.Fragment>
                                )}
                                {gifState.phase === 'working' && (
                                    <React.Fragment>
                                        <p className="text-sm mb-2">{t('gifWorking', { done: gifState.done, total: gifState.total })}</p>
                                        <div className="w-full h-3 bg-[var(--color-surface-light)] rounded-full overflow-hidden"><div className="h-3 bg-amber-500" style={{ width: `${Math.round(gifState.done / gifState.total * 100)}%` }}></div></div>
                                    </React.Fragment>
                                )}
                                {gifState.phase === 'ready' && (
                                    <React.Fragment>
                                        <img src={gifState.url} alt="GIF" className="w-full rounded border border-[var(--color-border)]" />
                                        <p className="text-xs text-[var(--color-text-muted)] mt-2">{(gifState.bytes / 1048576).toFixed(1)} MB</p>
                                        <div className="flex justify-end gap-2 mt-3">
                                            <button type="button" onClick={() => { URL.revokeObjectURL(gifState.url); setGifState(null); }} className="px-4 py-2 rounded-md bg-[var(--color-surface-light)]">{t('closeLabel')}</button>
                                            <a href={gifState.url} download={`${(comboTitle || 'combo').replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 60) || 'combo'}.gif`} className="px-4 py-2 rounded-md bg-green-600 text-white font-bold"><i className="fas fa-download mr-2"></i>{t('gifDownload')}</a>
                                        </div>
                                    </React.Fragment>
                                )}
                                {gifState.phase === 'error' && (
                                    <React.Fragment>
                                        <p className="text-sm text-red-400">{t('gifError')}</p>
                                        <div className="flex justify-end mt-3"><button type="button" onClick={() => setGifState(null)} className="px-4 py-2 rounded-md bg-[var(--color-surface-light)]">{t('closeLabel')}</button></div>
                                    </React.Fragment>
                                )}
                            </div>
                        </div>
                    )}
                    {pileOpen && (
                        <div className="absolute inset-0 z-10 bg-black/70 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setPileOpen(null)}>
                            <div className="w-full sm:max-w-lg max-h-[75%] flex flex-col bg-[var(--color-surface)] rounded-t-2xl sm:rounded-2xl shadow-xl" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-between gap-2 p-3 border-b border-[var(--color-border)]">
                                    <h3 className="font-semibold">{t(PLAY_PILE_LABEL[pileOpen])} ({board[pileOpen].length})</h3>
                                    <button type="button" onClick={() => setPileOpen(null)} title={t('playClose')} aria-label={t('playClose')} className="w-11 h-11 rounded-full flex items-center justify-center text-xl bg-[var(--color-surface-light)]"><i className="fas fa-times"></i></button>
                                </div>
                                <div className="overflow-y-auto p-3">
                                    {board[pileOpen].length > 0 ? (
                                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                                            {[...board[pileOpen]].reverse().map(c => (
                                                <div key={c.uid} className="flex flex-col items-center gap-1 min-w-0">
                                                    <div className="play-cardbox w-full">{cardButton(c)}</div>
                                                    <span className="text-[10px] leading-tight text-center line-clamp-2 break-words w-full">{cardById[c.id] ? cardById[c.id].name : '?'}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : <p className="text-center py-6 text-[var(--color-text-muted)]">{t('playEmpty')}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {zoomCard && (
                        <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center gap-3 p-4" onClick={() => setZoomCard(null)}>
                            <button type="button" onClick={() => setZoomCard(null)} title={t('playClose')} aria-label={t('playClose')} className="absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center text-xl bg-white/15 text-white"><i className="fas fa-times"></i></button>
                            <img src={zoomCard.image_url || zoomCard.image_url_small} alt={zoomCard.name} className="max-h-[75%] max-w-full rounded-lg shadow-2xl" />
                            <p className="text-white font-semibold text-center">{zoomCard.name}</p>
                        </div>
                    )}
                </div>
            );
        };

        const App = () => {
            const [isLoading, setIsLoading] = useState(true);
            const [language, setLanguage] = useState(() => { const saved = localStorage.getItem('ygo_lang'); if (isSupportedLanguage(saved)) return saved; const first = (navigator.languages || [navigator.language || 'en']).map(l => (l || '').slice(0, 2).toLowerCase()).find(isSupportedLanguage); return first || 'en'; });
            const [searchTerm, setSearchTerm] = useState('');
            const [searchResults, setSearchResults] = useState([]);
            const [suggestions, setSuggestions] = useState([]);
            const [isLoadingSearch, setIsLoadingSearch] = useState(false);
            const [selectedCardForZoom, setSelectedCardForZoom] = useState(null);
            const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
            const [isExportingPng, setIsExportingPng] = useState(false);
            const [pngPreviewUrl, setPngPreviewUrl] = useState(null);
            const [draggedItem, setDraggedItem] = useState(null);
            const [showExportOptionsModal, setShowExportOptionsModal] = useState(false);
            const [filters, setFilters] = useState({ type: '', attribute: '', level: '', archetype: '' });
            const [archetypes, setArchetypes] = useState([]);
            const [allTokens, setAllTokens] = useState([]);
            const [isAddingToken, setIsAddingToken] = useState(false);
            const [exportProgress, setExportProgress] = useState(0);
            const [exportMessage, setExportMessage] = useState('');
            const [isApiReady, setIsApiReady] = useState(false);
            const [apiCheckMessage, setApiCheckMessage] = useState('');
            const [currentPage, setCurrentPage] = useState(1);
            const [contextMenu, setContextMenu] = useState({ card: null, x: 0, y: 0, options: [] });
            const [showFilters, setShowFilters] = useState(false);
            const [highlightedCardIds, setHighlightedCardIds] = useState([]);
            const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
            const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
            const [isCardPoolOpen, setIsCardPoolOpen] = useState(true);
            const [isStatsOpen, setIsStatsOpen] = useState(false);
            const [openStepMenuId, setOpenStepMenuId] = useState(null);
            const [showTokenPicker, setShowTokenPicker] = useState(false);
            const [showMoreMenu, setShowMoreMenu] = useState(false);
            const [wiggleKeys, setWiggleKeys] = useState(() => new Set());
            const [movePicker, setMovePicker] = useState(null); // { stepId, instanceId, top, left }
            const [openSide, setOpenSide] = useState(null); // 'stepId:left' | 'stepId:right' (celular)
            const [stepSize, setStepSize] = useState(() => { try { const v = localStorage.getItem('ygo_step_size'); return ['s', 'm', 'l'].includes(v) ? v : 'm'; } catch (e) { return 'm'; } });
            useEffect(() => { try { localStorage.setItem('ygo_step_size', stepSize); } catch (e) {} }, [stepSize]);
            useEffect(() => {
                if (!movePicker) return;
                const onDown = (e) => { if (!(e.target.closest && e.target.closest('[data-move-picker]'))) setMovePicker(null); };
                const onKey = (e) => { if (e.key === 'Escape') setMovePicker(null); };
                document.addEventListener('pointerdown', onDown);
                document.addEventListener('keydown', onKey);
                return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
            }, [movePicker]);
            const [showShortcuts, setShowShortcuts] = useState(false);
            const [showImportDeck, setShowImportDeck] = useState(false);
            const [inspectorOn, setInspectorOn] = useState(() => { try { return localStorage.getItem('ygo_inspector') === '1'; } catch (e) { return false; } });
            const [inspectCard, setInspectCard] = useState(null);
            const toggleInspector = () => setInspectorOn(v => { const nv = !v; try { localStorage.setItem('ygo_inspector', nv ? '1' : '0'); } catch (e) {} return nv; });
            useEffect(() => {
                if (!showMoreMenu) return;
                const onDown = (e) => { if (!(e.target.closest && e.target.closest('[data-more-menu]'))) setShowMoreMenu(false); };
                const onKey = (e) => { if (e.key === 'Escape') setShowMoreMenu(false); };
                document.addEventListener('pointerdown', onDown);
                document.addEventListener('keydown', onKey);
                return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
            }, [showMoreMenu]);
            const scrollToSection = (sel) => { const el = document.querySelector(sel); if (!el) return; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => { if (Math.abs(el.getBoundingClientRect().top) > 60) el.scrollIntoView({ block: 'start' }); }, 700); };
            const [showWelcome, setShowWelcome] = useState(false);
            const [bgAnimated, setBgAnimated] = useState(window.__ygoBgAnimated !== false);
            const [stepsView, setStepsView] = useState(() => { try { const v = localStorage.getItem('ygo_steps_view2'); return (v === 'list' || v === 'compact') ? v : 'grid'; } catch (e) { return 'grid'; } });
            useEffect(() => { try { localStorage.setItem('ygo_steps_view2', stepsView); } catch (e) {} }, [stepsView]);
            const [isStartingHandOpen, setIsStartingHandOpen] = useState(true);
            const [isFinalBoardOpen, setIsFinalBoardOpen] = useState(true);
            const [isStepsOpen, setIsStepsOpen] = useState(true);
            const [isNotesOpen, setIsNotesOpen] = useState(true);
            const [showSaveModal, setShowSaveModal] = useState(false);
            const [showLoadModal, setShowLoadModal] = useState(false);
            const [tutorialState, setTutorialState] = useState({ active: false, steps: [], key: 'main' });
            const [notification, setNotification] = useState({ show: false, message: '' });
            const [showRestoreNotification, setShowRestoreNotification] = useState(false);
            const [toast, setToast] = useState({ show: false, message: '', onUndo: null });
            const [isFlyoutButtonVisible, setIsFlyoutButtonVisible] = useState(false);
            const [isFlyoutPoolOpen, setIsFlyoutPoolOpen] = useState(false);
            const [justAddedCardId, setJustAddedCardId] = useState(null);
            const [hoveredCard, setHoveredCard] = useState({ card: null, x: 0, y: 0 });
            const [dragOverIndex, setDragOverIndex] = useState(null);
            const [touchDragGhost, setTouchDragGhost] = useState(null);
            const [showCustomCardModal, setShowCustomCardModal] = useState(false);
            const [editingCustomCard, setEditingCustomCard] = useState(null);
            const [deleteFromIndex, setDeleteFromIndex] = useState(null);
            const [zonePickerStepId, setZonePickerStepId] = useState(null);
            const [isPlayOpen, setIsPlayOpen] = useState(false);
            const closePlay = useCallback(() => setIsPlayOpen(false), []);
            
            // Firebase State
            const [db, setDb] = useState(null);
            const [user, setUser] = useState(null);
            const [isOnlineSaveEnabled, setIsOnlineSaveEnabled] = useState(false);
            const appId = useMemo(() => typeof __app_id !== 'undefined' ? __app_id : 'default-app-id', []);

            const [exportOptions, setExportOptions] = useState(() => {
                let savedStyle = {};
                try { savedStyle = JSON.parse(localStorage.getItem('ygo_export_style') || '{}') || {}; } catch (e) {}
                return { include: { startingHand: true, comboSteps: true, finalBoard: true, notes: true, comboStats: true, qr: true }, scale: 2, stepsPerRow: 4, theme: savedStyle.theme || 'dark', cardFilter: savedStyle.cardFilter || 'color', layout: ['quick', 'discord'].includes(savedStyle.layout) ? savedStyle.layout : 'full', boardView: ['board', 'cards', 'both'].includes(savedStyle.boardView) ? savedStyle.boardView : 'board', paper: savedStyle.paper || 'auto', paperW: savedStyle.paperW ?? 21.6, paperH: savedStyle.paperH ?? 33, paperUnit: savedStyle.paperUnit || 'cm' };
            });
            // Se recuerda el estilo de exportación (fondo y color de cartas) para la próxima vez.
            useEffect(() => { try { localStorage.setItem('ygo_export_style', JSON.stringify({ theme: exportOptions.theme, cardFilter: exportOptions.cardFilter, layout: exportOptions.layout, boardView: exportOptions.boardView, paper: exportOptions.paper, paperW: exportOptions.paperW, paperH: exportOptions.paperH, paperUnit: exportOptions.paperUnit })); } catch (e) {} }, [exportOptions.theme, exportOptions.cardFilter, exportOptions.layout, exportOptions.boardView, exportOptions.paper, exportOptions.paperW, exportOptions.paperH, exportOptions.paperUnit]);
            const initialComboState = { cardPool: [], startingHand: [[]], comboSteps: [], finalBoardCards: [], comboTitle: '', notes: '', };
            const { state: comboState, setState: setComboStateRaw, loadState, undo, redo, canUndo, canRedo } = useHistoryState(initialComboState);
            // Cartas elegidas de la base de datos que todavía no están en el pool: entran con el siguiente cambio
            const pendingPoolRef = useRef([]);
            const setComboState = (newState, description) => {
                const pending = pendingPoolRef.current;
                if (pending.length) {
                    pendingPoolRef.current = [];
                    const pool = newState.cardPool || [];
                    const extra = pending.filter(p => !pool.some(c => c.instanceId === p.instanceId));
                    if (extra.length) newState = { ...newState, cardPool: [...pool, ...extra] };
                }
                setComboStateRaw(newState, description);
            };
            const { cardPool, startingHand, comboSteps, finalBoardCards, comboTitle, notes } = comboState;
            const comboMeta = comboState.meta || {};
            const [metaOpen, setMetaOpen] = useState(false);
            const searchAbortController = useRef(null);
            const langMenuRef = useRef(null);
            const cardPoolSectionRef = useRef(null);
            
            useEffect(() => { document.documentElement.lang = language; }, [language]);
            // Solo se recuerda el idioma cuando la persona lo elige; si no, se sigue el idioma de su sistema.
            const chooseLanguage = (lang) => { setLanguage(lang); try { localStorage.setItem('ygo_lang', lang); } catch (e) {} };
            CURRENT_LANG = language;
            const t = useCallback((key, params = {}) => { let str = (translations[language] && translations[language][key]) || translations['en'][key] || key; for (const param in params) { str = str.replace(`{${param}}`, params[param]); } return str; }, [language]);
            const tutorialSteps = useMemo(() => ({ main: [ { targetSelector: '.popular-cards-carousel', title: t('tutorialTitlePopularCards'), content: t('tutorialContentPopularCards') }, { targetSelector: '.starting-hand', title: t('tutorialTitleHand'), content: t('tutorialContentHand') }, { targetSelector: '.combo-steps', title: t('tutorialTitleSteps'), content: t('tutorialContentSteps') }, { targetSelector: '.final-board', title: t('tutorialTitleFinalBoard'), content: t('tutorialContentFinalBoard') }, { targetSelector: '.notes-section', title: t('tutorialTitleNotes'), content: t('tutorialContentNotes') }, { targetSelector: '.main-actions', title: t('tutorialTitleActions'), content: t('tutorialContentActions') }, ], stepActions: [ { targetSelector: '.combo-step-card .tutorial-action-select', title: t('tutorialTitleStepActionSelect'), content: t('tutorialContentStepActionSelect') }, { targetSelector: '.combo-step-card .tutorial-vulnerability-btn', title: t('tutorialTitleStepVulnerability'), content: t('tutorialContentStepVulnerability') }, { targetSelector: '.combo-step-card .tutorial-add-target-btn', title: t('tutorialTitleStepAffectedCards'), content: t('tutorialContentStepAffectedCards') }, { targetSelector: '.combo-step-card .tutorial-description-input', title: t('tutorialTitleStepDescription'), content: t('tutorialContentStepDescription') }, ] }), [t]);
            const IMAGE_PROXY = 'https://images.weserv.nl/?url=';

            // Firebase Initialization Effect
            useEffect(() => {
                try {
                    const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
                    if (!firebaseConfig || !window.firebase) {
                        console.warn("Firebase config not found. Saving will be local-only.");
                        setIsOnlineSaveEnabled(false);
                        return;
                    }

                    if (firebase.apps.length === 0) {
                        firebase.initializeApp(firebaseConfig);
                    }
                    
                    const authInstance = firebase.auth();
                    const dbInstance = firebase.firestore();
                    firebase.firestore.setLogLevel('debug');
                    setDb(dbInstance);
                    setIsOnlineSaveEnabled(true);

                    const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser) => {
                        if (firebaseUser) {
                            setUser(firebaseUser);
                        } else {
                            try {
                                const token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
                                if (token) {
                                    await authInstance.signInWithCustomToken(token);
                                } else {
                                    await authInstance.signInAnonymously();
                                }
                            } catch (error) {
                                console.error("Firebase sign-in failed:", error);
                                setIsOnlineSaveEnabled(false);
                            }
                        }
                    });
                    return () => unsubscribe();
                } catch (error) {
                    console.error("Firebase initialization failed:", error);
                    setIsOnlineSaveEnabled(false);
                }
            }, []);

            useEffect(() => {
                const splashScreen = document.getElementById('splash-screen');
                if (isApiReady) {
                    const firstVisit = !localStorage.getItem('ygo_tutorial_main_completed');
                    const splashTimer = setTimeout(() => {
                        if (splashScreen) splashScreen.classList.add('hidden');
                        setIsLoading(false);
                        if (firstVisit && !localStorage.getItem('ygo_welcome_done')) setShowWelcome(true);
                        const footer = document.getElementById('app-footer');
                        if (footer) footer.classList.add('visible');
                    }, 2000);
                    return () => clearTimeout(splashTimer);
                }
            }, [isApiReady, tutorialSteps.main]);
            
            useEffect(() => {
                const handleScroll = () => {
                    if (cardPoolSectionRef.current) {
                        const rect = cardPoolSectionRef.current.getBoundingClientRect();
                        setIsFlyoutButtonVisible(rect.bottom < 50);
                    }
                };
                window.addEventListener('scroll', handleScroll);
                return () => window.removeEventListener('scroll', handleScroll);
            }, []);

            useEffect(() => {
                const autoSaveTimer = setTimeout(() => {
                    if (cardPool.length > 0 || comboSteps.length > 0 || finalBoardCards.length > 0 || comboTitle || notes) {
                        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(comboState));
                    }
                }, 10000);
                return () => clearTimeout(autoSaveTimer);
            }, [comboState]);

            useEffect(() => {
                if (new URLSearchParams(window.location.search).get('combo')) return; // al abrir un enlace, la copia se guarda aparte
                const autoSavedData = localStorage.getItem(AUTO_SAVE_KEY);
                if (autoSavedData) {
                    setShowRestoreNotification(true);
                }
            }, []);

            const handleRestore = () => {
                const autoSavedData = localStorage.getItem(AUTO_SAVE_KEY);
                if (autoSavedData) {
                    try {
                        const loaded = JSON.parse(autoSavedData);
                        loadState(loaded, "Restored from Autosave");
                    } catch (e) { console.error("Failed to parse autosaved combo", e); }
                }
                setShowRestoreNotification(false);
            };

            useEffect(() => {
                const handleKeyDown = (e) => {
                    const tgt = e.target;
                    const typing = tgt && (/^(INPUT|TEXTAREA|SELECT)$/.test(tgt.tagName) || tgt.isContentEditable);
                    if (!typing && !e.ctrlKey && !e.metaKey && !e.altKey && !isPlayOpen) {
                        if (e.key === '/') { e.preventDefault(); setIsSearchPanelOpen(true); setTimeout(() => { const i = document.querySelector('#search-panel input'); if (i) i.focus(); }, 120); return; }
                        if (e.key === 'n' || e.key === 'N') { const b = document.querySelector('.steps-add-slot button'); if (b) { e.preventDefault(); b.scrollIntoView({ block: 'center' }); b.click(); } return; }
                        if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setIsPlayOpen(true); return; }
                        if (e.key === 'e' || e.key === 'E') { e.preventDefault(); setShowExportOptionsModal(true); return; }
                        if (e.key === '?') { e.preventDefault(); setShowShortcuts(v => !v); return; }
                    }
                    if (e.ctrlKey || e.metaKey) {
                        if (e.key === 'z') { e.preventDefault(); undo(); }
                        if (e.key === 'y') { e.preventDefault(); redo(); }
                        if (e.key === 's') { e.preventDefault(); setShowSaveModal(true); }
                    }
                    if (e.key === 'Escape') {
                        if (pngPreviewUrl) setPngPreviewUrl(null);
                        else if (selectedCardForZoom) setSelectedCardForZoom(null);
                        else if (showClearConfirmModal) setShowClearConfirmModal(false);
                        else if (showExportOptionsModal) setShowExportOptionsModal(false);
                        else if (showSaveModal) setShowSaveModal(false);
                        else if (showLoadModal) setShowLoadModal(false);
                        else if (showCustomCardModal) setShowCustomCardModal(false);
                        else if (contextMenu.card) closeContextMenu();
                    }
                };
                window.addEventListener('keydown', handleKeyDown);
                return () => window.removeEventListener('keydown', handleKeyDown);
            }, [undo, redo, pngPreviewUrl, selectedCardForZoom, showClearConfirmModal, showExportOptionsModal, showSaveModal, showLoadModal, showCustomCardModal, contextMenu.card, isPlayOpen]);


            useEffect(() => {
                const urlParams = new URLSearchParams(window.location.search);
                const comboData = urlParams.get('combo');
                if (comboData) {
                    // Si había un combo sin guardar, se guarda como copia en «Abrir» antes de reemplazarlo
                    let backedUp = false;
                    try {
                        const prevRaw = localStorage.getItem(AUTO_SAVE_KEY);
                        const prev = prevRaw ? JSON.parse(prevRaw) : null;
                        const hasContent = prev && ((prev.comboSteps || []).length || (prev.cardPool || []).length || (prev.finalBoardCards || []).length || prev.comboTitle || prev.notes);
                        if (hasContent) {
                            const stamp = new Date().toLocaleString();
                            localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${t('autoBackupPrefix')} · ${(prev.comboTitle || '').slice(0, 40)} ${stamp}`.trim(), prevRaw);
                            localStorage.removeItem(AUTO_SAVE_KEY);
                            backedUp = true;
                        }
                    } catch (e) { console.error('No se pudo guardar la copia del combo anterior', e); }
                    decodeComboFromUrl(comboData, IMAGE_PROXY)
                        .then(loaded => {
                            loadState(loaded, "Loaded from URL");
                            setNotification({ show: true, message: backedUp ? `${t('comboLoadedFromUrl')} ${t('linkBackupNotice')}` : t('comboLoadedFromUrl') });
                            window.history.replaceState({}, document.title, window.location.pathname);
                        })
                        .catch(e => {
                            console.error("Failed to load combo from URL:", e);
                            setNotification({ show: true, message: t('comboLoadFromUrlError') });
                        });
                }
            }, []);

            useEffect(() => {
                setApiCheckMessage(t('apiCheck'));
                fetch(`${YGOPRODECK_API_BASE_URL}?fname=Dark Magician`)
                    .then(res => res.ok ? res.json() : Promise.reject('API check failed'))
                    .then(() => {
                        setIsApiReady(true);
                        setApiCheckMessage(t('apiCheckSuccess'));
                    })
                    .catch(err => {
                        setIsApiReady(false);
                        setApiCheckMessage(t('apiCheckFail'));
                        console.error(err);
                    });
            }, [t]); 

            useEffect(() => { const mainTutorialCompleted = localStorage.getItem('ygo_tutorial_main_completed'); const stepActionsTutorialCompleted = localStorage.getItem('ygo_tutorial_stepActions_completed'); if (mainTutorialCompleted && !stepActionsTutorialCompleted && comboSteps.length === 1) { setTimeout(() => { setTutorialState({ active: true, steps: tutorialSteps.stepActions, key: 'stepActions' }); }, 100); } }, [comboSteps.length, tutorialSteps.stepActions]);
            useEffect(() => { if (notification.show) { const timer = setTimeout(() => { setNotification({ show: false, message: '' }); }, 2000); return () => clearTimeout(timer); } }, [notification.show]);
            useEffect(() => { const handleClickOutside = (event) => { if (langMenuRef.current && !langMenuRef.current.contains(event.target)) setIsLangMenuOpen(false); }; document.addEventListener('mousedown', handleClickOutside); return () => document.removeEventListener('mousedown', handleClickOutside); }, []);
            
            useEffect(() => {
                if (justAddedCardId) {
                    const timer = setTimeout(() => setJustAddedCardId(null), 500);
                    return () => clearTimeout(timer);
                }
            }, [justAddedCardId]);

            useEffect(() => {
                if (comboTitle) {
                    document.title = `${comboTitle} | Yu-Gi-Oh! Combo maker`;
                } else {
                    document.title = 'Yu-Gi-Oh! Combo maker App';
                }
            }, [comboTitle]);

            const debouncedSearch = useCallback(debounce(async (term, currentFilters, isForSuggestions = false) => {
                if (!isApiReady || (!term && !Object.values(currentFilters).some(v => v))) {
                    setSearchResults([]);
                    setSuggestions([]);
                    return;
                }
                if (searchAbortController.current) {
                    searchAbortController.current.abort();
                }
                searchAbortController.current = new AbortController();
                
                if (!isForSuggestions) {
                    setIsLoadingSearch(true);
                    setCurrentPage(1);
                }

                let url = new URL(YGOPRODECK_API_BASE_URL);
                if (term) url.searchParams.append('fname', term);
                Object.entries(currentFilters).forEach(([key, value]) => {
                    if (value) url.searchParams.append(key, value);
                });

                const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+AAgUBAQ8DFwAAAABJRU5ErkJggg==';

                try {
                    const res = await fetch(url.toString(), { signal: searchAbortController.current.signal });
                    if (!res.ok) throw new Error("Failed to fetch");
                    const data = await res.json();
                    if (isForSuggestions) {
                        setSuggestions(data.data?.slice(0, 10) || []);
                    } else {
                        setSearchResults(data.data || []);
                        setSuggestions([]);
                    }
                } catch (error) {
                    if (error.name !== 'AbortError') {
                        console.error("Error fetching card data:", error);
                        if (!isForSuggestions) setSearchResults([]);
                        setSuggestions([]);
                    }
                } finally {
                    if (!isForSuggestions) setIsLoadingSearch(false);
                }
            }, 300), [t, isApiReady]);

            useEffect(() => {
                if (searchTerm) {
                    debouncedSearch(searchTerm, filters, true);
                } else {
                    setSuggestions([]);
                }
            }, [searchTerm, debouncedSearch, filters]);

            const handleSearchSubmit = (term) => {
                setSearchTerm(term);
                debouncedSearch(term, filters, false);
            };

            useEffect(() => { if (!isApiReady) return; fetch('https://db.ygoprodeck.com/api/v7/archetypes.php').then(res => res.json()).then(data => setArchetypes(data.map(a => a.archetype_name).sort())).catch(err => console.error("Failed to fetch archetypes", err)); fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?type=token').then(res => res.json()).then(data => setAllTokens(data.data || [])).catch(err => console.error("Failed to fetch tokens", err)); }, [isApiReady]);
            
            const endTutorial = () => { localStorage.setItem(`ygo_tutorial_${tutorialState.key}_completed`, 'true'); setTutorialState({ active: false, steps: [], key: 'main' }); };
            
            const handleTutorialStepChange = (nextStepIndex) => {
                if (nextStepIndex === 2) { 
                    setIsSearchPanelOpen(false);
                }
            };
            
            const hoverTimerRef = useRef(null);
            const canHoverPreview = () => !window.matchMedia || window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            const handleCardMouseEnter = (card) => { clearTimeout(hoverTimerRef.current); if (inspectorOn) { if (card && card.name) setInspectCard(card); return; } if (window.__YGO_DRAGGING__ === true || window.innerWidth <= 1024 || !canHoverPreview()) return; hoverTimerRef.current = setTimeout(() => setHoveredCard({ card }), 450); };
            const handleCardMouseLeave = () => { clearTimeout(hoverTimerRef.current); if (window.__YGO_DRAGGING__ === true) return; setHoveredCard({ card: null }); };
            useEffect(() => {
                const hidePreview = () => { clearTimeout(hoverTimerRef.current); setHoveredCard(h => (h && h.card) ? { card: null } : h); };
                window.addEventListener('pointerdown', hidePreview, true);
                window.addEventListener('scroll', hidePreview, true);
                return () => { window.removeEventListener('pointerdown', hidePreview, true); window.removeEventListener('scroll', hidePreview, true); };
            }, []);
            const handleCardMouseMove = () => { if (window.__YGO_DRAGGING__ === true || window.innerWidth <= 1024) return; };

            const prepareApiCard = (apiCard) => {
                if (!apiCard) return null;
                const existing = cardPool.find(c => !c.isCustom && c.ygoprodeck_id === apiCard.id) || pendingPoolRef.current.find(c => c.ygoprodeck_id === apiCard.id);
                if (existing) return existing;
                const inst = createComboCardInstance(apiCard, IMAGE_PROXY);
                pendingPoolRef.current.push(inst);
                return inst;
            };
            const tokenCallbackRef = useRef(null);
            const prepareWildcard = () => {
                const existing = cardPool.find(c => c.isWildcard) || pendingPoolRef.current.find(c => c.isWildcard);
                if (existing) return existing;
                const w = makeWildcardCard(t('anyCard'));
                pendingPoolRef.current.push(w);
                return w;
            };
            cardSourceRef.current = { prepareApiCard, prepareWildcard, pickToken: (cb) => { tokenCallbackRef.current = cb; handleAddToken(); }, poolIds: new Set(cardPool.filter(c => !c.isCustom).map(c => c.ygoprodeck_id)) };

            // Menú «¿Dónde la pongo?» al tocar una carta del buscador o del carrusel
            const [destMenu, setDestMenu] = useState(null);
            const openDestMenu = (apiCard) => {
                const m = window.__YGO_MOUSE__ || {};
                setDestMenu({ apiCard, x: m.x || window.innerWidth / 2, y: m.y || window.innerHeight / 2 });
            };
            useEffect(() => {
                if (!destMenu) return;
                const onKey = (e) => { if (e.key === 'Escape') setDestMenu(null); };
                window.addEventListener('keydown', onKey);
                return () => window.removeEventListener('keydown', onKey);
            }, [destMenu]);
            const sendCardTo = (dest) => {
                const apiCard = destMenu && destMenu.apiCard;
                setDestMenu(null);
                if (!apiCard) return;
                if (dest === 'pool') { addCardToPool(apiCard); return; }
                const inst = prepareApiCard(apiCard);
                if (dest === 'step') handleAddStepOrNote(inst);
                else if (dest === 'hand') {
                    const hands = startingHand.length ? startingHand.map(g => [...g]) : [[]];
                    if (!hands[0].some(i => i.instanceId === inst.instanceId)) hands[0].push({ instanceId: inst.instanceId, quantity: 1 });
                    setComboState({ ...comboState, startingHand: hands }, `Added '${inst.name}' to hand`);
                } else if (dest === 'board') addCardToFinalBoard(inst);
                setNotification({ show: true, message: t('notificationAdded') });
            };

            const addCardToPool = (apiCard) => {
                const newCard = createComboCardInstance(apiCard, IMAGE_PROXY);
                setComboState({ ...comboState, cardPool: [...cardPool, newCard] }, `Added '${newCard.name}'`);
                setJustAddedCardId(newCard.instanceId);
                setNotification({ show: true, message: t('notificationAdded') });
            };

            const handleSaveCustomCard = (customCard) => {
                const existingIndex = cardPool.findIndex(c => c.instanceId === customCard.instanceId);
                let newPool;
                let description;
                if (existingIndex > -1) {
                    newPool = [...cardPool];
                    newPool[existingIndex] = customCard;
                    description = `Updated custom card '${customCard.name}'`;
                } else {
                    newPool = [...cardPool, customCard];
                    description = `Created custom card '${customCard.name}'`;
                }
                setComboState({ ...comboState, cardPool: newPool }, description);
                setJustAddedCardId(customCard.instanceId);
            };

            const handleAddToken = () => { if (allTokens.length === 0) { console.error("Token list not loaded yet."); return; } setShowTokenPicker(true); };
            
            const removeCardFromPool = (instanceId) => {
                if (hoveredCard.card?.instanceId === instanceId) {
                    handleCardMouseLeave();
                }
                const cardToRemove = cardPool.find(c => c.instanceId === instanceId);
                if (!cardToRemove) return;
                const newPool = cardPool.filter(c => c.instanceId !== instanceId);
                const newHand = startingHand.map(group => group.filter(item => item.instanceId !== instanceId)).filter(group => group.length > 0);
                // Las notas y los grupos no tienen cartas: antes esto fallaba y la carta no se podía quitar
                const newSteps = comboSteps.map(step => step.type === 'step' ? ({ ...step, targetCards: (step.targetCards || []).filter(c => c.instanceId !== instanceId), vulnerability: step.vulnerability ? { ...step.vulnerability, cards: (step.vulnerability.cards || []).filter(c => c.instanceId !== instanceId) } : step.vulnerability }) : step).filter(step => step.mainCardInstanceId !== instanceId);
                const newBoard = finalBoardCards.filter(item => item.card.instanceId !== instanceId);
                setComboState({ ...comboState, cardPool: newPool, startingHand: newHand.length > 0 ? newHand : [[]], comboSteps: newSteps, finalBoardCards: newBoard }, `Removed '${cardToRemove.name}'`);
                setToast({ show: true, message: t('toastRemoved'), onUndo: () => undo() });
            };

            const getDefaultAction = (cardType) => { if (!cardType) return "Normal Summon"; if (cardType.includes("Fusion") || cardType.includes("Synchro") || cardType.includes("Xyz") || cardType.includes("Link")) { return "Special Summon"; } if (cardType.includes("Spell") || cardType.includes("Trap")) { return "Activate Spell/Trap"; } return "Normal Summon"; };
            const addStep = (mainCard) => { const newStep = { type: "step", id: generateId(), mainCardInstanceId: mainCard.instanceId, actionType: getDefaultAction(mainCard.type), customActionText: '', actionDescription: '', targetCards: [], vulnerability: { text: '', cards: [] }, isLocked: false, location: null }; setComboState({ ...comboState, comboSteps: [...comboSteps, newStep] }, `Added step with '${mainCard.name}'`); };
            
            const handleAddStepOrNote = (item, insertIndex = null) => {
                const newItem = item.isNote
                    ? { type: 'note', id: generateId(), text: '' }
                    : { type: "step", id: generateId(), mainCardInstanceId: item.instanceId, actionType: getDefaultAction(item.type), customActionText: '', actionDescription: '', targetCards: [], vulnerability: { text: '', cards: [] }, isLocked: false, location: null };
                
                const newSteps = [...comboSteps];
                if (insertIndex === null || insertIndex >= newSteps.length) newSteps.push(newItem); else newSteps.splice(Math.max(0, insertIndex), 0, newItem);
                setComboState({ ...comboState, comboSteps: newSteps }, `Added ${item.isNote ? 'note' : 'step'}`);
            };

            const updateStep = (stepId, updatedData) => { const newSteps = comboSteps.map(step => step.id === stepId ? { ...step, ...updatedData } : step); setComboState({ ...comboState, comboSteps: newSteps }, `Updated step`); };
            const updateMeta = (key, value) => setComboState({ ...comboState, meta: { ...(comboState.meta || {}), [key]: value } }, 'Updated combo info');
            // Cartas afectadas (derecha) y a las que es vulnerable (izquierda)
            const addTargetCard = (step, card) => {
                if (!card || card.isNote) return;
                updateStep(step.id, { targetCards: [...(step.targetCards || []), { instanceId: card.instanceId, quantity: 1, move: defaultMoveFor(step.actionType) }] });
                const key = step.id + ':' + card.instanceId;
                setWiggleKeys(prev => { const n = new Set(prev); n.add(key); return n; });
                setTimeout(() => setWiggleKeys(prev => { const n = new Set(prev); n.delete(key); return n; }), 1400);
            };
            const addVulnCard = (step, card) => {
                if (!card || card.isNote) return;
                const v = step.vulnerability || { text: '', cards: [] };
                const current = v.cards || [];
                const idOf = (vc) => (vc.card ? vc.card.ygoprodeck_id : (findCard(vc.instanceId) || {}).ygoprodeck_id);
                if (current.some(vc => vc.instanceId === card.instanceId || (card.ygoprodeck_id && idOf(vc) === card.ygoprodeck_id))) return;
                updateStep(step.id, { vulnerability: { ...v, cards: [...current, { instanceId: card.instanceId, card }] } });
            };
            const setTargetMove = (stepId, instanceId, move) => {
                const step = comboSteps.find(s => s.id === stepId);
                if (!step) return;
                updateStep(stepId, { targetCards: step.targetCards.map(tc => tc.instanceId === instanceId ? { ...tc, move, moveSet: true } : tc) });
                setMovePicker(null);
            };
            const openMovePicker = (e, stepId, instanceId) => {
                e.stopPropagation();
                const z = parseFloat(getComputedStyle(document.body).zoom) || 1;
                const r = e.currentTarget.getBoundingClientRect();
                const w = 300 * z, h = 380 * z;
                let left = Math.min(Math.max(8, r.left - w / 2), window.innerWidth - w - 8);
                let top = r.bottom + 6; if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
                setMovePicker({ stepId, instanceId, top: top / z, left: left / z });
            };
            // Ramas: un paso puede tener una línea alternativa («si me interrumpen aquí…») con sus propios pasos
            const setBranch = (stepId, branch) => updateStep(stepId, { branch });
            const branchTitleFor = (step) => {
                const v = step.vulnerability || {};
                const names = (v.cards || []).map(vc => (vc.card && vc.card.name) || (findCard(vc.instanceId) || {}).name).filter(Boolean);
                if (names.length) return `${t('branchIf')} ${names.join(' / ')}`;
                if (v.text && v.text !== 'Disrupción') return v.text;
                return t('branchDefaultTitle');
            };
            const addBranch = (step) => { if (!step.branch) setBranch(step.id, { title: branchTitleFor(step), steps: [] }); };
            const removeBranch = (step) => updateStep(step.id, { branch: null });
            const addBranchStep = (step, card) => {
                if (!card || card.isNote) return;
                const b = step.branch || { title: branchTitleFor(step), steps: [] };
                setBranch(step.id, { ...b, steps: [...(b.steps || []), { type: 'step', id: generateId(), mainCardInstanceId: card.instanceId, actionType: getDefaultAction(card.type), customActionText: '', actionDescription: '', targetCards: [], location: null }] });
            };
            const updateBranchStep = (step, bsId, data) => setBranch(step.id, { ...step.branch, steps: step.branch.steps.map(s => s.id === bsId ? { ...s, ...data } : s) });
            const removeBranchStep = (step, bsId) => setBranch(step.id, { ...step.branch, steps: step.branch.steps.filter(s => s.id !== bsId) });
            const duplicateStep = (stepId) => {
                const i = comboSteps.findIndex(s => s.id === stepId);
                if (i < 0) return;
                const copy = { ...JSON.parse(JSON.stringify(comboSteps[i])), id: generateId(), isLocked: false };
                const newSteps = [...comboSteps];
                newSteps.splice(i + 1, 0, copy);
                setComboState({ ...comboState, comboSteps: newSteps }, 'Duplicated step');
            };
            const moveStep = (stepId, dir) => {
                const i = comboSteps.findIndex(s => s.id === stepId);
                const j = i + dir;
                if (i < 0 || j < 0 || j >= comboSteps.length) return;
                const newSteps = [...comboSteps];
                [newSteps[i], newSteps[j]] = [newSteps[j], newSteps[i]];
                setComboState({ ...comboState, comboSteps: newSteps }, 'Moved step');
            };
            useEffect(() => {
                if (!openStepMenuId) return;
                const onDown = (e) => { if (!(e.target.closest && e.target.closest('[data-step-menu], [data-card-selector-menu]'))) setOpenStepMenuId(null); };
                const onKey = (e) => { if (e.key === 'Escape') setOpenStepMenuId(null); };
                document.addEventListener('pointerdown', onDown);
                document.addEventListener('keydown', onKey);
                return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
            }, [openStepMenuId]);
            const deleteStep = (stepId) => { const newSteps = comboSteps.filter(step => step.id !== stepId); setComboState({ ...comboState, comboSteps: newSteps }, `Deleted step`); };
            const removeTargetCardFromStep = (stepId, targetInstanceId) => { const newSteps = comboSteps.map(step => { if (step.id === stepId) { return { ...step, targetCards: step.targetCards.filter(card => card.instanceId !== targetInstanceId) }; } return step; }); setComboState({ ...comboState, comboSteps: newSteps }, `Removed target card from step`); };
            
            const addCardToFinalBoard = (card) => { if (finalBoardCards.some(item => item.card.instanceId === card.instanceId)) return; const newBoardItem = { id: generateId(), card: card, zone: pickFinalBoardZone(card, finalBoardCards), isDisruption: false }; setComboState({ ...comboState, finalBoardCards: [...finalBoardCards, newBoardItem] }, `Added '${card.name}' to board`); };
            
            const updateFinalBoardCard = (itemId, updatedData) => { const newBoard = finalBoardCards.map(item => item.id === itemId ? { ...item, ...updatedData } : item); setComboState({ ...comboState, finalBoardCards: newBoard }, `Updated board card`); };
            
            const removeCardFromFinalBoard = (id) => {
                const itemToRemove = finalBoardCards.find(item => item.id === id);
                if (itemToRemove && hoveredCard.card?.instanceId === itemToRemove.card.instanceId) {
                    handleCardMouseLeave();
                }
                const newBoard = finalBoardCards.filter(item => item.id !== id);
                setComboState({ ...comboState, finalBoardCards: newBoard }, `Removed board card`);
                setToast({ show: true, message: t('toastRemoved'), onUndo: () => undo() });
            };

            const clearAll = () => { setShowClearConfirmModal(false); loadState(initialComboState, "Cleared all"); localStorage.removeItem(AUTO_SAVE_KEY); };
            
            const handleConfirmExport = async (mode = 'png') => {
                const cardFilter = exportOptions.cardFilter || 'color';
                if (!(comboTitle || '').trim()) {
                    setNotification({ show: true, message: t('exportTitleRequired') });
                    setShowExportOptionsModal(false);
                    return;
                }
                setShowExportOptionsModal(false);
                setIsExportingPng(true);
                setExportMessage(t('fetchingImages'));
                setExportProgress(0);
                const allCardInstances = [ ...startingHand.flat().map(item => item.instanceId), ...comboSteps.flatMap(s => s.type === 'step' ? [s.mainCardInstanceId, ...s.targetCards.map(tc => tc.instanceId), ...(s.vulnerability?.cards.map(vc => vc.instanceId) || [])] : []), ...finalBoardCards.map(fb => fb.card.instanceId) ];
                const uniqueCardIds = [...new Set(allCardInstances)];
                const cardsToExport = [...uniqueCardIds.map(id => findCard(id)).filter(Boolean), ...comboSteps.flatMap(s => s.type === 'step' ? (s.vulnerability?.cards || []).map(vc => vc.card).filter(Boolean) : [])];
                const imageUrls = cardsToExport.flatMap(c => c.isCustom ? [c.image_url] : [c.image_url_small, c.image_url_cropped]).filter(Boolean);
                const uniqueImageUrls = [...new Set(imageUrls)];
                const imageMap = {};
                
                const loadImageAsDataURL = (url) => {
                    return new Promise((resolve, reject) => {
                        const timeoutId = setTimeout(() => reject(new Error(`Image load timed out for ${url}`)), 8000);
                        const img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.onload = () => {
                            clearTimeout(timeoutId);
                            try {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.naturalWidth;
                                canvas.height = img.naturalHeight;
                                const ctx = canvas.getContext('2d');
                                ctx.drawImage(img, 0, 0);
                                applyCardFilterToCanvas(ctx, canvas.width, canvas.height, cardFilter);
                                resolve(canvas.toDataURL('image/png'));
                            } catch (e) {
                                reject(new Error(`Failed to convert image to data URL: ${url}`));
                            }
                        };
                        img.onerror = () => { clearTimeout(timeoutId); reject(new Error(`Failed to load image: ${url}`)); };
                        img.src = url;
                    });
                };

                try {
                    let loadedImages = 0;
                    const blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/5+AAgUBAQ8DFwAAAABJRU5ErkJggg==';
                    const promises = uniqueImageUrls.map((url) => {
                        if (url.startsWith('data:image') && cardFilter === 'color') {
                            imageMap[url] = url;
                            loadedImages++;
                            setExportProgress((loadedImages / uniqueImageUrls.length) * 50);
                            return Promise.resolve();
                        }
                        return loadImageAsDataURL(url)
                            .then((dataUrl) => { imageMap[url] = dataUrl; })
                            .catch((err) => { console.warn(err.message); imageMap[url] = blankImage; })
                            .finally(() => { loadedImages++; setExportProgress((loadedImages / uniqueImageUrls.length) * 50); });
                    });

                    await Promise.allSettled(promises);
                    
                    setExportMessage(t('generatingPng'));
                    const exportContainer = document.getElementById('export-container');
                    const exportRoot = createRoot(exportContainer);
                    exportRoot.render(<ExportLayout {...{ comboTitle, startingHand, comboSteps, finalBoardCards, notes, findCard, t, exportOptions, imageMap, meta: comboMeta, shareUrlFn: getShareUrl }} />);
                    
                    // --- New Robust Export Logic ---
                    // 1. Wait for React to render the component.
                    await new Promise(resolve => setTimeout(resolve, 100)); 
                    
                    // 2. Apply the special export styles.
                    document.body.setAttribute("data-exporting","1");

                    // 3. Wait for the browser to apply the new CSS.
                    await new Promise(resolve => setTimeout(resolve, 100)); 

                    // 4. CRITICAL: Wait for all fonts (including custom ones from CSS) to be fully loaded.
                    await document.fonts.ready;

                    // 5. Final safety delay for the browser to repaint everything with the correct fonts.
                    await new Promise(resolve => setTimeout(resolve, 200)); 

                    let adaptiveScale = exportOptions.scale;
                    const stepCountForScale = Array.isArray(comboSteps) ? comboSteps.filter(s => s?.type === 'step').length : 0;
                    if (stepCountForScale > 15) adaptiveScale = Math.min(adaptiveScale, 1.5);
                    else if (stepCountForScale > 8) adaptiveScale = Math.min(adaptiveScale, 2);
                    
                    if ((exportOptions.theme || 'dark') === 'dark') setSmartExportBackground(exportContainer.querySelector('.export-onewm'));
                    exportContainer.style.width = exportOptions.layout === 'discord' ? '720px' : '';
                    const canvas = await html2canvas(exportContainer, { scale: adaptiveScale, useCORS: true, backgroundColor: null });
                    exportContainer.style.width = '';

                    setExportProgress(100);
                    if (mode === 'print') printCanvasInPages(canvas, comboTitle, resolvePaper(exportOptions));
                    else setPngPreviewUrl(canvas.toDataURL('image/png'));
                    exportRoot.unmount();
                } catch(err) {
                    console.error("Error exporting to PNG:", err);
                    setExportMessage(t('exportError'));
                } finally {
                    document.body.removeAttribute("data-exporting");
                    setIsExportingPng(false);
                }
            };

            const downloadPng = () => { const link = document.createElement('a'); link.download = `${comboTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'yugioh_combo'}.png`; link.href = pngPreviewUrl; link.click(); setPngPreviewUrl(null); };
            const findCard = (instanceId) => cardPool.find(c => c.instanceId === instanceId);
            
            const addCardToStartingHand = (card, groupIndex = 0) => {
                if (!card) return;
                const newHands = comboState.startingHand.map((group, index) => {
                    if (index === groupIndex) {
                        if (!group.some(item => item.instanceId === card.instanceId)) {
                            return [...group, { instanceId: card.instanceId, quantity: 1 }];
                        }
                    }
                    return group;
                });
                if (JSON.stringify(newHands) !== JSON.stringify(comboState.startingHand)) {
                    setComboState({ ...comboState, startingHand: newHands }, `Added '${card.name}' to hand`);
                }
            };

            const removeCardFromHand = (instanceId, groupIndex) => {
                if (hoveredCard.card?.instanceId === instanceId) {
                    handleCardMouseLeave();
                }
                const newHands = startingHand.map((g, i) => i === groupIndex ? g.filter(it => it.instanceId !== instanceId) : g );
                setComboState({...comboState, startingHand: newHands}, 'Remove from hand');
                setToast({ show: true, message: t('toastRemoved'), onUndo: () => undo() });
            };

            const handleDragStart = (e, type, data) => { window.__YGO_DRAGGING__ = true; handleCardMouseLeave(); e.dataTransfer.setData('text/plain', JSON.stringify({type, data})); e.target.classList.add('dragging'); setDraggedItem({ type, data }); };
            const handleDragEnd = (e) => { window.__YGO_DRAGGING__ = false; if (e.target && e.target.classList) e.target.classList.remove('dragging'); setDraggedItem(null); setDragOverIndex(null); };
            
            const handleDrop = (e, targetArea, groupIndex) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const droppedData = JSON.parse(e.dataTransfer.getData('text/plain'));
                if (!droppedData) return;

                const processDrop = (cardToAdd) => {
                    if (cardToAdd) {
                        if (targetArea === 'startingHand') addCardToStartingHand(cardToAdd, groupIndex);
                        else if (targetArea === 'comboSteps') addStep(cardToAdd);
                        else if (targetArea === 'finalBoard') addCardToFinalBoard(cardToAdd);
                    }
                };
                
                if (['pool-card', 'hand-card', 'board-card'].includes(droppedData.type)) {
                    const cardToAdd = findCard(droppedData.data.instanceId || droppedData.data);
                    processDrop(cardToAdd);
                } else if (droppedData.type === 'search-card') {
                    const apiCard = droppedData.data;
                    let cardToAdd = cardPool.find(c => c.ygoprodeck_id === apiCard.id);
                    if (!cardToAdd) {
                        cardToAdd = createComboCardInstance(apiCard, IMAGE_PROXY);
                        const newPool = [...cardPool, cardToAdd];
                        const newState = { ...comboState, cardPool: newPool };
                        setComboState(newState, `Added '${cardToAdd.name}'`);
                        processDrop(cardToAdd);
                    } else {
                        processDrop(cardToAdd);
                    }
                }
                setDraggedItem(null);
            };

            const handleReorder = (type, draggedItem, targetItem) => {
                if (type === 'hand') {
                    const newHands = [...startingHand];
                    const sourceGroup = [...newHands[draggedItem.groupIndex]];
                    const targetGroup = draggedItem.groupIndex === targetItem.groupIndex ? sourceGroup : [...newHands[targetItem.groupIndex]];
                    const draggedIndex = sourceGroup.findIndex(c => c.instanceId === draggedItem.instanceId);
                    if (draggedIndex === -1) return;
                    const [removed] = sourceGroup.splice(draggedIndex, 1);
                    const targetIndex = targetGroup.findIndex(c => c.instanceId === targetItem.instanceId);
                    targetGroup.splice(targetIndex, 0, removed);
                    newHands[draggedItem.groupIndex] = sourceGroup;
                    newHands[targetItem.groupIndex] = targetGroup;
                    setComboState({ ...comboState, startingHand: newHands }, 'Reordered hand');
                } else if (type === 'board') {
                    let list = [...finalBoardCards];
                    const draggedIndex = list.findIndex(c => c.id === draggedItem.id);
                    if (draggedIndex === -1) return;
                    const [removed] = list.splice(draggedIndex, 1);
                    const targetIndex = list.findIndex(c => c.id === targetItem.id);
                    list.splice(targetIndex, 0, removed);
                    setComboState({ ...comboState, finalBoardCards: list }, 'Reordered board');
                } else if (type === 'step') {
                    let list = [...comboSteps];
                    const draggedIndex = list.findIndex(s => s.id === draggedItem.id);
                    if (draggedIndex === -1) return;
                    const [removed] = list.splice(draggedIndex, 1);
                    const targetIndex = list.findIndex(s => s.id === targetItem.id);
                    list.splice(targetIndex, 0, removed);
                    setComboState({ ...comboState, comboSteps: list }, 'Reordered combo steps');
                }
            };
            
            const handleContextMenu = (card, e, context) => {
                handleCardMouseLeave();
                let options = [ { label: t('ctxViewCard'), action: () => setSelectedCardForZoom(card) } ];
                if (context === 'pool') {
                    if (card.isCustom) {
                        options.push({ label: t('ctxEditCustomCard'), action: () => { setEditingCustomCard(card); setShowCustomCardModal(true); } });
                    }
                    options.push({ label: t('ctxRemoveFromPool'), action: () => removeCardFromPool(card.instanceId) });
                }
                options.push(
                    { label: t('ctxAddToHand'), action: () => addCardToStartingHand(card, 0) },
                    { label: t('ctxAddStep'), action: () => addStep(card) },
                    { label: t('ctxAddFinalBoard'), action: () => addCardToFinalBoard(card) }
                );
                setContextMenu({ card, x: e.clientX, y: e.clientY, options });
            };

            const closeContextMenu = () => setContextMenu({ card: null, x: 0, y: 0, options: [] });
            const filteredSearchResults = useMemo(() => { if (!searchResults) return null; const poolIds = new Set(cardPool.map(c => c.ygoprodeck_id)); return searchResults.filter(c => !poolIds.has(c.id)); }, [searchResults, cardPool]);
            const paginatedResults = useMemo(() => { if (!filteredSearchResults) return []; const startIndex = (currentPage - 1) * CARDS_PER_PAGE; return filteredSearchResults.slice(startIndex, startIndex + CARDS_PER_PAGE); }, [currentPage, filteredSearchResults]);
            const totalPages = filteredSearchResults ? Math.ceil(filteredSearchResults.length / CARDS_PER_PAGE) : 0;
            
            const handleSaveCombo = async (name) => { 
                if (!name) return; 
                if (isOnlineSaveEnabled && user) {
                    try {
                        const comboData = {
                            ...comboState,
                            authorId: user.uid,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        const combosCol = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('combos');
                        await combosCol.doc(name).set(comboData);
                        setShowSaveModal(false);
                        localStorage.removeItem(AUTO_SAVE_KEY);
                        setNotification({ show: true, message: '¡Combo guardado en la nube!' });
                    } catch (e) { console.error("Error saving combo to Firestore:", e); alert(t('saveError')); }
                } else {
                    if (localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${name}`) !== null && !window.confirm(t('overwriteConfirm', { name }))) return; try { const serializedState = JSON.stringify(comboState); localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${name}`, serializedState); setShowSaveModal(false); localStorage.removeItem(AUTO_SAVE_KEY); } catch (e) { console.error("Error saving combo locally:", e); alert(t('saveError')); }
                }
            };

            // Guardar / abrir combos como archivo (.json) en la computadora del usuario.
            const handleDownloadComboFile = (name) => {
                const fileName = (name || comboTitle || 'combo').replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 80) || 'combo';
                const payload = { app: 'yugioh-combo-maker', fileVersion: 1, savedAt: new Date().toISOString(), combo: comboState };
                const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `${fileName}.json`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                setShowSaveModal(false);
                setNotification({ show: true, message: t('fileDownloaded') });
            };

            const handleOpenComboFile = async (file) => {
                if (!file) return;
                try {
                    const parsed = JSON.parse(await file.text());
                    const combo = parsed && parsed.app === 'yugioh-combo-maker' ? parsed.combo : parsed;
                    if (!combo || !Array.isArray(combo.cardPool) || !Array.isArray(combo.comboSteps)) throw new Error('Formato no reconocido');
                    loadState({ ...initialComboState, ...combo }, `Loaded file '${file.name}'`);
                    setShowLoadModal(false);
                    setNotification({ show: true, message: t('fileLoaded') });
                } catch (e) {
                    console.error("Error opening combo file:", e);
                    setNotification({ show: true, message: t('fileInvalid') });
                }
            };

            const handleLoadCombo = async (name) => {
                if (isOnlineSaveEnabled && user) {
                    try {
                        const docRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('combos').doc(name);
                        const docSnap = await docRef.get();
                        if (docSnap.exists()) {
                            loadState(docSnap.data(), `Loaded '${name}' from cloud`);
                        }
                        setShowLoadModal(false);
                    } catch (e) { console.error("Error loading combo from Firestore:", e); alert(t('loadError')); }
                } else {
                    try { const serializedState = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${name}`); if (serializedState) { const loaded = JSON.parse(serializedState); loadState(loaded, `Loaded '${name}'`); } setShowLoadModal(false); } catch (e) { console.error("Error loading combo locally:", e); alert(t('loadError')); }
                }
            };
            
            const handleDeleteCombo = async (name) => {
                 if (isOnlineSaveEnabled && user) {
                    try {
                        const docRef = db.collection('artifacts').doc(appId).collection('public').doc('data').collection('combos').doc(name);
                        // Optional: Check for authorId before deleting for extra security
                        const doc = await docRef.get();
                        if (doc.exists && doc.data().authorId === user.uid) {
                            await docRef.delete();
                        } else {
                            alert("No tienes permiso para borrar este combo.");
                        }
                    } catch (e) { console.error("Error deleting combo from Firestore:", e); }
                } else {
                    try { localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${name}`); } catch (e) { console.error("Error deleting combo locally:", e); } 
                }
            };
            
            // Combo en texto plano (para Discord, WhatsApp, Reddit…)
            const htmlToText = (html) => {
                if (!html) return '';
                const withBreaks = String(html).replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|div|li)>/gi, '\n');
                const doc = new DOMParser().parseFromString(withBreaks, 'text/html');
                return (doc.body.textContent || '').replace(/\n{3,}/g, '\n\n').trim();
            };
            const buildComboText = () => {
                const nameOf = (id) => { const c = findCard(id); return c ? c.name : '?'; };
                const lines = [comboTitle || t('untitledCombo')];
                const metaLine = [FORMAT_LABEL[comboMeta.format], comboMeta.author ? `${t('metaBy')} ${comboMeta.author}` : '', comboMeta.updated].filter(Boolean).join(' · ');
                if (metaLine) lines.push(metaLine);
                if (comboMeta.source) lines.push(comboMeta.source);
                const hands = startingHand.filter(g => g && g.length);
                if (hands.length) lines.push(`${t('startingHandTitle')}: ` + hands.map(g => g.map(it => (it.quantity > 1 ? `${it.quantity}x ` : '') + nameOf(it.instanceId)).join(' + ')).join(`  |  ${t('or')}  |  `));
                lines.push('');
                let n = 0;
                comboSteps.forEach(s => {
                    if (s.type === 'group') { lines.push(''); lines.push(`== ${s.title || ''} ==`); return; }
                    if (s.type === 'note') { if (s.text) lines.push(`   📝 ${s.text}`); return; }
                    n++;
                    const act = s.actionType === 'Other' ? (s.customActionText || trTerm('Other')) : trTerm(s.actionType);
                    let line = `${n}. ${act}: ${nameOf(s.mainCardInstanceId)}`;
                    const targets = (s.targetCards || []).map(tc => `${nameOf(tc.instanceId)} (${moveLabel(targetMove(s, tc))})`);
                    if (targets.length) line += ` → ${targets.join(', ')}`;
                    if (s.location) line += ` [${ZONE_ABBREVIATIONS[s.location] || trTerm(s.location)}]`;
                    lines.push(line);
                    const desc = stripMentions(htmlToText(s.actionDescription));
                    if (desc) lines.push(`   ${desc}`);
                    const v = s.vulnerability;
                    if (v && (v.text || (v.cards || []).length)) {
                        const vNames = (v.cards || []).map(vc => (vc.card && vc.card.name) || nameOf(vc.instanceId));
                        lines.push(`   ⚠ ${t('vulnerableTo')}: ${[...vNames, v.cards && v.cards.length ? '' : v.text].filter(Boolean).join(', ')}`);
                    }
                    if (s.branch && s.branch.steps && s.branch.steps.length) {
                        lines.push(`   ↳ ${s.branch.title || t('branchLabel')}:`);
                        s.branch.steps.forEach((bs, bi) => {
                            const bact = bs.actionType === 'Other' ? (bs.customActionText || trTerm('Other')) : trTerm(bs.actionType);
                            const bdesc = htmlToText(bs.actionDescription);
                            lines.push(`      ${n}.${bi + 1} ${bact}: ${nameOf(bs.mainCardInstanceId)}${bdesc ? ' — ' + bdesc : ''}`);
                        });
                    }
                });
                if (finalBoardCards.length) {
                    lines.push('');
                    lines.push(`${t('finalBoardTitle')}: ` + finalBoardCards.map(b => `${(b.card && b.card.name) || '?'} (${ZONE_ABBREVIATIONS[b.zone] || b.zone})${b.isDisruption ? ' ⛔' : ''}`).join(', '));
                }
                const notesText = stripMentions(htmlToText(notes));
                if (notesText) { lines.push(''); lines.push(notesText); }
                lines.push('');
                lines.push(getShareUrl());
                return lines.join('\n');
            };
            const dismissWelcome = () => {
                setShowWelcome(false);
                try { localStorage.setItem('ygo_welcome_done', '1'); localStorage.setItem('ygo_tutorial_main_completed', 'true'); localStorage.setItem('ygo_tutorial_stepActions_completed', 'true'); } catch (e) {}
            };
            const loadExampleCombo = async () => {
                if ((comboSteps.length || cardPool.length) && !window.confirm(t('exampleReplaceConfirm'))) return;
                dismissWelcome();
                const st = (id, card, actionType, desc, extra = {}) => ({ type: 'step', id, mainCardInstanceId: card, actionType, customActionText: '', actionDescription: desc, targetCards: [], vulnerability: { text: '', cards: [] }, isLocked: false, location: null, ...extra });
                const example = {
                    cardPool: [
                        { $c: 89176044, i: 'ex_prim' },
                        { $c: 1845204, i: 'ex_ifus' },
                        { $c: 44932065, i: 'ex_bybl' },
                        { $c: 18595008, i: 'ex_liliz' },
                        { $c: 66309175, i: 'ex_ambu' },
                        { $c: 44994712, i: 'ex_longi' },
                        { $c: 66787942, i: 'ex_balt' },
                        { $c: 21200905, i: 'ex_jasm' },
                        { $c: 71734607, i: 'ex_petal' },
                        { $c: 78646298, i: 'ex_bprin' },
                        { $c: 71002019, i: 'ex_mudan' },
                        { $c: 76869711, i: 'ex_konkon' },
                        { $c: 69164989, i: 'ex_glam' },
                        { $c: 20477370, i: 'ex_sacred' },
                        { $c: 6284176, i: 'ex_kanz' },
                        { $c: 42651293, i: 'ex_prim2' },
                        { $c: 132308, i: 'ex_princ' },
                        { $c: 31615285, i: 'ex_cactus' },
                        { $c: 68941332, i: 'ex_sheet' },
                        { $c: 3828844, i: 'ex_queen' },
                        { $c: 48130397, i: 'ex_spoly' }
                    ],
                    startingHand: [[{ instanceId: 'ex_prim', quantity: 1 }], [{ instanceId: 'ex_ifus', quantity: 1 }]],
                    comboSteps: [
                        { type: 'group', id: generateId(), title: "Starter: Predaprimitive" },
                        st(generateId(), 'ex_prim', 'Activate Spell/Trap', "Starter. As cost, send Predaplant Byblisp from the Deck to the GY."),
                        st(generateId(), 'ex_bybl', 'Send to GY', "Cost for Predaprimitive."),
                        st(generateId(), 'ex_prim', 'Search', "Predaprimitive adds Instant Fusion to the hand.", { targetCards: [{ instanceId: 'ex_ifus', quantity: 1 }] }),
                        st(generateId(), 'ex_bybl', 'Search', "Byblisp's effect adds Predaplant Lilizard.", { targetCards: [{ instanceId: 'ex_liliz', quantity: 1 }] }),
                        st(generateId(), 'ex_ifus', 'Activate Spell/Trap', "Instant Fusion: Special Summon Predaplant Ambulomelides from the Extra Deck."),
                        st(generateId(), 'ex_ambu', 'Special Summon', "Summoned with Instant Fusion."),
                        st(generateId(), 'ex_ambu', 'Search', "Ambulomelides adds Predaplant Longinephila (can be any “Predap” card).", { targetCards: [{ instanceId: 'ex_longi', quantity: 1 }] }),
                        { type: 'group', id: generateId(), title: "Predap → Rikka" },
                        st(generateId(), 'ex_liliz', 'Special Summon', "Lilizard's effect: Special Summon it from the hand."),
                        st(generateId(), 'ex_ambu', 'Send to GY', "Ambulomelides tributes itself for its effect."),
                        st(generateId(), 'ex_longi', 'Special Summon', "Special Summoned with Ambulomelides' effect."),
                        st(generateId(), 'ex_prim', 'Add to Hand', "Then add Predaprimitive to the hand (can be any “Predap” card)."),
                        st(generateId(), 'ex_balt', 'Synchro Summon', "Longinephila (Tuner) + Lilizard.", { targetCards: [{ instanceId: 'ex_longi', quantity: 1 }, { instanceId: 'ex_liliz', quantity: 1 }] }),
                        st(generateId(), 'ex_balt', 'Activate Effect', "Bal Teah's effect + Lilizard's effect: draw 1 card.", { targetCards: [{ instanceId: 'ex_liliz', quantity: 1 }] }),
                        st(generateId(), 'ex_longi', 'Banish', "Banish Longinephila from the GY: place a counter on any card."),
                        st(generateId(), 'ex_bybl', 'Special Summon', "Special Summon Byblisp from the GY into an odd-numbered zone."),
                        st(generateId(), 'ex_jasm', 'Link Summon', "Bal Teah + Lilizard. Put Jasmine above Byblisp.", { targetCards: [{ instanceId: 'ex_balt', quantity: 1 }, { instanceId: 'ex_liliz', quantity: 1 }], location: 'Extra Monster 1' }),
                        st(generateId(), 'ex_bybl', 'Banish', "Cost for Jasmine's effect."),
                        st(generateId(), 'ex_petal', 'Special Summon', "Jasmine's effect: Special Summon Rikka Petal from the Deck."),
                        { type: 'group', id: generateId(), title: "Rikka" },
                        st(generateId(), 'ex_petal', 'Search', "Rikka Petal adds Rikka Black Princess.", { targetCards: [{ instanceId: 'ex_bprin', quantity: 1 }] }),
                        st(generateId(), 'ex_bprin', 'Special Summon', "Special Summon Rikka Black Princess from the hand."),
                        st(generateId(), 'ex_jasm', 'Send to GY', "Cost for Black Princess's effect."),
                        st(generateId(), 'ex_mudan', 'Special Summon', "Black Princess's effect: Special Summon Mudan the Rikka Fairy."),
                        st(generateId(), 'ex_mudan', 'Search', "Mudan adds Rikka Konkon.", { targetCards: [{ instanceId: 'ex_konkon', quantity: 1 }] }),
                        st(generateId(), 'ex_konkon', 'Activate Spell/Trap', "Activate the Field Spell Rikka Konkon."),
                        st(generateId(), 'ex_glam', 'Set', "Konkon's effect sets Rikka Glamour."),
                        st(generateId(), 'ex_sacred', 'Xyz Summon', "Mudan + Black Princess (Level 6).", { targetCards: [{ instanceId: 'ex_mudan', quantity: 1 }, { instanceId: 'ex_bprin', quantity: 1 }] }),
                        st(generateId(), 'ex_kanz', 'Special Summon', "Sacred Queen Strenna's effect: Special Summon Kanzashi the Rikka Queen and attach Primrose the Rikka Fairy Duo."),
                        st(generateId(), 'ex_glam', 'Activate Spell/Trap', "Activate Rikka Glamour (the original guide notes: «Tribute Black Princess»)."),
                        st(generateId(), 'ex_petal', 'Send to GY', "Rikka Petal leaves the field with Rikka Glamour."),
                        st(generateId(), 'ex_glam', 'Add to Hand', "Glamour adds Rikka Princess and Cactus Bouncer.", { targetCards: [{ instanceId: 'ex_princ', quantity: 1 }, { instanceId: 'ex_cactus', quantity: 1 }] }),
                        st(generateId(), 'ex_balt', 'Special Summon', "Chain Link 1 – Kanzashi's effect: Special Summon Predaplant Bal Teah."),
                        st(generateId(), 'ex_sheet', 'Set', "Chain Link 2 – Sacred Queen Strenna's effect: set Rikka Sheet."),
                        st(generateId(), 'ex_princ', 'Special Summon', "Special Summon Rikka Princess from the hand."),
                        st(generateId(), 'ex_queen', 'Xyz Summon', "Rikka Princess + Bal Teah (Level 4).", { targetCards: [{ instanceId: 'ex_princ', quantity: 1 }, { instanceId: 'ex_balt', quantity: 1 }] }),
                        st(generateId(), 'ex_queen', 'Add to Hand', "Detach Rikka Princess: add Primrose the Rikka Fairy Duo to the hand.", { targetCards: [{ instanceId: 'ex_prim2', quantity: 1 }] }),
                        { type: 'group', id: generateId(), title: "End" },
                        st(generateId(), 'ex_cactus', 'Special Summon', "Summon Cactus Bouncer.")
                    ],
                    finalBoardCards: [
                        { id: generateId(), card: { $c: 3828844, i: 'ex_queen' }, zone: 'Main Monster 3', isDisruption: true },
                        { id: generateId(), card: { $c: 31615285, i: 'ex_cactus' }, zone: 'Main Monster 4', isDisruption: true },
                        { id: generateId(), card: { $c: 6284176, i: 'ex_kanz' }, zone: 'Main Monster 2', isDisruption: false },
                        { id: generateId(), card: { $c: 20477370, i: 'ex_sacred' }, zone: 'Extra Monster 1', isDisruption: false },
                        { id: generateId(), card: { $c: 76869711, i: 'ex_konkon' }, zone: 'Field Zone', isDisruption: false },
                        { id: generateId(), card: { $c: 68941332, i: 'ex_sheet' }, zone: 'Spell/Trap 1', isDisruption: true },
                        { id: generateId(), card: { $c: 132308, i: 'ex_princ' }, zone: 'Graveyard', isDisruption: true }
                    ],
                    meta: { format: 'md', author: 'Yusodus (Master Duel Meta)', source: 'https://www.masterduelmeta.com/combo/6ae3c0776dfa324bb1a64110', updated: '2026-11-11' },
                    comboTitle: 'Predarikka: 1c Primitive/Instant (Bouncer)',
                    notes: `${t('exampleNotes')}<br><br>End board (from the original guide): Rikka Queen Strenna → Hyperyton or Teardrop8 · Cactus Bouncer → Special Summon floodgate · Rikka Princess (GY) → monster negate · Rikka Konkon → tribute for cost · Rikka Sheet → mind control · Rikka Sacred Queen Strenna → reset Sheet · Kanzashi → destruction protection · Primrose (hand) → quick Xyz for either Teardrop · +1 draw. If you start with Instant Fusion, you also end with Super Polymerization.<br><br>Combo «Predarikka: 1c Primitive/Instant (Bouncer)» by Yusodus on Master Duel Meta (masterduelmeta.com), adapted as the example of this app.`,
                };
                try { const loaded = await hydrateCombo(example, IMAGE_PROXY); loadState(loaded, 'Example combo'); }
                catch (e) { console.error('No se pudo cargar el ejemplo', e); }
            };
            const toggleBgAnimation = () => {
                const v = !bgAnimated;
                setBgAnimated(v);
                window.__ygoBgAnimated = v;
                try { localStorage.setItem('ygo_bg_anim', v ? '1' : '0'); } catch (e) {}
                document.documentElement.classList.toggle('bg-static', !v);
            };
            // Abre el formulario de GitHub de la Comunidad ya rellenado (título, arquetipo sugerido y enlace)
            const handlePublishCommunity = async () => {
                if (!comboSteps.some(s => s.type === 'step')) { setNotification({ show: true, message: t('publishNeedSteps') }); return; }
                const win = window.open('', '_blank'); // se abre ya, para que el navegador no lo bloquee
                let arch = '';
                try {
                    const ids = [...new Set(cardPool.filter(c => !c.isCustom && c.ygoprodeck_id && !/token/i.test(c.type || '')).map(c => c.ygoprodeck_id))].slice(0, 40);
                    if (ids.length) {
                        const r = await fetch(`${YGOPRODECK_API_BASE_URL}?id=${ids.join(',')}`);
                        if (r.ok) { const j = await r.json(); const cnt = {}; (j.data || []).forEach(c => { if (c.archetype) cnt[c.archetype] = (cnt[c.archetype] || 0) + 1; }); arch = (Object.entries(cnt).sort((a, b) => b[1] - a[1])[0] || [''])[0]; }
                    }
                } catch (e) {}
                const params = new URLSearchParams({ template: 'combo-sheet.yml', format: FORMAT_LABEL[comboMeta.format] || '', title: `[COMBO] ${comboTitle || ''}`.trim(), 'combo-title': comboTitle || '', archetype: arch, link: getShareUrl() });
                const url = `https://github.com/aaoollaaooll/Yugioh-combo-maker/issues/new?${params.toString()}`;
                if (win) { win.opener = null; win.location.href = url; } else window.open(url, '_blank', 'noopener');
            };
            // Importar mazo: añade al pool las cartas que aún no estén (en bloques de 50 por consulta)
            const importDeckIds = async (ids) => {
                const have = new Set(cardPool.filter(c => !c.isCustom).map(c => c.ygoprodeck_id));
                const unique = [...new Set(ids)].filter(id => !have.has(id));
                const found = [];
                for (let i = 0; i < unique.length; i += 50) {
                    const chunk = unique.slice(i, i + 50);
                    const r = await fetch(`${YGOPRODECK_API_BASE_URL}?id=${chunk.join(',')}`);
                    if (r.ok) { const j = await r.json(); (j.data || []).forEach(c => found.push(c)); }
                    else {
                        for (const id of chunk) { try { const r2 = await fetch(`${YGOPRODECK_API_BASE_URL}?id=${id}`); if (r2.ok) { const j2 = await r2.json(); (j2.data || []).forEach(c => found.push(c)); } } catch (e) {} }
                    }
                }
                const seen = new Set(have);
                const newCards = [];
                found.forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); newCards.push(createComboCardInstance(c, IMAGE_PROXY)); } });
                if (newCards.length) setComboState({ ...comboState, cardPool: [...cardPool, ...newCards] }, 'Imported deck');
                return newCards.length;
            };
            const handleCopyText = async () => {
                const text = buildComboText();
                try { await navigator.clipboard.writeText(text); }
                catch (e) { const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (err) {} ta.remove(); }
                setNotification({ show: true, message: t('textCopied') });
            };
            const getShareUrl = () => {
                try {
                    const encoded = encodeComboForUrl(comboState);
                    return `${window.location.origin}${window.location.pathname}?combo=${encoded}`;
                } catch (e) {
                    console.error("Error creating share link:", e);
                    return window.location.href;
                }
            };

            const handleShareUrl = () => {
                const url = getShareUrl();
                navigator.clipboard.writeText(url).then(() => {
                    setNotification({ show: true, message: t('linkCopied') });
                });
            };

            const handleTouchStart = (e, type, data) => {
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                setTouchDragGhost({
                    content: e.currentTarget.innerHTML,
                    width: rect.width,
                    height: rect.height,
                    x: touch.clientX,
                    y: touch.clientY,
                    offsetX: touch.clientX - rect.left,
                    offsetY: touch.clientY - rect.top,
                    type,
                    data
                });
                e.currentTarget.classList.add('dragging');
            };

            const handleTouchMove = (e) => {
                if (!touchDragGhost) return;
                const touch = e.touches[0];
                setTouchDragGhost(prev => ({...prev, x: touch.clientX, y: touch.clientY}));
                
                document.querySelectorAll('.drop-zone').forEach(el => el.classList.remove('drag-over'));
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropZone = elementUnder?.closest('.drop-zone');
                if(dropZone) {
                    dropZone.classList.add('drag-over');
                }
            };

            const handleTouchEnd = (e) => {
                if (!touchDragGhost) return;
                const touch = e.changedTouches[0];
                const elementUnder = document.elementFromPoint(touch.clientX, touch.clientY);
                const dropZone = elementUnder?.closest('.drop-zone');
                
                if (dropZone) {
                    dropZone.classList.remove('drag-over');
                    const targetArea = dropZone.dataset.dropArea;
                    const groupIndex = parseInt(dropZone.dataset.groupIndex, 10);
                    
                    const processDrop = (cardToAdd) => {
                        if (cardToAdd) {
                            if (targetArea === 'startingHand') addCardToStartingHand(cardToAdd, groupIndex);
                            else if (targetArea === 'comboSteps') addStep(cardToAdd);
                            else if (targetArea === 'finalBoard') addCardToFinalBoard(cardToAdd);
                        }
                    };

                    if (['pool-card', 'hand-card', 'board-card'].includes(touchDragGhost.type)) {
                        const cardToAdd = findCard(touchDragGhost.data.instanceId || touchDragGhost.data);
                        processDrop(cardToAdd);
                    } else if (touchDragGhost.type === 'search-card') {
                         const apiCard = touchDragGhost.data;
                         let cardToAdd = cardPool.find(c => c.ygoprodeck_id === apiCard.id);
                         if (!cardToAdd) {
                            cardToAdd = createComboCardInstance(apiCard, IMAGE_PROXY);
                            const newPool = [...cardPool, cardToAdd];
                            setComboState({...comboState, cardPool: newPool}, `Added '${cardToAdd.name}'`);
                            processDrop(cardToAdd);
                         } else {
                            processDrop(cardToAdd);
                         }
                    }
                }
                
                setTouchDragGhost(null);
                document.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
            };
            
            const disruptionCount = finalBoardCards.filter(c => c.isDisruption).length;
            
            const toggleStepLock = (stepId) => {
                const newSteps = comboSteps.map(step => 
                    step.id === stepId ? { ...step, isLocked: !step.isLocked } : step
                );
                setComboState({ ...comboState, comboSteps: newSteps }, 'Toggled step lock');
            };

            const handleConfirmDeleteFrom = () => {
                if (deleteFromIndex === null) return;
                const newSteps = comboSteps.slice(0, deleteFromIndex);
                setComboState({ ...comboState, comboSteps: newSteps }, `Deleted steps from index ${deleteFromIndex}`);
                setDeleteFromIndex(null);
            };
    
            const [theme, setTheme] = useState('dark');
            useEffect(() => {
                const savedTheme = localStorage.getItem('ygo-theme') || 'dark';
                setTheme(savedTheme);
                document.documentElement.setAttribute('data-theme', savedTheme);
            }, []);

            const toggleTheme = () => {
                const newTheme = theme === 'light' ? 'dark' : 'light';
                setTheme(newTheme);
                localStorage.setItem('ygo-theme', newTheme);
                document.documentElement.setAttribute('data-theme', newTheme);
            };
            
            const actualSteps = useMemo(() => comboSteps.filter(s => s.type === 'step'), [comboSteps]);
            const comboStats = useMemo(() => {
                const stats = { types: { Monster: 0, Spell: 0, Trap: 0 }, attributes: { DARK: 0, LIGHT: 0, WIND: 0, WATER: 0, FIRE: 0, EARTH: 0, DIVINE: 0 } };
                const seenCards = new Set();
                actualSteps.forEach(step => {
                    const card = findCard(step.mainCardInstanceId);
                    if (card && !seenCards.has(card.name)) {
                        seenCards.add(card.name);
                        if (card.type) {
                            if (card.type.includes('Monster')) stats.types.Monster++;
                            else if (card.type.includes('Spell')) stats.types.Spell++;
                            else if (card.type.includes('Trap')) stats.types.Trap++;
                        }
                        if (card.attribute && stats.attributes.hasOwnProperty(card.attribute)) {
                            stats.attributes[card.attribute]++;
                        }
                    }
                });
                return seenCards.size > 0 ? stats : null;
            }, [actualSteps, cardPool]);

            if (isLoading) {
                return (
                    <React.Fragment>

                        <div id="splash-screen">
                           <h1 className="font-yugi-title text-4xl md:text-6xl text-amber-300">Yu-Gi-Oh! Combo Maker</h1>
                        </div>
                    </React.Fragment>
                );
            }

            return (
                <React.Fragment>
                    {isPlayOpen && <PlayComboBoard comboState={comboState} onClose={closePlay} t={t} />}
                    <div className={`relative min-h-screen`} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
                        <Notification message={notification.message} show={notification.show} t={t} />
                        {toast.show && <Toast message={toast.message} onUndo={toast.onUndo} onClose={() => setToast({ show: false, message: '', onUndo: null })} t={t} />}
                        {showRestoreNotification && <RestoreNotification onRestore={handleRestore} onDismiss={() => setShowRestoreNotification(false)} t={t} />}
                        {tutorialState.active && <Tutorial steps={tutorialState.steps} onEnd={endTutorial} t={t} onStepChange={handleTutorialStepChange} />}
                        <CardHoverPreview card={hoveredCard.card} />
                        {touchDragGhost && createPortal(
                            <div id="touch-drag-ghost" style={{ top: touchDragGhost.y - touchDragGhost.offsetY, left: touchDragGhost.x - touchDragGhost.offsetX, width: touchDragGhost.width, height: touchDragGhost.height }} dangerouslySetInnerHTML={{ __html: touchDragGhost.content }}></div>,
                            document.getElementById('touch-drag-ghost-container')
                        )}

                        {!isApiReady && (<div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50"><Spinner /><p className="text-lg text-violet-300 mt-4">{apiCheckMessage}</p></div>)}
                        <CardZoomModal card={selectedCardForZoom} onClose={() => setSelectedCardForZoom(null)} t={t} onSaveNotes={(cardId, newNotes) => { const newPool = cardPool.map(c => c.instanceId === cardId ? {...c, notes: newNotes} : c); setComboState({...comboState, cardPool: newPool}, `Updated notes for card`); }}/>
                        <ConfirmationModal show={showClearConfirmModal} title={t('clearConfirmTitle')} message={t('clearConfirmMessage')} onConfirm={clearAll} onCancel={() => setShowClearConfirmModal(false)} t={t} />
                        <ConfirmationModal show={deleteFromIndex !== null} title={t('undoFromHereConfirmTitle')} message={t('undoFromHereConfirmMessage', { stepNumber: deleteFromIndex + 1 })} onConfirm={handleConfirmDeleteFrom} onCancel={() => setDeleteFromIndex(null)} t={t} />
                        <ZonePickerModal show={zonePickerStepId !== null} onClose={() => setZonePickerStepId(null)} onSelect={(zone) => updateStep(zonePickerStepId, { location: zone })} t={t} />

                        <PngPreviewModal imageUrl={pngPreviewUrl} onDownload={downloadPng} onClose={() => setPngPreviewUrl(null)} t={t} shareUrl={getShareUrl()} comboTitle={comboTitle} />
                        <ExportOptionsModal show={showExportOptionsModal} onClose={() => setShowExportOptionsModal(false)} onConfirm={() => handleConfirmExport('png')} onPrint={() => handleConfirmExport('print')} onCopyText={handleCopyText} exportOptions={exportOptions} setExportOptions={setExportOptions} layoutProps={{ comboTitle, startingHand, comboSteps, finalBoardCards, notes, findCard, t, meta: comboMeta, shareUrlFn: getShareUrl }} t={t} />
                        <SaveComboModal show={showSaveModal} onClose={() => setShowSaveModal(false)} onSave={handleSaveCombo} onDownload={handleDownloadComboFile} t={t} isOnlineSaveEnabled={isOnlineSaveEnabled} />
                        <LoadComboModal show={showLoadModal} onClose={() => setShowLoadModal(false)} onSelect={handleLoadCombo} onDelete={handleDeleteCombo} onOpenFile={handleOpenComboFile} t={t} db={db} user={user} appId={appId} isOnlineSaveEnabled={isOnlineSaveEnabled}/>
                        <nav className="mobile-tabbar" aria-label={t('quickNav')}>
                            <button type="button" onClick={() => setIsFlyoutPoolOpen(true)}><i className="fas fa-layer-group"></i><span>{t('navPool')}</span></button>
                            <button type="button" onClick={() => scrollToSection('#starting-hand-section')}><i className="fas fa-hand-paper"></i><span>{t('navHand')}</span></button>
                            <button type="button" onClick={() => scrollToSection('#combo-steps-section')}><i className="fas fa-list-ol"></i><span>{t('navSteps')}</span></button>
                            <button type="button" onClick={() => scrollToSection('.final-board')}><i className="fas fa-chess-board"></i><span>{t('navBoard')}</span></button>
                            <button type="button" onClick={() => setIsPlayOpen(true)} className="text-amber-400"><i className="fas fa-play"></i><span>{t('navTest')} β</span></button>
                        </nav>
                        <ImportDeckModal show={showImportDeck} onClose={() => setShowImportDeck(false)} onImport={importDeckIds} t={t} />
                        {showShortcuts && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowShortcuts(false)}>
                                <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-5 w-full max-w-sm text-sm text-slate-200" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center mb-3"><h3 className="text-lg font-bold text-violet-300 flex-1">{t('shortcutsTitle')}</h3><button onClick={() => setShowShortcuts(false)} aria-label={t('closeLabel')} className="w-9 h-9 rounded-full bg-black/30 text-xl">×</button></div>
                                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                                        {[['/', t('scSearch')], ['N', t('scNewStep')], ['P', t('scTest')], ['E', t('scExport')], ['Ctrl+Z / Ctrl+Y', t('scUndoRedo')], ['Ctrl+S', t('scSave')], ['?', t('scHelp')]].map(([k, d]) => (
                                            <React.Fragment key={k}><dt><kbd className="px-2 py-0.5 rounded bg-slate-700 border border-slate-600 font-mono text-xs">{k}</kbd></dt><dd>{d}</dd></React.Fragment>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        )}
                        {inspectorOn && (
                            <aside className="card-inspector hidden lg:flex" aria-label={t('inspectorTitle')}>
                                <div className="flex items-center justify-between mb-2"><span className="font-semibold text-sm text-[var(--color-secondary)]">{t('inspectorTitle')}</span><button onClick={toggleInspector} aria-label={t('closeLabel')} className="w-8 h-8 rounded-full hover:bg-[var(--color-surface-light)] text-xl">×</button></div>
                                {inspectCard ? (
                                    <React.Fragment>
                                        <img src={inspectCard.image_url || inspectCard.image_url_small} alt={inspectCard.name} className="w-40 mx-auto rounded" crossOrigin="anonymous" />
                                        <h4 className="font-bold mt-2">{inspectCard.name}</h4>
                                        <p className="text-xs text-[var(--color-text-muted)]">{[trTerm(inspectCard.type), inspectCard.attribute ? trTerm(inspectCard.attribute) : '', inspectCard.level ? '★' + inspectCard.level : '', (inspectCard.atk !== undefined && inspectCard.atk !== null && inspectCard.atk !== '') ? `${inspectCard.atk} / ${inspectCard.def ?? '-'}` : ''].filter(Boolean).join(' · ')}</p>
                                        <p className="text-xs mt-2 whitespace-pre-wrap">{inspectCard.desc}</p>
                                    </React.Fragment>
                                ) : <p className="text-xs text-[var(--color-text-muted)]">{t('inspectorEmpty')}</p>}
                            </aside>
                        )}
                        {movePicker && (() => {
                            const st = comboSteps.find(s => s.id === movePicker.stepId);
                            const tg = st && st.targetCards.find(x => x.instanceId === movePicker.instanceId);
                            const current = st && tg ? targetMove(st, tg) : null;
                            return (
                                <div data-move-picker="1" className="move-picker" style={{ top: movePicker.top, left: movePicker.left }} role="menu">
                                    <div className="text-xs font-semibold text-[var(--color-text-muted)] px-1 pb-1">{t('movePickerTitle')}</div>
                                    {MOVE_GROUPS.map(([g, label]) => (
                                        <div key={g} className="mb-1">
                                            <div className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] px-1">{t(label)}</div>
                                            <div className="grid grid-cols-1 gap-0.5">
                                                {Object.keys(MOVES).filter(k => MOVES[k].group === g).map(k => (
                                                    <button key={k} type="button" role="menuitem" onClick={() => setTargetMove(movePicker.stepId, movePicker.instanceId, k)} className={`flex items-center gap-2 px-1 py-1 rounded text-sm text-left hover:bg-[var(--color-surface-light)] ${current === k ? 'bg-[var(--color-surface-light)] font-semibold' : ''}`}>
                                                        <MoveBadge k={k} className="mv-inline" />
                                                        <span>{moveLabel(k)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                        <TokenPickerModal show={showTokenPicker} tokens={allTokens} onPick={(tk) => { const cb = tokenCallbackRef.current; tokenCallbackRef.current = null; if (cb) cb(prepareApiCard(tk)); else addCardToPool(tk); setShowTokenPicker(false); }} onClose={() => { tokenCallbackRef.current = null; setShowTokenPicker(false); }} t={t} />
                        <CustomCardModal show={showCustomCardModal} onClose={() => { setShowCustomCardModal(false); setEditingCustomCard(null); }} onSave={handleSaveCustomCard} t={t} existingCard={editingCustomCard} />

                        {isExportingPng && <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"><div className="bg-slate-800 rounded-lg shadow-xl p-8 text-center"><h3 className="text-xl font-bold mb-4 text-violet-300">{exportMessage}</h3><div className="w-full bg-slate-600 rounded-full h-4"><div className="bg-violet-500 h-4 rounded-full" style={{ width: `${exportProgress}%` }}></div></div><p className="text-white mt-2">{Math.round(exportProgress)}%</p></div></div>}
                        {destMenu && (() => {
                            const sheet = window.innerWidth <= 768;
                            const zf = getBodyZoom();
                            const pos = sheet ? {} : { left: Math.max(8, Math.min(destMenu.x + 8, window.innerWidth - 232 * zf)) / zf, top: Math.max(8, Math.min(destMenu.y + 8, window.innerHeight - 250 * zf)) / zf };
                            return (
                                <div className="fixed inset-0 z-[60]" onClick={() => setDestMenu(null)} onContextMenu={e => { e.preventDefault(); setDestMenu(null); }}>
                                    <div className={sheet ? 'dest-sheet' : 'dest-pop'} style={pos} role="menu" onClick={e => e.stopPropagation()}>
                                        <div className="dest-title">{destMenu.apiCard.name}</div>
                                        <div className="dest-sub">{t('destTitle')}</div>
                                        {[['pool', 'fa-layer-group', t('destPool')], ['step', 'fa-plus-circle', t('destStep')], ['hand', 'fa-hand-paper', t('destHand')], ['board', 'fa-chess-board', t('destBoard')]].map(([key, icon, label]) => (
                                            <button key={key} onClick={() => sendCardTo(key)} className="step-menu-item" role="menuitem"><i className={`fas ${icon} w-5 text-center`}></i>{label}</button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}
                        {contextMenu.card && <div className="fixed inset-0 z-50" onClick={closeContextMenu} onContextMenu={e => { e.preventDefault(); closeContextMenu(); }}><div style={{ position: 'fixed', top: `${contextMenu.y / getBodyZoom()}px`, left: `${contextMenu.x / getBodyZoom()}px` }} className="bg-slate-800 border border-slate-600 rounded-md shadow-lg py-2 w-48">{contextMenu.options.map(option => (<button key={option.label} onClick={() => { option.action(); closeContextMenu(); }} className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-violet-600">{option.label}</button>))}</div></div>}

                        {cardPool.length > 0 && !isFlyoutPoolOpen && (
                            <button onClick={() => setIsFlyoutPoolOpen(true)} className="fixed top-1/2 -translate-y-1/2 right-0 z-30 bg-amber-600/80 backdrop-blur-sm text-white p-2 rounded-l-lg shadow-lg transition-all duration-300 hover:bg-amber-500" aria-label={t('cardPoolTitle')} data-tooltip={t('cardPoolTitle')}>
                                <i className="fas fa-layer-group"></i>
                            </button>
                        )}
                        
                        <aside className={`fixed top-0 right-0 w-full max-w-sm h-full bg-amber-900/90 backdrop-blur-sm p-4 border-l border-amber-700/50 z-40 transition-transform duration-300 flex flex-col ${isFlyoutPoolOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                            <header className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-semibold text-amber-300">{t('cardPoolTitle')}</h3>
                                <div className="flex gap-2 ml-auto mr-3">
                                    <button onClick={() => setShowCustomCardModal(true)} className="btn px-2 py-1 text-xs bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">{t('createCustomCard')}</button>
                                    <button onClick={handleAddToken} disabled={allTokens.length === 0 || isAddingToken} className="btn px-2 py-1 text-xs bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 disabled:opacity-50">{t('addToken')}</button>
                                </div>
                                <button onClick={() => setIsFlyoutPoolOpen(false)} className="text-amber-200 hover:text-white" aria-label="Cerrar" data-tooltip="Cerrar"><i className="fas fa-times"></i></button>
                            </header>
                            <div className="flex-grow overflow-y-auto bg-black/20 p-2 rounded-lg">
                                {cardPool.length > 0 ? (
                                    <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))]">
                                        {cardPool.map((card) => <CardDisplay key={card.instanceId} card={card} size="small" onClick={(c) => setSelectedCardForZoom(c)} onRemove={() => removeCardFromPool(card.instanceId)} onEdit={() => { setEditingCustomCard(card); setShowCustomCardModal(true); }} draggable={true} onDragStart={(e) => handleDragStart(e, 'pool-card', card)} onTouchStart={(e) => handleTouchStart(e, 'pool-card', card)} onDragEnd={handleDragEnd} onContextMenu={(c, e) => handleContextMenu(c, e, 'pool')} isHighlighted={highlightedCardIds.includes(card.instanceId)} isNew={card.instanceId === justAddedCardId} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave} onMouseMove={handleCardMouseMove} />)}
                                    </div>
                                ) : (
                                    <EmptyState icon="fa-layer-group" title={t('emptyPoolTitle')} message={t('emptyPoolMessage')} />
                                )}
                            </div>
                        </aside>

                        <aside id="search-panel" className={`fixed top-0 left-0 w-full max-w-sm h-full bg-[var(--color-surface)]/80 backdrop-blur-sm p-4 border-r border-[var(--color-border)]/50 z-40 transition-transform duration-300 flex flex-col ${isSearchPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                            <header className="text-center mb-4 relative">
                                <h1 className="text-3xl font-bold text-[var(--color-secondary)] font-yugioh">{t('mainTitle')}</h1>
                                <button onClick={() => setIsSearchPanelOpen(false)} className="absolute top-0 right-0 text-[var(--color-text-muted)] hover:text-[var(--color-text)]" aria-label="Cerrar" data-tooltip="Cerrar"><i className="fas fa-times"></i></button>
                                
                            </header>
                            <div className="relative mb-2">
                                <form onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(searchTerm); }}>
                                    <input type="text" placeholder={t('searchPlaceholder')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none pr-10" disabled={!isApiReady} />
                                </form>
                                {suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-b-lg z-50 max-h-60 overflow-y-auto">
                                        {suggestions.map(card => (
                                            <div key={card.id} onClick={() => handleSearchSubmit(card.name)} className="p-2 hover:bg-[var(--color-surface-light)] cursor-pointer text-sm">
                                                {card.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button onClick={() => setShowFilters(prev => !prev)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"><i className="fas fa-filter"></i></button>
                            </div>
                            {showFilters && (<div className="mb-4 p-3 bg-black/20 rounded-lg grid grid-cols-2 gap-2"><select value={filters.archetype} onChange={e => setFilters({...filters, archetype: e.target.value})} className="w-full p-1 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-md text-xs"><option value="">{t('filterArchetype')}</option>{archetypes.map(a => <option key={a} value={a}>{a}</option>)}</select><select value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})} className="w-full p-1 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-md text-xs"><option value="">{t('filterType')}</option>{CARD_TYPES.map(ct => <option key={ct} value={ct}>{trTerm(ct)}</option>)}</select><select value={filters.attribute} onChange={e => setFilters({...filters, attribute: e.target.value})} className="w-full p-1 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-md text-xs"><option value="">{t('filterAttribute')}</option>{ATTRIBUTES.map(a => <option key={a} value={a}>{trTerm(a)}</option>)}</select><select value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})} className="w-full p-1 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded-md text-xs"><option value="">{t('filterLevel')}</option>{LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select><button onClick={() => { setFilters({ type: '', attribute: '', level: '', archetype: '' }); debouncedSearch(searchTerm, { type: '', attribute: '', level: '', archetype: '' }, false); }} className="btn col-span-2 mt-1 px-2 py-1 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700">{t('clearFilters')}</button></div>)}
                            <PopularCardsCarousel onCardClick={openDestMenu} t={t} cardPool={cardPool} />
                            <div className="flex-grow overflow-y-auto bg-black/20 p-2 rounded-lg">
                                {isLoadingSearch ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="w-full card-skeleton" style={{ aspectRatio: '0.686' }}></div>)}
                                    </div>
                                ) : paginatedResults.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-3">
                                        {paginatedResults.map((apiCard, index) => {
                                            const cardInstance = createComboCardInstance(apiCard, IMAGE_PROXY);
                                            return <div key={apiCard.id} className="animate-fadeInUp" style={{animationDelay: `${index * 50}ms`}}><CardDisplay card={cardInstance} onClick={() => openDestMenu(apiCard)} draggable={true} onDragStart={(e) => handleDragStart(e, 'search-card', apiCard)} onTouchStart={(e) => handleTouchStart(e, 'search-card', apiCard)} onDragEnd={handleDragEnd} size="small" t={t} onContextMenu={(c, e) => handleContextMenu(cardInstance, e, 'search')} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave} onMouseMove={handleCardMouseMove} /></div>
                                        })}
                                    </div>
                                ) : (searchTerm || Object.values(filters).some(v => v)) && <div className="p-4 text-center text-[var(--color-text-muted)]">{t('noCardsFound')}</div>
                                }
                            </div>
                            {totalPages > 1 && (<div className="flex justify-center items-center gap-2 mt-2 text-sm"><button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="btn px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50">‹</button><span>{t('page')} {currentPage} / {totalPages}</span><button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="btn px-3 py-1 bg-slate-600 rounded hover:bg-slate-500 disabled:opacity-50">›</button></div>)}
                        </aside>

                        <main className={`transition-all duration-300 p-4 lg:p-6 ${isSearchPanelOpen ? 'lg:ml-96' : 'ml-0'} ${inspectorOn ? 'lg:!pr-[19.5rem]' : ''}`}>
                            <div className="flex flex-col h-full">
                                <header className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2">
                                    <input type="text" value={comboTitle} onChange={(e) => setComboState({...comboState, comboTitle: sanitizeHTML(e.target.value)}, "Changed title")} className="w-full min-w-0 flex-grow basis-64 p-2 text-3xl font-bold bg-transparent text-[var(--color-secondary)] placeholder-[var(--color-text-muted)] focus:bg-[var(--color-surface)]/50 rounded-lg outline-none font-yugioh" placeholder={t('comboTitlePlaceholder')} />
                                    <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 max-w-full mx-auto md:mr-0 main-actions">
                                        <button onClick={undo} disabled={!canUndo} data-tooltip={`${t('undo')} (Ctrl+Z)`} className="btn p-3 bg-[var(--color-surface)] rounded-md hover:bg-[var(--color-surface-light)] disabled:opacity-50"><i className="fas fa-undo"></i></button>
                                        <button onClick={redo} disabled={!canRedo} data-tooltip={`${t('redo')} (Ctrl+Y)`} className="btn p-3 bg-[var(--color-surface)] rounded-md hover:bg-[var(--color-surface-light)] disabled:opacity-50"><i className="fas fa-redo"></i></button>
                                        <button onClick={() => setIsPlayOpen(true)} data-tooltip={t('playCombo')} aria-label={t('playCombo')} className="btn p-3 bg-amber-500 text-slate-900 font-semibold rounded-md hover:bg-amber-400 flex items-center gap-2"><i className="fas fa-play"></i> <span className="hidden sm:inline">{t('playCombo')}</span><span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 text-amber-300 text-[10px] font-bold uppercase tracking-wide align-middle">Beta</span></button>
                                        <button onClick={handleShareUrl} data-tooltip={t('shareUrl')} className="btn p-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"><i className="fas fa-link"></i></button>
                                        <button onClick={() => setShowSaveModal(true)} data-tooltip={isOnlineSaveEnabled ? t('saveOnlineTooltip') : t('saveLocalTooltip')} className="btn p-3 bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"><i className="fas fa-save"></i> {isOnlineSaveEnabled && <i className="fas fa-cloud text-xs"></i>}</button>
                                        <button onClick={() => setShowLoadModal(true)} data-tooltip={t('openSavedTooltip')} className="btn p-3 bg-blue-600 rounded-md hover:bg-blue-700"><i className="fas fa-folder-open"></i></button>
                                        <button onClick={() => setShowExportOptionsModal(true)} disabled={isExportingPng} data-tooltip={t('exportPng')} className="btn p-3 bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">{isExportingPng ? <Spinner /> : <i className="fas fa-download"></i>} <span className="hidden sm:inline">{t('exportPng')}</span></button>
                                        <div className="relative" data-more-menu="1">
                                            <button onClick={() => setShowMoreMenu(v => !v)} aria-haspopup="menu" aria-expanded={showMoreMenu} data-tooltip={t('moreOptions')} aria-label={t('moreOptions')} className={`btn p-3 rounded-md flex items-center gap-2 ${showMoreMenu ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-light)]'}`}><i className="fas fa-bars"></i><span className="hidden sm:inline text-sm font-semibold">{t('moreLabel')}</span></button>
                                            {showMoreMenu && (
                                                <div role="menu" className="step-menu fixed left-2 right-2 bottom-20 max-h-[70vh] overflow-y-auto sm:overflow-visible sm:max-h-none sm:absolute sm:left-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-72 rounded-lg shadow-xl py-1 text-sm z-50 text-left">
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); handlePublishCommunity(); }}><i className="fas fa-cloud-upload-alt w-5 text-center text-teal-400"></i>{t('publishCommunity')}</button>
                                                    <a role="menuitem" className="step-menu-item" href="community.html"><i className="fas fa-users w-5 text-center text-blue-400"></i>{t('publicCombosTitle')}</a>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); handleCopyText(); }}><i className="fas fa-copy w-5 text-center"></i>{t('copyText')}</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); setShowImportDeck(true); }}><i className="fas fa-file-import w-5 text-center"></i>{t('importDeck')}</button>
                                                    <div className="border-t border-[var(--color-border)] my-1"></div>
                                                    <button role="menuitem" className="step-menu-item" onClick={toggleTheme}><i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} w-5 text-center`}></i>{t('themeTooltip')}</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={toggleBgAnimation} aria-pressed={bgAnimated}><i className={`fas fa-star w-5 text-center ${bgAnimated ? 'text-amber-300' : 'opacity-50'}`}></i>{t('bgAnimation')}</button>
                                                    <label className="step-menu-item"><i className="fas fa-globe w-5 text-center"></i><select value={language} onChange={(e) => chooseLanguage(e.target.value)} aria-label={t('languageTooltip')} className="flex-1 min-w-0 bg-[var(--color-surface-light)] text-[var(--color-text)] rounded p-1 text-sm">{LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
                                                    <button role="menuitem" className="step-menu-item hidden lg:flex" onClick={toggleInspector} aria-pressed={inspectorOn}><i className={`fas fa-id-card w-5 text-center ${inspectorOn ? 'text-amber-300' : ''}`}></i>{t('inspectorToggle')}{inspectorOn ? ' ✓' : ''}</button>
                                                    <button role="menuitem" className="step-menu-item hidden lg:flex" onClick={() => { setShowMoreMenu(false); setShowShortcuts(true); }}><i className="fas fa-keyboard w-5 text-center"></i>{t('shortcutsTitle')} (?)</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); setShowCustomCardModal(true); }}><i className="fas fa-pen-ruler w-5 text-center"></i>{t('createCustomCard')}</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); setShowWelcome(true); }}><i className="fas fa-book-open w-5 text-center"></i>{t('guideMenu')}</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); setTutorialState({ active: true, steps: tutorialSteps.main, key: 'main' }); }}><i className="fas fa-question-circle w-5 text-center"></i>{t('welcomeTutorial')}</button>
                                                    <button role="menuitem" className="step-menu-item" onClick={() => { setShowMoreMenu(false); loadExampleCombo(); }}><i className="fas fa-magic w-5 text-center"></i>{t('welcomeExample')}</button>
                                                    <div className="border-t border-[var(--color-border)] my-1"></div>
                                                    <button role="menuitem" className="step-menu-item danger" onClick={() => { setShowMoreMenu(false); setShowClearConfirmModal(true); }}><i className="fas fa-trash w-5 text-center"></i>{t('clearAll')}</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </header>
                                <div className="w-full text-center text-xs text-slate-400 mb-4 h-4">
                                    {isOnlineSaveEnabled ? (user ? `${t('loggedInAs')} ${user.uid}` : t('connecting')) : t('localSaveActive')}
                                </div>
                                <details className="mb-4 rounded-lg border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30 combo-meta" open={metaOpen} onToggle={e => setMetaOpen(e.currentTarget.open)}>
                                    <summary className="cursor-pointer px-3 py-2 text-sm flex flex-wrap items-center gap-2">
                                        <span className="font-semibold text-[var(--color-secondary)]"><i className="fas fa-info-circle mr-1"></i>{t('metaTitle')}</span>
                                        {comboMeta.format && <span className="pill-meta">{FORMAT_LABEL[comboMeta.format]}</span>}
                                        {comboMeta.author && <span className="pill-meta">{t('metaBy')} {comboMeta.author}</span>}
                                        {comboMeta.updated && <span className="pill-meta">{comboMeta.updated}</span>}
                                        {!comboMeta.format && !comboMeta.author && !comboMeta.updated && <span className="text-[var(--color-text-muted)]">{t('metaNone')}</span>}
                                    </summary>
                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 p-3 pt-1">
                                        <label className="text-xs text-[var(--color-text-muted)]">{t('metaFormat')}
                                            <select value={comboMeta.format || ''} onChange={e => updateMeta('format', e.target.value)} className="mt-1 w-full p-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]">
                                                <option value="">{t('metaNone')}</option><option value="md">Master Duel</option><option value="tcg">TCG</option><option value="ocg">OCG</option>
                                            </select>
                                        </label>
                                        <label className="text-xs text-[var(--color-text-muted)]">{t('metaAuthor')}
                                            <input value={comboMeta.author || ''} maxLength={60} onChange={e => updateMeta('author', sanitizeHTML(e.target.value))} className="mt-1 w-full p-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]" />
                                        </label>
                                        <label className="text-xs text-[var(--color-text-muted)]">{t('metaSource')}
                                            <input type="url" value={comboMeta.source || ''} maxLength={300} placeholder="https://..." onChange={e => updateMeta('source', e.target.value.trim())} className="mt-1 w-full p-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]" />
                                        </label>
                                        <label className="text-xs text-[var(--color-text-muted)]">{t('metaUpdated')}
                                            <span className="flex gap-1 mt-1">
                                                <input type="date" value={comboMeta.updated || ''} onChange={e => updateMeta('updated', e.target.value)} className="flex-1 min-w-0 p-2 bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded text-sm text-[var(--color-text)]" />
                                                <button type="button" onClick={() => updateMeta('updated', new Date().toISOString().slice(0, 10))} className="px-2 rounded bg-[var(--color-surface-light)] text-xs text-[var(--color-text)]">{t('metaToday')}</button>
                                            </span>
                                        </label>
                                    </div>
                                </details>
                                {showWelcome && (
                                    <div className="fixed inset-0 z-[65] bg-black/75 flex items-center justify-center p-3 modal-enter" onClick={dismissWelcome}>
                                        <div className="guide-card modal-content w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-2xl p-5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center mb-3"><h2 className="text-2xl font-bold text-[var(--color-secondary)] flex-1">{t('guideTitle')}</h2><button onClick={dismissWelcome} aria-label={t('closeLabel')} className="w-10 h-10 rounded-full hover:bg-[var(--color-surface-light)] text-2xl">×</button></div>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="guide-panel"><div className="guide-art"><span className="guide-icon bg-violet-600"><i className="fas fa-magnifying-glass"></i></span><span className="side-add-btn" style={{ width: 40, height: 40 }}><i className="fas fa-plus"></i></span></div><h3>1. {t('guide1Title')}</h3><p>{t('guide1Text')}</p></div>
                                                <div className="guide-panel"><div className="guide-art"><span className="guide-mini"><span className="guide-thumb"><span className="mv-badge mv-warn"><i className="fas fa-triangle-exclamation"></i></span></span><span className="guide-main"></span><span className="guide-thumb"><span className="mv-badge mv-hand"><i className="fas fa-hand"></i><i className="fas fa-magnifying-glass mv-mod"></i></span></span></span></div><h3>2. {t('guide2Title')}</h3><p>{t('guide2Text')}</p></div>
                                                <div className="guide-panel"><div className="guide-art"><span className="guide-icon bg-amber-500 text-slate-900"><i className="fas fa-play"></i></span><span className="guide-icon bg-amber-600"><i className="fas fa-graduation-cap"></i></span></div><h3>3. {t('guide3Title')}</h3><p>{t('guide3Text')}</p></div>
                                                <div className="guide-panel"><div className="guide-art"><span className="guide-icon bg-green-600"><i className="fas fa-download"></i></span><span className="guide-icon bg-purple-600"><i className="fas fa-link"></i></span><span className="guide-icon bg-slate-600"><i className="fas fa-film"></i></span></div><h3>4. {t('guide4Title')}</h3><p>{t('guide4Text')}</p></div>
                                            </div>
                                            <div className="flex flex-wrap justify-end gap-2 mt-4">
                                                <button onClick={() => { setShowWelcome(false); try { localStorage.setItem('ygo_welcome_done', '1'); } catch (e) {} setTutorialState({ active: true, steps: tutorialSteps.main, key: 'main' }); }} className="btn px-4 py-2 bg-[var(--color-surface-light)] text-[var(--color-text)] font-semibold rounded-lg">{t('welcomeTutorial')}</button>
                                                <button onClick={loadExampleCombo} className="btn px-4 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700"><i className="fas fa-magic mr-2"></i>{t('welcomeExample')}</button>
                                                <button onClick={dismissWelcome} className="btn px-5 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">{t('guideStart')}</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex-grow space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                        <section id="starting-hand-section" className="bg-[var(--color-surface)]/30 rounded-lg border border-[var(--color-border)]/30 starting-hand">
                                        <h3 onClick={() => setIsStartingHandOpen(!isStartingHandOpen)} className="text-xl font-semibold text-[var(--color-secondary)] p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)]/50 transition-colors">
                                            <span className="flex items-center">{t('startingHandTitle')} <span data-tooltip={t('helpStartingHand')}><i className="fas fa-question-circle ml-2"></i></span></span>
                                            <i className={`fas fa-chevron-down transition-transform duration-300 ${isStartingHandOpen ? '' : '-rotate-90'}`}></i>
                                        </h3>
                                        <div className={`collapse-box ${isStartingHandOpen ? 'is-open' : ''}`}>
                                            <div className="p-4 pt-0 collapse-inner">
                                                <div className="flex flex-row flex-wrap items-start gap-3 pb-3">
                                                    {startingHand.map((group, groupIndex) => (
                                                        <React.Fragment key={groupIndex}>
                                                            <div className="relative flex-shrink-0">
                                                                {startingHand.length > 1 && (<button onClick={() => { const newHands = startingHand.filter((_, i) => i !== groupIndex); setComboState({...comboState, startingHand: newHands}, 'Removed alternate hand'); }} className="absolute -top-3 -left-3 w-7 h-7 bg-slate-700 text-slate-200 border border-slate-500 rounded-full flex items-center justify-center text-xs font-bold hover:bg-red-600 hover:text-white z-10">X</button>)}
                                                                <div data-drop-area="startingHand" data-group-index={groupIndex} onDragOver={(e) => {e.preventDefault(); e.currentTarget.classList.add('drag-over')}} onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')} onDrop={(e) => handleDrop(e, 'startingHand', groupIndex)} className="drop-zone p-3 pt-4 bg-black/20 rounded-lg min-h-[9.5rem] flex flex-wrap justify-start items-center gap-2 border-2 border-dashed border-[var(--color-border)] transition-colors w-max max-w-full">
                                                                    {group.map(item => { const card = findCard(item.instanceId); if (!card) return null; return <CardDisplay key={`hand-${card.instanceId}`} card={card} size="small" quantity={item.quantity} draggable={true} onDragStart={(e) => handleDragStart(e, 'hand-card', { ...item, groupIndex })} onDrop={e => { e.preventDefault(); e.stopPropagation(); const droppedData = JSON.parse(e.dataTransfer.getData('text/plain')); if (droppedData.type === 'hand-card') handleReorder('hand', droppedData.data, { ...item, groupIndex }); }} onQuantityChange={(id, change) => setComboState({...comboState, startingHand: startingHand.map((g, i) => i === groupIndex ? g.map(it => it.instanceId === id ? {...it, quantity: Math.max(1, Math.min(3, it.quantity+change))} : it) : g)}, 'Update quantity')} onRemove={() => removeCardFromHand(card.instanceId, groupIndex)} isHighlighted={highlightedCardIds.includes(card.instanceId)} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave} onMouseMove={handleCardMouseMove} /> })}
                                                                    {group.length === 0 && <p className="text-[var(--color-text-muted)] text-center w-full">{t('startingHandPlaceholder')}</p>}
                                                                    <CardSelector cardPool={cardPool.filter(p => !group.find(c => c.instanceId === p.instanceId))} onCardSelected={(card) => { const newHands = [...startingHand]; newHands[groupIndex].push({instanceId: card.instanceId, quantity: 1}); setComboState({...comboState, startingHand: newHands}, "Added card to hand") }} displayAs="card-placeholder" t={t} preferredDirection="side" />
                                                                </div>
                                                            </div>
                                                            {groupIndex < startingHand.length - 1 && <div className="self-center font-bold text-2xl text-violet-400 px-2">{t('or')}</div>}
                                                        </React.Fragment>
                                                    ))}
                                                    <button onClick={() => setComboState({...comboState, startingHand: [...startingHand, []]}, 'Add alternate hand')} className="btn self-center px-3 py-1 bg-[var(--color-primary)] text-white text-sm font-semibold rounded-lg hover:bg-[var(--color-primary-hover)]">{t('addAlternateHand')}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                        <section id="notes-section" className="bg-[var(--color-surface)]/30 p-4 rounded-lg border border-[var(--color-border)]/30 notes-section">
                                            <h3 onClick={() => setIsNotesOpen(!isNotesOpen)} className="text-xl font-semibold text-[var(--color-secondary)] mb-3 flex justify-between items-center cursor-pointer select-none"><span>{t('notesTitle')}</span><i className={`fas fa-chevron-down transition-transform duration-300 ${isNotesOpen ? '' : '-rotate-90'}`}></i></h3>
                                            <div className={`collapse-box ${isNotesOpen ? 'is-open' : ''}`}><div className="collapse-inner">
                                            <RichTextEditor value={notes} onChange={newNotes => setComboState({...comboState, notes: newNotes}, "Updated notes")} />
                                            <p className="text-xs text-[var(--color-text-muted)] mt-2">{t('mentionHint')}</p>
                                            {(() => {
                                                const names = [...new Set([...htmlToText(notes).matchAll(MENTION_RE)].map(m => m[1].trim()))];
                                                if (!names.length) return null;
                                                return (
                                                    <div className="flex flex-wrap gap-2 mt-2 items-center">
                                                        <span className="text-xs text-[var(--color-text-muted)]">{t('mentionedCards')}:</span>
                                                        {names.map(nm => { const c = cardPool.find(x => (x.name || '').toLowerCase() === nm.toLowerCase()); return (
                                                            <button key={nm} type="button" onClick={() => c && setSelectedCardForZoom(c)} className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${c ? 'bg-violet-700/70 hover:bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'}`}>{c && <img src={c.image_url_small} alt="" className="w-4 h-6 object-cover rounded-sm" />}{nm}</button>
                                                        ); })}
                                                    </div>
                                                );
                                            })()}
                                            </div></div>
                                        </section>
                                    </div>
                                    <section id="combo-steps-section" className="bg-[var(--color-surface)]/30 p-4 rounded-lg border border-[var(--color-border)]/30 combo-steps">
                                        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                                            <h3 onClick={() => setIsStepsOpen(!isStepsOpen)} className="text-xl font-semibold text-[var(--color-secondary)] flex items-center gap-3 cursor-pointer select-none"><i className={`fas fa-chevron-down text-base transition-transform duration-300 ${isStepsOpen ? '' : '-rotate-90'}`}></i>{t('comboStepsTitle')}</h3>
                                            <div className="flex items-center"><div className="inline-flex rounded-lg overflow-hidden border border-[var(--color-border)] mr-2" role="group"><button onClick={() => setStepsView('grid')} aria-pressed={stepsView === 'grid'} aria-label={t('stepsViewGrid')} data-tooltip={t('stepsViewGrid')} className={`px-3 py-1 text-sm ${stepsView === 'grid' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><i className="fas fa-th-large"></i></button><button onClick={() => setStepsView('list')} aria-pressed={stepsView === 'list'} aria-label={t('stepsViewList')} data-tooltip={t('stepsViewList')} className={`px-3 py-1 text-sm ${stepsView === 'list' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><i className="fas fa-list-ol"></i></button><button onClick={() => setStepsView('compact')} aria-pressed={stepsView === 'compact'} aria-label={t('stepsViewCompact')} data-tooltip={t('stepsViewCompact')} className={`px-3 py-1 text-sm ${stepsView === 'compact' ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><i className="fas fa-align-left"></i></button></div><div className="inline-flex rounded-lg overflow-hidden border border-[var(--color-border)] mr-2" role="group">{[['s', 'fa-magnifying-glass-minus', 'sizeSmall'], ['m', 'fa-magnifying-glass', 'sizeNormal'], ['l', 'fa-magnifying-glass-plus', 'sizeLarge']].map(([k, ic, lb]) => <button key={k} onClick={() => setStepSize(k)} aria-pressed={stepSize === k} aria-label={t(lb)} data-tooltip={t(lb)} className={`px-2.5 py-1 text-sm ${stepSize === k ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}><i className={`fas ${ic}`}></i></button>)}</div>
                                                <button onClick={() => setComboState({...comboState, comboSteps: [...comboSteps, { type: 'group', id: generateId(), title: 'New Group' }]}, 'Added group')} className="btn px-3 py-1 bg-slate-600 text-white text-sm font-semibold rounded-lg hover:bg-slate-500 mr-2">{t('addGroup')}</button>
                                            </div>
                                        </div>
                                        <div className={`collapse-box ${isStepsOpen ? 'is-open' : ''}`}><div className="collapse-inner">
                                        {stepsView === 'compact' && (
                                            <ol className="text-sm divide-y divide-[var(--color-border)]/40 mb-3">
                                                {(() => { let cn = 0; return comboSteps.map(s => {
                                                    if (s.type === 'group') return <li key={s.id} className="pt-3 pb-1 text-xs font-bold uppercase tracking-wide text-amber-500">{s.title}</li>;
                                                    if (s.type === 'note') return s.text ? <li key={s.id} className="py-1 pl-10 text-xs italic text-[var(--color-text-muted)]">📝 {s.text}</li> : null;
                                                    if (s.type !== 'step') return null;
                                                    cn++;
                                                    const c = findCard(s.mainCardInstanceId);
                                                    const act = YGO_ACTIONS.find(a => a.name === s.actionType) || {};
                                                    const targets = (s.targetCards || []).map(tc => (findCard(tc.instanceId) || {}).name).filter(Boolean);
                                                    const vul = s.vulnerability && (s.vulnerability.text || (s.vulnerability.cards || []).length);
                                                    return (
                                                        <li key={s.id}>
                                                            <button type="button" onClick={() => { setStepsView('list'); setTimeout(() => { const el = document.querySelector(`[data-step-id="${s.id}"]`); if (el) el.scrollIntoView({ block: 'center' }); }, 80); }} className="w-full text-left py-1.5 flex items-start gap-2 hover:bg-[var(--color-surface)]/50 rounded">
                                                                <span className="w-8 shrink-0 text-right font-bold text-[var(--color-text-muted)]">{cn}.</span>
                                                                {c && <img src={c.image_url_small} alt="" className="w-6 h-9 object-cover rounded-sm shrink-0" />}
                                                                <span className="min-w-0">
                                                                    <span className="text-[var(--color-accent)]">{act.emoji} {s.actionType === 'Other' ? (s.customActionText || trTerm('Other')) : trTerm(s.actionType)}</span> <b>{c ? c.name : '?'}</b>
                                                                    {(s.targetCards || []).length ? <span className="text-[var(--color-text-muted)]"> → {(s.targetCards || []).map((tc, ti) => { const c2 = findCard(tc.instanceId); return c2 ? <span key={ti} className="inline-flex items-center gap-1 mr-2"><MoveBadge k={targetMove(s, tc)} className="mv-inline" />{c2.name}</span> : null; })}</span> : null}
                                                                    {(s.vulnerability && (s.vulnerability.cards || []).length) ? <span className="text-red-400"> ⚠ {(s.vulnerability.cards || []).map(vc => (vc.card || findCard(vc.instanceId) || {}).name).filter(Boolean).join(', ')}</span> : null}
                                                                    {s.location ? <span className="text-[var(--color-text-muted)]"> [{ZONE_ABBREVIATIONS[s.location] || trTerm(s.location)}]</span> : null}
                                                                    {vul ? ' ⚠️' : ''}{s.branch && s.branch.steps && s.branch.steps.length ? ' ⑂' : ''}
                                                                    {s.actionDescription ? <span className="block text-xs text-[var(--color-text-muted)] break-words">{stripMentions(htmlToText(s.actionDescription))}</span> : null}
                                                                </span>
                                                            </button>
                                                        </li>
                                                    );
                                                }); })()}
                                            </ol>
                                        )}
                                        <div style={{ gridTemplateColumns: `repeat(auto-fill,minmax(${stepSize === 's' ? '13rem' : stepSize === 'l' ? '22rem' : '17rem'},1fr))` }} className={`grid gap-4 steps-size-${stepSize} ${stepsView === 'list' ? 'steps-list' : ''} ${stepsView === 'compact' ? 'hidden' : ''}`} data-drop-area="comboSteps" onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, 'comboSteps')}>
                                            {comboSteps.map((step, index) => { 
                                                if (step.type === 'group') {
                                                    return (
                                                        <div 
                                                            key={step.id} 
                                                            className="col-span-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50"
                                                            data-step-box="1"
                                                            onDrop={e => { e.preventDefault(); e.stopPropagation(); const d = JSON.parse(e.dataTransfer.getData('text/plain')); if (d.type === 'step') handleReorder('step', d.data, step); setDragOverIndex(null); }}
                                                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(index); }}
                                                        >
                                                            <div className="cursor-move text-slate-400 step-icon-btn" draggable={true} onDragStart={e => { e.stopPropagation(); const box = e.currentTarget.closest('[data-step-box]'); if (box && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(box, 24, 24); handleDragStart(e, 'step', step); }} onDragEnd={handleDragEnd}><i className="fas fa-grip-vertical"></i></div>
                                                            <input type="text" value={step.title} onChange={e => updateStep(step.id, { title: e.target.value })} placeholder={t('groupTitlePlaceholder')} className="flex-grow p-1 text-lg font-bold bg-transparent text-amber-300 placeholder-amber-400/50 focus:bg-slate-700/50 rounded-lg outline-none" />
                                                            <button onClick={() => deleteStep(step.id)} className="step-icon-btn text-slate-400 hover:text-red-500" aria-label={t('delete')}><i className="fas fa-trash"></i></button>
                                                        </div>
                                                    )
                                                }
                                                if (step.type === 'note') {
                                                    return (
                                                        <div 
                                                            key={step.id} 
                                                            className="w-full bg-yellow-900/20 rounded-lg p-3 flex flex-col gap-2 relative border border-yellow-700/50 h-full"
                                                            data-step-box="1"
                                                            onDrop={e => { e.preventDefault(); e.stopPropagation(); const d = JSON.parse(e.dataTransfer.getData('text/plain')); if (d.type === 'step') handleReorder('step', d.data, step); setDragOverIndex(null); }}
                                                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(index); }}
                                                        >
                                                            <div className="absolute top-2 right-2 flex gap-1 z-20">
                                                                <div className="cursor-move text-yellow-400 step-icon-btn step-grip" draggable={true} onDragStart={e => { e.stopPropagation(); const box = e.currentTarget.closest('[data-step-box]'); if (box && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(box, 24, 24); handleDragStart(e, 'step', step); }} onDragEnd={handleDragEnd}><i className="fas fa-grip-vertical"></i></div>
                                                                <button onClick={() => deleteStep(step.id)} className="step-icon-btn text-slate-400 hover:text-red-500" aria-label={t('delete')}><i className="fas fa-trash"></i></button>
                                                            </div>
                                                            <div className="flex items-center gap-2 self-start">
                                                                <i className="fas fa-sticky-note text-yellow-400"></i>
                                                                <span className="font-bold text-yellow-300">{t('addNote')}</span>
                                                            </div>
                                                            <AutoResizeTextarea
                                                                value={step.text}
                                                                onChange={e => updateStep(step.id, { text: e.target.value })}
                                                                placeholder="Escribe tu nota aquí..."
                                                                rows="1"
                                                                className="w-full h-full flex-grow p-1 text-sm bg-transparent text-yellow-200 placeholder-yellow-400/50 focus:bg-slate-700/50 rounded-lg outline-none resize-none"
                                                            />
                                                        </div>
                                                    );
                                                }
                                                const mainCard = findCard(step.mainCardInstanceId); 
                                                const isVulnerable = step.vulnerability?.text || (step.vulnerability?.cards && step.vulnerability.cards.length > 0); 
                                                const stepNumber = actualSteps.findIndex(s => s.id === step.id);
                                                return (
                                                <React.Fragment key={step.id}>
                                                <div 
                                                    key={step.id}
                                                    data-step-box="1"
                                                    data-step-id={step.id}
                                                    onDrop={e => { e.preventDefault(); e.stopPropagation(); const d = JSON.parse(e.dataTransfer.getData('text/plain')); if (d.type === 'step') handleReorder('step', d.data, step); setDragOverIndex(null); }}
                                                    onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverIndex(index); }}
                                                    onDragLeave={e => { e.stopPropagation(); }}
                                                    className={`combo-step-card w-full bg-[var(--color-surface)]/50 rounded-lg p-3 flex flex-col gap-2 relative border ${isVulnerable ? 'step-vulnerable border-red-500/50' : 'border-transparent'} ${step.isLocked ? 'opacity-70' : ''}`} 
                                                    onMouseEnter={() => setHighlightedCardIds([step.mainCardInstanceId, ...step.targetCards.map(c => c.instanceId)])} 
                                                    onMouseLeave={() => setHighlightedCardIds([])}
                                                >
                                                    <div className={`step-corner absolute top-2 right-2 flex items-center gap-1 ${openStepMenuId === step.id ? 'z-40' : 'z-20'}`}>
                                                        <button onClick={() => updateStep(step.id, { vulnerability: { text: isVulnerable ? '' : 'Disrupción', cards: [] } })} className={`tutorial-vulnerability-btn step-icon-btn rounded-full ${isVulnerable ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'} hover:bg-red-600`} data-tooltip={t('markVulnerable')} aria-label={t('markVulnerable')}><i className="fas fa-exclamation-triangle"></i></button>
                                                        <div className="cursor-move text-slate-400 step-icon-btn step-grip" draggable={!step.isLocked} onDragStart={e => { e.stopPropagation(); const box = e.currentTarget.closest('[data-step-box]'); if (box && e.dataTransfer.setDragImage) e.dataTransfer.setDragImage(box, 24, 24); handleDragStart(e, 'step', step); }} onDragEnd={handleDragEnd}><i className="fas fa-grip-vertical"></i></div>
                                                        <div className="relative" data-step-menu="1">
                                                            <button onClick={() => setOpenStepMenuId(id => id === step.id ? null : step.id)} className={`step-icon-btn rounded-full ${openStepMenuId === step.id ? 'bg-violet-600 text-white' : 'bg-slate-700 text-slate-300'} hover:bg-violet-600 hover:text-white`} aria-label={t('stepMoreActions')} aria-haspopup="menu" aria-expanded={openStepMenuId === step.id} data-tooltip={t('stepMoreActions')}><i className="fas fa-ellipsis-h"></i></button>
                                                            {openStepMenuId === step.id && (
                                                                <div className="step-menu absolute right-0 top-full mt-1 w-60 rounded-lg shadow-xl py-1 text-sm" role="menu">
                                                                    <button onClick={() => { duplicateStep(step.id); setOpenStepMenuId(null); }} className="step-menu-item" role="menuitem"><i className="fas fa-clone w-5 text-center"></i>{t('duplicateStep')}</button>
                                                                <button onClick={() => { addBranch(step); setOpenStepMenuId(null); }} disabled={!!step.branch} className="step-menu-item" role="menuitem"><i className="fas fa-code-branch w-5 text-center"></i>{t('branchAdd')}</button>
                                                                    <button onClick={() => moveStep(step.id, -1)} disabled={index === 0} className="step-menu-item" role="menuitem"><i className="fas fa-arrow-up w-5 text-center"></i>{t('moveStepUp')}</button>
                                                                    <button onClick={() => moveStep(step.id, 1)} disabled={index === comboSteps.length - 1} className="step-menu-item" role="menuitem"><i className="fas fa-arrow-down w-5 text-center"></i>{t('moveStepDown')}</button>
                                                                    <CardSelector cardPool={cardPool} onCardSelected={item => { handleAddStepOrNote(item, index + 1); setOpenStepMenuId(null); }} allowNote={true} displayAs="menu-item" buttonText={t('insertStepBelow')} t={t} preferredDirection="side" />
                                                                    <button onClick={() => toggleStepLock(step.id)} className="step-menu-item" role="menuitem">{step.isLocked ? <i className="fas fa-lock w-5 text-center"></i> : <i className="fas fa-unlock w-5 text-center"></i>}{step.isLocked ? t('unlockStep') : t('lockStep')}</button>
                                                                    <div className="border-t border-[var(--color-border)] my-1"></div>
                                                                    <button onClick={() => { setDeleteFromIndex(index); setOpenStepMenuId(null); }} className="step-menu-item danger" role="menuitem"><i className="fas fa-undo-alt w-5 text-center"></i>{t('undoFromHere')}</button>
                                                                    <button onClick={() => { deleteStep(step.id); setOpenStepMenuId(null); }} disabled={step.isLocked} className="step-menu-item danger" role="menuitem"><i className="fas fa-trash w-5 text-center"></i>{t('deleteStepLabel')}</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="step-label font-bold text-[var(--color-text-muted)] self-start">{(language === 'en' ? 'Step' : t('stepLabel'))} {stepNumber + 1}</span>
                                                    <select value={step.actionType} onChange={e => updateStep(step.id, { actionType: e.target.value })} disabled={step.isLocked} className="tutorial-action-select bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded p-1 text-sm font-semibold text-[var(--color-accent)] w-full disabled:opacity-50 disabled:cursor-not-allowed">{YGO_ACTIONS.map(act => <option key={act.name} value={act.name}>{act.emoji} {trTerm(act.name)}</option>)}</select>
                                                    {step.actionType === 'Other' && ( <input type="text" value={step.customActionText || ''} onChange={e => updateStep(step.id, { customActionText: sanitizeHTML(e.target.value) })} disabled={step.isLocked} placeholder="Especificar acción..." className="w-full bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded p-1 text-xs text-center mt-1" /> )}
                                                    <div className="step-body">
                                                        <button type="button" className="side-tab side-tab-left" onClick={() => setOpenSide(o => o === step.id + ':left' ? null : step.id + ':left')} aria-label={t('sideVuln')}><i className="fas fa-triangle-exclamation"></i><span>{(step.vulnerability?.cards || []).length}</span></button>
                                                        <div className={`step-side step-side-left ${openSide === step.id + ':left' ? 'side-open' : ''}`} aria-label={t('sideVuln')}><button type="button" className="side-close" onClick={() => setOpenSide(null)} aria-label={t('closeLabel')}>×</button>
                                                            {(step.vulnerability?.cards || []).map(vCard => { const vc = vCard.card || findCard(vCard.instanceId); if (!vc) return null; return (
                                                                <div key={vCard.instanceId} className="side-thumb" title={vc.name}>
                                                                    <img src={vc.image_url_cropped || vc.image_url_small} alt={vc.name} onClick={() => setSelectedCardForZoom(vc)} onMouseEnter={() => handleCardMouseEnter(vc)} onMouseLeave={handleCardMouseLeave} crossOrigin="anonymous" />
                                                                    <span className="mv-badge mv-warn" aria-hidden="true"><i className="fas fa-triangle-exclamation"></i></span>
                                                                    {!step.isLocked && <button type="button" className="side-remove" aria-label={t('delete')} onClick={() => { const newVCards = step.vulnerability.cards.filter(c => c.instanceId !== vCard.instanceId); updateStep(step.id, { vulnerability: { ...step.vulnerability, cards: newVCards } }); }}>×</button>}
                                                                </div>
                                                            ); })}
                                                            {!step.isLocked && <CardSelector cardPool={cardPool} mode="all" onCardSelected={card => addVulnCard(step, card)} displayAs="side-add" t={t} preferredDirection="side" wrapperClassName="side-add-vuln" />}
                                                        </div>
                                                        <div className="step-main flex justify-center relative"><CardDisplay card={mainCard} size="medium" onClick={c => setSelectedCardForZoom(c)} isHighlighted={highlightedCardIds.includes(step.mainCardInstanceId)} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave} onMouseMove={handleCardMouseMove} /></div>
                                                        <div className={`step-side step-side-right ${openSide === step.id + ':right' ? 'side-open' : ''}`} aria-label={t('sideTargets')}><button type="button" className="side-close" onClick={() => setOpenSide(null)} aria-label={t('closeLabel')}>×</button>
                                                            {(step.targetCards || []).map((target, ti) => { const tc = findCard(target.instanceId); if (!tc) return null; const mk = targetMove(step, target); return (
                                                                <div key={`target-${target.instanceId}-${ti}`} className={`side-thumb ${highlightedCardIds.includes(target.instanceId) ? 'side-hl' : ''}`} title={`${tc.name} — ${moveLabel(mk)}`}>
                                                                    <img src={tc.image_url_cropped || tc.image_url_small} alt={tc.name} onClick={() => setSelectedCardForZoom(tc)} onMouseEnter={() => handleCardMouseEnter(tc)} onMouseLeave={handleCardMouseLeave} crossOrigin="anonymous" />
                                                                    <MoveBadge k={mk} wiggle={wiggleKeys.has(step.id + ':' + target.instanceId)} title={`${moveLabel(mk)} (${t('moveChange')})`} onClick={step.isLocked ? undefined : (e) => openMovePicker(e, step.id, target.instanceId)} />
                                                                    {target.quantity > 1 && <span className="side-qty">×{target.quantity}</span>}
                                                                    {!step.isLocked && <button type="button" className="side-remove" aria-label={t('delete')} onClick={() => removeTargetCardFromStep(step.id, target.instanceId)}>×</button>}
                                                                </div>
                                                            ); })}
                                                            {!step.isLocked && <CardSelector wrapperClassName="tutorial-add-target-btn" cardPool={cardPool} onCardSelected={card => addTargetCard(step, card)} displayAs="side-add" t={t} preferredDirection="side" />}
                                                        </div>
                                                        <button type="button" className="side-tab side-tab-right" onClick={() => setOpenSide(o => o === step.id + ':right' ? null : step.id + ':right')} aria-label={t('sideTargets')}><span>{(step.targetCards || []).length}</span><i className="fas fa-clone"></i></button>
                                                    </div>
                                                    <button onClick={() => setZonePickerStepId(step.id)} className="btn text-xs py-1 px-2 bg-slate-600 hover:bg-slate-500 mb-2">{step.location ? (ZONE_ABBREVIATIONS[step.location] || trTerm(step.location)) : t('location')}</button>
                                                    {isVulnerable && (!step.vulnerability.cards || step.vulnerability.cards.length === 0) && (<input type="text" value={step.vulnerability.text} onChange={e => updateStep(step.id, { vulnerability: {...step.vulnerability, text: sanitizeHTML(e.target.value)} })} disabled={step.isLocked} placeholder={t('sideVuln') + '...'} className="w-full bg-red-900/50 border border-red-500/50 text-red-300 placeholder-red-400 rounded p-1 text-xs text-center disabled:opacity-50"/>)}
                                                    {isVulnerable && !step.branch && <button type="button" onClick={() => addBranch(step)} className="self-start text-xs font-semibold text-red-300 hover:text-red-200 px-2 py-1 rounded bg-red-900/30"><i className="fas fa-code-branch mr-1"></i>{t('branchAdd')}</button>}
                                                    <AutoResizeTextarea
                                                        value={step.actionDescription}
                                                        onChange={e => updateStep(step.id, { actionDescription: sanitizeHTML(e.target.value) })}
                                                        disabled={step.isLocked}
                                                        placeholder={t('stepDescribeAction')}
                                                        rows="1"
                                                        className="tutorial-description-input w-full bg-transparent mt-auto p-1 border-b border-[var(--color-border)] focus:border-[var(--color-primary)] outline-none text-xs text-center disabled:opacity-50 resize-none break-all"
                                                    />
                                                </div>
                                                {step.branch && (
                                                    <div className="branch-box col-span-full ml-4 md:ml-10 border-l-4 border-red-500 bg-red-900/15 rounded-r-lg p-3 flex flex-col gap-2">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <i className="fas fa-code-branch text-red-400"></i>
                                                            <input value={step.branch.title || ''} onChange={e => setBranch(step.id, { ...step.branch, title: sanitizeHTML(e.target.value) })} aria-label={t('branchTitleLabel')} placeholder={t('branchDefaultTitle')} className="flex-1 min-w-[10rem] bg-transparent font-semibold text-red-200 outline-none focus:bg-black/20 rounded px-1" />
                                                            <span className="text-xs text-[var(--color-text-muted)]">{t('branchFromStep', { n: stepNumber + 1 })}</span>
                                                            <button onClick={() => removeBranch(step)} aria-label={t('branchRemove')} data-tooltip={t('branchRemove')} className="step-icon-btn text-slate-400 hover:text-red-500"><i className="fas fa-trash"></i></button>
                                                        </div>
                                                        {(step.branch.steps || []).map((bs, bi) => { const bc = findCard(bs.mainCardInstanceId); return (
                                                            <div key={bs.id} className="flex flex-wrap items-center gap-2 bg-black/20 rounded p-2">
                                                                <span className="font-bold text-red-300 w-10 text-right">{stepNumber + 1}.{bi + 1}</span>
                                                                {bc && <CardDisplay card={bc} size="tiny" onClick={c => setSelectedCardForZoom(c)} />}
                                                                <span className="text-sm font-semibold min-w-0 max-w-[11rem] truncate">{bc ? bc.name : '?'}</span>
                                                                <select value={bs.actionType} onChange={e => updateBranchStep(step, bs.id, { actionType: e.target.value })} className="bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded p-1 text-xs">{YGO_ACTIONS.map(act => <option key={act.name} value={act.name}>{act.emoji} {trTerm(act.name)}</option>)}</select>
                                                                <input value={bs.actionDescription || ''} onChange={e => updateBranchStep(step, bs.id, { actionDescription: sanitizeHTML(e.target.value) })} placeholder={t('stepDescribeAction')} className="flex-1 min-w-[8rem] bg-transparent border-b border-[var(--color-border)] text-xs p-1 outline-none" />
                                                                <button onClick={() => removeBranchStep(step, bs.id)} aria-label={t('delete')} className="step-icon-btn text-slate-400 hover:text-red-500"><i className="fas fa-times"></i></button>
                                                            </div>
                                                        ); })}
                                                        <div className="max-w-xs"><CardSelector cardPool={cardPool} onCardSelected={card => addBranchStep(step, card)} displayAs="button" buttonText={t('branchAddStep')} t={t} /></div>
                                                    </div>
                                                )}
                                                </React.Fragment>
                                            )})}
                                            <div className="steps-add-slot flex items-center justify-center w-full min-h-[10rem]" onDragOver={(e) => {e.preventDefault(); setDragOverIndex(comboSteps.length);}}><CardSelector cardPool={cardPool} onCardSelected={handleAddStepOrNote} allowNote={true} displayAs="card-placeholder" t={t} preferredDirection="side" /></div>
                                        </div>
                                        </div></div>
                                    </section>
                                    <section className="bg-[var(--color-surface)]/30 p-4 rounded-lg border border-[var(--color-border)]/30 final-board">
                                            <h3 onClick={() => setIsFinalBoardOpen(!isFinalBoardOpen)} className="text-xl font-semibold text-[var(--color-secondary)] mb-3 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)]/50 transition-colors">
                                                <span>
                                                    {t('finalBoardTitle')}
                                                    {disruptionCount > 0 && (
                                                        <span className="text-lg text-red-400 ml-2">({disruptionCount} {t('finalBoardDisruption')})</span>
                                                    )}
                                                </span>
                                                <i className={`fas fa-chevron-down transition-transform duration-300 ${isFinalBoardOpen ? '' : '-rotate-90'}`}></i>
                                            </h3>
                                             <div className={`collapse-box ${isFinalBoardOpen ? 'is-open' : ''}`}><div className="collapse-inner"><div className="grid gap-4 lg:grid-cols-2 items-start"><div>
                                                
                                                <div data-drop-area="finalBoard" onDragOver={(e) => {e.preventDefault(); e.currentTarget.classList.add('drag-over')}} onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')} onDrop={(e) => handleDrop(e, 'finalBoard')} className={`drop-zone p-4 bg-black/20 rounded-lg min-h-[9.5rem] flex flex-wrap gap-3 border-2 border-dashed border-[var(--color-border)] ${finalBoardCards.length === 0 ? 'justify-center items-center' : 'justify-start items-start'}`}>
                                                    {finalBoardCards.map(item => (
                                                        <div key={item.id} className="flex flex-col items-center gap-1 w-28" draggable={true} onDragStart={e => handleDragStart(e, 'board-card', item)} onDrop={e => { e.preventDefault(); e.stopPropagation(); const d = JSON.parse(e.dataTransfer.getData('text/plain')); if (d.type === 'board-card') handleReorder('board', d.data, item); }}>
                                                            <CardDisplay card={item.card} size="small" onClick={c => setSelectedCardForZoom(c)} onRemove={() => removeCardFromFinalBoard(item.id)} isHighlighted={highlightedCardIds.includes(item.card.instanceId)} onMouseEnter={handleCardMouseEnter} onMouseLeave={handleCardMouseLeave} onMouseMove={handleCardMouseMove} />
                                                            <select value={item.zone} onChange={e => updateFinalBoardCard(item.id, { zone: e.target.value })} className="bg-[var(--color-surface-light)] border border-[var(--color-border)] rounded p-1 text-xs w-full">{YGO_ZONES.map(zone => <option key={zone} value={zone}>{trTerm(zone)}</option>)}</select>
                                                            <label className="flex items-center justify-center gap-1.5 text-xs mt-1 cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                                                                <input type="checkbox" checked={item.isDisruption || false} onChange={() => updateFinalBoardCard(item.id, { isDisruption: !item.isDisruption })} className="h-4 w-4 bg-slate-600 border-slate-500 text-violet-500 focus:ring-violet-500 rounded" />
                                                                {t('finalBoardDisruption')}
                                                            </label>
                                                        </div>
                                                    ))}
                                                    <CardSelector cardPool={cardPool.filter(p => !finalBoardCards.find(fb => fb.card.instanceId === p.instanceId))} onCardSelected={addCardToFinalBoard} displayAs="card-placeholder" t={t} preferredDirection="up" />
                                                </div>
                                            </div>
                                            <div className="final-board-mini-col">{finalBoardCards.length > 0 ? <FinalBoardMini items={finalBoardCards} onCardClick={c => setSelectedCardForZoom(c)} /> : <div className="h-full min-h-[9.5rem] rounded-lg border-2 border-dashed border-[var(--color-border)] flex items-center justify-center text-center text-sm text-[var(--color-text-muted)] p-4"><span><i className="fas fa-chess-board text-2xl block mb-2"></i>{t('finalBoardMiniEmpty')}</span></div>}</div>
                                            </div></div></div>
                                        </section>
                                    <section className="bg-[var(--color-surface)]/30 rounded-lg border border-[var(--color-border)]/30">
                                            <h3 onClick={() => setIsStatsOpen(!isStatsOpen)} className="text-xl font-semibold text-[var(--color-secondary)] p-4 flex justify-between items-center cursor-pointer hover:bg-[var(--color-surface)]/50 transition-colors">
                                                <span>{t('comboStatsTitle')}</span>
                                                <i className={`fas fa-chevron-down transition-transform duration-300 ${isStatsOpen ? '' : '-rotate-90'}`}></i>
                                            </h3>
                                            <div className={`collapse-box ${isStatsOpen ? 'is-open' : ''}`}>
                                                <div className="collapse-inner"><ComboStats stats={comboStats} t={t} /></div>
                                            </div>
                                        </section>
                                </div>
                            </div>
                        </main>
                    </div>
                </React.Fragment>
            );
        };
        
        const root = createRoot(document.getElementById('app-container'));
        root.render(<App />);

    
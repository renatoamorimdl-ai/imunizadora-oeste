(function(){
  var C = window.SITE_CONFIG, dl = window.dataLayer;
  function track(event, params){
    params = params || {};
    dl.push(Object.assign({event: event}, params));
    if (window.fbq) {
      var map = {click_whatsapp:'Contact', click_phone:'Contact', generate_lead:'Lead', form_start:'InitiateCheckout'};
      if (map[event]) fbq('track', map[event], params);
    }
  }
  window.ioTrack = track;

  // Store helper (tolerante a navegador sem storage)
  var store = {
    get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } },
    set: function(k,v){ try { localStorage.setItem(k,v); } catch(e){} }
  };

  // Atribuição: UTMs / gclid / fbclid (first-touch + last-touch)
  var qs = new URLSearchParams(location.search), keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'];
  var attr = {}; keys.forEach(function(k){ if (qs.get(k)) attr[k] = qs.get(k); });
  if (Object.keys(attr).length) {
    attr.landing_page = location.href; attr.referrer = document.referrer;
    store.set('io_last_touch', JSON.stringify(attr));
    if (!store.get('io_first_touch')) store.set('io_first_touch', JSON.stringify(attr));
  }
  var saved = {}; try { saved = JSON.parse(store.get('io_last_touch') || '{}'); } catch(e){}
  var form = document.getElementById('form-orcamento');
  keys.concat(['landing_page','referrer']).forEach(function(k){
    var el = form.elements[k]; if (el) el.value = saved[k] || (k==='landing_page' ? location.href : k==='referrer' ? document.referrer : '');
  });

  // WhatsApp
  function waLink(text){ return 'https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(text); }
  document.querySelectorAll('.js-wa').forEach(function(a){
    a.href = waLink(a.dataset.waMsg || 'Olá, Imunizadora Oeste! Vim pelo site e gostaria de um orçamento.');
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Cliques rastreados
  document.addEventListener('click', function(e){
    var el = e.target.closest('[data-track]'); if (!el || el.tagName === 'DETAILS') return;
    track(el.dataset.track, {click_location: el.dataset.loc || '', service: el.dataset.service || '', link_url: el.href || ''});
    if (el.dataset.service) { var s = document.getElementById('f-serv'); var map={limpeza_fossa:1,desentupimento:2,efluentes_industriais:3,locacao_banheiros:4,manutencao_banheiros:5}; s.selectedIndex = map[el.dataset.service]||0; }
  });
  document.querySelectorAll('details[data-track]').forEach(function(d){
    d.addEventListener('toggle', function(){ if (d.open) track('faq_open', {question: d.querySelector('summary').textContent}); });
  });

  // Visualização de seções
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) {
          en.target.classList.add('in');
          var sec = en.target.id;
          if (sec && !seen[sec]) { seen[sec] = 1; track('section_view', {section: sec}); }
        }
      });
    }, {threshold: .25});
    document.querySelectorAll('.reveal, main > section[id]').forEach(function(el){ io.observe(el); });
  } else { document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); }); }

  // Profundidade de rolagem
  var marks = [25,50,75,90], hit = {};
  addEventListener('scroll', function(){
    var p = (scrollY + innerHeight) / document.documentElement.scrollHeight * 100;
    marks.forEach(function(m){ if (p >= m && !hit[m]) { hit[m] = 1; track('scroll_depth', {percent: m}); } });
  }, {passive: true});

  // Formulário
  var started = false;
  form.addEventListener('focusin', function(){ if (!started) { started = true; track('form_start', {form_id: 'orcamento'}); } });
  var tel = document.getElementById('f-tel');
  tel.addEventListener('input', function(){
    var d = tel.value.replace(/\D/g,'').slice(0,11), o = d;
    if (d.length > 2) o = '(' + d.slice(0,2) + ') ' + d.slice(2);
    if (d.length > 7) o = '(' + d.slice(0,2) + ') ' + d.slice(2, d.length-4) + '-' + d.slice(-4);
    tel.value = o;
  });
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (form.elements.empresa_site.value) return; // honeypot
    var ok = true;
    ['nome','telefone','servico','cidade'].forEach(function(n){
      var el = form.elements[n], bad = !el.value.trim() || (n==='telefone' && el.value.replace(/\D/g,'').length < 10);
      el.style.borderColor = bad ? 'var(--red)' : ''; if (bad) ok = false;
    });
    if (!ok) { track('form_error', {form_id: 'orcamento'}); return; }
    var data = Object.fromEntries(new FormData(form).entries()); delete data.empresa_site;
    var first = {}; try { first = JSON.parse(store.get('io_first_touch') || '{}'); } catch(err){}
    data.first_touch_source = first.utm_source || '';
    // Enhanced Conversions: dados do usuário (o GTM faz o hash)
    dl.push({user_data: {email: data.email || undefined, phone_number: '+55' + data.telefone.replace(/\D/g,'')}});
    track('generate_lead', {form_id: 'orcamento', service: data.servico, client_type: data.tipo_cliente, city: data.cidade, value: 1, currency: 'BRL'});
    if (C.leadWebhook) { try { navigator.sendBeacon(C.leadWebhook, new Blob([JSON.stringify(data)], {type: 'application/json'})); } catch(err){} }
    form.classList.add('sent');
    var msg = 'Olá, Imunizadora Oeste! Gostaria de um orçamento.\n\n' +
      'Nome: ' + data.nome + '\nServiço: ' + data.servico + '\nCidade/bairro: ' + data.cidade +
      '\nTipo: ' + data.tipo_cliente + (data.data ? '\nData: ' + data.data.split('-').reverse().join('/') : '') +
      (data.mensagem ? '\nDetalhes: ' + data.mensagem : '');
    window.open(waLink(msg), '_blank', 'noopener');
  });

  // Menu mobile
  var btn = document.querySelector('.menu-btn'), menu = document.getElementById('menu');
  btn.addEventListener('click', function(){ var o = menu.classList.toggle('open'); btn.setAttribute('aria-expanded', o); });
  menu.addEventListener('click', function(e){ if (e.target.tagName === 'A') { menu.classList.remove('open'); btn.setAttribute('aria-expanded', false); } });

  // Consentimento LGPD
  var ck = document.getElementById('cookie');
  if (!store.get('io_consent')) ck.classList.add('show');
  function setConsent(v){
    store.set('io_consent', v); ck.classList.remove('show');
    var g = v === 'granted' ? 'granted' : 'denied';
    gtag('consent', 'update', {ad_storage:g, ad_user_data:g, ad_personalization:g, analytics_storage:g});
    if (window.fbq) fbq('consent', v === 'granted' ? 'grant' : 'revoke');
    track('consent_update', {consent: v});
  }
  document.getElementById('ck-yes').onclick = function(){ setConsent('granted'); };
  document.getElementById('ck-no').onclick = function(){ setConsent('denied'); };
  document.getElementById('cookie-prefs').onclick = function(e){ e.preventDefault(); ck.classList.add('show'); };

  document.getElementById('ano').textContent = new Date().getFullYear();
})();

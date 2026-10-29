const ACTION_COPY = {
  en: { share: 'Share', embed: 'Embed', install: 'Add to home screen', close: 'Close', copy: 'Copy embed code', copied: 'Copied', title: 'Share or embed this tool', hint: 'Add Pratix.io to your home screen for quick access.', ios: 'On iPhone or iPad, tap Share in your browser and choose “Add to Home Screen”.' },
  tr: { share: 'Paylaş', embed: 'Göm', install: 'Ana ekrana ekle', close: 'Kapat', copy: 'Gömme kodunu kopyala', copied: 'Kopyalandı', title: 'Aracı paylaş veya göm', hint: 'Hızlı erişim için Pratix.io’yu ana ekranınıza ekleyin.', ios: 'iPhone veya iPad’de tarayıcıdaki Paylaş düğmesine dokunup “Ana Ekrana Ekle” seçeneğini seçin.' },
  de: { share: 'Teilen', embed: 'Einbetten', install: 'Zum Startbildschirm', close: 'Schließen', copy: 'Einbettungscode kopieren', copied: 'Kopiert', title: 'Tool teilen oder einbetten', hint: 'Fügen Sie Pratix.io für schnellen Zugriff zum Startbildschirm hinzu.', ios: 'Tippen Sie auf iPhone oder iPad im Browser auf Teilen und wählen Sie „Zum Home-Bildschirm“.' },
  fr: { share: 'Partager', embed: 'Intégrer', install: 'Ajouter à l’écran d’accueil', close: 'Fermer', copy: 'Copier le code', copied: 'Copié', title: 'Partager ou intégrer cet outil', hint: 'Ajoutez Pratix.io à votre écran d’accueil.', ios: 'Sur iPhone ou iPad, touchez Partager puis « Sur l’écran d’accueil ».' },
  es: { share: 'Compartir', embed: 'Insertar', install: 'Añadir a pantalla de inicio', close: 'Cerrar', copy: 'Copiar código', copied: 'Copiado', title: 'Compartir o insertar esta herramienta', hint: 'Añade Pratix.io a tu pantalla de inicio.', ios: 'En iPhone o iPad, toca Compartir y selecciona «Añadir a pantalla de inicio».' },
  it: { share: 'Condividi', embed: 'Incorpora', install: 'Aggiungi alla schermata', close: 'Chiudi', copy: 'Copia codice', copied: 'Copiato', title: 'Condividi o incorpora lo strumento', hint: 'Aggiungi Pratix.io alla schermata iniziale.', ios: 'Su iPhone o iPad tocca Condividi e scegli «Aggiungi alla schermata Home».' },
  nl: { share: 'Delen', embed: 'Insluiten', install: 'Aan startscherm toevoegen', close: 'Sluiten', copy: 'Insluitcode kopiëren', copied: 'Gekopieerd', title: 'Tool delen of insluiten', hint: 'Voeg Pratix.io toe aan je startscherm.', ios: 'Tik op iPhone of iPad op Delen en kies “Zet op beginscherm”.' },
  sv: { share: 'Dela', embed: 'Bädda in', install: 'Lägg till på hemskärmen', close: 'Stäng', copy: 'Kopiera kod', copied: 'Kopierad', title: 'Dela eller bädda in verktyget', hint: 'Lägg till Pratix.io på hemskärmen.', ios: 'På iPhone eller iPad: tryck på Dela och välj ”Lägg till på hemskärmen”.' },
  da: { share: 'Del', embed: 'Integrer', install: 'Føj til hjemmeskærm', close: 'Luk', copy: 'Kopiér kode', copied: 'Kopieret', title: 'Del eller integrer værktøjet', hint: 'Føj Pratix.io til hjemmeskærmen.', ios: 'På iPhone eller iPad: tryk på Del og vælg “Føj til hjemmeskærm”.' },
  no: { share: 'Del', embed: 'Bygg inn', install: 'Legg til på startskjermen', close: 'Lukk', copy: 'Kopier kode', copied: 'Kopiert', title: 'Del eller bygg inn verktøyet', hint: 'Legg Pratix.io på startskjermen.', ios: 'På iPhone eller iPad: trykk Del og velg «Legg til på Hjem-skjerm». ' },
  fi: { share: 'Jaa', embed: 'Upota', install: 'Lisää aloitusnäyttöön', close: 'Sulje', copy: 'Kopioi upotuskoodi', copied: 'Kopioitu', title: 'Jaa tai upota työkalu', hint: 'Lisää Pratix.io aloitusnäyttöön.', ios: 'iPhonessa tai iPadissa napauta Jaa ja valitse ”Lisää Koti-valikkoon”.' },
  zh: { share: '分享', embed: '嵌入', install: '添加到主屏幕', close: '关闭', copy: '复制嵌入代码', copied: '已复制', title: '分享或嵌入此工具', hint: '将 Pratix.io 添加到主屏幕以便快速访问。', ios: '在 iPhone 或 iPad 上点击浏览器的分享，然后选择“添加到主屏幕”。' },
  pt: { share: 'Partilhar', embed: 'Incorporar', install: 'Adicionar ao ecrã principal', close: 'Fechar', copy: 'Copiar código', copied: 'Copiado', title: 'Partilhe ou incorpore esta ferramenta', hint: 'Adicione o Pratix.io ao ecrã principal.', ios: 'No iPhone ou iPad, toque em Partilhar e escolha “Adicionar ao ecrã principal”.' }
};

function actionEscape(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function actionMarkup(language = 'en') {
  const copy = ACTION_COPY[language] || ACTION_COPY.en;
  const labels = JSON.stringify(copy);
  return `
<style data-pratix-actions-style>
.pratix-actions{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:flex;gap:7px;align-items:center;padding:7px;border:1px solid rgba(148,163,184,.35);border-radius:14px;background:rgba(255,255,255,.9);box-shadow:0 10px 30px rgba(15,23,42,.14);backdrop-filter:blur(14px);font:600 12px/1.2 system-ui,sans-serif}.pratix-actions button{border:0;border-radius:9px;padding:8px 10px;background:transparent;color:#334155;cursor:pointer;white-space:nowrap}.pratix-actions button:hover{background:#eff6ff;color:#1d4ed8}.pratix-actions .pratix-action-primary{background:#2563eb;color:#fff}.pratix-actions .pratix-action-primary:hover{background:#1d4ed8;color:#fff}.pratix-actions-dialog{width:min(560px,calc(100% - 28px));border:1px solid #e2e8f0;border-radius:18px;padding:0;box-shadow:0 24px 70px rgba(15,23,42,.24);color:#0f172a}.pratix-actions-dialog::backdrop{background:rgba(15,23,42,.35);backdrop-filter:blur(2px)}.pratix-actions-dialog-inner{padding:22px}.pratix-actions-dialog h2{margin:0 0 15px;font:750 20px/1.2 system-ui,sans-serif}.pratix-share-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0 18px}.pratix-share-grid a,.pratix-share-grid button{display:block;border:1px solid #e2e8f0;border-radius:10px;padding:10px 7px;background:#fff;color:#334155;text-align:center;text-decoration:none;font:650 12px system-ui;cursor:pointer}.pratix-share-grid a:hover,.pratix-share-grid button:hover{border-color:#93c5fd;background:#eff6ff}.pratix-embed-code{width:100%;min-height:92px;resize:vertical;border:1px solid #cbd5e1;border-radius:10px;padding:10px;font:12px/1.4 ui-monospace,SFMono-Regular,monospace}.pratix-dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.pratix-dialog-actions button{border:1px solid #cbd5e1;border-radius:9px;padding:9px 12px;background:#fff;cursor:pointer}.pratix-dialog-actions .pratix-copy{background:#2563eb;border-color:#2563eb;color:#fff}@media(max-width:640px){.pratix-actions{right:10px;left:10px;bottom:10px;justify-content:space-between}.pratix-actions button{padding:9px 7px;font-size:11px}.pratix-share-grid{grid-template-columns:repeat(2,1fr)}}@media print{.pratix-actions,.pratix-actions-dialog{display:none!important}}
</style>
<div class="pratix-actions" data-pratix-actions role="toolbar" aria-label="Pratix tools">
  <button type="button" class="pratix-action-primary" data-pratix-share>${actionEscape(copy.share)}</button>
  <button type="button" data-pratix-embed>${actionEscape(copy.embed)}</button>
  <button type="button" data-pratix-install>${actionEscape(copy.install)}</button>
</div>
<dialog class="pratix-actions-dialog" data-pratix-dialog>
  <div class="pratix-actions-dialog-inner">
    <h2>${actionEscape(copy.title)}</h2>
    <div class="pratix-share-grid">
      <a data-pratix-social="whatsapp" target="_blank" rel="noopener">WhatsApp</a>
      <a data-pratix-social="x" target="_blank" rel="noopener">X</a>
      <a data-pratix-social="facebook" target="_blank" rel="noopener">Facebook</a>
      <a data-pratix-social="linkedin" target="_blank" rel="noopener">LinkedIn</a>
      <a data-pratix-social="email">Email</a>
      <button type="button" data-pratix-copy-link>Copy link</button>
    </div>
    <textarea class="pratix-embed-code" data-pratix-embed-code readonly aria-label="Embed code"></textarea>
    <p data-pratix-install-hint style="margin:11px 0 0;color:#64748b;font:13px/1.5 system-ui">${actionEscape(copy.hint)}</p>
    <p data-pratix-ios-hint hidden style="margin:7px 0 0;color:#64748b;font:13px/1.5 system-ui">${actionEscape(copy.ios)}</p>
    <div class="pratix-dialog-actions"><button type="button" data-pratix-close>${actionEscape(copy.close)}</button><button type="button" class="pratix-copy" data-pratix-copy-embed>${actionEscape(copy.copy)}</button></div>
  </div>
</dialog>
<script data-pratix-actions-script>
(()=>{
  const copy=${labels};
  const bar=document.querySelector('[data-pratix-actions]'), dialog=document.querySelector('[data-pratix-dialog]');
  if(!bar||!dialog||bar.dataset.ready==='1') return; bar.dataset.ready='1';
  const url=location.href.split('#')[0], title=document.title||'Pratix.io tool';
  const embed='<iframe src="'+url+'" title="'+title+'" loading="lazy" style="width:100%;min-height:560px;border:0;border-radius:12px" referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  const code=dialog.querySelector('[data-pratix-embed-code]'); code.value=embed;
  const open=()=>{if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','')};
  bar.querySelector('[data-pratix-share]').onclick=async()=>{if(navigator.share){try{await navigator.share({title,url})}catch(e){if(e.name!=='AbortError')open()}}else open()};
  bar.querySelector('[data-pratix-embed]').onclick=open;
  dialog.querySelector('[data-pratix-close]').onclick=()=>dialog.close?dialog.close():dialog.removeAttribute('open');
  dialog.querySelector('[data-pratix-copy-embed]').onclick=async()=>{await navigator.clipboard?.writeText(code.value);dialog.querySelector('[data-pratix-copy-embed]').textContent=copy.copied;setTimeout(()=>dialog.querySelector('[data-pratix-copy-embed]').textContent=copy.copy,1500)};
  dialog.querySelector('[data-pratix-copy-link]').onclick=async()=>{await navigator.clipboard?.writeText(url);dialog.querySelector('[data-pratix-copy-link]').textContent=copy.copied;setTimeout(()=>dialog.querySelector('[data-pratix-copy-link]').textContent='Copy link',1500)};
  const shareUrls={whatsapp:'https://api.whatsapp.com/send?text='+encodeURIComponent(title+' '+url),x:'https://twitter.com/intent/tweet?text='+encodeURIComponent(title)+'&url='+encodeURIComponent(url),facebook:'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(url),linkedin:'https://www.linkedin.com/sharing/share-offsite/?url='+encodeURIComponent(url),email:'mailto:?subject='+encodeURIComponent(title)+'&body='+encodeURIComponent(url)};
  dialog.querySelectorAll('[data-pratix-social]').forEach(a=>{const target=a.dataset.pratixSocial;a.href=shareUrls[target];if(target==='email')a.target='_self'});
  let deferredPrompt=null; window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredPrompt=event});
  if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});
  bar.querySelector('[data-pratix-install]').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;return}dialog.querySelector('[data-pratix-ios-hint]').hidden=false;open()};
})();
</script>`;
}

function injectToolActions(html, language = 'en') {
  if (html.includes('data-pratix-actions')) return html;
  const pwaHead = html.includes('manifest.webmanifest') ? html : html.replace('</head>', '<link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/favicon.svg" type="image/svg+xml"><meta name="apple-mobile-web-app-capable" content="yes">\n</head>');
  return pwaHead.replace('</body>', `${actionMarkup(language)}\n</body>`);
}

module.exports = { injectToolActions };

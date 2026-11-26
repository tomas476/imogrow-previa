/* Pixel do Meta com aviso de cookies.
   - Só carrega o pixel depois de a pessoa carregar em "Aceitar" (regras europeias).
   - Cada clique num botão de WhatsApp conta como "Lead" no Meta.
   - Enquanto PIXEL_ID estiver vazio, nada é carregado nem mostrado. */
(() => {
  const PIXEL_ID = "1639410437543529"; // ← o ID do pixel (só números), tirado do Gestor de Eventos do Meta
  if (!PIXEL_ID) return;

  const KEY = "ig-consent";
  let consent = "";
  try { consent = localStorage.getItem(KEY) || ""; } catch (e) {}

  const TXT = {
    pt: { msg: "Usamos cookies do Meta para perceber se os nossos anúncios funcionam. Só são ativados se aceitares.", yes: "Aceitar", no: "Recusar", mais: "Política de privacidade" },
    en: { msg: "We use Meta cookies to see whether our ads work. They are only turned on if you accept.", yes: "Accept", no: "Decline", mais: "Privacy policy" }
  };
  const lang = () => (document.documentElement.lang || "pt").startsWith("en") ? "en" : "pt";

  function loadPixel() {
    if (window.fbq) return;
    /* Código oficial do Meta */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }

  /* Clique no WhatsApp = Lead. Fica à escuta na página toda, por isso apanha todos os botões. */
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-wa]");
    if (!a || !window.fbq) return;
    fbq("track", "Lead", { content_name: { imoveis: "Imóveis", brand: "Marca pessoal" }[a.dataset.wa] || "WhatsApp" });
    /* No telemóvel a app do WhatsApp abre logo e o browser pode não chegar a enviar o Lead.
       Por isso esperamos um instante e só depois abrimos o WhatsApp (no mesmo separador,
       para o browser não bloquear como se fosse uma janela pop-up).
       No computador o site fica aberto noutro separador, por isso não é preciso. */
    if (matchMedia("(pointer: coarse)").matches && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const href = a.href;
      setTimeout(() => { location.href = href; }, 350);
    }
  });

  if (consent === "yes") { loadPixel(); return; }
  if (consent === "no") return;

  /* Aviso de cookies */
  const bar = document.createElement("div");
  bar.className = "consent";
  bar.setAttribute("role", "dialog");
  bar.setAttribute("aria-label", "Cookies");
  bar.innerHTML = `<p class="consent__msg"></p>
    <div class="consent__btns"><button type="button" class="consent__no"></button><button type="button" class="consent__yes"></button></div>`;
  const paint = () => {
    const t = TXT[lang()];
    const msg = bar.querySelector(".consent__msg");
    msg.textContent = t.msg + " ";
    const a = document.createElement("a");
    a.href = "./privacidade/";
    a.textContent = t.mais;
    msg.appendChild(a);
    bar.querySelector(".consent__yes").textContent = t.yes;
    bar.querySelector(".consent__no").textContent = t.no;
  };
  const answer = v => {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    bar.remove();
    if (v === "yes") loadPixel();
  };
  bar.querySelector(".consent__yes").addEventListener("click", () => answer("yes"));
  bar.querySelector(".consent__no").addEventListener("click", () => answer("no"));
  document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setTimeout(paint)));
  paint();
  document.body.appendChild(bar);
})();

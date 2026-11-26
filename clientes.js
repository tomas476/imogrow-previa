/* As setas e a inclinação dos cartões de clientes, copiadas do site antigo (imogrow.pt). */

/* As setas da fila de clientes: uma avanca um cartao, a outra recua, e cada
   uma some-se na ponta em que ja nao ha para onde ir. Uma seta para lado
   nenhum e pior que nenhuma seta.

   O passo e o mesmo nos dois sentidos (90% da largura visivel) para o par ser
   reversivel: quem avanca e volta a recuar tem de aterrar no cartao de onde
   saiu, senao a fila fica meia posicao ao lado a cada ida e volta. */
(function () {
  var palco = document.querySelector('.cl-fila-palco');
  if (!palco) return;
  var fila = palco.querySelector('.cl-fila');
  var frente = palco.querySelector('.cl-seta--frente');
  var tras = palco.querySelector('.cl-seta--tras');
  if (!fila || !frente || !tras) return;
  var MARGEM = 8;
  /* A fila ainda nao assentou quando o script corre pela primeira vez: mede-se
     scrollLeft 20 e so dois segundos depois e que ela repousa em 4, com as
     fontes ja carregadas e o snap ja acertado. Com a decisao presa so ao
     scrollLeft, a seta de recuar acendia nesse intervalo e apagava-se sozinha
     a seguir, que foi o que se viu ao descer ate aos clientes.

     A correccao nao e afinar a tolerancia, e perceber o que a seta quer dizer:
     recuar so faz sentido depois de alguem ter avancado. Ao chegar a pagina
     esta-se no primeiro cartao por definicao, e nao ha nada para tras. Por
     isso ela espera por um gesto sobre a fila em vez de esperar por um numero
     que ainda esta a mudar. */
  var mexeu = false;
  function marcarGesto() { mexeu = true; }
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    fila.addEventListener(ev, marcarGesto, { passive: true });
  });

  function estado() {
    var scrollavel = fila.scrollWidth > fila.clientWidth + MARGEM;
    var fim = fila.scrollLeft >= fila.scrollWidth - fila.clientWidth - MARGEM;
    var inicio = fila.scrollLeft <= MARGEM;
    /* 'flex' e nao '': com o CSS a nascer em display:none, o valor vazio
       devolvia-as ao none da folha e nenhuma das duas voltava a aparecer. */
    frente.style.display = (scrollavel && !fim) ? 'flex' : 'none';
    tras.style.display = (mexeu && scrollavel && !inicio) ? 'flex' : 'none';
  }
  function andar(sentido) {
    fila.scrollBy({ left: sentido * fila.clientWidth * 0.9, behavior: 'smooth' });
  }
  /* Carregar na seta tambem conta como ter avancado: e o outro caminho para
     sair do primeiro cartao, e sem isto quem usasse so as setas nunca via a
     de voltar. */
  frente.addEventListener('click', function () { marcarGesto(); andar(1); });
  tras.addEventListener('click', function () { andar(-1); });
  fila.addEventListener('scroll', estado, { passive: true });
  addEventListener('resize', estado, { passive: true });
  /* A fila muda de medida depois desta primeira corrida: as fontes chegam, os
     retratos assentam, e o proprio scroll-snap acerta a posicao de repouso.
     Sem voltar a medir nesses momentos, a decisao ficava presa a uma
     fotografia tirada cedo demais. */
  if (window.ResizeObserver) new ResizeObserver(estado).observe(fila);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(estado);
  addEventListener('load', estado);
  estado();
})();

/*----*/

/* Tilt do cartao de cliente. Delegado no document de proposito: o support.js
   re-renderiza a arvore do x-dc pouco depois do primeiro paint e um listener
   preso ao no morria ali. Aqui nao ha nos guardados — procura-se o cartao a
   cada evento, que so custa quando o rato anda mesmo por cima. */
(function () {
  var fino = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  var parado = window.matchMedia && matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!fino || parado) return;

  var MAX = 5;   /* graus. Mais do que isto e o texto comeca a nadar */
  document.addEventListener('pointermove', function (e) {
    var card = e.target && e.target.closest && e.target.closest('[data-cl-tilt]');
    if (!card) return;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    card.style.setProperty('--cl-ry', ((px - .5) * 2 * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--cl-rx', ((.5 - py) * 2 * MAX).toFixed(2) + 'deg');
    card.style.setProperty('--cl-mx', (px * 100).toFixed(1) + '%');
    card.style.setProperty('--cl-my', (py * 100).toFixed(1) + '%');
  }, {passive: true});

  document.addEventListener('pointerleave', function (e) {
    var card = e.target && e.target.closest && e.target.closest('[data-cl-tilt]');
    if (!card) return;
    card.style.setProperty('--cl-rx', '0deg');
    card.style.setProperty('--cl-ry', '0deg');
  }, true);
})();

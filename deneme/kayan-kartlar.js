// DENEME — yana kayan kartlar (Terminal "One Modular Platform"). Çıkarılabilir: index.html'deki
// <section id="deneme-kartlar"> satırını ve bu dosya ile kayan-kartlar.css'in iki satırını silmek yeterli.
// Sekmeler ya da oklarla kart seçilir; seçili kart genişler, bulanık fotoğraf + açıklama + düğme gösterir; diğerleri düz renk,
// üstüne gelince fotoğraf görünür. Kartların sağ kenarında çentik var.
(() => {
  const kap = document.getElementById("deneme-kartlar");
  if (!kap) return;
  const KART = [
    { s: "Proje", h: "Projeden anahtar teslime", p: "Mimari proje, statik ve uygulama; yangın güvenliğini binayla birlikte çizer, anahtarı teslim ederiz.", img: "I03-bina", odak: "75% 50%", renk: "vurgu", bag: "#acilis" },
    { s: "Algılama", h: "Dumanı ilk anda fark eden sistem", p: "Dedektör, ihbar butonu ve algılama panosu: projelendirme, montaj, programlama ve periyodik bakım.", img: "I05-dedektor", odak: "70% 30%", renk: "gece", bag: "#yangin" },
    { s: "Söndürme", h: "Elinizin altında doğru söndürücü", p: "Tüp, dolap, sprinkler ve yangın kapısı; dolum, kontrol ve etiketleme tek elden.", img: "T4-otel-tuplu", odak: "52% 40%", renk: "gri", bag: "#tup" },
    { s: "Tartı", h: "Kantardan teraziye doğru tartı", p: "Kamyon kantarından hassas teraziye satış, kurulum, muayene ve kalibrasyon.", img: "I14-kantar-hava", odak: "70% 60%", renk: "vurgu", bag: "#kantar" },
  ];
  kap.innerHTML = `<div class="ic">
    <div class="ortali"><p class="etiket">Hizmetlerimiz</p><h2 class="baslik" style="margin-top:22px">Tek ekip, dört iş.</h2></div>
    <div class="kk-ust"><div class="kk-sekmeler" role="tablist">${KART.map((k, i) => `<button type="button" role="tab" data-i="${i}">${k.s}</button>`).join("")}</div>
      <div class="kk-oklar"><button type="button" data-yon="-1" aria-label="Önceki">‹</button><button type="button" data-yon="1" aria-label="Sonraki">›</button></div></div>
    <div class="kk-pencere"><div class="kk-ray">${KART.map((k, i) => `<article class="kk-kart ${k.renk}" data-i="${i}">
      <img src="gorsel/${k.img}.webp" style="object-position:${k.odak}" alt="" loading="lazy">
      <div class="kk-yazi"><p class="kk-etiket">${k.s}</p><h3>${k.h}</h3><p class="kk-ac">${k.p}</p></div>
      <a class="kk-dugme" href="${k.bag}">Daha fazla</a></article>`).join("")}</div></div></div>`;
  const ray = kap.querySelector(".kk-ray"), kartlar = [...ray.children], sekmeler = [...kap.querySelectorAll(".kk-sekmeler button")];
  let aktif = 0;
  const sec = (i) => {
    aktif = (i + KART.length) % KART.length;
    kartlar.forEach((k, j) => k.classList.toggle("acik", j === aktif));
    sekmeler.forEach((b, j) => b.setAttribute("aria-selected", String(j === aktif)));
    // seçili kart görünür kalsın: genişlikler CSS'teki oranlardan (--kk-ac, --kk-kp), ray o kadar sola kayar
    const st = getComputedStyle(kap), C = kap.querySelector(".kk-pencere").clientWidth, gap = 16;
    const ac = C * parseFloat(st.getPropertyValue("--kk-ac")) / 100, kp = C * parseFloat(st.getPropertyValue("--kk-kp")) / 100;
    const sol = aktif * (kp + gap), toplam = ac + (KART.length - 1) * (kp + gap);
    ray.style.transform = `translate3d(${-Math.max(0, Math.min(sol, toplam - C))}px,0,0)`;
  };
  kap.addEventListener("click", (e) => {
    const s = e.target.closest(".kk-sekmeler button"), o = e.target.closest(".kk-oklar button"), k = e.target.closest(".kk-kart:not(.acik)");
    if (s) sec(+s.dataset.i); else if (o) sec(aktif + +o.dataset.yon); else if (k) { e.preventDefault(); sec(+k.dataset.i); }
  });
  addEventListener("resize", () => sec(aktif));
  sec(0);
})();

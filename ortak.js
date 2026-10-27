// Kaptan demo — bütün sayfalarda ortak parçalar: üst çubuk, alt bilgi, iletişim çağrısı, sepet ve ürün çekmeceleri,
// telefon menüsü, referans/bayilik ızgaraları ve durumsal renk için bulunulan bölüm. Sayfa: <body data-sayfa="ana|hakkimizda|urunler">
(() => {
  const SAYFA = document.body.dataset.sayfa || "ana";
  const ANA = SAYFA === "ana";
  const ana = (id) => (ANA ? `#${id}` : `./#${id}`);
  const KY = window.KATALOG.kurumlar.find((k) => k.kisa_ad === "KY");
  const MENU = [["hakkimizda", "Hakkımızda", "hakkimizda"], [ana("tup"), "Yangın"], [ana("kantar"), "Kantar"], ["magaza/", "Ürünler", "urunler"], ["#iletisim", "İletişim"]];

  document.body.insertAdjacentHTML("afterbegin", `<header class="ust" id="ust">
  <a class="logo" href="${ANA ? "#acilis" : "./"}"><i></i>KAPTAN</a>
  <nav class="menu" id="menu">${MENU.map(([href, ad, s]) => `<a href="${href}" class="${s === SAYFA ? "on sayfa" : ""}">${ad}</a>`).join("")}</nav>
  <div class="sag"><a class="dugme kirmizi" href="#iletisim">Teklif al</a><button class="sepet-ust" id="sepet-dugme" aria-label="Sepet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.3 8h11.4a1 1 0 0 1 1 1.1l-1 9.8a2 2 0 0 1-2 1.8H8.3a2 2 0 0 1-2-1.8l-1-9.8a1 1 0 0 1 1-1.1z"/><path d="M9 11V6a3 3 0 0 1 6 0v5"/></svg><b id="sepet-sayi">0</b></button><button class="burger" id="burger" aria-label="Menü"><span></span></button></div>
</header>`);

  // Ana sayfada iletişim kapanış sahnesinde; alt sayfalarda kısa bir çağrı bandı
  const main = document.querySelector("main");
  if (!ANA) main.insertAdjacentHTML("beforeend", `<section class="cagri" id="iletisim" data-unsur="yangin"><div class="ic">
    <div><p class="etiket">İletişim</p><h2 class="baslik" style="margin-top:20px">Bir telefon uzağınızdayız<b class="nokta">.</b></h2>
      <p class="giris">Keşif, teklif ya da bakım için yazın; en kısa sürede dönelim.</p></div>
    <div class="cagri-sag"><div class="iletisim-bilgi"><span><em>Telefon</em>${KY.telefon}</span><span><em>E-posta</em>${KY.eposta}</span><span><em>Adres</em>Samatya, Fatih / İstanbul</span></div>
      <div class="hizli" style="display:flex"><a class="dugme beyaz" href="tel:+9${KY.telefon.replace(/\D/g, "")}">Ara</a><a class="dugme kirmizi" data-wa="Merhaba, teklif almak istiyorum." href="#">WhatsApp'tan yaz</a></div></div></div></section>`);

  // Alt bilgi HTML'de duruyorsa (Araclar/seo-sayfalar.py yazar; JS'siz tarayıcılar da bağlantıları görsün) yeniden eklenmez
  main.insertAdjacentHTML("afterend", `${document.querySelector("footer.alt") ? "" : `<footer class="alt">
  <div class="kapak"><span class="duz"></span><span class="egri"></span><span class="orta"></span><span class="egri ters"></span><span class="duz"></span></div>
  <div class="ic">
    <div><a class="logo" href="./"><i></i>KAPTAN</a><p style="margin-top:18px;max-width:280px">İstanbul ve Antalya'da yangın güvenliği, kantar ve terazi.</p></div>
    <div><h5>Hizmetler</h5><a href="yangin-tupu-dolum">Yangın tüpü dolumu</a><a href="yangin-sondurucu-bakim">Periyodik kontrol ve bakım</a><a href="hakkimizda">Hakkımızda</a><a href="hakkimizda#kurumlar">Referanslar</a></div>
    <div><h5>Ürünler</h5><a href="yangin-sondurucu">Yangın söndürücüler</a><a href="terazi-kantar">Terazi ve kantar</a><a href="magaza/">Tüm katalog</a></div>
    <div><h5>İletişim</h5><p>Kaptan Yangın · ${KY.telefon}</p><a href="istanbul-fatih">Merkez: Samatya, Fatih / İstanbul</a><a href="antalya-finike">Şube: Finike / Antalya</a></div>
    <p class="kucuk">© 2026 Kaptan Yangın</p>
  </div>
</footer>`}
<div class="cekmece" id="sepet"><div class="golge" data-kapat></div>
  <aside><header><div><h3 class="ara-baslik" style="font-size:26px">Sepet</h3><small id="sepet-ozet"></small></div><button class="kapat" data-kapat aria-label="Kapat">×</button></header>
    <div class="sepet-ic" id="sepet-ic"></div>
    <div class="sepet-alt" id="sepet-alt"></div></aside></div>
<div class="cekmece detay" id="detay"><div class="golge" data-kapat></div>
  <aside><header><div><small id="detay-tur"></small></div><button class="kapat" data-kapat aria-label="Kapat">×</button></header>
    <div class="detay-ic" id="detay-ic"></div></aside></div>`);

  // Referans ve bayilik ızgaraları (Terminal "brands you know"): hücreler CSS grid'de; çizgiler ve kesişimdeki artılar hücre
  // sınırlarından ölçülüp SVG'ye piksel hizasında çizilir. İmlecin çevresindeki çizgiler tema rengiyle yanar, üstünde durulan
  // hücre tema rengine döner. Logolar yer tutucu: onaylandıkça [ad, işaret, stil] yerine gerçek logo görseli gelecek.
  const ISARET = {
    halka: '<circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="3.2"/>',
    elmas: '<path d="M12 1.5 22.5 12 12 22.5 1.5 12z"/>',
    yarim: '<path d="M2 15a10 10 0 0 1 20 0z"/><rect x="2" y="17.5" width="20" height="3.5"/>',
    ucgen: '<path d="M12 2.5 22.5 21h-21z"/>',
    cubuk: '<rect x="2.5" y="5" width="4.6" height="16"/><rect x="9.7" y="9" width="4.6" height="12"/><rect x="16.9" y="2" width="4.6" height="19"/>',
    dalga: '<path d="M2 9c3.3-4 6.7-4 10 0s6.7 4 10 0M2 16c3.3-4 6.7-4 10 0s6.7 4 10 0" fill="none" stroke="currentColor" stroke-width="3"/>',
    arti: '<path d="M8.5 2h7v6.5H22v7h-6.5V22h-7v-6.5H2v-7h6.5z"/>',
    altigen: '<path d="M12 2.2 20.6 7v10L12 21.8 3.4 17V7z" fill="none" stroke="currentColor" stroke-width="3"/>',
  };
  // [ad, logo dosyası (logo/ altında, tek renge çevrilmiş saydam PNG) | null, alt yazı]. Logolar CSS maskesiyle tek renkte çizilir.
  // { ad, logo (logo/ altında tek renk saydam PNG), oran (genişlik/yükseklik), amblem (logonun altında ad yazılır), url }
  // Logolar optik olarak eşit görünsün diye alanı sabit tutulur: genişlik ∝ √oran, yükseklik ∝ 1/√oran.
  const SB = "logo/saglik-bakanligi.png", HARITA = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  const KURUMLAR = [
    { ad: "Demre Devlet Hastanesi", logo: SB, oran: 1, amblem: 1, url: "https://demredh.saglik.gov.tr" },
    { ad: "Kumluca Devlet Hastanesi", logo: SB, oran: 1, amblem: 1, url: "https://kumlucadh.saglik.gov.tr" },
    { ad: "Finike Devlet Hastanesi", logo: SB, oran: 1, amblem: 1, url: "https://finikedh.saglik.gov.tr" },
    { ad: "Meysan", logo: "logo/meysan.png", oran: 1.67, url: HARITA("Meysan Finike Antalya") },
    { ad: "Asya Fresh", logo: "logo/asya-fresh.png", oran: 1.57, amblem: 1, url: "https://www.asyafresh.com" },
    { ad: "Ruby Rose", logo: "logo/ruby-rose.png", oran: 4.64, url: HARITA("Ruby Rose Cosmetics Trakya Serbest Bölge Çatalca İstanbul") },
    { ad: "Club Marco Polo", logo: "logo/marco-polo.png", oran: 4.88, url: "https://www.marcopolo.com.tr" },
  ];
  const BAYILER = [{ ad: "CAS", logo: "logo/cas.png", oran: 3.21 }, { ad: "TEM", logo: "logo/tem.png", oran: 1.93 },
    { ad: "HANA", logo: "logo/hana.png", oran: 3.81 }, { ad: "GÜNAŞ" }];
  // Çekirdek yerleşim (K = logo, . = boş). Izgara sayfa genişliğine yayılır: çekirdeğin iki yanına ekranı aşacak kadar boş
  // sütun, üstüne ve altına birer boş satır eklenir; kenarlar ve üst/alt satır solar. Öğe sayısı kadar K olur (tekrar yok).
  const DUZEN = {
    kurum: { ogeler: KURUMLAR, masa: ["KKKK", "KKK."], tel: ["KKK", "KKK", ".K."] },
    bayi: { ogeler: BAYILER, masa: ["KKKK"], tel: ["KK", "KK"] },
  };
  const telIzgara = matchMedia("(max-width: 820px)");
  const kok = location.pathname.includes("/magaza/") ? "../" : "";
  const logoYer = ({ ad, logo, oran = 1, amblem }) => {
    if (!logo) return `<span class="logo-yazi">${ad}</span>`;
    const k = amblem ? 36 : 44, w = Math.min(82, k * Math.sqrt(oran)), h = w / oran; // hücreye oranla %
    return `<span class="logo-kap ${amblem ? "amblem" : ""}"><span class="logo-img" role="img" aria-label="${ad}" style="--logo:url(${kok}${logo});width:${w.toFixed(1)}%;height:${h.toFixed(1)}%"></span>${amblem ? `<span class="logo-yazi">${ad}</span>` : ""}</span>`;
  };
  let izgaraNo = 0;
  document.querySelectorAll("[data-izgara]").forEach((el) => {
    const duzen = DUZEN[el.dataset.izgara], no = ++izgaraNo;
    let ic, satirlar = [], sut = 0, X = [], Y = [], imza = "";
    const kur = () => {
      const W = el.clientWidth, tel = telIzgara.matches, cekirdek = tel ? duzen.tel : duzen.masa, cs = cekirdek[0].length;
      // hücre boyu içerik genişliğinden: çekirdek satır sayfanın içerik alanını doldurur (logolar büyük kalır)
      const icerik = Math.min(1180, W - 2 * Math.min(56, Math.max(18, W * .034)));
      const hucre = Math.round(tel ? W / 3.15 : Math.min(230, Math.max(130, icerik / cs)));
      const yan = Math.max(1, Math.ceil((W / hucre - cs) / 2) + 1); // ekranı her iki yanda aşan boş sütun
      sut = cs + 2 * yan;
      const bos = ".".repeat(sut);
      satirlar = [bos, ...cekirdek.map((r) => ".".repeat(yan) + r + ".".repeat(yan)), bos];
      if (imza === `${sut}/${hucre}/${satirlar.length}`) return ciz();
      imza = `${sut}/${hucre}/${satirlar.length}`;
      el.style.setProperty("--hucre", hucre + "px");
      el.style.setProperty("--uc", Math.round(hucre * .55) + "px");
      el.style.setProperty("--kenar-sol", Math.max(0, (W - cs * hucre) / 2) + "px");
      let k = 0;
      el.innerHTML = `<div class="izgara-ic" style="grid-template-columns:repeat(${sut},${hucre}px);grid-template-rows:${Math.round(hucre * .55)}px repeat(${cekirdek.length},${hucre}px) ${Math.round(hucre * .55)}px">` + satirlar.join("").split("").map((c) => c === "K" ? (() => { const o = duzen.ogeler[k++]; return o.url ? `<a class="hucre bagli" href="${o.url}" target="_blank" rel="noopener" aria-label="${o.ad}">${logoYer(o)}</a>` : `<div class="hucre">${logoYer(o)}</div>`; })() : `<div class="hucre bos"></div>`).join("")
        + `<svg class="cizgiler" aria-hidden="true"><defs><radialGradient id="isik-${no}" gradientUnits="userSpaceOnUse" r="100"><stop offset="0" stop-opacity=".55"/><stop offset=".45" stop-opacity=".18"/><stop offset="1" stop-opacity="0"/></radialGradient></defs>
          <g class="taban"></g><g class="artilar"></g><g class="isik" stroke="url(#isik-${no})"></g></svg></div>`;
      ic = el.querySelector(".izgara-ic");
      ic.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; son = e; el.classList.add("isikli"); if (!bekle) { bekle = true; requestAnimationFrame(isik); } });
      ic.addEventListener("pointerleave", () => { son = null; el.classList.remove("isikli"); ic.querySelectorAll(".hucre.on").forEach((c) => c.classList.remove("on")); });
      ciz();
    };
    const art = (x, y) => `M${x - 5.5} ${y}h11M${x} ${y - 5.5}v11`;
    const ciz = () => {
      if (!ic) return;
      const kutu = ic.getBoundingClientRect(), hucreler = ic.querySelectorAll(".hucre");
      if (!kutu.width) return;
      // çizgi konumları gerçek hücre sınırlarından (yarım piksel = keskin 1 px çizgi)
      X = [...Array(sut).keys()].map((i) => hucreler[i].getBoundingClientRect().left - kutu.left); X.push(kutu.width);
      Y = satirlar.map((_, j) => hucreler[j * sut].getBoundingClientRect().top - kutu.top); Y.push(kutu.height);
      X = X.map((x) => Math.round(x) + .5); Y = Y.map((y) => Math.round(y) + .5);
      const svg = ic.querySelector(".cizgiler");
      svg.setAttribute("viewBox", `0 0 ${kutu.width} ${kutu.height}`);
      const yol = X.map((x) => `M${x} 0V${kutu.height}`).join("") + Y.map((y) => `M0 ${y}H${kutu.width}`).join("");
      // artılar tek tek: fare ızgaraya girince rastgele gecikmeyle yanıp sönerek belirir (Terminal "cross-flicker")
      svg.querySelector(".taban").innerHTML = `<path d="${yol}"/>`;
      svg.querySelector(".artilar").innerHTML = X.flatMap((x) => Y.map((y) => `<path d="${art(x, y)}" style="--g:${Math.round(Math.random() * 420)}ms"/>`)).join("");
      svg.querySelector(".isik").innerHTML = `<path d="${yol}"/>`;
    };
    // imleç: çizgilerde ışık, seçili hücrede çerçeve + dört köşede artı
    let bekle = false, son = null;
    const isik = () => {
      bekle = false;
      if (!son || !ic) return;
      const kutu = ic.getBoundingClientRect(), x = son.clientX - kutu.left, y = son.clientY - kutu.top;
      const g = ic.querySelector(`#isik-${no}`);
      g.setAttribute("cx", x); g.setAttribute("cy", y);
      const i = X.findIndex((v, n) => n < X.length - 1 && x >= v && x < X[n + 1]), j = Y.findIndex((v, n) => n < Y.length - 1 && y >= v && y < Y[n + 1]);
      const h = i < 0 || j < 0 ? null : ic.querySelectorAll(".hucre")[j * sut + i];
      ic.querySelectorAll(".hucre.on").forEach((c) => c !== h && c.classList.remove("on"));
      if (h && !h.classList.contains("bos")) {
        h.classList.add("on");
        const r = h.getBoundingClientRect(); // hücre ışığı imlecin olduğu yerden yayılır
        h.style.setProperty("--mx", son.clientX - r.left + "px"); h.style.setProperty("--my", son.clientY - r.top + "px");
      }
    };
    new ResizeObserver(kur).observe(el);
    telIzgara.addEventListener("change", kur);
    kur();
  });

  // Telefon menüsü
  const menu = document.getElementById("menu");
  document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("acik"));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.classList.remove("acik"); });

  // WhatsApp (Kaptan Katalog'daki Kaptan Yangın numarası)
  window.waAc = (metin, tel = KY.telefon) => open(`https://wa.me/9${tel.replace(/\D/g, "")}?text=${encodeURIComponent(metin)}`, "_blank");
  document.addEventListener("click", (e) => { const a = e.target.closest("[data-wa]"); if (a) { e.preventDefault(); waAc(a.dataset.wa); } });

  // Durumsal renk: ekranın %40 çizgisindeki bölümün unsuru <body>'ye yazılır (üst çubuk ve sabit öğeler onu izler)
  const unsurlar = [...document.querySelectorAll("main > [data-unsur]")];
  let bekliyor = false;
  const bak = () => {
    bekliyor = false;
    const y = innerHeight * .4;
    const aktif = unsurlar.find((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom > y; });
    const u = aktif ? aktif.dataset.unsur : unsurlar[0]?.dataset.unsur;
    if (u && document.body.dataset.unsur !== u) document.body.dataset.unsur = u;
  };
  addEventListener("scroll", () => { if (!bekliyor) { bekliyor = true; requestAnimationFrame(bak); } }, { passive: true });
  addEventListener("resize", bak);
  bak();

  // Başlıklar ekrana girince kelime kelime açılır (sahne dışındaki başlıklar)
  const kel = (el) => {
    let i = 0;
    el.innerHTML = el.innerHTML.split(/(<br>)/).map((p) => p === "<br>" ? p : p.split(" ").filter(Boolean).map((w) => `<span class="k" style="--i:${i++}"><span>${w.replace(/\.$/, '<b class="nokta">.</b>')}</span></span>`).join(" ")).join("");
  };
  window.kelimeKelime = kel;
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("acik"); io.unobserve(e.target); } }), { threshold: .3 });
  document.querySelectorAll("main > :not(.sahne) .bol").forEach((h) => { kel(h); io.observe(h); });
})();

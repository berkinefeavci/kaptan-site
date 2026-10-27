// Kaptan demo — mağaza. Veri: katalog.js (Kaptan Katalog). Sepet Kaptan Katalog ile ortak: localStorage "kaptan-sepet" = { ürün no: adet }.
// Ana sayfada #cesitler + #oneler (vitrin), Ürünler sayfasında #magaza-icerik (tam mağaza) çizilir; sepet ve ayrıntı ikisinde de ortak.
(() => {
  const K = window.KATALOG;
  const $ = (s, r = document) => r.querySelector(s);
  const KURUM = Object.fromEntries(K.kurumlar.map((k) => [k.kisa_ad, k]));
  const URUN = new Map();
  K.bolumler.forEach((b) => b.urunler.forEach((u) => URUN.set(u.id, { ...u, kurum: b.kurum, bolum: b.kategori })));
  const tl = (x) => (x == null ? null : Number(x).toLocaleString("tr-TR", { maximumFractionDigits: 0 }) + " ₺");
  const boy = (u) => (u.kapasite ? Number(u.kapasite).toLocaleString("tr-TR", { maximumFractionDigits: 1 }) : "");
  const kacir = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Söndürücü aileleri (Kaptan Katalog'daki aile kartlarıyla aynı). Eşleme sırası önemli: özel olan önce.
  const AILE = [
    { k: "kkt", ad: "KKT yangın tüpü", sinif: ["A", "B", "C"], ac: "Katı, sıvı ve gaz yangınlarında etkili kuru kimyevi toz." },
    { k: "co2", ad: "CO₂ tüpü", sinif: ["B"], ek: "ve elektrik", ac: "Elektrik panosu ve hassas cihazlarda iz bırakmadan söndürür.", es: /CO₂/ },
    { k: "kopuk", ad: "Köpüklü tüp", sinif: ["A", "B"], ac: "Akaryakıt ve boya gibi sıvı yangınlarının üstünü örterek söndürür.", es: /köpüklü/i },
    { k: "pano", ad: "Pano tipi söndürücü", sinif: [], ek: "FM-200 temiz gaz", ac: "Pano içine takılır; ısıyı algılayınca kendiliğinden boşalır, kalıntı bırakmaz.", es: /FM-200/ },
    { k: "sprinkli", ad: "Sprinkli söndürücü", sinif: ["A", "B", "C"], ac: "Tavana asılır; ısıyla açılan uç tozu doğrudan aşağı boşaltır.", es: /sprinkli/i },
    { k: "davlumbaz", ad: "Davlumbaz söndürücü", sinif: ["A", "F"], ac: "Mutfak yağ yangınları için; kızgın yağın üstünü kapatıp soğutur.", es: /davlumbaz/i },
    { k: "temiz", ad: "Temiz gazlı tüp", sinif: ["A", "B"], ac: "Kalıntı bırakmaz; elektronik cihaz ve arşiv için.", es: /FK-5-1-12|temiz gaz/i },
  ];
  const ysc = K.bolumler.find((b) => b.kategori === "ysc").urunler.map((u) => URUN.get(u.id));
  const aileOf = (u) => (AILE.slice(1).find((a) => a.es.test(u.ad)) || AILE[0]).k;
  AILE.forEach((a) => { a.urunler = ysc.filter((u) => aileOf(u) === a.k).sort((x, y) => x.kapasite - y.kapasite); });
  const AILELER = AILE.filter((a) => a.urunler.length);
  const secili = {}; // aile → seçili ürün no (varsayılan 6 kg, yoksa ilk boy)
  AILELER.forEach((a) => { secili[a.k] = (a.urunler.find((u) => Number(u.kapasite) === 6) || a.urunler[0]).id; });

  // Görseli olmayan yangın güvenliği ürünleri için sitedeki iç mekân kareleri
  const SAHNE = [[/dedektör/i, "I05-dedektor", "74% 18%"], [/ihbar/i, "I04-buton", "88% 45%"], [/dolab/i, "I08-dolap", "80% 50%"], [/kapı/i, "I09-kapi", "70% 45%"]];
  const foto = (u, ek = "") => {
    if (u.gorsel) return `<div class="foto" data-detay="${u.id}" ${ek}><img src="${u.gorsel}" alt="${kacir(u.ad)}" loading="lazy"></div>`;
    const s = SAHNE.find(([r]) => r.test(u.ad));
    if (s) return `<div class="foto sahne" data-detay="${u.id}" ${ek}><img src="gorsel/${s[1]}.webp" style="object-position:${s[2]}" alt="${kacir(u.ad)}" loading="lazy"></div>`;
    return `<div class="foto" data-detay="${u.id}" ${ek}><span class="etiket" style="color:var(--ink-3)">Görsel yakında</span></div>`;
  };

  // ---------- Sepet (Kaptan Katalog ile ortak) ----------
  let sepet = {};
  try { sepet = JSON.parse(localStorage.getItem("kaptan-sepet")) || {}; } catch {}
  const sakla = () => { try { localStorage.setItem("kaptan-sepet", JSON.stringify(sepet)); } catch {} };
  const ekle = (id, n = 1) => { sepet[id] = (sepet[id] || 0) + n; if (sepet[id] <= 0) delete sepet[id]; sakla(); sepetCiz(); yenile(); };
  const sepetteki = () => Object.entries(sepet).map(([id, adet]) => ({ u: URUN.get(Number(id)), adet })).filter((x) => x.u);

  function sepetCiz() {
    const k = sepetteki(), adet = k.reduce((t, x) => t + x.adet, 0);
    $("#sepet-sayi").textContent = adet;
    $("#sepet-dugme").classList.toggle("gorunur", adet > 0);
    $("#sepet-ozet").textContent = adet ? `${adet} ürün` : "";
    if (!k.length) { $("#sepet-ic").innerHTML = `<p class="bos">Sepet boş.</p>`; $("#sepet-alt").innerHTML = ""; return; }
    const firmalar = [...new Set(k.map((x) => x.u.kurum))];
    let toplam = 0, fiyatsiz = 0;
    $("#sepet-ic").innerHTML = firmalar.map((f) => {
      const kal = k.filter((x) => x.u.kurum === f);
      const ara = kal.reduce((t, x) => t + (x.u.fiyat ? x.u.fiyat * x.adet : 0), 0);
      toplam += ara; fiyatsiz += kal.filter((x) => !x.u.fiyat).length;
      return `<section class="firma"><h4><span>${kacir(KURUM[f].ad)}</span><span>${tl(ara)}</span></h4><ul>${kal.map((x) => `<li>
        ${x.u.gorsel ? `<img src="${x.u.gorsel}" alt="">` : `<span></span>`}
        <div><span class="ad">${kacir(x.u.ad)}</span><span class="tl">${x.u.fiyat ? `${x.adet} × ${tl(x.u.fiyat)}` : "Fiyat sorulacak"}</span></div>
        <div class="adet"><button data-azalt="${x.u.id}" aria-label="Azalt">−</button><span>${x.adet}</span><button data-artir="${x.u.id}" aria-label="Artır">+</button></div></li>`).join("")}</ul>
        <button class="dugme kirmizi gonder" data-gonder="${f}">${kacir(KURUM[f].ad)}'a WhatsApp'tan gönder</button></section>`;
    }).join("");
    $("#sepet-alt").innerHTML = `<div><span>Toplam</span><b>${tl(toplam)}</b></div><small>KDV dahil${fiyatsiz ? ` · ${fiyatsiz} ürünün fiyatı sorulacak` : ""} · Demo: fiyatlar örnektir.${firmalar.length > 1 ? " İki firmaya ayrı mesaj gider." : ""}</small>`;
  }
  function gonder(f) {
    const kal = sepetteki().filter((x) => x.u.kurum === f);
    const toplam = kal.reduce((t, x) => t + (x.u.fiyat ? x.u.fiyat * x.adet : 0), 0);
    const metin = `Merhaba ${KURUM[f].ad}, sitenizden sipariş vermek istiyorum:\n` + kal.map((x) => `• ${x.adet} × ${x.u.ad}${x.u.fiyat ? ` — ${tl(x.u.fiyat * x.adet)}` : ""}`).join("\n") + `\nToplam: ${tl(toplam)} (KDV dahil)`;
    open(`https://wa.me/9${KURUM[f].telefon.replace(/\D/g, "")}?text=${encodeURIComponent(metin)}`, "_blank");
  }

  // ---------- Vitrin ----------
  const SEKME = [{ k: "ysc", ad: "Söndürücüler" }, { k: "yangin", ad: "Yangın güvenliği" }, { k: "kantar", ad: "Tartı" }];
  const ilkSekme = location.hash.slice(1);
  let sekme = SEKME.some((x) => x.k === ilkSekme) ? ilkSekme : "ysc", filtre = "Hepsi";
  // Yayın (2026-10-14): fiyat gösterilmez; her üründe "Fiyat al" → WhatsApp 0533 407 75 57, ürün adıyla hazır mesaj
  const FIYAT_WA = "905334077557";
  const fiyatAl = (u) => `<a class="dugme kirmizi fiyat-al" href="https://wa.me/${FIYAT_WA}?text=${encodeURIComponent(`Merhaba, "${u.ad}" için fiyat almak istiyorum.`)}" target="_blank" rel="noopener">Fiyat al</a>`;
  const sepeteDugme_eski = (u) => `<button class="sepete ${sepet[u.id] ? "var" : ""}" data-ekle="${u.id}">${sepet[u.id] ? `Sepette · ${sepet[u.id]}` : "Sepete ekle"}</button>`;
  const fiyatHtml_eski = (u, etiket) => u.fiyat ? `<div class="fiyat"><small>${etiket}</small><b>${tl(u.fiyat)}</b></div>` : `<div class="fiyat"><small>${etiket}</small><b class="sor">Fiyat sorun</b></div>`;

  function aileHtml(a) {
    const u = URUN.get(secili[a.k]);
    return `<article class="aile" data-aile="${a.k}">${foto(u)}
      <div class="govde"><h3 data-detay="${u.id}">${a.ad}</h3>
        <div class="sinif">${a.sinif.map((s) => `<b>${s}</b>`).join("")}<span>${a.sinif.length ? "sınıf" : ""}${a.ek ? ` ${a.ek}` : ""}</span></div>
        <p class="ac">${a.ac}</p>
        <div class="boylar">${a.urunler.map((x) => `<button class="${x.id === u.id ? "on" : ""}" data-boy="${a.k}:${x.id}" aria-label="${boy(x)} kg">${boy(x)}</button>`).join("")}<em>kg</em></div>
        <div class="fiyat-satir">${fiyatAl(u)}</div></div></article>`;
  }
  const urunHtml = (u) => `<article class="urun">${foto(u)}<p class="tur">${kacir(u.alt_tur || (u.bolum === "ysc" ? (AILELER.find((a) => a.urunler.includes(u)) || {}).ad : u.marka) || "")}</p><h4 data-detay="${u.id}">${kacir(u.ad)}</h4><span></span>
    <div class="fiyat-satir">${fiyatAl(u)}</div></article>`;

  // Tam mağaza (Ürünler sayfası)
  function icerikCiz() {
    const kap = $("#magaza-icerik"); if (!kap) return;
    const bol = K.bolumler.find((b) => b.kategori === sekme);
    const bolum = kap.closest("[data-unsur]");
    if (bolum) { bolum.dataset.unsur = sekme === "kantar" ? "kantar" : "yangin"; dispatchEvent(new Event("scroll")); }
    $("#sekmeler").innerHTML = SEKME.map((s) => `<button class="${s.k === sekme ? "on" : ""}" data-sekme="${s.k}">${s.ad}<small>${K.bolumler.find((b) => b.kategori === s.k).urunler.length}</small></button>`).join("");
    if (sekme === "kantar") {
      const turler = [...new Set(bol.urunler.map((u) => u.alt_tur || "Diğer"))].sort((a, b) => a.localeCompare(b, "tr"));
      $("#filtre").innerHTML = ["Hepsi", ...turler].map((t) => `<button class="${t === filtre ? "on" : ""}" data-filtre="${t}">${t}<small>${t === "Hepsi" ? bol.urunler.length : bol.urunler.filter((u) => (u.alt_tur || "Diğer") === t).length}</small></button>`).join("");
    } else $("#filtre").innerHTML = "";
    if (sekme === "ysc") kap.innerHTML = `<div class="aileler">${AILELER.map(aileHtml).join("")}</div>`;
    else {
      const liste = bol.urunler.map((u) => URUN.get(u.id)).filter((u) => sekme !== "kantar" || filtre === "Hepsi" || (u.alt_tur || "Diğer") === filtre);
      kap.innerHTML = `<div class="urunler">${liste.map(urunHtml).join("")}</div>`;
    }
  }

  // Ana sayfa vitrini: çeşitler + öne çıkan 5 ürün
  const CESIT = [
    { k: "ysc", ad: "Söndürücüler", ac: "KKT, CO₂, köpüklü, pano tipi, sprinkli ve davlumbaz; 1 kg'dan 50 kg'a.", img: "gorsel/T4-otel-tuplu.webp", odak: "52% 40%", c: ["KKT", "CO₂", "Köpüklü", "Pano tipi"] },
    { k: "yangin", ad: "Yangın güvenliği", ac: "Dedektör, ihbar butonu, yangın dolabı, yangın kapısı ve acil aydınlatma.", img: "gorsel/I08-dolap.webp", odak: "72% 50%", c: ["Dedektör", "Buton", "Dolap", "Kapı"] },
    { k: "kantar", ad: "Tartı sistemleri", ac: "Tır kantarından hassas teraziye; CAS baskül, terazi ve indikatörler.", img: "gorsel/K2-market.webp", odak: "88% 50%", c: ["Baskül", "Terazi", "İndikatör"] },
  ];
  // Öne çıkanlar: katmanlı vitrin kartı (Kabarza "depth map" örneği). Mekân fotoğrafı ve büyük yazı pencereye kırpılır, ürün
  // kırpılmaz: imleçle katmanlar farklı derinlikte kayar, üstüne gelince ürün öne çıkıp pencerenin dışına taşar.
  const ONE = [
    { ad: "6 kg KKT yangın söndürücü", zemin: "T4-otel-yatay-bos", odak: "50% 45%", yazi: "6 kg" },
    { ad: "5 kg CO₂ yangın söndürücü", zemin: "T5-fabrika-yatay-bos", odak: "50% 50%", yazi: "CO₂" },
    { ad: "6 kg FM-200 pano tipi söndürücü", zemin: "I07-panel", odak: "88% 50%", yazi: "FM-200" },
    { ad: "CAS CL5500D barkodlu terazi 15/30 kg", zemin: "K2-market", odak: "0% 55%", yazi: "30 kg" },
    { ad: "CAS DB-I tartım baskülü 30–600 kg", zemin: "T5-fabrika-yatay-bos", odak: "22% 60%", yazi: "600 kg" },
  ].map((x) => ({ ...x, u: [...URUN.values()].find((u) => u.ad === x.ad) })).filter((x) => x.u && x.u.gorsel);
  const vitrinKart = ({ u, zemin, odak, yazi }, i) => `<article class="vk ${u.bolum === "kantar" ? "tarti" : ""}" style="--i:${i}">
    <div class="vk-sahne" data-detay="${u.id}"><div class="vk-pencere"><img class="vk-zemin" src="gorsel/${zemin}.webp" style="object-position:${odak}" alt="" loading="lazy"><span class="vk-yazi">${yazi}</span></div>
      <img class="vk-urun" src="${u.gorsel}" alt="${kacir(u.ad)}" loading="lazy"><span class="vk-isik"></span></div>
    <div class="vk-alt"><p class="tur">${kacir(u.alt_tur || (u.bolum === "ysc" ? (AILELER.find((a) => a.urunler.includes(u)) || {}).ad : u.marka) || "")}</p><h4 data-detay="${u.id}">${kacir(u.ad)}</h4>
      <div class="fiyat-satir">${fiyatAl(u)}</div></div></article>`;
  function vitrinCiz() {
    const c = $("#cesitler");
    // çeşitler: Biz kimiz'deki sektör panoları gibi; üstüne gelinen genişler
    if (c) c.innerHTML = CESIT.map((x, i) => `<a class="hp" href="magaza/index.html#${x.k}" style="--odak:${x.odak}" data-unsur="${x.k === "kantar" ? "kantar" : "yangin"}"><img src="${x.img}" alt="" loading="lazy">
      <div class="hp-ust"><span class="hp-no">0${i + 1}</span><span class="hp-tur">${K.bolumler.find((b) => b.kategori === x.k).urunler.length} ürün</span></div>
      <div class="hp-alt"><h3>${x.ad}</h3><div class="hp-acik"><div><p>${x.ac}</p><div class="hp-cip">${x.c.map((t) => `<span>${t}</span>`).join("")}</div></div></div></div>
      <span class="hp-ok" aria-hidden="true">↗</span></a>`).join("");
    const o = $("#oneler");
    if (o) { o.innerHTML = ONE.map(vitrinKart).join(""); vitrinIzle(o); }
  }
  // imleç → --px, --py (-1…1): pencere eğilir, katmanlar derinliklerine göre kayar. Kartlar ekrana girince ürünler sırayla yükselir.
  let vitrinGozcu = null;
  function vitrinIzle(o) {
    if (!o.dataset.izli) {
      o.dataset.izli = "1";
      o.addEventListener("pointermove", (e) => {
        const k = e.target.closest(".vk"); if (!k || e.pointerType !== "mouse") return;
        const r = $(".vk-sahne", k).getBoundingClientRect();
        k.style.setProperty("--px", Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1)).toFixed(3));
        k.style.setProperty("--py", Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1)).toFixed(3));
        k.classList.add("ic");
      });
      o.addEventListener("pointerout", (e) => { const k = e.target.closest(".vk"); if (k && !k.contains(e.relatedTarget)) { k.classList.remove("ic"); k.style.setProperty("--px", 0); k.style.setProperty("--py", 0); } });
      vitrinGozcu = new IntersectionObserver((es) => es.forEach((x) => { if (x.isIntersecting) { x.target.classList.add("gorundu"); x.target.parentElement.dataset.goruldu = "1"; vitrinGozcu.unobserve(x.target); } }), { threshold: .35 });
    }
    o.querySelectorAll(".vk").forEach((k) => { if (o.dataset.goruldu) k.classList.add("gorundu", "hazir"); else vitrinGozcu.observe(k); }); // yeniden çizimde (sepete ekleme) tekrar oynamaz
  }
  const yenile = () => { icerikCiz(); vitrinCiz(); };

  // ---------- Ürün ayrıntısı ----------
  function detayAc(id) {
    const u = URUN.get(Number(id)); if (!u) return;
    const a = u.bolum === "ysc" ? AILELER.find((x) => x.urunler.some((y) => y.id === u.id)) : null;
    $("#detay-tur").textContent = a ? a.ad : u.alt_tur || "";
    $("#detay-ic").innerHTML = `${foto(u)}<h3>${kacir(u.ad)}</h3>
      ${a ? `<div class="boylar" style="margin-top:0">${a.urunler.map((x) => `<button class="${x.id === u.id ? "on" : ""}" data-detay-boy="${x.id}">${boy(x)}</button>`).join("")}<em>kg</em></div>` : ""}
      <dl class="kunye"><dt>Satan</dt><dd>${kacir(KURUM[u.kurum].ad)}</dd>${u.kapasite ? `<dt>Kapasite</dt><dd>${boy(u)} ${kacir(u.birim)}</dd>` : ""}${u.marka ? `<dt>Marka</dt><dd>${kacir(u.marka)}${u.model ? " " + kacir(u.model) : ""}</dd>` : ""}${a ? `<dt>Sınıf</dt><dd>${a.sinif.join(" · ") || a.ek}</dd>` : ""}</dl>
      ${a ? `<p class="giris" style="font-size:16px">${a.ac}</p>` : ""}
      <div class="fiyat-satir">${fiyatAl(u)}</div>
      <a class="katalog-bag" href="magaza/index.html#u-${u.id}" style="justify-self:start">Tam katalogda aç ↗</a>`;
    $("#detay").classList.add("acik");
  }

  // ---------- Olaylar ----------
  document.querySelectorAll(".magaza-kap").forEach((kap) => kap.addEventListener("click", (e) => {
    const t = e.target;
    const s = t.closest("[data-sekme]"); if (s) { sekme = s.dataset.sekme; filtre = "Hepsi"; history.replaceState(null, "", "#" + sekme); icerikCiz(); return; }
    const f = t.closest("[data-filtre]"); if (f) { filtre = f.dataset.filtre; icerikCiz(); return; }
    const b = t.closest("[data-boy]"); if (b) { const [ak, id] = b.dataset.boy.split(":"); secili[ak] = Number(id); icerikCiz(); return; }
    const ek = t.closest("[data-ekle]"); if (ek) { ekle(ek.dataset.ekle); $("#sepet-dugme").animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 320 }); return; }
    const d = t.closest("[data-detay]"); if (d) detayAc(d.dataset.detay);
  }));
  $("#detay").addEventListener("click", (e) => {
    if (e.target.closest("[data-kapat]")) { $("#detay").classList.remove("acik"); return; }
    const b = e.target.closest("[data-detay-boy]"); if (b) { const u = URUN.get(Number(b.dataset.detayBoy)); const a = AILELER.find((x) => x.urunler.includes(u)); if (a) secili[a.k] = u.id; yenile(); detayAc(u.id); return; }
    const ek = e.target.closest("[data-ekle]"); if (ek) { ekle(ek.dataset.ekle); detayAc(ek.dataset.ekle); }
  });
  $("#sepet-dugme").addEventListener("click", () => $("#sepet").classList.add("acik"));
  $("#sepet").addEventListener("click", (e) => {
    if (e.target.closest("[data-kapat]")) { $("#sepet").classList.remove("acik"); return; }
    const a = e.target.closest("[data-artir]"); if (a) ekle(a.dataset.artir, 1);
    const z = e.target.closest("[data-azalt]"); if (z) ekle(z.dataset.azalt, -1);
    const g = e.target.closest("[data-gonder]"); if (g) gonder(g.dataset.gonder);
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape") document.querySelectorAll(".cekmece.acik").forEach((c) => c.classList.remove("acik")); });
  addEventListener("storage", (e) => { if (e.key === "kaptan-sepet") { try { sepet = JSON.parse(e.newValue) || {}; } catch { sepet = {}; } sepetCiz(); yenile(); } });

  yenile(); sepetCiz();
  addEventListener("hashchange", () => { const h = location.hash.slice(1); if (SEKME.some((x) => x.k === h) && h !== sekme) { sekme = h; filtre = "Hepsi"; icerikCiz(); } });
})();

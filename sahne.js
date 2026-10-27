// Kaptan demo — ana sayfanın kaydırmaya bağlı sahneleri. Kütüphane yok; her sahne 0–1 arası ilerleme alır.
// Bir sahnenin .sabit öğesinde data-video="video/x" varsa ve o klasörde kareler.json bulunursa, sahne görseller yerine
// video karelerini tuvale çizer (kaydırma = videonun zamanı). Kareler video-kare.sh ile bir mp4'ten çıkarılır.

// Kurumlar sahnesi: arka planlar tüpsüz; ankraj.js her görselde tüpün durduğu yeri (ax, ay) ve oradaki çapı (d) verir.
// Tek tüp ayrı bir görsel; masaüstünde mekândan mekâna sağa sola kayar, telefonda ortada kalır.
const ANKRAJ = window.ANKRAJ;
const TUP = { w: 1024, h: 1536, cx: 534.5, cy: 752, d: 381 }; // urun/tup/kkt-6kg.webp: gövde ortası, siluet ortası, gövde çapı

// sag: video durağında ürün kadrajın solunda; masaüstünde yazı sağa geçer (sıra yangın videosuyla aynı)
// x, y: ürünün kare (1:1) görseldeki yeri; masaüstünde ürün kartın dikey ortasına, telefonda üst üçte bire oturur
const YANGIN = [
  { img: "yangin/k1", sag: true, x: .33, y: .444, ray: "İhbar butonu", e: "02 · Yangın", h: "Algıla. Uyar. Söndür.", p: "İçeri girdiğimiz ilk şey duvardaki yangın ihbar butonu. Bir yangını erken fark etmek için gereken her şey bu koridorda başlar.", c: ["Adresli", "Konvansiyonel", "Montaj + bakım"] },
  { img: "yangin/k2", x: .68, y: .41, ray: "Duman dedektörü", h: "Duman dedektörü", p: "Dumanı ilk anda fark eder, panoya haber verir. Odaya, tavan yüksekliğine ve kullanıma göre doğru tip seçilir.", c: ["Optik", "Isı", "Adresli"] },
  { img: "yangin/k3", sag: true, x: .33, y: .388, ray: "Sprinkler", h: "Sprinkler", p: "Isı yükselince kendiliğinden açılır, yangını büyümeden bastırır. Projelendirme, montaj ve periyodik test.", c: ["Sulu", "Kuru", "Projelendirme"] },
  { img: "yangin/k4", x: .66, y: .472, ray: "Algılama panosu", h: "Algılama panosu", p: "Bütün dedektörler ve butonlar buraya bağlanır. Hangi katta, hangi odada ne olduğunu tek bakışta gösterir.", c: ["Kurulum", "Programlama", "Bakım"] },
  { img: "yangin/k5", sag: true, x: .32, y: .472, ray: "Yangın kapısı", h: "Yangın kapısı", p: "Yangını ve dumanı bulunduğu bölümde tutar, kaçış yolunu açık bırakır. Panik bar, kapı kapatıcı ve yalıtım fitiliyle.", c: ["Yangına dayanıklı", "Panik bar", "Montaj + bakım"] },
  { img: "yangin/k6", x: .67, y: .455, ray: "Tahliye planı", h: "Tahliye planı", p: "Çıkışlar, toplanma alanı ve yangın ekipmanları tek bakışta. Binanıza özel çizilir, doğru noktalara asılır.", c: ["Kat planı", "Kaçış yolu", "Montaj"] },
  { img: "yangin/k7", sag: true, x: .33, y: .472, ray: "Yangın dolabı", h: "Yangın dolabı", p: "Hortum, lans ve vana; doğru yerde, doğru basınçta, her an kullanıma hazır.", c: ["Hortum", "Lans", "Test"] },
  { img: "yangin/k8", x: .59, y: .556, ray: "Tüp", h: "Ve elinin altındaki tüp.", p: "İlk müdahale çoğu zaman en yakındaki söndürücüyle yapılır. Her kuruma doğru tip, doğru kapasite.", c: ["KKT", "CO₂", "Köpüklü"], bag: ["magaza/index.html#ysc", "Söndürücüleri gör"] },
];
// Kurumlar: x = tüpün masaüstünde duracağı yatay konum (ekran genişliğine oran)
const MEKAN = [
  { img: "T1-konut", ad: "Konut", x: .5, h: "Konutlar", p: "Apartman girişinden otoparka; yönetmeliğe uygun sayı, tip ve yerleşim." },
  { img: "T2-hastane", ad: "Hastane", x: .66, h: "Hastaneler", p: "Koridor, hasta odası ve yoğun bakım için doğru tip; periyodik kontrol ve kayıt." },
  { img: "T3-belediye", ad: "Belediye", x: .34, h: "Kamu binaları", p: "Belediye ve resmi kurumlarda periyodik kontrol, etiketleme ve kayıt." },
  { img: "T4-otel", ad: "Otel", x: .66, h: "Oteller", p: "Sezon öncesi bakım, dolum ve personel eğitimi; misafir hiç fark etmeden." },
  { img: "T5-fabrika", ad: "Fabrika", x: .5, h: "Fabrikalar", p: "Yüksek riskli alanlar için doğru sınıf, doğru kapasite ve düzenli denetim. Ve fabrikanın içinde, tartı." },
];
const KANTAR = [
  { img: "K4-platform", ad: "Platform", odak: "87% 60%", e: "03 · Kantar", h: "Fabrikanın içinden kapısına.", p: "Üretim alanında 1×1,5 m'den 2×2 m'ye platform kantarlar: palet, kasa ve çuval tartımı.", c: ["1×1,5 m", "2×2 m", "İndikatör"] },
  { img: "K5-rayli", ad: "Raylı", odak: "68% 40%", e: "03 · Raylı sistem", h: "Hat üstünde, durmadan.", p: "Asma ray hatlarında taşınan yükü hattı durdurmadan tartan raylı kantar sistemleri.", c: ["Ray kantarı", "Yük hücresi", "Hat entegrasyonu"] },
  { img: "K6-tezgah", ad: "Tezgâh", odak: "98% 55%", e: "03 · Tezgâh", h: "Paketlemede, gramında.", p: "Paketleme ve kontrol tezgâhları için tezgâh tipi terazi ve basküller.", c: ["Tezgâh terazisi", "Kontrol tartımı", "Paslanmaz"] },
  { img: "I14-kantar-hava", ad: "Kamyon", odak: "79% 60%", e: "03 · Kamyon kantarı", h: "Kapıda, kamyonuyla.", p: "Fabrika, ocak ve lojistik girişlerinde kamyon kantarı: zemin etüdü, kurulum ve periyodik muayene.", c: ["Kamyon kantarı", "Kurulum", "Muayene"] },
  { img: "I15-kantar-kesit", ad: "Prensip", odak: "93% 50%", e: "03 · Nasıl tartar?", h: "Ağırlık, sinyale dönüşür.", p: "Yük hücreleri ağırlığı elektrik sinyaline çevirir; indikatör bu sinyali okunur bir değere dönüştürür ve kaydeder.", c: ["Yük hücresi", "İndikatör", "Kayıt"] },
  { img: "K1-hal", ad: "Hal", odak: "79% 55%", e: "03 · Hal kantarı", h: "Halde, kasa kasa.", p: "Hal ve depolarda kasa, palet ve çuval tartımı: platform baskül, indikatör ve günlük yoğun kullanıma dayanıklı kurulum.", c: ["Platform baskül", "30–600 kg", "İndikatör"] },
  { img: "K2-market", ad: "Market", odak: "100% 50%", e: "03 · Barkodlu terazi", h: "Tezgâhta, etiketiyle.", p: "Market, şarküteri ve kasaplar için fiyatı hesaplayan, etiketini basan terazi.", c: ["15 / 30 kg", "Etiket yazıcı", "Fiyat hesaplama"] },
  { img: "K3-hassas", ad: "Hassas", odak: "100% 55%", e: "03 · Hassas terazi", h: "Laboratuvarda, gramı gramına.", p: "Laboratuvar, eczane ve kuyumcular için hassas tartım ve periyodik kalibrasyon.", c: ["300 g – 6 kg", "Hassas tartım", "Kalibrasyon"] },
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const sinir = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const yumus = (t) => t * t * (3 - 2 * t);
// n durak arasında, her durakta biraz bekleyen ilerleme (0 … n-1)
// Video duraklarına göre ilerleme: her geçiş videodaki kare sayısıyla orantılı kaydırma alır (oynatma hızı her yerde aynı),
// her durakta eşit bekleme (bekle = kare cinsinden; ilk ve son durakta yarısı). Geçişin başı/sonu hafif yumuşar.
// Son durakta uzun bekleme (SON_PAY kare): video önce son karesine (T1) varır, sonra kurumlar yerleşimine oturur ve tüp belirir.
const SON_PAY = 110;
const videoParca = (D, bekle) => {
  const n = D.length, parca = [];
  for (let i = 0; i < n; i++) { parca.push([0, i, i === 0 ? bekle / 2 : i === n - 1 ? SON_PAY : bekle]); if (i < n - 1) parca.push([1, i, D[i + 1] - D[i]]); }
  return parca;
};
// son duraktaki ilerleme (0–1): 0 = video son karesine yeni vardı
const videoSon = (p, D, bekle = 34) => { const t = videoParca(D, bekle).reduce((a, x) => a + x[2], 0); return sinir((sinir(p) * t - (t - SON_PAY)) / SON_PAY); };
const videoDurak = (p, D, bekle = 34) => {
  const n = D.length, parca = videoParca(D, bekle);
  let u = sinir(p) * parca.reduce((t, x) => t + x[2], 0);
  for (const [gecis, i, l] of parca) { if (u <= l) { const t = u / l; return gecis ? i + .6 * t + .4 * yumus(t) : i; } u -= l; }
  return n - 1;
};
const duraklı = (p, n, bekle = .28) => { const t = p * (n - 1), i = Math.min(n - 2, Math.floor(t)), f = t - i; return n < 2 ? 0 : i + yumus(sinir((f - bekle) / (1 - 2 * bekle))); };
const etkin = (adimlar, i) => adimlar.forEach((a, j) => a.classList.toggle("acik", j === i));
const cip = (c) => `<div class="cipler">${c.map((x) => `<span>${x}</span>`).join("")}</div>`;
const mekanResmi = (m, ek = "") => `<div class="mekan ${ek}"><picture><source media="(max-aspect-ratio: 1/1)" srcset="gorsel/${m.img}-dikey-bos.webp"><img src="gorsel/${m.img}-yatay-bos.webp" alt=""></picture></div>`;

// ---------- Kurulum ----------
// her kare bir katman: katmanlar sırayla soldan kayarak gelir. Son katman (mekân) + perdenin üstündeki tüp = kurumlar sahnesinin ilk karesi.
$("#yangin-katlar").innerHTML = YANGIN.map((y, i) => `<div class="katman"><img class="kat" src="gorsel/${y.img}.webp" alt="" ${i > 1 ? 'loading="lazy"' : ""}></div>`).join("");
$("#ray").style.gridTemplateColumns = `repeat(${YANGIN.length}, minmax(0, 1fr))`;
// kare görsel: masaüstünde ürün kartın dikey ortasında ve kendi yatay yerinde, telefonda ortada ve üst üçte birde (kesilmeden)
function yanginYerlestir() {
  const st = $("#yangin .sabit"), W = st.clientWidth, H = st.clientHeight, Z = Math.max(W, H), tel = telefonMu.matches;
  document.querySelectorAll("#yangin-katlar .kat").forEach((im, i) => {
    const y = YANGIN[i], tx = tel ? .5 : y.x, ty = tel ? .34 : .5;
    const L = Math.min(0, Math.max(W - Z, tx * W - y.x * Z)), T = Math.min(0, Math.max(H - Z, ty * H - y.y * Z));
    Object.assign(im.style, { left: L + "px", top: T + "px", width: Z + "px", height: Z + "px" });
  });
}
$("#yangin-metin").innerHTML = YANGIN.map((y, i) => `<div class="adim ${i ? "" : "acik"} ${y.sag ? "sag" : ""}"><p class="etiket">${y.e || `02 · Yangın — 0${i + 1}/0${YANGIN.length}`}</p><h2 class="baslik bol">${y.h}</h2><p class="giris">${y.p}</p>${cip(y.c)}
  <a class="dugme koyu-d" href="${y.bag ? y.bag[0] : "magaza/index.html#yangin"}">${y.bag ? y.bag[1] : "Ürünleri gör"}</a></div>`).join("");
// cam kart: imlece doğru en çok 6° eğilir, imlecin olduğu yerden ışık yayılır (yalnız fare)
document.querySelectorAll("#yangin-metin .adim").forEach((k) => {
  k.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = k.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    k.classList.add("ust");
    k.style.setProperty("--hx", ((x - .5) * 12).toFixed(2) + "deg"); k.style.setProperty("--hy", ((.5 - y) * 8).toFixed(2) + "deg");
    k.style.setProperty("--px", x * 100 + "%"); k.style.setProperty("--py", y * 100 + "%");
  });
  k.addEventListener("pointerleave", () => { k.classList.remove("ust"); k.style.setProperty("--hx", "0deg"); k.style.setProperty("--hy", "0deg"); });
});
$("#ray").innerHTML = YANGIN.map((y) => `<span>${y.ray}<i></i></span>`).join("");

$("#mekanlar").innerHTML = MEKAN.map((m) => `<div class="katman">${mekanResmi(m)}</div>`).join("");
$("#mekan-metin").innerHTML = MEKAN.map((m, i) => `<div class="adim ${i ? "" : "acik"}"><h2 class="baslik bol">${m.h}</h2><p class="giris">${m.p}</p><a class="katalog-bag" href="magaza/index.html#ysc" style="margin-top:22px">Söndürücüleri gör →</a></div>`).join("");
$("#mekan-liste").innerHTML = MEKAN.map((m, i) => `<span class="${i ? "" : "on"}">${m.ad}</span>`).join("");

$("#kantar-katlar").innerHTML = KANTAR.map((k) => `<img class="kat" src="gorsel/${k.img}.webp" style="--odak:${k.odak}" alt="" loading="lazy">`).join("");
$("#kantar-metin").innerHTML = KANTAR.map((k, i) => `<div class="adim ${i ? "" : "acik"}"><p class="etiket">${k.e}</p><h2 class="baslik bol">${k.h}</h2><p class="giris">${k.p}</p>${cip(k.c)}${i === 0 ? '<a class="dugme koyu-d" href="magaza/index.html#kantar">Tartı ürünleri</a>' : ""}</div>`).join("");
$("#kantar-liste").innerHTML = KANTAR.map((k, i) => `<span class="${i ? "" : "on"}">${k.ad}</span>`).join("");

document.querySelectorAll(".sahne .bol").forEach((h) => window.kelimeKelime(h)); // sahne dışındaki başlıkları ortak.js açar

// ---------- Video kareleri: kaydırma = zaman ----------
// kareler.json'a elle "duraklar": [kare no, …] (sahnedeki durak sayısı kadar, 0'dan) eklenirse video her durakta metinle birlikte bekler;
// "odaklar": [[x, y], …] (durak başına, 0–1) eklenirse kırpma her durakta o noktaya kayar (telefonda ürün kadrajda kalsın diye).
const VIDEO = new Map(); // .sabit → { kare(p, d), odak(d), ciz(i, kutuFn, odak) }
document.querySelectorAll(".sabit[data-video]").forEach(async (st) => {
  const kok = st.dataset.video;
  let bilgi;
  try { const r = await fetch(`${kok}/kareler.json`, { cache: "no-store" }); if (!r.ok) return; bilgi = await r.json(); } catch { return; }
  const tuval = $(".video-tuval", st), c = tuval.getContext("2d");
  const kareler = Array.from({ length: bilgi.adet }, (_, i) => { const im = new Image(); im.decoding = "async"; im.src = `${kok}/${String(i + 1).padStart(4, "0")}.${bilgi.uzanti || "jpg"}`; return im; });
  // "durakGorsel": [yol | null, …] (durak başına): durakta beklerken video karesinin yerine aynı karenin keskin fotoğrafı
  // görünür, hareket başlayınca yumuşakça videoya döner (görsel karenin birebir aynısı olmalı; durak-kareleri/ + görsel upscale)
  const IZ = bilgi.durakIz || [];
  // keskin görselin kenarları yumuşak solar (kamera kayınca görselin bittiği yer çizgi olarak seçilmesin)
  const yumusKenar = (im) => {
    const t = document.createElement("canvas"), w = t.width = im.naturalWidth, h = t.height = im.naturalHeight, g = t.getContext("2d"), p = .09;
    g.drawImage(im, 0, 0); g.globalCompositeOperation = "destination-in";
    const yat = g.createLinearGradient(0, 0, w, 0); yat.addColorStop(0, "transparent"); yat.addColorStop(p, "#000"); yat.addColorStop(1 - p, "#000"); yat.addColorStop(1, "transparent");
    g.fillStyle = yat; g.fillRect(0, 0, w, h);
    const dik = g.createLinearGradient(0, 0, 0, h); dik.addColorStop(0, "transparent"); dik.addColorStop(p, "#000"); dik.addColorStop(1 - p, "#000"); dik.addColorStop(1, "transparent");
    g.fillStyle = dik; g.fillRect(0, 0, w, h);
    t.naturalWidth = w; t.naturalHeight = h; t.complete = true; return t;
  };
  const DG = (bilgi.durakGorsel || []).map((y, n) => { if (!y) return null; const im = new Image(); im.decoding = "async"; im.src = `${kok}/${y}`; im.onload = () => { DGK[n] = yumusKenar(im); }; return im; });
  const DGK = [];
  let son = "";
  // kutuFn: ekranı kaplayan kutuyu ([x, y, g, y], CSS px) alır, çizilecek kutuyu döner; d: durak konumu (keskin görsel için)
  const ciz = (i, kutuFn, odak, d) => {
    const im = kareler[i]; if (!im.complete || !im.naturalWidth) { im.onload = () => ciz(i, kutuFn, odak, d); return; }
    const W = st.clientWidth, H = st.clientHeight, s = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * s, h = im.naturalHeight * s;
    const [ox, oy] = odak || bilgi.odak || [.5, .5], kapla = [(W - w) * ox, (H - h) * oy, w, h];
    // keskin durak görseli: kameranın hareketini izleyerek (durakIz afinleri) videoyla üst üste kayar, durak karesinden uzaklaştıkça solar
    const j = d == null ? -1 : Math.round(d), dg = DG[j], iz = IZ[j], A = iz && iz.A[i - iz.bas];
    const uzak = Math.abs(i - D[j] || 0), menzil = iz ? Math.min(8, i < D[j] ? D[j] - iz.bas : iz.bas + iz.A.length - 1 - D[j]) : 0;
    const wd = dg && dg.complete && dg.naturalWidth && A ? (menzil ? 1 - yumus(sinir(uzak / menzil)) : (uzak ? 0 : 1)) : 0;
    const k = (kutuFn ? kutuFn(kapla) : kapla).map((v) => v * devicePixelRatio), anahtar = `${i}|${k.map(Math.round)}|${W}x${H}|${j}:${wd.toFixed(3)}`;
    if (anahtar === son) return;
    tuval.width = W * devicePixelRatio; tuval.height = H * devicePixelRatio;
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high"; // tuval boyutu değişince sıfırlanır
    c.drawImage(im, ...k);
    if (wd > 0) {
      const [x, y, w, h] = k, iw = dg.naturalWidth, ih = dg.naturalHeight, [a, b, cc, dd, e, f] = A;
      c.save(); c.globalAlpha = wd;
      c.setTransform(w * a / iw, h * dd / iw, w * b / ih, h * e / ih, x + w * cc, y + h * f);
      c.drawImage(DGK[j] || dg, 0, 0);
      // durak karesinde tam görsel (kenarlar da keskin); uzaklaştıkça yalnız kenarı yumuşatılmış hâli kalır
      const tam = wd * (1 - sinir(uzak / 3)); if (tam > 0 && DGK[j]) { c.globalAlpha = tam; c.drawImage(dg, 0, 0); }
      c.restore();
    }
    son = anahtar;
  };
  const D = bilgi.duraklar;
  const kare = (p, d) => {
    if (!D || d == null) return Math.round(sinir(p) * (bilgi.adet - 1));
    const i = Math.min(D.length - 2, Math.floor(d)), f = d - i;
    return Math.round(D[i] + (D[i + 1] - D[i]) * f);
  };
  const O = bilgi.odaklar;
  const odak = (d) => { if (!O || d == null) return null; const i = Math.min(O.length - 2, Math.floor(d)), f = d - i; return [0, 1].map((k) => O[i][k] + (O[i + 1][k] - O[i][k]) * f); };
  VIDEO.set(st, { kare, odak, ciz, D });
  st.classList.add("video-var");
  iste();
});
const videoCiz = (el, p, d, kutuFn) => { const v = VIDEO.get($(".sabit", el)); if (!v) return false; v.ciz(v.kare(p, d), kutuFn, v.odak(d), d); return true; };

// ---------- Kurumlar: her mekânda tüpün durduğu yer kendi hedef noktasına, tüp her mekânda aynı boyda ----------
const dikeyMi = matchMedia("(max-aspect-ratio: 1/1)");
const telefonMu = matchMedia("(max-width: 820px)");
let HEDEF = [], TUP_OLCEK = 1, SAHNE_H = 0;
function mekanYerlestir() {
  const st = $("#tup .sabit"), W = st.clientWidth, H = st.clientHeight;
  const set = ANKRAJ[dikeyMi.matches ? "dikey" : "yatay"];
  const A = MEKAN.map((m) => set[m.img] || ANKRAJ.yatay[m.img]);
  HEDEF = MEKAN.map((m) => (telefonMu.matches ? .5 : m.x) * W);
  SAHNE_H = H;
  // her görsel ekranı kaplamalı ve tüpün yeri hedef noktaya gelmeli; en çok büyütme isteyen görsel tüpün çapını belirler
  const kapla = (a, tx) => Math.max(W / a.w, H / a.h, tx / a.ax, (W - tx) / (a.w - a.ax), H / 2 / a.ay, H / 2 / (a.h - a.ay));
  const cap = Math.max(...A.map((a, i) => kapla(a, HEDEF[i]) * a.d));
  const yerlestir = (el, a, tx) => { const s = cap / a.d; Object.assign(el.style, { width: a.w * s + "px", height: a.h * s + "px", left: tx - a.ax * s + "px", top: H / 2 - a.ay * s + "px" }); };
  document.querySelectorAll("#mekanlar .mekan").forEach((m, i) => yerlestir(m, A[i], HEDEF[i]));
  // yangın sahnesinin son karesi = kurumlar sahnesinin ilk karesi (kesintisiz geçiş)
  if ($(".yangin-son")) yerlestir($(".yangin-son"), A[0], HEDEF[0]);
  TUP_OLCEK = cap / TUP.d;
  for (const t of [$("#tek-tup"), $("#gecis-tup")]) Object.assign(t.style, { width: TUP.w * TUP_OLCEK + "px", height: TUP.h * TUP_OLCEK + "px", top: H / 2 - TUP.cy * TUP_OLCEK + "px" });
}
// tüp mekânlar arasında taşınıyormuş gibi: alt ucundan dönerek öne yatar (önce üstü gider), varınca hafifçe geri sallanıp yerine oturur.
// Görsel bozulmaz (yalnız kaydırma + dönme).
const tupKoy = (x, aci = 0) => {
  const t = $("#tek-tup");
  t.style.transformOrigin = `${TUP.cx * TUP_OLCEK}px ${(TUP.cy + TUP.h * .3) * TUP_OLCEK}px`;
  t.style.transform = `translate3d(${x - TUP.cx * TUP_OLCEK}px,0,0) rotate(${aci.toFixed(2)}deg)`;
};

// Kayan katmanlar: gelen katman soldan girer, giden biraz sağa çekilip kararır; tamamen örtülen katman çizilmez
// dikey: gelen katman alttan girer, giden biraz yukarı çekilip kararır
const kaydir = (katmanlar, d, dikey) => katmanlar.forEach((k, i) => {
  const gir = i === 0 ? 1 : yumus(sinir(d - i + 1)), cik = i === katmanlar.length - 1 ? 0 : yumus(sinir(d - i));
  k.style.visibility = gir > 0 && cik < 1 ? "" : "hidden"; // "" = üst öğeden miras (gizli sahnede görünmesin)
  k.style.transform = dikey ? `translate3d(0,${((1 - gir) - .32 * cik) * 100}%,0)` : `translate3d(${(.32 * cik - (1 - gir)) * 100}%,0,0)`;
  k.style.setProperty("--cik", cik.toFixed(3));
});
// İki sahne arasındaki kesintisiz geçiş: kurumlar sahnesi yangın sahnesinin son ekranının üstüne biner (CSS: margin-top -100svh);
// yapışana kadar gizli kalır, yapıştığı an ilk karesi yangının son karesiyle birebir aynıdır. Yazılar sınırda kısa bir an söner.
const SINIR = .035;
const YANGIN_KIRP = [0, 54, 1536, 864]; // yangın videosunun son karesi = T1-konut-yatay'ın bu bölgesi (16:9; ../Video/yangin/son-T1-*.png)

// ---------- Neden Kaptan: solda maddeler, sağda yapışkan panel ----------
// Madde değişince panel Terminal'deki tır videoları gibi döner: gerçek görüntü → karanlıkta çizgi + nokta bulutu (gorsel/cizgi/,
// cizgi.py ile üretildi) → yeni görüntünün çizgisi → ortadan yayılan tarama halkasıyla yeni gerçek görüntü. kutu: görsele oranla [x, y, g, y].
const NEDEN = [
  { h: "Tek elden", p: "Projeden montaja, dolumdan bakıma tek ekip. Binayı çizen de, dedektörü takan da, tüpü dolduran da biziz; muhatabınız hep aynı.", img: "I03-bina", odak: [.78, .5], hud: "BİNA TARANDI ✓", kutu: [.55, .15, .38, .64], ad: "BLOK A" },
  { h: "Yerinde servis", p: "Antalya ve İstanbul'daki ekiplerimiz keşif, montaj ve arıza için sahaya gelir. Telefonla değil, yerinde çözeriz.", img: "I17-iletisim", odak: [.74, .6], hud: "EKİP YOLDA", kutu: [.51, .41, .44, .41], ad: "SERVİS 01" },
  { h: "Kayıtlı bakım", p: "Her söndürücü ve dedektör periyodik olarak kontrol edilir, etiketlenir ve kaydı tutulur. Denetim günü belgeniz hazırdır.", img: "T4-otel-tuplu", odak: [.52, .4], hud: "KONTROL EDİLDİ ✓", kutu: [.43, .08, .17, .55], ad: "KKT · 6 KG" },
  { h: "Kalibrasyonlu tartı", p: "Kantar ve terazilerde kurulum, muayene ve periyodik kalibrasyon; tartınız ilk günkü kadar doğru.", img: "I14-kantar-hava", odak: [.72, .55], hud: "KALİBRE EDİLDİ ✓", kutu: [.62, .5, .19, .2], ad: "KANTAR 01" },
];
const neden = $("#neden");
let nedenAktif = 0, nedenZaman = [];
if (neden) {
  $("#maddeler").innerHTML = NEDEN.map((m, i) => `<article class="madde" data-i="${i}"><div class="madde-bas"><span class="no">0${i + 1}</span><h3>${m.h}</h3></div>
    <p class="okuma">${m.p.split(" ").map((k) => `<span class="kel">${[...k].map((h) => `<span class="h">${h}</span>`).join("")}</span>`).join(" ")}</p></article>`).join("");
  $("#panel").innerHTML = NEDEN.map((m, i) => `<div class="p-kat ${i ? "" : "gorunur"}" style="--odak:${m.odak[0] * 100}% ${m.odak[1] * 100}%"><img class="p-taban" src="gorsel/${m.img}.webp" alt=""><img class="p-cizgi" src="gorsel/cizgi/${m.img}.webp" alt=""><img class="p-gercek" src="gorsel/${m.img}.webp" alt=""></div>`).join("")
    + `<span class="p-tarama"></span><span class="p-kutu"><em></em></span><span class="p-hud"></span>`;
}
// HUD yazısı harf harf; o an yazılan harf vurgu renginde (Terminal'deki gibi)
let hudSayac = 0;
function hudYaz(metin) {
  const el = $("#panel .p-hud"), no = ++hudSayac, h = [...metin];
  h.forEach((_, i) => setTimeout(() => { if (no === hudSayac) el.innerHTML = h.slice(0, i).join("") + (i < h.length - 1 ? `<b>${h[i]}</b>` : h[i]); }, 140 + i * 32));
}
// çerçeve: görsel object-fit: cover ile kırpıldığı için görsele oranla verilen kutu panel ölçüsüne çevrilir
function kutuKoy(i) {
  const pn = $("#panel"), img = $$(".p-kat")[i].querySelector(".p-gercek"), k = $("#panel .p-kutu");
  if (!img.naturalWidth) { img.onload = () => kutuKoy(i); return; }
  const [px, py] = NEDEN[i].odak, W = pn.clientWidth, H = pn.clientHeight, s = Math.max(W / img.naturalWidth, H / img.naturalHeight), ox = (W - img.naturalWidth * s) * px, oy = (H - img.naturalHeight * s) * py;
  const [x, y, g, y2] = NEDEN[i].kutu;
  Object.assign(k.style, { left: ox + x * img.naturalWidth * s + "px", top: oy + y * img.naturalHeight * s + "px", width: g * img.naturalWidth * s + "px", height: y2 * img.naturalHeight * s + "px" });
  $("em", k).textContent = NEDEN[i].ad;
  // çerçeve üstteki HUD'a çok yakınsa etiket çerçevenin içine (sol üst) alınır
  const hud = $("#panel .p-hud"), hudAlt = hud.offsetTop + hud.offsetHeight + 34;
  k.classList.toggle("ic-etiket", parseFloat(k.style.top) < hudAlt);
  pn.style.setProperty("--cap", Math.hypot(W, H) * 1.5 * 2 + "px");
}
function nedenGec(b) {
  if (b === nedenAktif) return;
  nedenZaman.forEach(clearTimeout); nedenZaman = [];
  const katlar = $$(".p-kat"), A = katlar[nedenAktif], B = katlar[b];
  nedenAktif = b;
  $("#panel .p-kutu").classList.remove("acik");
  A.classList.add("cizgi");                                  // 1) gerçek → çizgi + nokta
  nedenZaman.push(setTimeout(() => {                         // 2) yeni görüntünün çizgisi üstte belirir
    katlar.forEach((k) => k.classList.remove("onde"));
    B.classList.add("cizgi", "onde", "gorunur");
    hudYaz(NEDEN[b].hud);
    nedenZaman.push(setTimeout(() => {                       // 3) tarama halkasıyla gerçek görüntü
      const t = $("#panel .p-tarama"); t.classList.remove("git"); void t.offsetWidth; t.classList.add("git");
      B.classList.remove("cizgi");
      katlar.forEach((k) => k !== B && k.classList.remove("gorunur", "cizgi"));
      nedenZaman.push(setTimeout(() => { kutuKoy(b); $("#panel .p-kutu").classList.add("acik"); }, 1100));
    }, 1150));
  }, 520));
}
// kaydırma: okunan paragraf kelime kelime renklenir (okunan koyu, okunmakta olan vurgu, gelecek açık); ekranın ortasındaki madde panelde
function nedenGuncelle() {
  if (!neden) return;
  const vh = innerHeight, r = neden.getBoundingClientRect();
  if (r.bottom < 0 || r.top > vh) return;
  const cizgi = telefonMu.matches ? vh * .72 : vh * .5;
  let enYakin = 0, fark = 1e9;
  $$("#maddeler .madde").forEach((m, i) => {
    const q = m.getBoundingClientRect(), d = Math.abs((q.top + q.bottom) / 2 - cizgi);
    if (d < fark) { fark = d; enYakin = i; }
    // harf harf: --a açık→vurgu dolgusu, --b vurgu→koyu dolgusu (0–1; sınırdaki harf yarım dolar)
    const p = $(".okuma", m), pr = p.getBoundingClientRect(), h = p._h || (p._h = [...p.querySelectorAll(".h")]), n = h.length, V = 16;
    const ilerle = sinir((vh * .86 - pr.top) / (pr.height + vh * .32)), bas = ilerle * (n + V);
    for (let j = 0; j < n; j++) {
      const a = sinir(bas - j), b = sinir(bas - j - V), k = Math.round(a * 50) * 100 + Math.round(b * 50);
      if (h[j]._k !== k) { h[j]._k = k; h[j].style.setProperty("--a", a.toFixed(2)); h[j].style.setProperty("--b", b.toFixed(2)); }
    }
  });
  nedenGec(enYakin);
}
if (neden) { hudYaz(NEDEN[0].hud); addEventListener("resize", () => kutuKoy(nedenAktif)); setTimeout(() => { kutuKoy(0); $("#panel .p-kutu").classList.add("acik"); }, 600); }

// ---------- Sahneler ----------
let kurumTaraf = "sol";
const S = {
  acilis(el, p) {
    const i = Math.round(duraklı(p, 3, .22));
    if (!videoCiz(el, p)) {
      const k = el.querySelectorAll(".kat"), d = duraklı(p, 3, .22);
      k.forEach((img, j) => { img.style.opacity = j ? sinir(d - (j - 1)) : 1; img.style.transform = `scale(${1.1 - .1 * sinir(d - j + 1, 0, 2) / 2})`; });
    }
    etkin(el.querySelectorAll(".adim"), i);
    const acik = i === 2;
    $(".sabit", el).classList.toggle("ton-acik", acik);
    el.querySelector(".sol-koyu").style.opacity = acik ? 0 : 1;
    el.querySelector(".sol-acik").style.opacity = acik ? 1 : 0;
    el.querySelector(".kaydir").style.opacity = p > .9 ? 0 : .8;
  },
  yangin(el, p) {
    const n = YANGIN.length, vd = VIDEO.get($(".sabit", el)), d = vd && vd.D ? videoDurak(p, vd.D) : duraklı(p, n, .36);
    // Video: son karesi T1-konut-yatay'ın YANGIN_KIRP bölgesi + tüp. Son kısımda kare, kurumlar sahnesindeki T1 yerleşimine
    // kayarak oturur (altında aynı T1 durur, kenar boşluğu kalırsa o doldurur); en sonda sayfadaki tüp aynı yerde belirir.
    // Telefonda kurumlar dikey görsel kullandığı için oturma yok: video söner, altındaki dikey T1 görünür.
    const son = vd && vd.D ? videoSon(p, vd.D) : sinir((p - .86) / .14);
    const hiza = dikeyMi.matches ? 0 : yumus(sinir((son - .12) / .5));
    const video = videoCiz(el, p, d, (kapla) => {
      if (!hiza) return kapla;
      const ys = $(".yangin-son"), s = parseFloat(ys.style.width) / ANKRAJ.yatay["T1-konut"].w;
      const hedef = [parseFloat(ys.style.left) + YANGIN_KIRP[0] * s, parseFloat(ys.style.top) + YANGIN_KIRP[1] * s, YANGIN_KIRP[2] * s, YANGIN_KIRP[3] * s];
      return kapla.map((v, k) => v + (hedef[k] - v) * hiza);
    });
    if (video) {
      const sonK = $$("#yangin-katlar .katman", el).pop();
      Object.assign(sonK.style, { visibility: "", transform: "none" }); sonK.style.setProperty("--cik", 0);
      $(".video-tuval", el).style.opacity = dikeyMi.matches ? 1 - sinir((son - .2) / .4) : 1;
      // sayfadaki tüp, video yerine tam oturduktan sonra belirir (videodaki tüple üst üste)
      const gt = $("#gecis-tup"), tg = dikeyMi.matches ? 0 : sinir((son - .66) / .14);
      gt.style.transform = `translate3d(${HEDEF[0] - TUP.cx * TUP_OLCEK}px,0,0)`; gt.style.opacity = tg; gt.style.visibility = tg > 0 ? "" : "hidden";
    } else {
      // taslak (video geçici kapalı): durak görselleri yumuşak geçişle (crossfade) birbirine geçer
      el.querySelectorAll("#yangin-katlar .katman").forEach((k, i) => {
        const o = i === 0 ? 1 : yumus(sinir(d - i + 1)), ust = i < n - 1 ? yumus(sinir(d - i)) : 0;
        k.style.transform = "none"; k.style.opacity = o; k.style.visibility = o > 0 && ust < 1 ? "" : "hidden"; k.style.setProperty("--cik", 0);
      });
      $("#gecis-tup").style.visibility = "hidden";
    }
    const sonuk = 1 - sinir((p - (1 - SINIR)) / SINIR);
    for (const o of [$("#yangin-metin"), $("#ray"), $("#sayac")]) o.style.opacity = sonuk;
    // telefonda yazı altta, kurumlarda üstte: sınırda okuma perdesi de alttan üste geçer
    // masaüstünde yazı ürünün karşı tarafında: okuma perdesi de durağa göre soldan sağa geçer
    const sagO = telefonMu.matches ? 0 : (() => { const i = Math.min(n - 2, Math.floor(d)), f = sinir((d - i - .3) / .4); return (YANGIN[i].sag ? 1 : 0) * (1 - f) + (YANGIN[i + 1].sag ? 1 : 0) * f; })();
    $(".perde.sol-acik", el).style.opacity = telefonMu.matches ? sonuk : 1 - sagO;
    $(".perde.sag-acik", el).style.opacity = sagO * sonuk;
    $(".perde.ust-acik", el).style.opacity = telefonMu.matches ? 1 - sonuk : 0;
    const a = Math.round(d);
    etkin(el.querySelectorAll("#yangin-metin .adim"), a);
    el.querySelectorAll(".ray span").forEach((s, i) => { s.classList.toggle("on", i === a); s.classList.toggle("gecti", i < a); s.querySelector("i").style.width = (i < a ? 100 : i === a ? 100 * sinir(d - a + .5) : 0) + "%"; });
    $("#sayac").innerHTML = `<span><i>0${a + 1}</i> / 0${n}</span><span>${YANGIN[a].ray}</span>`;
  },
  tup(el, p) {
    const n = MEKAN.length, d = duraklı(p, n, .3);
    const st = $(".sabit", el);
    // yangın sahnesi açıksa kurumlar onun son ekranının üstüne biner (yapışana kadar gizli); kapalıysa normal akar
    const binme = !$("#yangin")?.hidden;
    st.style.visibility = binme && el.getBoundingClientRect().top > 1 ? "hidden" : "visible";
    st.style.setProperty("--gor", binme ? sinir(p / SINIR).toFixed(3) : 1);
    kaydir(el.querySelectorAll("#mekanlar .katman"), d, true);
    const i0 = Math.min(n - 2, Math.floor(d)), f = d - i0, yon = Math.sign(HEDEF[i0 + 1] - HEDEF[i0]);
    // yatma: yolun ilk %70'inde öne (en çok 7°); oturma: son %30'da ters yönde küçük bir sallanma, sonra dik
    const yat = sinir(f / .7), otur = sinir((f - .7) / .3);
    const aci = yon * (7 * Math.sin(Math.PI * yat) * (f < .7 ? 1 : 0) - 2.6 * Math.sin(Math.PI * otur) * (1 - otur * .4));
    tupKoy(HEDEF[i0] + (HEDEF[i0 + 1] - HEDEF[i0]) * yumus(sinir(f * 1.08)), aci);
    const a = Math.round(d);
    etkin(el.querySelectorAll("#mekan-metin .adim"), a);
    el.querySelectorAll(".mekan-liste span").forEach((s, i) => s.classList.toggle("on", i === a));
    // yazı tüpün karşı tarafında: tüp soldaysa sağda, değilse solda
    const taraf = !telefonMu.matches && HEDEF[a] < el.clientWidth * .45 ? "sag" : "sol";
    if (taraf !== kurumTaraf) {
      kurumTaraf = taraf;
      const m = $("#kurum-metin");
      m.classList.add("gecis");
      setTimeout(() => { m.classList.toggle("sag", taraf === "sag"); $("#tup .perde").classList.toggle("ters", taraf === "sag"); m.classList.remove("gecis"); }, 280);
    }
  },
  kantar(el, p) {
    const n = KANTAR.length, d = duraklı(p, n, .26);
    if (!videoCiz(el, p)) el.querySelectorAll(".kat").forEach((img, i) => {
      const t = i === 0 ? 1 : sinir(d - i + 1);
      img.style.clipPath = "none"; img.style.transform = "none"; // taslak: kayma yerine yumuşak geçiş
      img.style.opacity = i === 0 ? 1 : yumus(t);
    });
    const a = Math.round(d);
    etkin(el.querySelectorAll("#kantar-metin .adim"), a);
    el.querySelectorAll(".kantar-liste span").forEach((s, i) => s.classList.toggle("on", i === a));
  },
  son(el, p) {
    $(".kat", el).style.transform = `scale(${1.14 - .14 * p})`; // yalnız yaklaşma (kaydırma yok): ölçek ≥ 1, sağda/solda boşluk kalmaz
    el.querySelector(".bol").classList.toggle("acik", p > .05);
  },
};

const sahneler = [...document.querySelectorAll("[data-sahne]")].filter((el) => !el.hidden);
let bekliyor = false;
// Sahne ilerlemesi kaydırmayı yumuşak izler (atalet): hızlı kaydırmada kareler sıçramaz, her karede hedefe biraz yaklaşır
const YUMUSAK = new Map(), IZLE = .11;
function guncelle() {
  bekliyor = false;
  const vh = innerHeight;
  let devam = false;
  for (const el of sahneler) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -vh || r.top > vh * 1.5) { YUMUSAK.delete(el); continue; }
    const toplam = el.offsetHeight - $(".sabit", el).offsetHeight, hedef = sinir(-r.top / toplam);
    let p = YUMUSAK.has(el) ? YUMUSAK.get(el) : hedef;
    p += (hedef - p) * IZLE;
    if (Math.abs(hedef - p) < .0003) p = hedef; else devam = true;
    YUMUSAK.set(el, p);
    S[el.dataset.sahne](el, p);
  }
  if (devam) iste();
  nedenGuncelle();
  document.querySelectorAll('.menu a[href^="#"]').forEach((a) => { const t = $(a.getAttribute("href")); if (!t) return; const r = t.getBoundingClientRect(); a.classList.toggle("on", r.top < vh * .5 && r.bottom > vh * .5); });
}
function iste() { if (!bekliyor) { bekliyor = true; requestAnimationFrame(guncelle); } }
addEventListener("scroll", iste, { passive: true });
addEventListener("resize", () => { mekanYerlestir(); yanginYerlestir(); iste(); });
dikeyMi.addEventListener("change", () => { mekanYerlestir(); yanginYerlestir(); iste(); });
telefonMu.addEventListener("change", () => { mekanYerlestir(); yanginYerlestir(); iste(); });
mekanYerlestir(); yanginYerlestir(); guncelle();

// ---------- İletişim formu → WhatsApp (waAc: ortak.js) ----------
$("#konu").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; $("#konu").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); });
$("#form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = new FormData(e.target), konu = $("#konu .on").textContent;
  waAc(`Merhaba, ${konu.toLowerCase()} için teklif almak istiyorum.\nAd: ${f.get("ad") || "-"}\nTelefon: ${f.get("tel") || "-"}\n${f.get("mesaj") || ""}`.trim());
});

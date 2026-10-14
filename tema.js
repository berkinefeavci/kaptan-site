// Kaptan demo — renk temaları. Seçim ?tema= ile ya da sol alttaki seçiciyle; tarayıcıda hatırlanır.
(() => {
  const TEMALAR = [
    { k: "kirmizi", ad: "Kırmızı", i: "linear-gradient(135deg, #f3f2ef 0 50%, #d3262d 50%)" },
    { k: "turuncu", ad: "Turuncu", i: "linear-gradient(135deg, #16345c 0 50%, #e8591a 50%)" },
    { k: "lacivert", ad: "Lacivert", i: "linear-gradient(135deg, #0b1a30 0 50%, #c6d8f0 50%)" },
    { k: "grafit", ad: "Grafit", i: "linear-gradient(135deg, #17181b 0 50%, #e5392b 50%)" },
    { k: "durumsal", ad: "Durumsal", i: "linear-gradient(135deg, #ffffff 0 34%, #d3262d 34% 66%, #16345c 66%)" },
  ];
  const ANAHTAR = "kaptan-demo-tema";
  const gecerli = (k) => TEMALAR.some((t) => t.k === k);
  let kayitli = null;
  try { kayitli = localStorage.getItem(ANAHTAR); } catch {}
  const istek = new URLSearchParams(location.search).get("tema");
  let tema = gecerli(istek) ? istek : gecerli(kayitli) ? kayitli : "kirmizi";
  document.documentElement.dataset.tema = tema;

  const ACIKLAMA = { kirmizi: "Yangın", turuncu: "Kaptan Sistemi", lacivert: "Katalog", grafit: "Koyu", durumsal: "Bölüme göre" };
  const sec = (k) => {
    tema = k;
    document.documentElement.dataset.tema = k;
    try { localStorage.setItem(ANAHTAR, k); } catch {}
    document.querySelectorAll("[data-tema-k]").forEach((b) => b.classList.toggle("on", b.dataset.temaK === k));
    const ac = document.querySelector(".tema-ac i");
    if (ac) ac.style.background = TEMALAR.find((t) => t.k === k).i;
  };
  const dugme = (t, ek = "") => `<button type="button" data-tema-k="${t.k}" aria-label="${t.ad} tema"><i style="background:${t.i}"></i>${t.ad}${ek}</button>`;

  addEventListener("DOMContentLoaded", () => {
    if (!document.querySelector(".ust .sag") || !document.getElementById("menu")) return; // tam katalog: yalnız seçili temayı uygular
    // masaüstü: üst çubukta açılır liste
    const kutu = document.createElement("div");
    kutu.className = "tema-kutu";
    kutu.innerHTML = `<button type="button" class="tema-ac" aria-label="Renk teması" aria-expanded="false"><i></i></button>
      <div class="tema-liste" role="menu"><p>Renk teması</p>${TEMALAR.map((t) => dugme(t, `<small>${ACIKLAMA[t.k]}</small>`)).join("")}</div>`;
    document.querySelector(".ust .sag").prepend(kutu);
    const kapat = () => { kutu.classList.remove("acik"); kutu.querySelector(".tema-ac").setAttribute("aria-expanded", "false"); };
    kutu.querySelector(".tema-ac").addEventListener("click", (e) => { e.stopPropagation(); const a = kutu.classList.toggle("acik"); e.currentTarget.setAttribute("aria-expanded", String(a)); });
    addEventListener("click", (e) => { if (!kutu.contains(e.target)) kapat(); });
    addEventListener("keydown", (e) => { if (e.key === "Escape") kapat(); });
    // telefon: menünün içinde satır
    const satir = document.createElement("div");
    satir.className = "menu-tema";
    satir.innerHTML = `<p>Renk teması</p>${TEMALAR.map((t) => dugme(t)).join("")}`;
    document.getElementById("menu").appendChild(satir);
    document.addEventListener("click", (e) => { const b = e.target.closest("[data-tema-k]"); if (b) { e.stopPropagation(); sec(b.dataset.temaK); kapat(); } }, true);
    sec(tema);
  });
})();

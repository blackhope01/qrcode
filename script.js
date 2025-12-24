// script.js - Dinamik Formül QR Kod Oluşturucu
document.addEventListener("DOMContentLoaded", function () {
    // --- Elementler ---
    const form = document.getElementById("form");
    const qrImg = document.getElementById("qr-code");
    const formülGosterim = document.getElementById("formül-gosterim");
    const copyButton = document.getElementById("copy-button"); 

    // Girdi Alanları
    const barkodBitisInput = document.getElementById("barkod-bitis-satiri");
    const modelHucreInput = document.getElementById("model-kontrol-hucre");
    const modelBaslangicInput = document.getElementById("model-baslangic");
    const modelUzunlukInput = document.getElementById("model-uzunluk");
    const uzunlukInput = document.getElementById("uzunluk-input");
    const paletSayiInput = document.getElementById("palet-sayi-input");
    
    // Toggle Kontrolleri
    const paletToggle = document.getElementById("palet-toggle");
    const modelKontrolToggle = document.getElementById("model-kontrol-toggle");

    const inputElements = [
        barkodBitisInput,
        modelHucreInput,
        modelBaslangicInput,
        modelUzunlukInput,
        uzunlukInput,
        paletSayiInput
    ];

    // --- Fonksiyonlar ---

    function buildFormül() {
        const bitis = barkodBitisInput.value || "750";
        const aralik = `A1:A${bitis}`;
        const modelHucre = modelHucreInput.value || "A$1";
        const mBaslangic = modelBaslangicInput.value || "1";
        const mUzunluk = modelUzunlukInput.value || "10";
        const uzunluk = uzunlukInput.value || "18";
        const paletAdet = paletSayiInput.value || "10";

        let f = `=EĞER(${aralik}=""; ""; EĞER(UZUNLUK(${aralik})<>${uzunluk}; "❌ HATALI BARKOD ❌"; `;

        let icMantik = "";

        if (modelKontrolToggle.checked) {
            icMantik += `EĞERHATA(EĞER(BUL(PARÇAAL(${modelHucre}; ${mBaslangic}; ${mUzunluk}); ${aralik}); `;
        }

        icMantik += `EĞER(SATIR(${aralik})=KAÇINCI(${aralik}; ${aralik}; 0); `;

        if (paletToggle.checked) {
            icMantik += `EĞER(MOD(SATIR(${aralik});${paletAdet})=0; "PALET DOLDU (" & TAMSAYI(SATIR(${aralik})/${paletAdet}) & ")"; "✓"); `;
        } else {
            icMantik += `"✓"; `;
        }

        icMantik += `"❌ ZATEN OKUTULDU ❌")`;

        if (modelKontrolToggle.checked) {
            icMantik += `); "❌ FARKLI MODEL ❌")`;
        }

        f += icMantik + "))";
        return f;
    }

    function updateDisplay() {
        formülGosterim.textContent = buildFormül();
        qrImg.classList.add("hidden"); 
    }

    function handleToggles() {
        const modelGrubu = document.getElementById("model-ayarlar-grubu");
        const modelChecked = modelKontrolToggle.checked;

        modelHucreInput.disabled = !modelChecked;
        modelBaslangicInput.disabled = !modelChecked;
        modelUzunlukInput.disabled = !modelChecked;
        modelGrubu.style.opacity = modelChecked ? "1" : "0.5";

        const paletGrubu = document.getElementById("palet-sayi-ayari");
        const paletChecked = paletToggle.checked;

        paletSayiInput.disabled = !paletChecked;
        paletGrubu.style.opacity = paletChecked ? "1" : "0.5";

        updateDisplay();
    }

    // ✔ DOĞRU TOGGLE DİNLEYİCİLERİ
    paletToggle.addEventListener("change", handleToggles);
    modelKontrolToggle.addEventListener("change", handleToggles);

    // Diğer inputlar
    inputElements.forEach(el => {
        el.addEventListener("input", updateDisplay);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const formula = buildFormül();
        const size = 400;
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(formula)}&size=${size}x${size}&margin=2&ecc=L`;
        qrImg.classList.remove("hidden");
        qrImg.scrollIntoView({ behavior: 'smooth' });
    });

    copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(formülGosterim.textContent).then(() => {
            const originalText = copyButton.textContent;
            copyButton.textContent = "KOPYALANDI!";
            copyButton.classList.add("text-green-400");
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove("text-green-400");
            }, 1500);
        });
    });

    document.getElementById('copyright-text')
        .innerHTML = `&copy; ${new Date().getFullYear()} <strong>Ferhat Erdoğan</strong> - Tüm Hakları Saklıdır.`;

    handleToggles();
});
            

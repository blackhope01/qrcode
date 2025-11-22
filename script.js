// script.js - Dinamik Formül QR Kod Oluşturucu
document.addEventListener("DOMContentLoaded", function () {
    // --- Elementler ---
    const form = document.getElementById("form");
    const qrImg = document.getElementById("qr-code");
    const formülGosterim = document.getElementById("formül-gosterim");
    const copyButton = document.getElementById("copy-button"); 

    // Formül Referans Girişleri
    const barkodBitisSatiriInput = document.getElementById("barkod-bitis-satiri");
    const modelKontrolHucreInput = document.getElementById("model-kontrol-hucre");
    
    // Ayar Kontrolleri
    const uzunlukInput = document.getElementById("uzunluk-input");
    const paletToggle = document.getElementById("palet-toggle");
    const paletSayiInput = document.getElementById("palet-sayi-input");
    const paletSayiAyariDiv = document.getElementById("palet-sayi-ayari");
    const modelKontrolToggle = document.getElementById("model-kontrol-toggle"); 

    // Toggle'ların Dış Kapsayıcıları (Tıklama Alanını Genişletmek İçin)
    const modelKontrolKapsayici = modelKontrolToggle.closest('.flex');
    const paletKontrolKapsayici = paletToggle.closest('.flex');

    // Tüm girdileri dinleyecek tek bir dizi
    const inputElements = [
        barkodBitisSatiriInput, 
        modelKontrolHucreInput, 
        uzunlukInput, paletToggle, paletSayiInput, 
        modelKontrolToggle
    ];
    
    // --- Olay Dinleyicileri ---

    // Toggle Kapsayıcılarını İşlevselleştirme
    modelKontrolKapsayici.addEventListener("click", function(event) {
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'LABEL' && !event.target.classList.contains('toggle-dot')) {
            modelKontrolToggle.checked = !modelKontrolToggle.checked;
            modelKontrolToggle.dispatchEvent(new Event('change'));
        }
    });

    paletKontrolKapsayici.addEventListener("click", function(event) {
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'LABEL' && !event.target.classList.contains('toggle-dot')) {
            paletToggle.checked = !paletToggle.checked;
            paletToggle.dispatchEvent(new Event('change'));
        }
    });
    
    // Kopyalama Butonu Olay Dinleyicisi
    copyButton.addEventListener("click", copyFormül);

    // Form gönderimini yakala (QR kodunu oluştur)
    form.addEventListener("submit", function (e) {
        e.preventDefault();
        generateQR();
    });

    // Tüm ayar değişikliklerini dinle (Formülü anında güncelle)
    inputElements.forEach(element => {
        element.addEventListener("input", updateFormülDisplay);
        element.addEventListener("change", updateFormülDisplay);
    });

    // Palet Toggle değişimini dinle (Palet Sayısı Girişini devre dışı bırak/etkinleştir)
    paletToggle.addEventListener("change", function() {
        if (paletToggle.checked) {
            paletSayiInput.disabled = false;
        } else {
            paletSayiInput.disabled = true;
        }
        updateFormülDisplay();
    });

    // --- Fonksiyonlar ---
    
    // Formülü Panoya Kopyala
    function copyFormül() {
        const formülMetni = formülGosterim.textContent;
        // Eğer metin hala "Formül yükleniyor..." ise kopyalama yapma
        if (formülMetni.trim() === "Formül yükleniyor...") return;

        navigator.clipboard.writeText(formülMetni).then(() => {
            
            // YENİ METİN TABANLI GERİ BİLDİRİM
            const originalText = copyButton.textContent;
            copyButton.textContent = "Kopyalandı!";
            copyButton.classList.add("bg-green-600");
            copyButton.classList.remove("bg-zinc-700");
            
            setTimeout(() => {
                copyButton.textContent = originalText;
                copyButton.classList.remove("bg-green-600");
                copyButton.classList.add("bg-zinc-700");
            }, 1500);
            
        }).catch(err => {
            console.error('Kopyalama başarısız oldu: ', err);
            alert("Kopyalama başarısız oldu. Lütfen metni manuel olarak kopyalayın.");
        });
    }

    // Formülü Ayarlara Göre Oluşturma
    function buildFormül() {
        // Değerleri al
        const bitisSatiri = barkodBitisSatiriInput.value.trim();
        const aralik = `A1:A${bitisSatiri}`;
        
        const modelHucre = modelKontrolHucreInput.value.trim();
        const uzunluk = uzunlukInput.value.trim();
        const paletSayi = paletSayiInput.value.trim(); 
        const paletKontrolAktif = paletToggle.checked;
        const modelKontrolAktif = modelKontrolToggle.checked;

        // 1. Boş Kontrolü
        let formül = `=EĞER(${aralik}=""; "";`;

        // 2. Uzunluk Kontrolü
        formül += `EĞER(UZUNLUK(${aralik})<>${uzunluk}; "❌ HATALI BARKOD ❌"; `;
        
        let icFormül = ''; 

        // 3. Model Kontrolü ve EĞERHATA Bloğu
        if (modelKontrolAktif) {
            icFormül += `EĞERHATA(`;
            icFormül += `EĞER(BUL(PARÇAAL(${modelHucre}; 1; 12); ${aralik}); `;
        }
        
        // 4. Tekrar Kontrolü (KAÇINCI)
        icFormül += `EĞER(SATIR(${aralik})=KAÇINCI(${aralik}; ${aralik}; 0); `;
        
        // 5. Palet Dolum Kontrolü veya Başarılı (✓)
        if (paletKontrolAktif) {
            icFormül += `EĞER(MOD(SATIR(${aralik});${paletSayi})=0;"PALET DOLDU";"✓"); `;
        } else {
            icFormül += `"✓"; `; 
        }
        
        // 6. Zaten Okutuldu
        icFormül += `"❌ ZATEN OKUTULDU ❌")`; 
        
        // 7. Kapatmalar (Model Kontrolü Kapatmaları)
        if (modelKontrolAktif) {
            icFormül += `)`; 
            icFormül += `; "❌ FARKLI MODEL ❌")`; 
        }

        // Ana formüle iç formülü ekle
        formül += icFormül; 
        
        // Tüm dıştaki EĞER'leri kapat
        formül += `))`; 
        
        return formül;
    }

    // Formülü ekranda göster ve QR kodu için hazırla
    function updateFormülDisplay() {
        const formül = buildFormül();
        formülGosterim.textContent = formül;
        qrImg.classList.add("hidden"); 
    }

    // QR kodunu oluştur (Butona basıldığında)
    function generateQR() {
        const formülMetni = buildFormül();
        if (!formülMetni || formülMetni.length < 5) {
            qrImg.classList.add("hidden");
            alert("Lütfen tüm formül ayarlarını kontrol edin.");
            return;
        }

        const size = 350; 
        const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
            formülMetni
        )}&size=${size}x${size}&margin=1`;

        qrImg.src = url;
        qrImg.alt = "Oluşturulan Dinamik Formül QR kodu";
        qrImg.classList.remove("hidden");
    }

    // Sayfa yüklendiğinde formu bir kez oluştur ve gerekli olayları tetikle
    updateFormülDisplay();
    paletToggle.dispatchEvent(new Event('change'));
});
      

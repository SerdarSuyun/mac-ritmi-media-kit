# Teknik mimari

## Tercih
Node.js 22+ üzerinde bağımlılıksız statik üretim. HTML + CSS + ES modules. İçerik ağırlıklı, kişisel veri toplamayan bu proje için sunucu veya framework gerekmiyor. GitHub Pages alt dizinlerinde göreli URL kullanılır.

## Yapı
- src/data/brand.json: kimlik, sosyal adres ve iletişim.
- src/data/metrics.json: dönemler, kaynaklar, hesap performansı, Reels yayın grupları.
- src/data/audience.json: platforma göre demografi, payda ve kaynak tarihi.
- src/data/content.json: görsel eşleşmeleri ve iş birliği seçenekleri.
- src/template.html: semantik sayfa iskeleti.
- src/app.js: sekmeler, menü, DOM üzerinden güvenli veri gösterimi. Build sırasında JSON verileri HTML içine de gömülür; dosyadan doğrudan önizleme çalışır.
- src/styles.css: tokenlar, responsive ve print.
- public/assets: seçilmiş optimize WebP ve lisanslı yerel fontlar.
- scripts/build.mjs: doğrula, dist üret; JSON dosyalarını kopyala.
- scripts/validate.mjs: veri bütünlüğü ve kaynak/asset kontrolleri.
- .github/workflows: CI ve elle başlatılabilir Pages yayını.

## Veri sözleşmesi
Sayısal değerler ham number; Türkçe biçimleme Intl.NumberFormat ile yapılır. Her veri grubu source, period veya asOf, scope taşır. Ham raporlar docs/sources içinde yerel referans olarak korunur. Kamuya build çıktısında raporlar ve orijinal görseller dahil edilmez. İçerik URL’leri https/mailto/tel şemalarına sınırlandırılır.

## Yayın ve güvenlik
npm run check, npm run build; dist statik olarak sunulur. Secrets, API anahtarı ve kişisel hesap oturumu gerekmez. .gitignore derleme ve çalışma dosyalarını dışlar. GitHub Pages workflow yalnız manuel tetiklenir; CI push ve PR üzerinde doğrular. Fontlar yerel. GA4 ölçüm altyapısı isteğe bağlıdır; gerçek kimlik ve yayın hostname’i tanımlanmadan aktif olmaz. Etiket yalnız ziyaretçi onayından sonra yüklenir. GitHub entegrasyonu için README adımları izlenir.

## Güncelleme
JSON güncelle → npm run check → npm run build → önizleme → commit → Pages workflow. Yeni rapor geldiğinde mevcut dönemleri sessizce değiştirmek yerine period ve asOf birlikte güncellenir.

## Ziyaretçi ölçümü revizyonu
Merkezi analytics.json, bağımsız analytics.js, ölçüm tercihleri ve GA4 özel iletişim olayları eklendi. Aktivasyon koşulları ve rapor kapsamı docs/ANALYTICS.md içindedir.

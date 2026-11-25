# MAÇ RİTMİ DIGITAL MEDIA KIT V1.0

Türkçe, mobil uyumlu, sponsor görüşmelerine yönelik Digital Media Kit. Anton ve Antonio Regular fontları, optimize edilmiş gerçek görseller ve merkezi JSON istatistik dosyaları kullanır.

## Önizleme

`dist/index.html` dosyasını tarayıcıda açın. Veriler build sırasında HTML içine de gömülür; internet veya yerel sunucu gerekmez. Kaynak JSON dosyalarını düzenledikten sonra yeniden build alın.

Geliştirme için Node.js 22 veya üzeri:

```sh
npm run check
npm run build
npm run preview
```

Önizleme: http://127.0.0.1:4173 — durdurmak için Ctrl+C. Bağımlılık kurulumu gerekmiyor. Kaynak dosya değişikliklerinden sonra `npm run build` komutunu tekrar çalıştırın.

## Belgeler

- [PRD](docs/PRD.md)
- [Teknik mimari](docs/ARCHITECTURE.md)
- [Tasarım sistemi](docs/DESIGN_SYSTEM.md)
- [GitHub araştırması ve tasarım kararları](docs/GITHUB_RESEARCH.md)
- [Doğrulama raporu](docs/QA.md)
- [Kaynak envanteri](docs/source-inventory.json)
- [Görsel seçimi](docs/asset-selection.json)

## İçerik ve istatistik güncelleme

| Dosya | İçerik |
|---|---|
| src/data/brand.json | İletişim ve sosyal bağlantılar |
| src/data/metrics.json | Dönemler, takipçiler, görüntülenmeler, Reels/Story metrikleri |
| src/data/audience.json | Platform demografileri ve ölçüm kapsamları |
| src/data/content.json | Kapaklar ve iş birliği seçenekleri |

Ham sayıları nokta veya virgül eklemeden yazın. `source`, `period`, `scope`, `asOf` alanlarını ilgili sayı ile birlikte güncelleyin. Oranları yüzde işareti olmadan sayı olarak yazın. Yeni görsellerin optimize kopyalarını `public/assets` içine ekleyin. Orijinal görselleri değiştirmeyin.

24 Kasım temel raporu ile 25 Kasım V2 raporunun tarih ve payda ayrımları korunur. 3.112.043 yalnız Instagram görüntülenmesi değildir. Yeni Instagram toplamı 6.523’tür. X adresi kurumsal görselden farklı olarak V2’de doğrulanmış `@SSPhotograpy` adresidir.

## GitHub entegrasyonu

1. GitHub’da boş depo oluşturun. Kaynak analiz raporları içerdiğinden depo görünürlüğünü bilinçli seçin; ham raporlar web build’ine girmez.
2. Proje kökünde:

```sh
git init -b main
git add .
git commit -m "Initial Maç Ritmi Digital Media Kit v1.0"
git remote add origin GITHUB_DEPO_ADRESI
git push -u origin main
```

3. Push/PR üzerinde `Validate and build` iş akışı çalışır.
4. Pages için GitHub Settings → Pages → Source: GitHub Actions seçin.
5. Actions → Publish GitHub Pages → Run workflow ile yayına alın. Bu iş akışı kendiliğinden yayın başlatmaz.

Site depo alt yolunda da çalışır; asset URL’leri göreli. Yalnız `dist/` içeriği yayınlanır. Özel alan adı veya OG paylaşım görseli eklenecekse yayın URL’si kesinleştikten sonra canonical ve mutlak OG image URL’lerini tanımlayın. Mevcut V1 temel OG başlık ve açıklamasını içerir.

## İzinler ve lisanslar

Maç Ritmi marka, fotoğraf ve içerik materyalleri proje sahibine aittir; üçüncü taraflara yeniden kullanım lisansı verilmez. Fontlar SIL Open Font License 1.1 kapsamındadır; her fontun lisans metni assets altında bulunur. GitHub araştırmasındaki tasarımlar kopyalanmamıştır. Uygulama üçüncü taraf JS paketi kullanmaz; kullanıcı takibi veya veri toplayan form yoktur.

## Ziyaretçi ölçümü
GA4 entegrasyonu hazır, henüz aktif değil. Maç Ritmi’ye ait ölçüm kimliği ve kesin yayın hostname’i src/data/analytics.json içinde tanımlanmalıdır. Kurulum, olaylar ve veri sınırlamaları için [ölçüm belgesi](docs/ANALYTICS.md).

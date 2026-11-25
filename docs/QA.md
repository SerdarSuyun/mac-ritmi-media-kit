# V1 doğrulama raporu

25 Kasım 2026

## Tamamlanan kontroller
- Node build ve veri doğrulaması başarılı.
- JavaScript sözdizimi kontrolü başarılı.
- Meta toplamları Instagram + Facebook kırılımları ile aritmetik olarak eşleşiyor.
- Yeni rapordaki Instagram 6.523 toplamı korunuyor.
- Platformların dönem, kaynak ve kapsam bilgileri mevcut.
- Seçilen görseller ve iki font dosyası mevcut; Türkçe ç, ğ, ı, İ, ö, ş, ü karakterleri her iki fontta bulunuyor.
- HTML hedef bağlantıları ve benzersiz ID kontrolü başarılı.
- Orijinal 65 kaynak dosya SHA-256 değerleriyle yeniden kontrol edildi; değiştirilmedi.
- Dağıtımda kaynak analiz raporları ve kaynak envanteri yer almıyor.
- dist/index.html verileri build sırasında merkezî JSON’dan içeriyor; file:// üzerinden veri fetch ihtiyacı yok.

## Doğrulanamayanlar
Bu oturumda yerel HTTP sunucusu işletim sistemi izni nedeniyle başlatılamadı (listen EPERM). Uygulama içi önizleme açılamadı; tarayıcı otomasyonu file:// protokolünü güvenlik politikası gereği reddetti. Dolayısıyla görsel tarayıcı kontrolü, gerçek cihaz/mobil taşma, sekme/menü etkileşimleri ve print/PDF çıktısı bu oturumda doğrulanamadı. Kodda responsive kuralları ve bu etkileşimler uygulanmıştır; çalıştıkları doğrulanmış gibi raporlanmaz.

## Yayın öncesi kullanıcı tarayıcısında kontrol
- dist/index.html açıldığında tüm fontlar, görseller ve sayılar görünüyor mu?
- 30/90 gün ve üç hedef kitle sekmesi doğru değerleri gösteriyor mu?
- 320, 375, 768 ve 1440 px genişlikte yatay taşma var mı?
- Klavye ile Tab, sol/sağ ok, Home/End sekme davranışları çalışıyor mu?
- Mobil menü açılıyor, bağlantı ve Escape ile kapanıyor mu?
- WhatsApp, telefon ve e-posta hedefleri doğru mu?
- Yazdır/PDF görünümü okunaklı mı?

## Bilinen ürün sınırları
Veriler anlık değildir. Envanter önerileri henüz fiyatlı paket değildir. Reels görselleriyle tekil performans eşleştirmesi yapılmadığı için kapaklara tekil görüntülenme sayısı eklenmedi. X’in dönem performansı gösterilmedi. Canlı yayın ekran görüntüsü kullanılmadı. Sosyal paylaşım için mutlak URL içeren OG image yayın adresi kesinleşince eklenebilir.

## Revizyon kontrolleri
Portre dosyasında renk kanalları doğrulandı, grayscale filtresi kaldırıldı. Hakkımızda ve içerik formatı kontrolleri build çıktısında mevcut. JS sözdizimi ve tam build tekrar geçti. Kaynak dosyaların SHA-256 değerleri tekrar eşleşti. Yeni saha panelinin görsel ve tıklama kontrolü mevcut tarayıcı engeli nedeniyle doğrulanamadı.

## Hareket revizyonu
CSS pas döngüsü, top dönüşü, hat akışı ve görünürlük duraklatması eklendi. Sözdizimi ve build kontrolü tekrar çalıştırıldı. Tarayıcı animasyon ve kontrol testi bu oturumdaki mevcut önizleme engeli nedeniyle doğrulanamadı.

## WhatsApp revizyonu
Sabit WhatsApp bağlantısı merkezi brand.json adresinden atanır. Hazır mesaj ve hedef numara build verisinden kontrol edildi. Mobil/tarayıcı görsel doğrulaması bu oturumda yapılamadı.

## GA4 revizyonu
Ayrı ölçüm dosyası, üretim hostname kontrolü, onay akışı ve iletişim olayları eklendi. Node testleri ve build çalıştırıldı. Akış kimliği ve gerçek yayın adresi olmadan canlı GA4 veri alımı doğrulanamaz; ölçüm şu anda pasiftir.

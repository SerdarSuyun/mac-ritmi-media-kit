# Ziyaretçi ölçümü — GA4

## Mevcut durum
Kod hazır; ölçüm aktif değil. Maç Ritmi için doğrulanmış GA4 ölçüm kimliği ve kesin yayın hostname’i henüz mevcut değil. src/data/analytics.json bu yüzden enabled:false durumundadır. Rastgele veya başka markaya ait eski kimlik kullanılmadı.

## Aktivasyon
1. Google Analytics hesabında Maç Ritmi Digital Media Kit için ayrı bir mülk ve Web veri akışı oluşturun. Saat dilimi Türkiye, para birimi TRY seçilebilir.
2. Akışın G- ile başlayan ölçüm kimliğini alın.
3. src/data/analytics.json içindeki measurementId değerini bu kimlikle, allowedHosts listesini gerçek yayın hostname’iyle doldurun. URL şeması veya yol eklemeyin. Örnek yapı: ["medyakit.lunarmedia.com.tr"].
4. enabled:true yapın, npm run check ve npm run build çalıştırın; yeniden yayınlayın.
5. GA4 Gerçek zamanlı/Tag Assistant ve tarayıcı ağ isteğiyle veri alımını kontrol edin. Ana raporların işlenmesi zaman alabilir.

## Ölçülenler
| GA4 alanı/olayı | Anlamı |
|---|---|
| Toplam kullanıcılar | GA4’ün tahmin ettiği kullanıcı sayısı; kesin gerçek kişi sayısı değildir |
| Oturumlar | Ziyaret oturumları |
| page_view | Sayfa görüntüleme; sayfa açılışı başına tek gönderim |
| whatsapp_click | Sabit veya iletişim bölümündeki WhatsApp tıklaması |
| email_click / phone_click | E-posta / telefon bağlantısı tıklaması |
| audience_view | Hedef kitle bölümü görünür olduğunda, sayfa başına bir kez |
| sponsorship_view | Sponsorluk bölümü görünür olduğunda, sayfa başına bir kez |
| media_kit_print_requested | Yazdır/PDF düğmesine basılması; PDF’nin kaydedildiğini göstermez |

WhatsApp tıklaması mesaj gönderildiğini veya iş birliği gerçekleştiğini kanıtlamaz. Ziyaretçi kimliği veya hangi kişinin baktığı tespit edilmez. Ham URL parametreleri, e-posta adresi, telefon numarası veya WhatsApp mesajı olay parametresi olarak gönderilmez. Bu sürüm UTM ayrıştırması yapmaz.

## Onay ve kapsam
Google etiketi yalnız ziyaretçi izin verdikten sonra yüklenir (basic consent). İzin vermeyen veya reklam engelleyici kullanan ziyaretçiler eksik sayılabilir; tüm girişlerin eksiksiz sayıldığı iddia edilmez. Tercih 180 gün saklanır ve footer’daki Ölçüm tercihleri düğmesinden değiştirilebilir. Reklam kişiselleştirme, Google Signals ve reklam verisi onayları kapalıdır.

file://, localhost, izin listesinde olmayan alan adları ve HTTPS dışı ortamlar ölçüm dışıdır. Sayfa içi bölüm bağlantıları yeni sayfa görüntülemesi sayılmaz. GA4 akışında gelişmiş ölçümün tarayıcı geçmişi değişikliklerinden sayfa görüntüleme toplama seçeneği kapatılmalıdır; tek sayfalı yapıda çift sayımı önler. Özel whatsapp_click olayını gönderdiğimiz için GTM üzerinden ikinci bir aynı olay etiketi eklenmemelidir.

## Kontroller
Node VM testleri: pasif/yerel/geçersiz alan durumları; onaysız etiket yüklenmemesi; tek page_view; URL temizleme; WhatsApp yerleşimleri; onay geri çekme ve süre dolumu. Gerçek GA4 veri alımı ancak akış kimliği ve yayın adresi tanımlandıktan sonra test edilebilir.

Kaynaklar:
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/analytics/devguides/collection/ga4/reference/config
- https://developers.google.com/tag-platform/security/guides/consent

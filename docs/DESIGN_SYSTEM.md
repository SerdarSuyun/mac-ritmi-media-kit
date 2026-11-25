# Tasarım sistemi

## Yön
Premium spor editoryali: derin koyu zemin, sarı marka vurgusu, iri ve yoğun başlıklar, ince ayraçlar, bol negatif alan. Görseller gerçek içerik ve üretim ortamını anlatır; parlak efekt ve kalabalık dekor kullanılmaz.

## Tokenlar
| Rol | Değer |
|---|---|
| Ana zemin | #0B0D12 |
| Panel | #1A1F2B |
| Metin | #E6E6E6 |
| Ana vurgu | #FFB300 |
| İkincil vurgu | #FF6F00 |
| Uyarı/canlı | #D71920 |
| Bilgi | #00C2FF |

Kaynak: 07-Kurumsal/Kurumsal.png. V1 ağırlıklı koyu/sarı kullanır; cyan veriye özel sınırlı vurgudur.

## Tipografi
Anton 400 büyük başlık ve ana sayılar. Antonio 400 gövde, navigasyon ve alt açıklamalar. Türkçe karakter içeren font dosyaları yerel sunulur. Başlık clamp(3rem, 7vw, 7rem), gövde 20–22 px, yardımcı metin en az 14 px. Büyük harf dönüşümü Türkçe locale ile uygulanır.

## Grid ve bileşenler
Maksimum içerik 1280 px, masaüstü yan boşluk 48 px, mobil 20 px. 8 px tabanlı aralıklar; 1 px ayraç; panel köşesi 4 px. Ana CTA sarı dolgu/siyah metin, ikincil CTA sınır çizgili. Klavye odağı cyan dış çizgi. Hareket azaltma tercihi desteklenir. Aktif sekme yalnız renkle değil aria-selected ve alt çizgiyle belirtilir.

## Yerleşim
Hero: tipografik anlatı ve gerçek sunucu portresi. Meta çapraz görüntüleme büyük vurgu; alt kısımda üç platform ayrı. Kitle: erişilebilir yatay çubuklar ve sayılar. İçerik: yatay beş dikey kapak. Stüdyo: geniş fotoğraf + iki ayrıntı. İş birliği: fiyat vaadi içermeyen üç envanter önerisi. Son bölüm güçlü iletişim CTA.

## Mobil ve çıktı
900 px altında çift kolonlar tek kolon; 600 px altında kapaklar iki kolon; navigasyon açılır menü. Dokunma alanı minimum 44 px. Print görünümünde koyu fon kaldırılır, tüm kritik bölümler ve metrikler korunur.

## V1 görsel revizyon — 25 Kasım 2026
Portre renkli gösterilir. Üst logo masaüstünde 100×112, mobilde 78×96 CSS piksel alana büyütülür. Hero arkasında düşük opaklıklı saha çizgileri bulunur. Hakkımızda bölümü kanal kimliği, Serdar Süyün ve Lunar Media prodüksiyon bağını açıklar. Oyun planı panelinde Maç önü / Maç sonu / Reels–Shorts düğmeleri açıklamayı ve saha üzerindeki top konumunu değiştirir. Saha görseli dekoratiftir, gerçek bir maç verisi veya kadro sunmaz. İlk açılışta tek kısa giriş hareketi, gezinmede bölüm göstergesi bulunur. Hareket azaltma tercihinde animasyon ve geçişler kapatılır.

## Futbol hareketi
Taktik panelinde top 12 saniyelik bir pas döngüsüyle üç format noktasını dolaşır ve döner. Kesik pas hattı akışı destekler. Hareket yalnız dekoratif saha içinde kalır, metin veya aktif format kendi kendine değiştirilmez. Bir format seçilince hareket durur ve top ilgili noktaya geçer; yeniden başlatma kontrolü vardır. Ekran dışındayken animasyon duraklar. prefers-reduced-motion açıkken hareket varsayılan olarak kapalıdır ve kontrol bu durumu belirtir.

Futbol topu ikonu klasik siyah beşgen paneller, beyaz yüzey ve ince dikiş çizgileriyle revize edildi. Küçük boyutta panel okunurluğu için 30 px gösterilir.

## Sabit WhatsApp iletişimi
Sağ alt köşede WhatsApp yeşili (#25D366) iletişim bağlantısı, sponsorluk hazır mesajıyla +90 506 256 00 41 numarasına yönlenir. Mobil güvenli alan ve footer alt boşluğu gözetilir; print çıktısında gizlenir. Mesaj kendiliğinden gönderilmez; ziyaretçi WhatsApp’ta gönderir.

WhatsApp düğmesi ve iletişim bölümündeki WhatsApp CTA yeşildir; okunabilirlik için koyu yeşil metin kullanılır. Sabit düğme ilk açılışta 1,6 saniyelik üç hafif halka dalgasıyla dikkat çeker, sonra sakinleşir. Hover/klavye odağında ve hareket azaltma tercihinde animasyon kapanır.

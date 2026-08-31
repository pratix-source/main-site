# Pratix.io SEO Audit — Faz 1

**PR kapsamı:** Yalnızca analiz raporu; uygulama kodu değiştirilmemiştir.  
**İncelenen depo:** `pratix-source/main-site`  
**İncelenen commit:** Audit çalışması sırasında `main` dalındaki mevcut HEAD  
**Tarih:** 2026-08-31

## Yönetici özeti

`main-site` deposu, framework veya paket yöneticisi kullanılmayan, tek bir `index.html` içinde HTML, Tailwind CDN çıktısı ve gömülü JavaScript barındıran statik bir hub sayfasıdır. Araçların kendisi bu depoda hesaplanmıyor; kartlar, `PRATIX_TOOLS` içindeki sabit URL’lere yeni sekmede açılan bağlantılar olarak üretiliyor. Araç URL’lerinin önemli bölümü `vercel.json` içindeki rewrite kurallarıyla ayrı Vercel uygulamalarına yönlendiriliyor.

Mevcut dil sistemi URL tabanlı değildir. `currentLanguage` JavaScript değişkeniyle tutuluyor ve dil seçimi yalnızca DOM metinlerini yeniden oluşturan `updateLanguage()` fonksiyonunu çalıştırıyor. `pushState`, `location.pathname`, hash tabanlı yönlendirme veya bir framework router’ı bulunamadı. SEO meta etiketleri başlangıç HTML’inde yalnızca tek dilde yer alıyor; JavaScript sonrasında da yalnızca `keywords` ve `description` güncelleniyor. `title`, `canonical`, `hreflang`, `og:*` ve `twitter:*` için dil bazlı çalışma yok.

Bu nedenle en kritik teknik ihtiyaç, mevcut hesaplama/araç mantığını değiştirmeden, hub ve araç uygulamalarının sınırlarını dikkate alan **gerçek route üretimi + statik HTML üretimi** mimarisidir. Ancak her aracın ayrı deposunda çalıştığı görüldüğünden, 130+ URL hedefi yalnızca `main-site` üzerinde yapılacak bir değişiklikle otomatik olarak gerçekleştirilemez; route sahipliği ve deploy modeli Faz 2 başlamadan netleştirilmelidir.

## 1. Framework, router ve build süreci

| Alan | Gerçek bulgu | Kanıt |
|---|---|---|
| Framework | React, Vue, Next veya benzeri framework bağımlılığı yok. | Depo kökünde yalnızca `index.html`, `sitemap.xml`, `vercel.json` ve doğrulama HTML’i bulunuyor; `package.json` yok. |
| UI/HTML | Sayfa işaretlemesi doğrudan `index.html` içinde. | `index.html` satır 1’den başlayan tam HTML dokümanı. |
| Stil/build | Tailwind, CDN üzerinden tarayıcıda yükleniyor; dosyada ayrıca büyük bir üretilmiş stil bloğu bulunuyor. | `index.html` satır 22’de `https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4`. |
| JavaScript | Uygulama mantığı `index.html` içindeki `master-script` bölümünde gömülü. | `index.html` satır 14.759 civarı başlayan script ve satır 15.588’de kapanış. |
| Router | Uygulama içi route router’ı yok. | Kaynakta `pushState`, `location.pathname`, `history.*` ve `hashchange` kullanımı yok. |
| Build aracı | Depo içinde tanımlı bir build komutu veya package script’i yok. | `package.json` bulunmuyor; `vercel.json` yalnızca rewrite yapılandırması içeriyor. |
| Deploy/edge routing | Vercel rewrite kurallarıyla araç yolları harici Vercel uygulamalarına aktarılıyor. | `vercel.json` satır 3–212. |

### Sonuç

Bu depo mevcut haliyle bir SPA/SSG projesi değil; **tek statik giriş dokümanı + edge rewrite hub’ı** olarak çalışıyor. Faz 4’te istenen çok sayıdaki dil-sayfa kombinasyonu için önce bir üretim katmanı (örneğin Node tabanlı statik route generator) ve deploy sırasında çalışacak bir build komutu eklenmesi gerekecek. Bu, Faz 1 kapsamında uygulanmamıştır.

## 2. Mevcut i18n mekanizması

Çeviri verileri `index.html` içinde `const TRANSLATIONS` nesnesinde tutuluyor. Desteklenen diller kodda açıkça şu sırayla tanımlı: `en`, `tr`, `de`, `fr`, `es`, `it`, `nl`, `sv`, `da`, `no`, `fi`, `zh` (`index.html` satır 15.419).

Araç adları, açıklamaları ve kategori adları `PRATIX_TOOLS` ile `PRATIX_CATEGORIES` nesnelerinde dil anahtarlarıyla tutuluyor. Kart render edilirken `tool.name[currentLanguage]` ve `tool.desc[currentLanguage]` okunuyor; anahtar yoksa İngilizceye dönülüyor (`index.html` satır 15.511–15.516). Dil seçici, `data-lang` değerini okuyup `updateLanguage()` fonksiyonunu çağırıyor (`index.html` satır 15.553–15.573). Bu fonksiyon URL’i değiştirmiyor; yalnızca `currentLanguage` değerini güncelliyor ve metinleri yeniden render ediyor.

Ek olarak `remoteTranslate()` fonksiyonu `translate.googleapis.com` uç noktasına istek atacak şekilde tanımlanmış (`index.html` satır 15.422–15.432). Bu, dosyada bulunan “işlemler tarayıcıda çalışır” gizlilik vaadiyle SEO/i18n açısından bir risk oluşturur: çeviri eksik olduğunda kullanıcı girdisi değil de metin dış servise gönderilebilecek bir yol tanımlanmış durumdadır. Faz 2 ve sonrasında bu mekanizmanın route tabanlı, repoda bulunan doğrulanmış çeviri verisiyle değiştirilmesi veya kapsamının açıkça sınırlandırılması gerekir.

### Çeviri anahtarı kapsamı

Kaynak taramasında `PRATIX_TOOLS` + kategori veri bölümünde 16 araç için 12 dil anahtarlarının her biri 32 kez bulundu. `TRANSLATIONS` nesnesinde de 12 dilin tamamı mevcut. Bu sonuç **anahtar varlığı bakımından %100 kapsam** gösterir; çevirilerin dilbilimsel doğruluğu veya SEO kalitesi bu auditte değerlendirilmemiştir. Bu nedenle “tam” ifadesi yalnızca mevcut anahtarların varlığı anlamındadır; makine çevirisi kalitesi hakkında olumlu bir hüküm verilmemelidir.

| Dil | UI çeviri nesnesinde mevcut | Araç/kategori anahtarları | Audit yorumu |
|---|---:|---:|---|
| en | Evet | 32 | Ana dil/fallback |
| tr | Evet | 32 | Anahtar kapsamı mevcut |
| de | Evet | 32 | Anahtar kapsamı mevcut |
| fr | Evet | 32 | Anahtar kapsamı mevcut |
| es | Evet | 32 | Anahtar kapsamı mevcut |
| it | Evet | 32 | Anahtar kapsamı mevcut |
| nl | Evet | 32 | Anahtar kapsamı mevcut |
| sv | Evet | 32 | Anahtar kapsamı mevcut |
| da | Evet | 32 | Anahtar kapsamı mevcut |
| no | Evet | 32 | Anahtar kapsamı mevcut |
| fi | Evet | 32 | Anahtar kapsamı mevcut |
| zh | Evet | 32 | Anahtar kapsamı mevcut |

## 3. Araç → dosya yolu ve deploy sahipliği

Bu repoda araçların hesaplama kaynakları bulunmuyor. 16 araç, `index.html` içindeki `PRATIX_TOOLS` veri nesnesinde tanımlanıyor ve `vercel.json` içindeki rewrite kurallarıyla ayrı uygulamalara bağlanıyor.

| Araç kimliği | Hub URL’i | Bu depodaki tanım | Hedef uygulama / rewrite kanıtı |
|---|---|---|---|
| cleaner | `/cleaner` | `index.html` içindeki `PRATIX_TOOLS` | `excel-data-cleaner-iota.vercel.app` |
| schema-generator | `/schema` | Aynı | `schema-generator-one.vercel.app` |
| revenue-calculator | `/revenue` | Aynı | `revenue-khaki-seven.vercel.app` |
| ad-layout / banner placeholder | `/ads/` | Aynı | `banner-placeholder-generator.vercel.app` |
| ai-prompt-generator | `/prompter/` | Aynı | `prompter-wine-three.vercel.app` |
| compressor | `/compressor` | Aynı | `compressor-murex.vercel.app` |
| commerce-studio | `/commerce-studio` | Aynı | `pratix-commerce-studio.vercel.app` |
| free-pdf-editor | `/pdfeditor` | Aynı | `pdfeditor-psi.vercel.app` |
| loan-calculator | `/loancalculator` | Aynı | `loan-calculator-eight-mu.vercel.app/tools/loan-calculator.html` |
| auto-loan-calculator | `/autoloancalculator` | Aynı | `auto-loan-calculator-flame.vercel.app/tools/auto-loan-calculator.html` |
| debt-payoff-calculator | `/deptpayoffcalculator` | Aynı | `dept-payoff-calculator.vercel.app/tools/debt-payoff-calculator.html` |
| net-worth-calculator | `/networthcalculator` | Aynı | `net-worth-calculator-one.vercel.app/tools/net-worth-calculator.html` |
| cross-border-vat-calculator | `/vatcalculator` | Aynı | `vat-calculator-seven.vercel.app/tools/vat-calculator` |
| retirement-savings-calculator | `/retirementsavingscalculator` | Aynı | `retirement-savings-calculator-cyan.vercel.app/tools/retirement-savings-calculator` |
| file-bridge | `/bridge` | Aynı | `pratix-bridge.vercel.app` |
| content-creator-studio | `/creator-studio` | Aynı | `creator-studio-seven-murex.vercel.app` |

**Önemli adlandırma bulgusu:** Kullanıcı gereksinimindeki `content-creator-studio` yolu ile kaynakta kullanılan `/creator-studio` yolu aynı değildir. Ayrıca `deptpayoffcalculator` yazımı “debt” yerine “dept” olarak mevcut URL’de korunmaktadır. Bu adresler Faz 2’de 301 uyumluluğu planlanmadan değiştirilmemelidir.

## 4. Metadata, canonical ve hreflang’ın mevcut davranışı

Başlangıç HTML kaynak kodunda tek bir ortak metadata seti bulunuyor: `description`, `keywords`, `author`, `og:title`, `og:description`, `og:type`, `og:url` ve `theme-color` (`index.html` satır 12–21). `twitter:*`, `canonical` ve `hreflang` etiketleri bulunmuyor.

JavaScript tarafındaki `updateSEOMeta()` yalnızca `keywords` ve `description` değerlerini güncelliyor (`index.html` satır 15.435–15.444). Bu fonksiyon `DOMContentLoaded` sonrasında çağrılıyor (`index.html` satır 15.581–15.586) ve kullandığı metinler `toolNames`/`toolDescriptions` için sabit olarak İngilizce anahtarları okuyor (`t.name.en`, `t.desc.en`). `title` etiketi başlangıç HTML’inde tek bir İngilizce başlık olarak kalıyor; dil değiştiğinde `document.title` güncellenmiyor.

| SEO unsuru | İlk HTML kaynağında | JS sonrası | Dil bazlı mı? |
|---|---|---|---|
| `<title>` | Evet, tek ortak başlık | Değişmiyor | Hayır |
| `meta description` | Evet | Değişiyor | Hayır; İngilizce araç açıklamalarından üretiliyor |
| `meta keywords` | Evet | Değişiyor | Hayır |
| `canonical` | Yok | Yok | Hayır |
| `hreflang` | Yok | Yok | Hayır |
| `og:title` | Evet, tek ortak değer | Değişmiyor | Hayır |
| `og:description` | Evet, tek ortak değer | Değişmiyor | Hayır |
| `twitter:*` | Yok | Yok | Hayır |

Bu nedenle en kritik bulgu şudur: **dil ve SEO metadatası şu anda ilk HTML kaynak kodunda ayrı sayfalar olarak mevcut değildir; sınırlı metadata değişikliği yalnızca JS çalıştıktan sonra yapılır.**

## 5. Mevcut sitemap ve routing durumu

`sitemap.xml` içinde 17 adet `<loc>` bulunuyor: ana sayfa ve 16 araç. Ana sayfa kaydında yalnızca `tr` ve `x-default` alternate bağlantıları var; araç kayıtlarının çoğunda hreflang kardeşleri yok. `sitemap.xml` elle yazılmış görünüyor ve build sırasında route/slug haritasından üretildiğine dair bir mekanizma bulunmuyor.

`vercel.json` içinde 52 adet `source` kuralı bulunuyor. Kurallar çoğunlukla her araç için kök, slash’li ve `:path*` varyantlarını harici Vercel uygulamasına rewrite ediyor. Bu, mevcut yolların çalışmasını sağlıyor; fakat rewrite, gereksinimdeki dil bazlı statik dosyaları tek başına üretmiyor ve 301 redirect değildir.

## 6. Prerender/SSG için uygun yaklaşım

Bu depo için en uygun yaklaşım, mevcut gömülü JavaScript’i hesaplama/etkileşim katmanı olarak koruyan, ancak build aşamasında route başına HTML kopyası üreten küçük bir **Node tabanlı statik site üretim katmanı** eklemektir. Route/slug haritası, çeviri metadata’sı ve araç sahipliği tek bir merkezi veri modülünde tutulabilir. Build script’i her gerçekten desteklenen dil–araç kombinasyonu için ilgili `dist/{lang}/{slug}/index.html` dosyasını üretmeli; her sayfanın `<head>` bölümüne kendi title, description, canonical, Open Graph, Twitter ve otomatik hreflang setini koymalıdır.

Bu yaklaşımın gerekçesi şudur: mevcut depo paket yöneticisi ve framework içermiyor; dolayısıyla ağır bir framework migrasyonu gereksiz risk yaratır. Saf statik HTML, Vercel’in mevcut dağıtım modeline uyumludur ve tarayıcı içi çalışma vaadini korur. Araç hesaplamaları ayrı depolarda ve ayrı uygulamalarda bulunduğundan, Faz 2’de hub route’larının harici araç route’larıyla nasıl eşleneceği ayrıca tasarlanmalıdır. Eğer hedef, araç uygulamalarının kendi HTML kaynaklarında da dil bazlı metadata ve prerender olması ise aynı üretim yaklaşımı ilgili 16 araç deposuna da uygulanmalıdır; yalnızca hub deposu bunu garanti edemez.

## 7. Araç sınıflandırması ve veri riski

Kaynakta 16 araç bulunuyor. Kullanıcı gereksinimindeki A/B/C sınıflandırmasıyla eşleştirildiğinde A grubunda 11, B grubunda 2, C grubunda 3 araç hedefleniyor. Bu auditte hiçbir vergi oranı, asgari ücret, SGK tavanı veya başka mevzuat parametresi eklenmemiş ya da değiştirilmemiştir.

| Grup | Araç sayısı | SEO/i18n kapsamı için audit notu |
|---|---:|---|
| A — mevzuattan bağımsız | 11 | 12 dilde route ve slug adayı |
| B — piyasa verisine bağlı | 2 | 12 dil mümkün; daha düşük öncelik ve veri güncelliği riski |
| C — mevzuata bağlı | 3 | Dil varyantı üretilmemeli; ülke bazlı kanonik yapı ayrı tasarlanmalı |

## 8. Riskler ve kırılma noktaları

| Risk | Etki | Faz 2 öncesi karar |
|---|---|---|
| Araçlar ayrı GitHub/Vercel depolarında | Hub’da route üretmek, araç HTML’lerinin SEO’sunu otomatik çözmez | Hub ve araç depolarının kapsamı netleştirilmeli |
| Rewrite ile redirect’in karıştırılması | Eski URL’ler 301 olmadan kopya/kanonik sorunları yaratabilir | Vercel redirect kuralları ve geçiş matrisi hazırlanmalı |
| Eski URL biçimleri tutarsız | `/ads/`, `/prompter/`, `www` ve yazım farkları mevcut | Her eski URL için açık 301 hedefi tanımlanmalı |
| Çeviri anahtarlarının varlığı kalite garantisi değil | Hatalı/uygunsuz çeviri SEO kalitesini düşürür | Yalnızca doğrulanmış çeviriler yayınlanmalı |
| `remoteTranslate()` dış servise istek atabilir | Gizlilik vaadi ve deterministik build ile çelişebilir | SEO build’inde dış çeviri kullanılmamalı |
| HTML içine gömülü monolitik script | Route başına güvenli veri enjeksiyonu zorlaşır | Hesaplama mantığına dokunmadan veri/şablon katmanı ayrıştırılmalı |
| Harici uygulamaların doğrudan URL’leri | Host uygulamada canonical/hreflang kontrolü sınırlı olabilir | Her araç deposu için SEO sahipliği belirlenmeli |
| Faz 4 doğrulaması | JS’siz kaynak kontrolü yapılmazsa sorun gözden kaçar | Build sonrası `dist` içindeki Almanca dosya ve `<head>` kanıtı zorunlu tutulmalı |

## 9. Faz 1 doğrulama özeti

| Kontrol | Durum |
|---|---|
| Kod yazmadan önce mevcut yapı okundu | Tamamlandı |
| Framework/router/build gerçek dosyalardan tespit edildi | Tamamlandı |
| i18n mekanizması ve çeviri konumu tespit edildi | Tamamlandı |
| 16 araç ve hub URL’leri listelendi | Tamamlandı |
| Metadata’nın HTML mi JS mi olduğu doğrulandı | Tamamlandı |
| Prerender/SSG yaklaşımı gerekçelendirildi | Tamamlandı |
| 12 dilde anahtar kapsamı ölçüldü | Tamamlandı; varlık bazında 12/12 |
| Hesaplama mantığı değiştirildi | Hayır |
| Vergi/mevzuat sayısı değiştirildi | Hayır |
| Build/lint çalıştırıldı | Hayır; depoda build/lint komutu bulunmuyor ve Faz 1 kod değişikliği içermiyor |

## Faz 1 sonucu

Faz 1 audit raporu tamamlandı. Bu PR’da uygulama kodu, mevcut URL’ler ve hesaplama mantığı değiştirilmemiştir. Kullanıcı onayı olmadan Faz 2’ye geçilmemelidir.

## References

[1]: https://github.com/pratix-source/main-site/blob/main/index.html "Pratix.io main-site index.html"

[2]: https://github.com/pratix-source/main-site/blob/main/vercel.json "Pratix.io Vercel routing configuration"

[3]: https://github.com/pratix-source/main-site/blob/main/sitemap.xml "Pratix.io sitemap"

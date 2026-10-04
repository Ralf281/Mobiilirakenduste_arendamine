# Mobiilirakenduste_arendamine
Ionic 8.8, Capacitor 8.5, TypeScript, Web Components (non-React)

## Paigaldus juhis
Kloonimine ja kõigi sõltuvuste installimine ühe käsuga:

* npm install

npm install loeb package.json ja package-lock.json failid ning installib automaatselt kõik projektis kasutatavad paketid (Ionic, Capacitor, kõnetuvastuse plugin, jne)

## Brauseris käivitamine
* npm run dev

## Build ja Capacitor'i sünkroonimine

Enne natiivsete platvormide käivitamist tuleb projekt build'ida ja Capacitor'iga sünkroonida:
* npm run build
* npx cap sync android
* npx cap run android

Seda tuleb korrata iga kord, kui teed muudatusi src/ kaustas ja tahad neid natiivses äpis näha (v.a. kui kasutad live-reload'i, vt Capacitor'i dokumentatsiooni).

## Käivitamine Android emulaatoris

* npx cap open android

See avab projekti Android Studios. Vali ülevalt AVD (Android Virtual Device) ripploendist ja vajuta Run.

Kui AVD-d pole veel loodud: Android Studio → Device Manager → Create Device → vali seadmemudel ja Android-versioon.

Käivitamine Android pärisseadmes
Telefonis: Settings → About phone → vajuta 7 korda Build number peale, et aktiveerida Developer options
Settings → Developer options → luba USB debugging
Ühenda telefon arvutiga USB kaabliga
npx cap open android → vali oma telefon seadmete nimekirjast → Run

## Käivitamine iOS pärisseadmes (ainult macOS)
Ühenda iPhone Maciga
Xcode's vali projekt → Signing & Capabilities → vali oma Apple Developer konto (Team)
Vali seadmete ripploendist oma telefon
Vajuta Run

Esimesel korral tuleb telefonis kinnitada usaldus arendaja sertifikaadi vastu: Settings → General → VPN & Device Management.

## Mida algmallis muudeti
* Eemaldati Vite vaikimisi genereeritud demo-sisu (counter.ts, style.css, assets/ kaust)
* Lisatud @ionic/core ja ionicons sõltuvused
* Lisatud vite.config.ts konfiguratsioon, mis parandab Ionic'u lazy-loaded komponentide bundlemise Capacitor'i jaoks (ilma selleta äpp töötab brauseris, aga puruneb pärisseadmes)
* main.ts kirjutatakse kogu rakenduse UI otse <ion-app> sisse innerHTML kaudu, ilma eraldi lehekomponentideta
* Lisatud Capacitor natiivsed platvormid (Android, iOS)
* Lisatud kõnetuvastuse nupp ja funktsionaalsus (@capacitor-community/speech-recognition)
* Lisatud märkmete püsiv salvestamine (@capacitor/preferences)

## Teadaolevad piirangud
* Eesti keele tugi kõnetuvastuses on ebakindel — testitud [täienda: mis keel töötas / ei töötanud]
* Kõnetuvastus vajab tavaliselt internetiühendust (Android saadab heli Google'i pilveteenusesse töötlemiseks)
* Emulaatoris/simulaatoris kõnetuvastus üldiselt ei tööta korralikult puuduva või piiratud mikrofoni sisendi tõttu soovitatud testida pärisseadmel

# Tehnoloogia dokumentatsioon
## 1. TypeScripti ülevaade

Projektis kasutatakse peamise programmeerimiskeelena TypeScripti. TypeScript põhineb JavaScriptil ja lisab sellele staatilise tüübisüsteemi. TypeScripti kood teisendatakse JavaScriptiks, mistõttu saab seda kasutada veebitehnoloogiatel põhinevate rakenduste arendamisel.

TypeScript aitab suuremates projektides vähendada tüüpvigu ning muudab koodi arusaadavamaks ja paremini hooldatavaks. Muutujatele, funktsioonide parameetritele ja tagastusväärtustele saab määrata tüübid. Samuti saab TypeScriptis kasutada interface'e objektide struktuuri kirjeldamiseks.

## 2. TypeScripti võrdlus tuttavate programmeerimiskeeltega

TypeScript sarnaneb kõige rohkem JavaScriptiga, kuna TypeScript on JavaScripti laiendus. Mõlemas keeles kasutatakse näiteks muutujaid, funktsioone, tingimuslauseid, tsükleid, klasse ja objekte.

Võrreldes Pythoniga on oluline erinevus tüüpide käsitlemisel. Python on dünaamiliselt tüübitud keel, samas kui TypeScript võimaldab kasutada staatilist tüübisüsteemi. TypeScriptis saab näiteks määrata, et muutuja peab sisaldama ainult teksti või ainult numbrit. See võimaldab osa vigadest avastada juba arendamise ajal, enne rakenduse käivitamist.

Selle projekti puhul sobib TypeScript Pythonist paremini, sest Ionic põhineb veebitehnoloogiatel ning TypeScript on loodud JavaScripti ökosüsteemi jaoks.

## 3. Projekti seisukohalt olulised keerukamad omadused
### 3.1. Staatiline tüübisüsteem

TypeScripti üks olulisemaid omadusi on staatiline tüübisüsteem. Muutujatele, funktsioonide parameetritele ja tagastusväärtustele saab määrata tüübid.

See on mobiilirakenduse puhul kasulik, sest rakenduses liigub erinevate komponentide vahel palju andmeid. Kui andmetüüp on vale, võib TypeScript sellest juba arendamise ajal märku anda. See aitab vähendada olukordi, kus rakendus hakkab alles käivitamisel vigaselt töötama.

### 3.2. Asünkroonne programmeerimine

Teine projekti seisukohalt oluline omadus on asünkroonne programmeerimine. TypeScript toetab JavaScripti Promise'e ning async ja await märksõnu.

Mobiilirakenduses tuleb sageli oodata mõne tegevuse lõpetamist, näiteks andmete laadimist, API päringu vastust või seadme funktsiooniga suhtlemist. async/await võimaldab sellist koodi kirjutada lihtsamalt ja loetavamalt.

Asünkroonne programmeerimine on oluline ka Capacitori puhul, sest mitmed seadmefunktsioonid ja pluginad võivad töötada asünkroonselt. Rakendus saab samal ajal kasutajaliidest edasi kuvada ega pea kogu rakendust ühe tegevuse lõppemiseni peatama.

## 4. Seos mobiilirakenduste arendusega

Ionicu kasutamise peamine eesmärk selles projektis on võimaldada mobiilirakenduse loomist tuttavate veebitehnoloogiate abil. Kasutajaliidese jaoks kasutatakse HTML-i, CSS-i ja TypeScripti ning Ionic pakub nende kõrvale mobiilirakendustele sobivaid valmis komponente.

Ionicuga loodud rakendus töötab veebitehnoloogiate abil, kuid Capacitor võimaldab selle viia Androidi ja iOS-i platvormidele. Capacitor annab rakendusele ligipääsu mobiilseadme natiivsetele võimalustele.

Käesolevas projektis kasutatakse Capacitori kaudu kõnetuvastust ja märkmete püsivat salvestamist.

## 5. Kasutatavad olulised teegid ja raamistikud
### Ionic 8.8

Ionic on mobiilirakenduste arendamise raamistik, mis pakub suure hulga valmis kasutajaliidese komponente. Näiteks saab kasutada komponente nagu ion-button, ion-input, ion-card ja ion-list.

Ionicu oluline eripära on see, et selle komponendid põhinevad Web Components'i tehnoloogial. Seetõttu saab Ionicut kasutada ilma Reactita. Käesolevas projektis kasutataksegi Ionicut non-React lahendusena.

### Capacitor 8.5

Capacitor on Ionicu rakenduste jaoks mõeldud platvormikiht, mille abil saab veebirakenduse ühendada Androidi ja iOS-i natiivsete funktsioonidega.

Capacitori oluline omadus on pluginapõhine ülesehitus. Vajadusel saab projektile lisada plugina, mis annab rakendusele ligipääsu konkreetsele seadmefunktsioonile.

### Web Components

Web Components on veebiplatvormi standarditel põhinev tehnoloogia, mis võimaldab luua korduvkasutatavaid HTML-i komponente. Ionic kasutab oma komponentide loomisel Web Components'i tehnoloogiat.

Selle projekti puhul on oluline, et Ionicu kasutamiseks ei ole vaja Reacti. Komponendid töötavad otse veebitehnoloogiate abil ning seetõttu saab kasutada TypeScripti koos Ionicu komponentidega.

@capacitor-community/speech-recognition

Seda pluginat kasutatakse rakenduses kõnetuvastuse võimaldamiseks.

@capacitor/preferences

Seda Capacitori pluginat kasutatakse märkmete püsivaks salvestamiseks.

## 6. Kasutatud allikad
1. TypeScript Documentation. TypeScript: JavaScript With Syntax for Types. https://www.typescriptlang.org/docs/
2. Ionic Documentation. Ionic Framework Documentation. https://ionicframework.com/docs
3. Capacitor Documentation. Capacitor Documentation. https://capacitorjs.com/docs
4. MDN Web Docs. Web Components. https://developer.mozilla.org/en-US/docs/Web/API/Web_components
5. MDN Web Docs. JavaScript Promises. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

# Programmeerimiskeel: TypeScript (Ionic 8.8 + Capacitor 8.5 + Vite)

> Mustand. Kohad, mis on märgitud **[TÄIDA]**, kirjuta ise oma projekti põhjal.
> Kontrolli versioonid ja sõltuvused oma `package.json`-ist.

## 1. Keele ülevaade

Projekt on kirjutatud **TypeScriptis**. See kompileeritakse JavaScriptiks, mis jookseb mobiilis **WebView's**
(iOS: WKWebView, Android: System WebView). Rakendus **ei kompileeru natiivkoodiks**.

| Kiht | Tehnoloogia | Roll |
|---|---|---|
| Keel | TypeScript (`tsconfig.json`) | Kogu rakenduse loogika |
| UI | Ionic 8.8 (`@ionic/core`, `ionicons`) | Web Components (`<ion-app>`, `<ion-button>` jne) |
| Raamistik | **Puudub** (vanilla TS) | Angularit, Vue't ega Reacti ei kasutata |
| Ehitus | Vite (`vite.config.ts`) | Pakib TS-i, Ionic'u komponendid laaditakse laisalt (lazy-loaded) |
| Sild | Capacitor 8.5 (`capacitor.config.ts`, `android/`, `ios/`) | JS ↔ Swift / Kotlin |
| Pluginad | `@capacitor-community/speech-recognition`, `@capacitor/preferences` | Mikrofon (kõnetuvastus) ja andmete püsisalvestus |

Rakenduse UI kirjutatakse `main.ts`-is otse `<ion-app>` sisse `innerHTML`-iga, ilma lehekomponentideta.

```
TypeScript --(Vite)--> JavaScript --> WebView (JS-mootor + DOM)
                                          |  Capacitor sild (JSON-sõnumid)
                                          v
                             Swift / Kotlin plugin --> iOS / Android API
```

## 2. Võrdlus tuttavate keeltega

**[TÄIDA]** Kirjuta oma varasemad keeled (nt Java, Python, C#) ja 2–3 lauset, millega TypeScript sarnaneb
ja mis oli sulle üllatav.

| Aspekt | Java / C# **[TÄIDA]** | JavaScript | TypeScript |
|---|---|---|---|
| Tüübikontroll | Compile + runtime | Runtime | Ainult compile time (*type erasure*) |
| Tüüpimine | Nominaalne | Dünaamiline | Struktuurne |
| null | `null` igal viitel | `null` ja `undefined` | `string \| null` (`strictNullChecks`) |
| Mälu | GC | GC | GC WebView's, ARC-i ei ole |
| Konkurentsus | Lõimed | Üks lõim, event loop | Event loop + Promise/`async`/`await` |

Sarnasus: `async`/`await`, generics, liidesed ja enum'id on tuttavad. Erinevus: tüübid kaitsevad ainult
kompileerimisel. Kõik, mis tuleb väljastpoolt (plugin, salvestus), on tegelikult JSON.

## 3. Keerukamad omadused

### 3.1 Tüübisüsteem ja puuduvad väärtused (null)

```java
String title = null;                 // Java: kompilaator lubab, NPE tuleb runtime'is
```
```kotlin
val title: String? = null           // Kotlin: kompilaator nõuab kontrolli, jõustatud ka runtime'is
```
```ts
let title: string | null = null;     // TS: kompilaator nõuab kontrolli, runtime'is kaitset pole
```

`strict` režiimis ei lase kompilaator `title.length` kasutada enne `null`-kontrolli. See garantii kehtib
**ainult kompileerimisel**. Kui väärtus tuleb väljastpoolt, on tüüp vaid lubadus:

```ts
const { value } = await Preferences.get({ key: 'user' }); // value: string | null
const user = JSON.parse(value!) as User;                  // `as User` on VALE, kui andmed on vanad
```

Parem on type guard või skeemi valideerimine:

```ts
function isUser(x: unknown): x is User {
  return typeof x === 'object' && x !== null && typeof (x as any).id === 'string';
}
```

Mobiilis on see oluline, sest salvestatud andmed elavad üle versiooniuuenduste ja load võivad puududa.

**[TÄIDA]** Kus meie projektis seda kasutame (fail ja funktsioon)?

### 3.2 Asünkroonsus: event loop ja Capacitor silla Promise'id

Iga natiivne kutse on `Promise`, sest sõnum läheb üle silla ja vastus tuleb hiljem:

```ts
try {
  await SpeechRecognition.requestPermissions();
  await SpeechRecognition.start({ language: 'et-EE', partialResults: true });
} catch (e) {
  // load puuduvad, mikrofon hõivatud
}
```

- JavaScript on **ühelõimeline**: raske sünkroonne tsükkel külmutab UI.
- `await` ei blokeeri lõime, see annab juhtimise event loop'ile tagasi.
- Natiivne töö jookseb natiivlõimedes, JS saab ainult vastuse.
- Rakendus võib minna taustale, enne kui Promise lõpeb. Kasuta `App.addListener('appStateChange', ...)`.

Plugin: `@capacitor-community/speech-recognition`. **[TÄIDA]** Kontrolli meetodid ja keel oma koodist.

### 3.3 Mälu ja elutsükkel (GC, mitte ARC)

- Mälu haldab WebView JS-mootor (GC). Deterministlikku vabastamist (ARC) ei ole.
- Suurim oht on lekked: unustatud listener'id, `setInterval`, tellimused.

```ts
const handle = await SpeechRecognition.addListener('partialResults', onText);
// ekraanilt lahkudes:
await handle.remove();
```

- **Meie projekti eripära:** `main.ts` asendab UI `innerHTML`-iga. Vanad elemendid kaovad ja uutel
  elementidel ei ole listener'eid, seega tuleb need uuesti siduda.
- Veebikomponentide elutsükkel: `connectedCallback`, `disconnectedCallback`, `attributeChangedCallback`.
- OS võib WebView protsessi mälu nappuse tõttu **tappa**, seega olek tuleb salvestada (Preferences).

### 3.4 Web Components

Ionic komponendid on standardsed custom element'id.

- **Shadow DOM:** stiil CSS-muutujate (`--background`, `--color`) ja `::part()`-iga.
- **Atribuut vs property:** atribuut on string, property võib olla objekt või boolean.
- **Sündmused** on `CustomEvent`'id (`ionChange`), andmed on `event.detail` sees:
  `(e: CustomEvent<{ value: string }>) => e.detail.value`.
- Komponendid on raamistikuvabad, seepärast sobib Ionic ka vanilla TS-iga.

### 3.5 Tee mobiiliplatvormi API-ni (Capacitor)

1. Kood kutsub `SpeechRecognition.start()` (JS Proxy).
2. Capacitor serialiseerib kutse JSON-iks ja saadab natiivi.
3. Natiivne plugin (Swift `CAPPlugin` / Kotlin `@CapacitorPlugin`, meetod `@PluginMethod`) teeb töö.
4. Tulemus tagasi `call.resolve(...)` / `call.reject(...)`, mis lahendab JS-i Promise'i.

```ts
import { registerPlugin } from '@capacitor/core';
export interface EchoPlugin { echo(o: { value: string }): Promise<{ value: string }>; }
const Echo = registerPlugin<EchoPlugin>('Echo');
```

TS-i tüübid on ainus "leping" JS-i ja natiivi vahel, natiivne pool seda ei kontrolli.

## 4. Seos mobiiliarendusega: miks käitume teisiti?

- Tüübid ei kaitse piiril, seepärast valideerime plugina ja salvestatud andmed.
- Seadmeligipääs on asünkroonne ja võib ebaõnnestuda, seepärast `try/catch` ja lubade küsimine.
- OS juhib elutsüklit, seepärast koristame listener'id ja salvestame oleku.
- Jõudlus on WebView piires, seepärast ei blokeeri JS-lõime.

## 5. Kasutatavad teegid ja raamistikud

| Teek | Milleks | Eripära |
|---|---|---|
| `@ionic/core` | UI komponendid | Web Components, shadow DOM, iOS/Material stiilid |
| `ionicons` | Ionic'u ikoonid | SVG-põhised ikoonid, kasutatakse `<ion-icon>` elemendina |
| `@capacitor/core` | Sild, `registerPlugin` | Promise-põhine |
| `@capacitor-community/speech-recognition` | Kõnetuvastus | Vajab mikrofoniluba, tulemused tulevad listener'iga (`partialResults`), natiivne Swift/Kotlin pool |
| `@capacitor/preferences` | Püsiv salvestus (võti-väärtus) | Väärtused on stringid ja asünkroonsed (`value: string \| null`), seega JSON-i valideerimine on vajalik |
| Vite | Ehitus | Lazy-loaded Ionic komponendid |

## 6. Allikad

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/
- `strictNullChecks`: https://www.typescriptlang.org/tsconfig#strict
- Ionic Framework: https://ionicframework.com/docs
- Capacitor: https://capacitorjs.com/docs
- MDN Web Components: https://developer.mozilla.org/en-US/docs/Web/API/Web_components
- MDN Event loop: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop
- **[TÄIDA]** lisa plugina dokumentatsioon ja kuupäevad, millal lehti vaatasid
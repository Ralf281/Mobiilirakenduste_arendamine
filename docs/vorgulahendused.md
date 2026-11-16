# Speech Notes – võrgulahenduste dokumentatsioon

Kodutöö: **Võrgulahenduste koostamine**. Mobiilirakendus ühendatakse välise serveriga, et saaks saata ja vastu võtta andmeid (tekst, vajadusel pildid) REST HTTP protokolli abil.

## 1. Rakenduse lühitutvustus

Speech Notes on hääle põhjal märkmeid tegev mobiilirakendus (eesti keel, `et-EE`).

- **Tehnoloogiad:** Ionic Core (Web Components), TypeScript, Vite, Capacitor
- **Pluginad:** `@capacitor-community/speech-recognition`, `@capacitor/preferences`, `@capacitor/filesystem`
- **Olemasolevad funktsioonid:** märkmete rääkimine/salvestamine, kaustad, otsing, seaded, eksport/import failina, augmenteeritud reaalsus (A-Frame / WebXR)

Võrgufunktsioonid, mis kodutöö jaoks lisati:

| Nupp | HTTP meetod | Eesmärk |
|---|---|---|
| **Tõlgi** | `GET` | Tõlgib eestikeelse märkme inglise keelde |
| **Varunda Serverisse** | `POST` | Saadab ühe märkme serverisse |

Mõlemad nupud asuvad märkme detailvaates (`#detail-view`).

## 2. Kasutatud API-d

| Funktsioon | Allikas | Protokoll |
|---|---|---|
| Tõlge | [MyMemory Translation API](https://mymemory.translated.net/doc/spec.php) – `https://api.mymemory.translated.net/get` | REST, HTTP GET, JSON |
| Varundus | [reqres.in](https://reqres.in) – `POST /api/users` | REST, HTTP POST, JSON |

Kodutöö nõue lubab saatmist "fakida" ainult serveri poolt – reqres.in vastab POST-päringule eduka vastusega (`id`, `createdAt`), kuid andmeid päriselt ei salvesta. See on lubatud.

## 3. GET – märkme tõlkimine

### Voog

1. Kasutaja avab märkme (kaardil klikk → `openDetail`).
2. Vajutab **Tõlgi**.
3. Nupp muutub laadimisindikaatoriks (`ion-spinner`) ja on ajutiselt keelatud.
4. Rakendus saadab GET-päringu.
5. Vastusest võetakse `responseData.translatedText` ja see kuvatakse plokis "Inglise keeles".
6. Vea korral näidatakse punast toast-teadet "Tõlkimine ebaõnnestus".

### Päring

```
GET https://api.mymemory.translated.net/get?q=<tekst>&langpair=et|en
```

### Kood (`src/main.ts`)

```ts
async function translateNote(text: string): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 450))}&langpair=et|en`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Server vastas: ${res.status}`);

  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails);

  return data.responseData.translatedText;
}
```

### Näidisvastus (lühendatud)

```json
{
  "responseData": { "translatedText": "Buy milk and bread tomorrow." },
  "responseStatus": 200
}
```

### Veatöötlus

- `!res.ok` – võrgu-/serveriviga (HTTP staatus)
- `responseStatus !== 200` – API enda viga (nt päevalimiit ületatud), sõnum tuleb väljalt `responseDetails`
- `try/catch/finally` – `finally` taastab nupu alati algseisu, et see ei jääks laadima
- `showToast(..., 'danger')` annab kasutajale tagasisidet

## 4. POST – märkme varundamine serverisse

### Voog

1. Kasutaja avab märkme ja vajutab **Varunda Serverisse**.
2. Rakendus saadab märkme JSON-kujul POST-päringuga.
3. Server vastab loodud kirje `id` ja `createdAt` väärtustega.
4. Kasutajale näidatakse toast "Märge varundatud".

### Päring

```
POST https://reqres.in/api/users
Content-Type: application/json

{ "name": "<kasutajanimi>", "job": "<märkme tekst>" }
```

> **NB:** reqres.in võib nõuda päisena `x-api-key` (võtme saab lehelt reqres.in). Kui see puudub, tuleb vastuseks 401/403.

### Kood (lisamisel `src/main.ts` faili)

```ts
async function backupNote(n: Note): Promise<{ id: string; createdAt: string }> {
  const res = await fetch('https://reqres.in/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // 'x-api-key': '<sinu-võti>',
    },
    body: JSON.stringify({
      name: settings.userName || 'Nimetu',
      job: n.text,
    }),
  });
  if (!res.ok) throw new Error(`Server vastas: ${res.status}`);
  return res.json();
}

const backupBtn = document.getElementById('detail-backup')!;
backupBtn.addEventListener('click', async () => {
  if (!openNote) return;
  setLoading(backupBtn, true, 'Varunda Serverisse');
  try {
    const r = await backupNote(openNote);
    showToast(`Märge varundatud (id ${r.id})`);
  } catch (err) {
    console.error('Varundamine ebaõnnestus', err);
    showToast('Varundamine ebaõnnestus', 'danger');
  } finally {
    setLoading(backupBtn, false, 'Varunda Serverisse');
  }
});
```

## 5. Pildid

Kodutöö nõuab tekstide **ja piltide** kuvamist. Lahendus: reqres.in `GET /api/users` tagastab kasutajaid väljaga `avatar` (pildi URL), mida saab kuvada `<img>` või `ion-avatar` elemendis (nt päises olev `header-avatar`).

## 6. Mis oli lihtne

- **`fetch` + `async/await`** töötab WebView's ilma lisapluginata, GET-päring oli paar rida.
- **Valmis `setLoading` ja `showToast` abifunktsioonid** – laadimisseisu ja veateadete kuvamine ei vajanud uut UI-d.
- **MyMemory ei vaja API võtit** ega registreerimist.
- **JSON-i parsimine** – vastus on valmis objekt, `res.json()` piisas.

## 7. Mis oli raske

- **Tõlke pikkuspiirang:** MyMemory lubab päringus umbes 500 baiti, seega tekst lõigatakse `slice(0, 450)` abil. Pikemad märkmed tõlgitakse vaid osaliselt. Parem lahendus oleks tekst lauseteks jagada ja tõlkida tükkhaaval.
- **Päevalimiit:** anonüümsel kasutajal on tasuta päringute limiit; ületamisel tuleb viga `responseStatus` kaudu, mitte HTTP staatusega – seega tuli kontrollida mõlemat.
- **Tõlke kvaliteet:** masintõlge eesti keelest ei ole alati täpne (kõnetuvastuse vead kanduvad tõlkesse edasi).
- **Võrgu olemasolu pärisseadmel:** emulaatoris/brauseris töötas, aga pärisseadmel tuli kontrollida, et telefonil on internet ja päring ei blokeeru.
- **CORS ja HTTPS:** Capacitori WebView nõuab turvalisi (HTTPS) aadresse ning serveri vastus peab lubama päringu.
- **Eesti tähed URL-is:** `õ, ä, ö, ü` vajavad `encodeURIComponent`-i, muidu päring katki.
- **POST-i "fake":** reqres.in ei salvesta andmeid, seega varundust ei saa hiljem tagasi lugeda – kontrollida saab vaid vastuse `id` järgi.

## 8. Testimine pärisseadmel

| # | Test | Oodatud tulemus | Tulemus |
|---|---|---|---|
| 1 | Ava märge → **Tõlgi** | Kuvatakse inglise tõlge | ☐ |
| 2 | **Tõlgi** ilma internetita (lennurežiim) | Toast "Tõlkimine ebaõnnestus", nupp taastub | ☐ |
| 3 | **Tõlgi** väga pika märkmega (>450 märki) | Tõlgitakse esimesed 450 märki | ☐ |
| 4 | **Varunda Serverisse** | Toast eduteatega ja `id`-ga | ☐ |
| 5 | **Varunda** ilma internetita | Toast veateatega | ☐ |
| 6 | Märge eesti tähtedega (õäöü) | Tõlge ja varundus toimivad korrektselt | ☐ |

*Seade / Androidi versioon:* ______

## 9. Käivitamine

```bash
npm install
npm run dev            # brauseris testimine
npm run build
npx cap sync android
npx cap run android    # pärisseadmel
```

## 10. Esitamine

- Dokumentatsioon: see fail GitHubis (`README.md` / `DOKUMENTATSIOON.md`) või GitHub Wiki
- Esitluse pikkus: 8–11 minutit
- Videoklipp: valikuline
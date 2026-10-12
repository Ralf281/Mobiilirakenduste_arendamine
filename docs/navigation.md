# Äpisisene navigeerimine

## Ülevaade

Rakenduse kasutajaliides on kirjeldatud failis [`speech-notes/index.html`](../speech-notes/index.html#L12-L129) ja navigeerimise käitumine failis [`speech-notes/src/main.ts`](../speech-notes/src/main.ts#L70-L82). Rakendus ei kasuta eraldi marsruuterit ega lehekomponente. Vaateid näidatakse ja peidetakse sama lehe sees CSS-klassi `ion-hide` abil.

Rakenduses on kolm sisemist vaadet:

- `notes` – märkmete vaade;
- `folders` – kaustade vaade;
- `detail` – ühe märkme detailvaade.

Funktsioon `showView` juhib vaadete nähtavust. Detailvaates peidetakse segmendijuht, märkmete vaates kuvatakse salvestamise nupp ja kaustade vaates kuvatakse selle asemel nupp „Lisa kaust“ ([`main.ts`](../speech-notes/src/main.ts#L70-L78)).

## Kasutatavad navigeerimismudelid

### Tab-menüü

Rakenduse põhivaadete vahel liigutakse päises oleva Ionicu `ion-segment`-i abil. Segmendil on kaks valikut: „Kõik märkused“ ja „Kaustad“ ([`index.html`](../speech-notes/index.html#L28-L37)). See lahendus sobib eraldi põhivaadete vahel kiireks liikumiseks.

Segmendi `ionChange` sündmus kuvab vastavalt valitud väärtusele märkmete või kaustade vaate ([`main.ts`](../speech-notes/src/main.ts#L80-L82)).

### Detailvaade

Märkme detailvaade ei ole eraldi marsruut ega navigeerimispinu osa. See on olemasoleval lehel paiknev HTML-i ala, mida näidatakse ja peidetakse. Koodis ei ole detailvaate jaoks `ion-modal`-elementi.

### Ajutised dialoogid

Kaustade lisamisel, muutmisel ja kustutamisel kasutatakse Ionicu `alertController`-i dialooge. Need on ajutised dialoogid, millel on sulgemis- või tühistamisvõimalus. Need ei moodusta põhivaadete vahelist hierarhilist navigeerimisteed ([`main.ts`](../speech-notes/src/main.ts#L169-L235)).

### Rakenduses puuduvad mudelid

Projektis ei ole tuvastatud:

- navigeerimispinu, kuhu vaateid lisatakse ja kust eemaldatakse;
- drawer-tüüpi külgmenüüd ega hamburger-nuppu;
- URL-marsruute ega sügavlinkide töötlemist.

## Navigeerimisvood

### Märkmete ja kaustade vahel liikumine

1. Rakenduse algolekus on segmendi väärtus `notes`, mistõttu kuvatakse märkmete vaade ([`index.html`](../speech-notes/index.html#L28-L32)).
2. Kasutaja valib „Kaustad“.
3. `ionChange` sündmus kutsub `showView('folders')` ja kaustade vaade tehakse nähtavaks.
4. Kasutaja valib „Kõik märkused“.
5. `ionChange` sündmus kutsub `showView('notes')` ja märkmete vaade tehakse nähtavaks.

„Kõik märkused“ valimisel eemaldatakse ka aktiivne kaustafilter, kutsudes `setFilter(null)` ([`main.ts`](../speech-notes/src/main.ts#L84-L87)).

### Kaustast märkmete vaatesse

Kaustade vaates kuvatakse iga kaust kaardina. Kaardi klõps käivitab `openFolder` funktsiooni ([`main.ts`](../speech-notes/src/main.ts#L237-L246)). Funktsioon:

1. seab valitud kausta aktiivseks filtriks;
2. muudab segmendi väärtuseks `notes`;
3. kuvab märkmete vaate;
4. täidab märkme redaktori kaustavaliku selle kaustaga, kui parajasti ei muudeta märkust ([`main.ts`](../speech-notes/src/main.ts#L158-L163)).

Aktiivset filtrit näidatakse märkmete loendi kohal kiibina. Kiibi klõps eemaldab filtri ([`main.ts`](../speech-notes/src/main.ts#L150-L156), [`main.ts`](../speech-notes/src/main.ts#L165-L167)). Filtreerimine muudab nähtavaid märkmeid, kuid ei loo uut lehte ega navigeerimispinu ([`main.ts`](../speech-notes/src/main.ts#L322-L333)).

### Märkme detailvaate avamine

Märkmete loendis oleva kaardi klõps käivitab `openDetail` funktsiooni ([`main.ts`](../speech-notes/src/main.ts#L335-L339)). Funktsioon:

1. salvestab valitud märkme muutujasse `openNote`;
2. täidab detailvaate pealkirja, loomise aja, kausta, sõnade arvu ja teksti;
3. kutsub `showView('detail')` ([`main.ts`](../speech-notes/src/main.ts#L300-L310)).

Detailvaates oleva nupu „Kõik märkused“ klõps kuvab taas märkmete vaate. Nupud „Muuda“ ja „Kustuta“ viivad samuti esmalt märkmete vaatesse ning käivitavad seejärel vastava tegevuse ([`index.html`](../speech-notes/index.html#L84-L109), [`main.ts`](../speech-notes/src/main.ts#L312-L319)).

## Kokkuvõte

- Põhivaadete vahel liigutakse `ion-segment`-i abil.
- Vaatevahetust juhib `showView`, mis lülitab olemasolevate vaatealade nähtavust.
- Kaustakaart avab filtreeritud märkmete vaate.
- Märkmekaart avab detailvaate.
- Detailvaatest saab naasta märkmete vaatesse ning alustada märkme muutmist või kustutamist.
- Kaustade lisamiseks, muutmiseks ja kustutamiseks kasutatakse ajutisi dialooge.
- Projektis ei ole navigeerimispinu, drawer-menüüd ega URL-põhist marsruutimist.

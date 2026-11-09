# Andmete hoidmine ja ligipääs mobiiliseadmes
## 1. Eesmärk
Selle töö eesmärk oli täiendada Speech Notes mobiilirakendust nii, et kasutaja andmed ja personaalsed eelistused säiliksid ka pärast rakenduse sulgemist. Lisaks rakenduse sees säilivatele andmetele on võimalik märkmed eksportida telefoni failidena ning hiljem failist uuesti rakendusse importida.

Rakendus on loodud TypeScripti ja Ionicu abil. Mobiilseadme funktsioonidele ligipääsuks kasutatakse Capacitori pluginaid.
## 2. Personaalsete sätete salvestamine
Rakenduses on eraldi Personaalsed sätted vaade. Kasutaja saab seal määrata:
- kasutajanime, mida kasutatakse rakenduse pealkirjas;
- vaikimisi kausta, kuhu uus märge lisatakse;
- märkmete teksti suuruse (12–22 pikslit);
- kas mustand tühjendatakse pärast märkme salvestamist.
Sätete salvestamiseks kasutatakse @capacitor/preferences pluginat. Sätted koondatakse Settings objektiks ja teisendatakse JSON-stringiks. Seejärel salvestatakse need võtme settings alla käsuga Preferences.set().

Rakenduse käivitamisel loetakse sätted Preferences.get() abil tagasi. JSON-string teisendatakse objektiks ning funktsioon applySettings() rakendab need kasutajaliidesele. Näiteks muudetakse kasutaja nime põhjal rakenduse pealkirja ja määratakse märkmete teksti suurus.

Kui salvestatud andmete lugemisel tekib JSON-i viga, kasutatakse rakenduse vaikesätteid. Nii ei takista vigane salvestatud väärtus rakenduse tavapärast käivitamist.
## 3. Märkmete ja kaustade lokaalne salvestamine
Lisaks seadetele salvestab rakendus lokaalselt ka kasutaja märkmed ja kaustad. Nende jaoks kasutatakse eraldi võtmeid:
- notes – märkmete loend;
- folders – kaustade loend;
- settings – personaalsed sätted.
Märkmed salvestatakse save() funktsioonis ning kaustad vastavas salvestusfunktsioonis. Andmed teisendatakse JSON-kujule ja kirjutatakse Preferences'i abil seadme lokaalsesse salvestusruumi.

Rakenduse käivitamisel loeb load() funktsioon märkmed ja kaustad tagasi. Andmed kuvatakse seejärel rakenduse märkmete ja kaustade vaadetes. Seetõttu ei kao rakenduse sees loodud märkmed ega kaustad lihtsalt rakenduse sulgemisel.
## 4. Märkmete salvestamine failina telefoni
Rakenduse seadete vaates on kaks nuppu: Ekspordi märkmed failina ja Impordi viimane eksport.

Failide kirjutamiseks ja lugemiseks kasutatakse @capacitor/filesystem pluginat. Telefonis salvestatakse failid kataloogi Documents/SpeechNotes.

Eksportimisel luuakse kaks faili:
1. markmed.json – sisaldab märkmeid ja kaustu JSON-vormingus. Seda faili kasutatakse andmete hilisemaks taastamiseks.
2. markmed.txt – sisaldab märkmeid inimesele loetavas tekstivormingus. Iga märkme juures kuvatakse kuupäev, kausta nimi ja teksti sisu.
JSON-faili kasutatakse seetõttu, et selle struktuuri saab hiljem programmis uuesti objektideks teisendada. TXT-faili on mugav avada ja lugeda ka ilma rakenduseta.

Kui rakendust kasutatakse tavalises veebibrauseris, laaditakse failid alla brauseri allalaadimisfunktsiooni kaudu. Telefonis kasutatakse Capacitori failisüsteemi.
## 5. Andmete importimine
Nupp Impordi viimane eksport loeb telefoni kataloogist Documents/SpeechNotes faili markmed.json.

Seejärel parsitakse faili sisu JSON-ina. Enne andmete kasutamist kontrollitakse, kas fail sisaldab oodatud kujul märkmete ja kaustade loendeid. Kui kontroll õnnestub, asendatakse rakenduse praegused märkmed ja kaustad failis olevatega ning salvestatakse need uuesti Preferences'i.

Importimise järel värskendatakse märkmete ja kaustade vaated. Kui faili ei leita või selle vorming ei sobi, kuvatakse kasutajale veateade.

Importimine on praeguses lahenduses lubatud ainult natiivses mobiilirakenduses. Brauseris kuvatakse vastav teade.
## 6. Rakenduse sulgemine ja uuesti avamine
Andmete säilimist toetavad kaks erinevat lahendust:
- Preferences hoiab rakenduse tööks vajalikke märkmeid, kaustu ja seadeid lokaalselt alles. Käivitamisel loetakse need uuesti sisse.
- Failisüsteemi eksport loob eraldi varukoopiafailid, mida saab hiljem importida.
Kontrollimiseks saab muuta seadeid, lisada märkme, rakenduse sulgeda ja uuesti avada. Seejärel tuleb kontrollida, kas kasutaja nimi, valitud eelistused, märkmed ja kaustad on alles. Eraldi saab proovida eksportida märkmed ning seejärel need importida.

## 7. Kasutatud tehnoloogiad
- TypeScript – rakenduse loogika ja andmete töötlemine.
- Ionic – mobiilirakenduse kasutajaliidese komponendid.
- Capacitor – veebirakenduse ühendamine Androidi ja iOS-i natiivsete võimalustega.
- @capacitor/preferences – sätete, märkmete ja kaustade lokaalne salvestamine.
- @capacitor/filesystem – JSON- ja TXT-failide kirjutamine ning lugemine telefoni mälust.

## 8. Mis osutus lihtsaks ja mis keeruliseks?
Lihtsam osa oli sätete ja märkmete salvestamine Preferences'i abil. Andmete salvestamiseks ja lugemiseks on olemas valmis funktsioonid ning rakenduses saab kasutada eraldi võtmeid erinevate andmete jaoks.

Keerulisem osa oli failide eksportimise ja importimise korraldamine. tuli arvestada, et mobiilirakenduses ja veebibrauseris toimub failide salvestamine erinevalt. Samuti tuli tagada, et imporditava JSON-faili struktuur oleks õige ning vigase faili korral ei prooviks rakendus sobimatuid andmeid kasutada.

Teine oluline tähelepanek oli eristada rakenduse sisemist salvestust ja failina eksportimist. Preferences'i salvestatud andmed on rakenduse enda kasutuseks, TXT- ja JSON-failid aga võimaldavad märkmeid eraldi failidena säilitada.

## 9. Kasutatud allikad
1. Capacitor – Preferences Plugin API. Kasutatakse võtme-väärtuse kujul andmete lokaalseks salvestamiseks ja lugemiseks (Preferences.set() ja Preferences.get()).
   https://capacitorjs.com/docs/apis/preferences
2. Capacitor – Filesystem Plugin API. Failide loomise, kirjutamise, lugemise ja seadme failisüsteemis kasutamise dokumentatsioon.
   https://capacitorjs.com/docs/apis/filesystem
3. Ionic Framework – Documentation. Ionicu kasutajaliidese komponentide ja rakenduse ülesehituse dokumentatsioon.
   https://ionicframework.com/docs
4. Capacitor – Documentation. Capacitori üldine dokumentatsioon, mis selgitab veebitehnoloogiatel põhineva rakenduse ühendamist Androidi ja iOS-i natiivsete võimalustega.
   https://capacitorjs.com/docs
5. TypeScript – The TypeScript Handbook. TypeScripti keele ja tüüpide kasutamise juhend.
   https://www.typescriptlang.org/docs/handbook/intro.html

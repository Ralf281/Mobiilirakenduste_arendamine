## Mikrofoni kasutamine

Rakenduses on mikrofoni testimise funktsioon. Selle eesmärk on saada ligipääs seadme mikrofonile ja kuvada kasutajale, kas mikrofon töötab ning kui tugev on sisenev helisignaal.

Mikrofoni kasutamisel tuleb arvestada Androidi õigustega. Rakendus peab küsima salvestusõigust ning kasutaja peab selle lubama.

Mikrofoni testimise ajal tuleb helisisend pärast kasutamist peatada ja vabastada, et mikrofon ei jääks tarbetult tööle.

Lisaks toetab Speech Notes kõnetuvastust, mille abil saab kõne muuta tekstiks ja kasutada seda märkmete koostamisel.

## Kaamera kasutamine

Rakenduses on kaamera testimise funktsioon. Kaamerale ligipääsemiseks kasutatakse seadme videovoogu.

Kaamera käivitamisel küsib rakendus vajalikku luba ning proovib avada kaamerapildi. Võimaluse korral kasutatakse seadme tagakaamerat.

Kaameravoogu saab kasutada pildi eelvaate kuvamiseks rakenduse eraldi vaates. Kui kasutaja lahkub sellest vaatest või lõpetab kaamera kasutamise, peatatakse videovoog ja vabastatakse kaamera.

## Testimine

Mikrofoni ja kaamera funktsioone testisin Android emulaatoris, füüsilises seadmeid ja ka veebibrauseris.

Testimise käigus kontrollisin:

* mikrofoni käivitamist ja peatamist;

* helitaseme näidu muutumist rääkimise ajal;

* kaamerapildi kuvamist;

* kaamera korrektset peatamist;

Kõik testimise tulemused olid positiivsed.

## Mis oli lihtne?

Lihtsam oli kasutajaliidese loomine ja seadme funktsioonide olekute kuvamine. Ionicu komponendid võimaldasid luua eraldi vaateid ja näidata kasutajale arusaadavaid teateid.

Kaamerapildi kuvamiseks sai kasutada olemasolevat veebitehnoloogiate API-t. Mikrofoni puhul oli kasulik kasutada Capacitori pluginat, mis võimaldas lugeda helisignaali amplituudi.

## Mis oli raske?

Kõige keerulisem oli saada mikrofoni ja kaamera tööle Androidi keskkonnas. Veebibrauseris töötav API ei pruugi Androidi WebView keskkonnas alati samamoodi toimida.

Probleemide lahendamisel tuli kontrollida rakenduse õigusi, kasutatavaid API-sid ja Capacitori plugina toimimist.

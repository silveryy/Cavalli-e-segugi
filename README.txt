CAVALLI E SEGUGI 3.0

Novità:
- Stemmi stilizzati delle squadre accanto ai nomi.
- Nuove card partita casa/trasferta.
- Sfondo più moderno in stile stadio/campo.
- Feedback visivi più chiari.
- Autogol mostrati come 🔴⚽.

Gli stemmi sono badge stilizzati CSS, non loghi ufficiali.

Apri con: python -m http.server 8000
Poi vai su http://localhost:8000


Aggiornamento 3.0.1:
- Migliorata la normalizzazione dei nomi.
- Ora Bàez, Báez e Baez vengono considerati equivalenti.
- Aggiunto mapping esplicito per molte vocali accentate, ç e ñ.


Aggiornamento 3.1:
- Aggiunti 20 loghi ufficiali inviati dall'utente.
- Se una squadra non ha ancora il logo, il gioco usa temporaneamente il badge stilizzato.


Aggiornamento 3.2:
- Aggiunti gli ultimi 5 loghi: Udinese, Venezia, Hellas Verona, Milan, Bologna.
- Totale loghi ufficiali inseriti: 25.
- Squadre senza logo: nessuna.


Aggiornamento 3.2.1:
- Corretto il problema dei loghi non visibili.
- I 25 loghi sono ora incorporati direttamente in teams.json come data URI.
- Il gioco non dipende più dai percorsi relativi della cartella logos/ per visualizzarli.
- Loghi incorporati: 25.


Aggiornamento 3.5:
- Corretto il parser marcatori 2023/24.
- Il gol viene preso solo dagli eventi con cambio risultato.
- Corretti i minuti tipo 21' e 90+5', che prima facevano saltare alcuni marcatori.
- Corretto Sassuolo-Juventus 4-2 e Juventus-Lecce 1-0.


Aggiornamento 3.6:
- Verificato che nella stagione 2023/24 ogni partita abbia tanti marcatori quanti sono i gol del risultato.
- Verificati esempi con marcatori in trasferta: Frosinone-Napoli, Sassuolo-Juventus.
- Cambiata la chiave di salvataggio della partita: il browser non può più caricare una vecchia partita buggata dal localStorage.
- Se avevi una partita salvata con una versione precedente, va iniziata una nuova partita.


Aggiornamento 3.7:
- Aggiunta equivalenza Ç/ç = c.
- Aggiunta equivalenza Ğ/ğ = g.
- Esempio: Calhanoglu viene accettato per Çalhanoğlu.
- Nota: Chalanoglu con h dopo la c non è la stessa stringa di Calhanoglu; se vuoi posso aggiungere anche alias manuali per errori comuni.

Aggiornamento 3.8:
- Aggiunta transizione animata a ogni tentativo sui marcatori.
- Corretto singolo/autogol: tiro, rete gonfiata e scritta GOOOOLLL!!.
- Doppietta: DOPPIETTA!!!!.
- Tripletta o più: HAT-TRICK!.
- Sbagliato: tiro/parata e NOOOO, CHE ERRORE!.
- Aggiornato il logo testuale con due cavalli e un pallone.


Aggiornamento 4.0:
- Animazioni semplificate.
- Se il marcatore è corretto: solo pallone che entra e gonfia la rete.
- Se è sbagliato: portiere che blocca il pallone.
- Gol singolo/autogol: "E C'È IL GRAN GOL!".
- Doppietta: "DOPPIETTA!!!!".
- Tripletta: "HAT-TRICK!".
- Logo Cavalli e Segugi migliorato con cavallo bianco, cavallo dorato e pallone.


Aggiornamento 4.1:
- Rimossa completamente l'animazione quando il marcatore è sbagliato.
- In caso di errore ora compare solo il feedback rosso: "NOOOO, CHE ERRORE!".
- Le animazioni restano solo come premio quando il marcatore è corretto.


Aggiornamento 4.3:
- Inserita nel gioco l'immagine logo inviata dall'utente.
- Il titolo testuale nella schermata iniziale è stato sostituito con assets/logo_cavalli_e_segugi.jpeg.

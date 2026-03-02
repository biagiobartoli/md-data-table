# Assistente immobiliare: progetto di app per affitto/vendita

## Obiettivo
Creare un assistente che raccolga annunci immobiliari da più fonti, li normalizzi, li deduplichi e invii ogni giorno solo le novità importanti:
- nuovi annunci coerenti con i criteri utente;
- ribassi di prezzo;
- annunci rientrati online;
- variazioni rilevanti (metratura, numero locali, disponibilità).

## Funzionalità principali (MVP)
1. **Profilo di ricerca intelligente**
   - Input strutturato: città/zone, budget, mq, locali, tipologia immobile, stato, ascensore, balcone, box, classe energetica.
   - Input testuale: "cerco bilocale luminoso vicino metro M2 sotto 1.200€".
   - Parsing NLP del testo e conversione in filtri.

2. **Raccolta multi-fonte**
   - Connettori per portali principali (dove consentito da ToS/API).
   - Fonti pubbliche/istituzionali (siti agenzie comunali, aste, annunci ufficiali).
   - Import feed RSS/API e monitoraggio pagine dove possibile.

3. **Normalizzazione e deduplica**
   - Standardizzazione campi (prezzo, indirizzo, metratura, coordinate, caratteristiche).
   - Deduplica con regole + similarità (titolo, foto hash, posizione, prezzo).

4. **Alert giornaliero**
   - Email/Telegram/WhatsApp (in base al canale disponibile).
   - Report "novità ultime 24h" + sezione "prezzi ribassati".
   - Link diretto annuncio + motivazione del match.

5. **Scoring personalizzato**
   - Ogni annuncio riceve un punteggio in base alle preferenze.
   - Spiegazione trasparente: "+20 vicino metro, -10 oltre budget".

## Architettura consigliata
- **Frontend**: React/Next.js (web app) + dashboard preferenze.
- **Backend API**: Node.js (NestJS) o Python (FastAPI).
- **Data ingestion**: job schedulati (cron/queue) con workers separati.
- **Database**:
  - PostgreSQL + PostGIS per query geografiche;
  - Redis per cache/code;
  - Object storage per snapshot/metadati immagini.
- **Orchestrazione job**: BullMQ / Celery.
- **Notifiche**: provider email + bot Telegram.
- **Osservabilità**: logging centralizzato + metriche (Prometheus/Grafana).

## Flusso dati
1. L'utente crea una ricerca con filtri + testo libero.
2. Un parser NLP estrae preferenze implicite (es. "zona tranquilla", "vicino metro").
3. I connettori interrogano le fonti con frequenza definita.
4. Gli annunci vengono normalizzati e deduplicati.
5. Il motore di matching calcola score e differenze rispetto ai giorni precedenti.
6. Viene inviato un digest giornaliero con i soli eventi rilevanti.

## Modello dati minimo
- `users`
- `search_profiles`
- `sources`
- `listings_raw`
- `listings_canonical`
- `listing_events` (new, price_drop, updated, relisted)
- `notifications`

## Aspetti legali e compliance (fondamentali)
- Verificare **Termini d'uso** di ogni portale prima del crawling.
- Preferire API ufficiali/licenze dati quando disponibili.
- Rispettare robots.txt dove applicabile.
- Gestire GDPR (consenso notifiche, diritto cancellazione, minimizzazione dati).

## Roadmap pratica (90 giorni)

### Fase 1 (settimane 1-3)
- Definizione fonti consentite e strategia integrazione.
- Prototipo parser testo -> filtri.
- Setup backend, DB e autenticazione.

### Fase 2 (settimane 4-7)
- Implementazione 2-3 connettori prioritari.
- Pipeline deduplica + normalizzazione.
- Dashboard base ricerche utente.

### Fase 3 (settimane 8-10)
- Sistema alert giornaliero e digest.
- Rilevazione ribassi prezzo e variazioni.
- Feedback utente (like/dislike) per migliorare ranking.

### Fase 4 (settimane 11-13)
- Hardening, monitoraggio, audit legale.
- Ottimizzazione qualità match e riduzione falsi duplicati.
- Beta privata con utenti reali.

## KPI da monitorare
- % annunci rilevanti nel digest (precisione percepita).
- Tempo medio tra pubblicazione annuncio e alert inviato.
- Tasso di click su notifiche.
- Numero di duplicati residui.
- Riduzione tempo ricerca utente (obiettivo principale).

## Possibile evoluzione con AI
- Riassunto automatico pro/contro annuncio.
- Estrazione automatica da descrizioni non strutturate.
- Q&A conversazionale: "mostrami solo case con balcone sotto 300k vicino a scuole".
- Stima competitività prezzo su base zona/comparables.

## Primo MVP consigliato (semplice ma utile)
- 1 città.
- 2 fonti ad alta qualità.
- 1 canale notifiche (email).
- 1 digest/die + evento immediato su ribasso >5%.

Con questo approccio puoi avere un prodotto utile in poche settimane, evitando di partire da una piattaforma troppo complessa.

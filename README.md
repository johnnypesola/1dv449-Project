# 1dv449-Project
A mashup application for the course 1dv449 on Linnaeus University

## Appnamn: Climbspotter

### Inledning

Tekniker som använs:

- Frontend: (Javascript) Angular.js, Ionic, Cordava, SQLite, Google Maps API
- Backend: (Javascript) MongoDB, Node.js

[Demonstrationsfilm för Appen](https://www.youtube.com/watch?v=Nu6H7tAVJ)

[Android app (frontend) finns att ladda ner här](frontend/climbspotter.apk)

Anledningen till att appen blev av är att jag personligen i flera år har tyckt att det saknas en bra överblick och sammanställning av all klättring som finns i trakterna omkring. Klättersidorna som finns på nätet är få och innehåller till största del olika klättringsinformation. Som klättrare så måste man ha koll på alla dessa och gå in på varje enskild för att ta reda på om det kan finns någon klättring av intresse i närheten.

Idag så finns det inga liknande applikationer vad jag vet, men jag kan ha fel. Klättersidorna har dock delvis börjar komma ut med sina egna mer avancerade applikationer. Men ingen har syftet att fungera som en "sökmotor"  för all klättring som denna app har som syfte att göra.


### Schematisk bild

I Stora drag skrer dataflödet på följande vis.

![GitHub Logo](app_schema.png)

Något som inte nämns i schemat är användningen av googles Geocoder API som används till lokalisering av GPS kordinater för sökning i Svenska Turistföreningens API.  
   
### Säkerhet och prestanda

I backend:en så finns det två skrapor som i dagsläget körs manuellt för att hämta och parsa markers ifrån de två klättersidorna som kan ses i schemat. Skraporna kommunicerar i sin tur internt med REST-apiet på samma server för att populera MongoDB databasen med markers. Detta är den sorts av mellanlagring som gjort applikationen möjlig. MongoDB är väldigt snabb i hanteringen och sökning av denna typ av information. Generellt så går det snabbare att hämta informationen ifrån det MongoDB baserade REST-API:et än för telefonen att hämta markersen ifrån det lokala SQLite databasen i telefonen där den finns cache:ad(!) förusatt att telefonen har en någorlunda bra uppkoppling.
   
Även efter alla möjliga prestandaoptimeringar jag funnit så är SQLite databasen i telefonen segare än hämtningen över nätverk till REST-API:et.

När det gäller säkerhet så har jag gjort mitt bästa för att läsa på, hitta och använda mig av lämpliga validerings-, saniterings- och xssfilter-bibliotek för att säkerställa att datat som hamnar i Backendens databas är säker. När det gäller klientsidan så får man mycket gratis med Angular.js när det gäller XSS skydd. Men jag fick manuellt validera och sanitisera strängar för att kommunicera lokalt med SQLite databasen i frontend appen.

Genom hur applikationen är uppbyggd så har användaren stor kontroll äver appens prestanda. Det går att förstora och förminska sökningsurvalet på både area och antalet för önskat resultat. All information som hämtas sparas ju dessutom lokalt i databasen. Denna används så fort som applikationen känner att användaren hamnar i offline-läge eller när användare väljer att slå på offline-läget själv.

### Offline-first

Appen har ett väldigt bra offline-läge, som slås på automatiskt eller vid användarens önskan. Eftersom det är en SQLite databas som lagras i telefonens filsystem så har den potentialen att rymma mycket mer än localstorage i webbläsaren. Den inbyggda Google Maps API:t (Android versionen) tar emot vektorgrafik och visade sig gå betydligt snabbare, stabilare och snyggare än Google Maps javascript API:t som jag använde mig av först. Skillnaden i prestanda och stabilitet är stor och jag är glad att jag tog mig tiden att genomföra bytet, vilket till en början var ett tveksamt beslut.


### Risker 
Den största risken helt klart är vid offentliggörandet av appen. Den är byggd som ett testprojekt som faktiskt visade sig bli riktigt bra och riktigt användbart för en klättrare. Det här är precis det som saknas. Men eftersom den grundar sig på andras information kan de vid närmare kontakt visa sig fientliga till att deras information används på det här sättet. Jag har visionen om att applikationen ska vara en gratis sökmotor för just klättring och bidra med nya användare till klättringshemsidorna, vilket jag tänker att de bara kan se som en positiv sak. Men risken finns att de inte har lika positiv syn på projektet som jag själv.
   
Säkerhetsmässigt finns risken att någon lyckas få kontroll över backenden genom SQL injections, felkonfigurerad mjukvara eller använda sig av något för mig helt okänt säkerhetshål i mobilapplikationen. Men jag har verkligen gjort mitt bästa för att täppa igen de hål jag sett, fast det ibland har varit knepigt på grund av tidsbristen.

### Reflektion
Jag tycker att Ionic är ett fantastiskt ramverk. Jag är glad över att Angular, Ionic, Cordava, Node.js och MongoDB finns till som gör detta arbete så roligt och häftigt. Det är som byggt för att göra sådana här applikationen. Och i och med att man använder webb-teknologi så är det mycket enklare att få ut applikationen till både IOS och Android enheter. Just för min egen utveckling så passade detta ramverk perfekt. Jag lärde mig tidigare under året Angular och det här var den perfekta utvecklingskursen. Dock har det blivit mycket tid som gått att läsa på om just denna teknologi, men väl värt den nerlagda tiden.

Det största problemet jag stötte på under utvecklingen av applikationen var just testningen av den. Testa den så var var tvungen att ladda över den till telefonen för att se om allt fungerar som det ska. Det var väldigt viktigt att koda varsamt eftersom man inte har tiden till att sitta och vänta på tiden det tar att föra applikationen  till telefonen. 
   
Det andra största problemet jag stötte på var att jag länge körde med Google Maps JS (webbläsar) API. Det var mycket ostabilt och krashade stup i kvarten. Jag insåg till slut att jag var tvungen att göra något radikalt för att lyckas med detta projekt. Bytet till Android versionen av google maps krävde en hel del omskrivning av kod men slutresultatet blev ett helt annat.

Jag tror helt klart att applikationen har en framtid. Mer klättersidor (beroende på hur dessa förhåller sig till idén) kommer att läggas till för att till slut bli den bästa sökvertyget för klättring (vilket det redan är för att vara sådan). Eftersom applikationen byggts på ett modulärt sätt ser jag inga gränser för hur många lager som kan finnas i det. Det återstår att se.

Jag anser att teknologierna och det stora risktagandet i hela projektet bör ses som en betygshöjande faktor. En faktor är också att jag har försökt koda väldigt modulärt för att applikationen ska kunnas byggas på ytterligare utan större omstrukturering. Mängden tid jag lagt ner på detta projekt är, ja.. Väldigt mycket tid. När jag kom på idén till den så kunde jag nog helt enkelt inte sluta jobba eller tänka på den. Och i slutändan så känns det som att det klaffade ganska bra.

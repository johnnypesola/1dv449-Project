# 1dv449-Project
A mashup application for the course 1dv449 on Linnaeus University

## The Mashup, initial vision

Appname: My Climbing Trip / Climbing Companion

The application is going to be an Angular.js mobile based application (http://mobileangularui.com/). It's not going go commercial or be published on Google Play or iTunes in the first phase of development, maybe later depending on licencing issues and such.
   
I have two potential paths to follow. Focusing on both will be too time-consuming.

## Potential App functionality 

### App angle 1: Tools for climbing trips (This is the main focus for now)

#### Tools:
- Nearest gas stations from eniro (API) (Swedish only)
- Nearest accomodations from STR (API) (Swedish only)
- Nearest bathing sites from eniro (API) (Swedish only)
- Climbing Locations from climbing.iloove.it (scraped)
- Pictures of locations from climbing.iloove.it (scraped)
- Climbing Locations from thecrag.com (API)
- Weather info for location from yr.no (API)
- Google maps for map (API)

### App angle 2: News and inspiration (Maybe will be implemented partially)

#### News:
- News text from http://www.climbing.com/feed/ (rss)
- News text from http://www.rockandice.com/RSSRetrieve.aspx?ID=13126&Type=RSS20 (rss)

#### Inspiration: 
- Movies from Vimeo (API)
- TV from Youtube - Climbing daily (API)
- Pictures from climbing.iloove.it (scraped)
- Climbing Locations from climbing.iloove.it (scraped)


### Other potential sources:

	Twitter, instagram, google street view, 
	
## Memos

Working order:
1. Setup/build a climbing GeoJSON search engine
  1. Install couchDB with GeoCouch
  2. Build scrapers for different climbing sites (which approves this) that scrapes markers and stores GeoJSON objects with href links to the sites for more information about the GeoJSON marker. This gives the climbing sites more potential users.

2. Setup project enviroment

#### 1.1 CouchDB with GeoCouch extension/plugin

1. Install and run the following docker container https://hub.docker.com/r/elecnix/geocouch/

#### 2. Setup project enviroment
- GitHub client
- Node.js
- Java SDK
- Android SDK
- Install Cordova (API that gives the App access to Android hardware)
- Apache Ant
- Genymotion (Android)
- Ionic (Angular Mobile App Framework)

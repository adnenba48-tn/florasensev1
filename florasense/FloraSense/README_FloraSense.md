# FloraSense

FloraSense est un prototype IoT de surveillance des plantes d'intérieur.
L'ESP32 lit les capteurs, envoie les mesures au backend Node.js/Express,
puis le backend les enregistre dans MongoDB et les rend disponibles au
dashboard.

## 1. Prérequis

-   Node.js et npm
-   Arduino IDE avec le support ESP32
-   Les bibliothèques Arduino utilisées dans le sketch (`DHT`,
    `LiquidCrystal_I2C`, etc.)
-   Un compte MongoDB Atlas configuré
-   Le PC et l'ESP32 sur des réseaux capables de communiquer

## 2. Matériel et branchements

  Composant          Broche ESP32
  ---------------- --------------
  DHT11 DATA               GPIO 5
  Soil sensor AO          GPIO 34
  LDR DO                  GPIO 27
  LED verte               GPIO 23
  LED orange              GPIO 19
  LED rouge               GPIO 26
  LCD SDA                 GPIO 21
  LCD SCL                 GPIO 22

Adresse I2C du LCD : `0x27`.

## 3. Lancer le site web

### Étape 1 --- Ouvrir PowerShell

Exécuter :

``` powershell
cd "$env:USERPROFILE\Desktop\FloraSense\backend"
```

### Étape 2 --- Installer les dépendances

À faire lors de la première installation :

``` powershell
npm install
```

### Étape 3 --- Vérifier `.env`

Le fichier `.env` doit se trouver dans le dossier `backend` et contenir
la configuration MongoDB ainsi que `INGESTION_TOKEN`.

La base utilisée par le projet est `FLORASENSORS` et la collection est
`sensor_readings`.

**Important :** ne jamais publier `.env`, le mot de passe MongoDB ou le
token d'ingestion dans GitHub ou dans une capture d'écran.

### Étape 4 --- Démarrer le backend

``` powershell
npm start
```

Garder cette fenêtre ouverte.

### Étape 5 --- Ouvrir le dashboard

Dans le navigateur :

``` text
http://localhost:3000
```

Pour vérifier l'état du serveur et de MongoDB :

``` text
http://localhost:3000/health
```

## 4. Connecter l'ESP32

### Étape 1 --- Ouvrir le sketch Arduino

Ouvrir le fichier `.ino` du projet dans Arduino IDE.

### Étape 2 --- Configurer le réseau et l'API

Renseigner localement le nom et le mot de passe Wi-Fi, le token
d'ingestion et l'adresse du backend.

Exemple d'URL utilisée pendant les tests (adapter l'adresse IP à celle
du PC) :

``` cpp
#define FLORASENSE_API_URL "http://192.168.100.7:3000/api/ingest"
```

Ne pas utiliser `localhost` dans le sketch ESP32 : cette adresse
désignerait l'ESP32 lui-même et non le PC.

Le token du sketch doit correspondre à `INGESTION_TOKEN` dans le fichier
`.env`. Garder cette valeur secrète.

### Étape 3 --- Vérifier l'en-tête d'authentification

La fonction d'envoi doit contenir une seule fois :

``` cpp
http.addHeader("X-Ingestion-Token", FLORASENSE_INGEST_TOKEN);
```

Ne pas ajouter en parallèle l'ancien en-tête `Authorization` si le
projet utilise `X-Ingestion-Token`.

### Étape 4 --- Téléverser le programme

Dans Arduino IDE :

1.  Choisir la carte **ESP32 Dev Module**.
2.  Choisir le port COM correspondant à la carte (COM3 était utilisé
    pendant les tests).
3.  Cliquer sur **Upload**.

### Étape 5 --- Vérifier le moniteur série

Ouvrir le Serial Monitor à `115200` bauds. Vérifier la connexion Wi-Fi
et l'envoi des mesures.

Une réponse HTTP `202` avec `accepted: true` indique que le backend a
accepté la mesure. `persistedToDb: true` confirme son enregistrement
dans MongoDB.

## 5. Endpoints du backend

  Méthode   Endpoint              Description
  --------- --------------------- -------------------------------
  GET       `/health`             État du serveur et de MongoDB
  POST      `/api/ingest`         Réception des mesures ESP32
  GET       `/api/data`           Données récentes
  GET       `/api/data/history`   Historique des mesures

## 6. Tester l'envoi depuis le PC

Laisser `npm start` actif dans une première fenêtre PowerShell. Ouvrir
une deuxième fenêtre et exécuter :

``` powershell
cd "$env:USERPROFILE\Desktop\FloraSense\backend"
```

Puis :

``` powershell
node -e "require('dotenv').config(); fetch('http://localhost:3000/api/ingest',{method:'POST',headers:{'Content-Type':'application/json','X-Ingestion-Token':process.env.INGESTION_TOKEN},body:JSON.stringify({temp:24.6,hum:76.5,soil:2000,light:0,state:0})}).then(async r=>console.log('HTTP',r.status,await r.text())).catch(console.error)"
```

Une réponse `HTTP 202` confirme que le test local est accepté. Il s'agit
d'une donnée de test, pas d'une lecture réelle des capteurs.

## 7. Dépannage

### Le site ne s'ouvre pas

-   Vérifier que `npm start` fonctionne toujours.
-   Tester `http://localhost:3000/health`.
-   Vérifier que le port 3000 n'est pas occupé.

### MongoDB n'est pas connectée

-   Vérifier les paramètres MongoDB dans `.env`.
-   Vérifier la connexion Internet et les règles Network Access de
    MongoDB Atlas.
-   Ne jamais partager les identifiants.

### L'ESP32 reçoit HTTP 401

-   Vérifier que le token du sketch correspond à `INGESTION_TOKEN`.
-   Vérifier qu'il n'y a aucun espace supplémentaire.
-   Vérifier que `X-Ingestion-Token` est envoyé une seule fois.
-   Vérifier que le sketch contacte le bon serveur.

### L'ESP32 ne rejoint pas le serveur

-   Vérifier que le PC et l'ESP32 peuvent communiquer sur le réseau.
-   Utiliser l'adresse IPv4 locale du PC, pas `localhost`.
-   Vérifier le pare-feu Windows et autoriser TCP sur le port 3000 si
    nécessaire.

### Les nouvelles données ne s'affichent pas

-   Vérifier dans le Serial Monitor que l'envoi reçoit HTTP 202.
-   Vérifier `/health` et la connexion MongoDB.
-   Vérifier que le dashboard récupère les données depuis le backend.

## 8. Démarrage quotidien

1.  Alimenter l'ESP32.
2.  Ouvrir PowerShell dans `Desktop\FloraSense\backend`.
3.  Exécuter `npm start`.
4.  Ouvrir `http://localhost:3000`.
5.  Vérifier la connexion Wi-Fi et les réponses HTTP de l'ESP32.
6.  Contrôler les mesures affichées sur le dashboard.

## 9. Remarque

FloraSense est actuellement un prototype. La calibration des capteurs,
les seuils d'alerte, la stabilité du réseau et le comportement du
système doivent être validés avant toute installation réelle dans une
habitation.

# Guide de déploiement sur VPS

## Prérequis

- Un VPS avec Ubuntu 22.04+ ou Debian 12+
- Docker et Docker Compose installés
- Git installé
- Un nom de domaine pointant vers l'IP de votre VPS

## 1. Installation de Docker (si pas déjà fait)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
logout
```

Reconnectez-vous après le logout.

## 2. Cloner le projet

```bash
git clone https://github.com/votre-username/votre-repo.git crm-sereniteo
cd crm-sereniteo
```

## 3. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Remplissez les valeurs :
- `DB_PASSWORD` : Un mot de passe sécurisé pour PostgreSQL
- `SESSION_SECRET` : Une chaîne aléatoire (générez avec `openssl rand -hex 32`)
- `APP_BASE_URL` : https://crm.sereniteo.fr
- `BREVO_API_KEY` : Votre clé API Brevo
- `BREVO_FROM_EMAIL` : L'email d'expédition vérifié

## 4. Lancer l'application

```bash
docker compose up -d --build
```

## 5. Initialiser la base de données (première fois uniquement)

Après le premier lancement, créez les tables :

```bash
docker compose exec app npx drizzle-kit push
```

Vérifiez que l'application fonctionne :
```bash
docker compose logs -f app
```

Attendez de voir "serving on port 5000" avant de continuer.

## 6. Configurer Nginx (reverse proxy avec SSL)

Installez Nginx et Certbot :

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

Créez la configuration Nginx :

```bash
sudo nano /etc/nginx/sites-available/crm.sereniteo.fr
```

Contenu :

```nginx
server {
    listen 80;
    server_name crm.sereniteo.fr;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activez le site et obtenez le certificat SSL :

```bash
sudo ln -s /etc/nginx/sites-available/crm.sereniteo.fr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d crm.sereniteo.fr
```

## 7. Importer les données depuis Replit

### Option 1 : Export SQL depuis Replit
Dans Replit, utilisez l'onglet Database pour exporter vos données, puis :
```bash
docker compose exec -T db psql -U crm -d crm < backup.sql
```

### Option 2 : Copie directe via pg_dump
Si vous avez accès à la DATABASE_URL de Replit :
```bash
pg_dump "DATABASE_URL_REPLIT" > backup.sql
docker compose exec -T db psql -U crm -d crm < backup.sql
```

## Commandes utiles

```bash
# Voir les logs
docker compose logs -f app

# Redémarrer l'application
docker compose restart app

# Mettre à jour après un git pull
git pull
docker compose up -d --build

# Arrêter tout
docker compose down

# Arrêter et supprimer les données
docker compose down -v
```

## Résolution de problèmes

### L'application ne démarre pas
```bash
docker compose logs app
```

### La base de données n'est pas accessible
```bash
docker compose logs db
docker compose exec db psql -U crm -d crm -c "SELECT 1"
```

### Réinitialiser la base de données
```bash
docker compose down -v
docker compose up -d --build
```

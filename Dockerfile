FROM node:18-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer TOUTES les dépendances (y compris dev pour build)
RUN npm install

# Copier tout le code
COPY . .

# Builder l'application
RUN npm run build

# Supprimer les devDependencies après le build
RUN npm prune --production

# Port d'exposition
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
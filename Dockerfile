FROM node:20-alpine

WORKDIR /app

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste des fichiers
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Lancer Vite en mode développement
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Basica.fr

Site React/Vite avec API serverless pour Vercel.

## Deploiement Vercel

1. Importer le depot GitHub dans Vercel.
2. Framework preset : `Vite`.
3. Build command : `npm run build`.
4. Output directory : `dist`.
5. Ajouter les variables d'environnement ci-dessous dans Vercel.
6. Deployer.

## Variables Vercel

Obligatoires pour la connexion, Turso et Stripe :

```txt
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
JWT_SECRET=
```

Emails via Resend :

```txt
RESEND_API_KEY=
RESEND_FROM=
```

Alternative SMTP :

```txt
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Optionnel cote client :

```txt
VITE_STRIPE_PUBLIC_KEY=
```

## Tests apres deploiement

Remplacer `https://ton-domaine.vercel.app` par l'URL Vercel :

```txt
https://ton-domaine.vercel.app/api/test
https://ton-domaine.vercel.app/api/debug-env
https://ton-domaine.vercel.app/api/db-status
```

Stripe webhook :

```txt
https://ton-domaine.vercel.app/api/webhooks/stripe
```

## Local

```bash
npm install
npm run dev
```

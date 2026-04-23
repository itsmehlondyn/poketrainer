# PokéTrainer — Trainer Profile Site

A full-stack Node.js web app where users create a trainer account, build a 6-Pokémon team using live PokéAPI data, and share a public trainer card.

## Tech Stack

| Concept | Implementation |
|---|---|
| HTTP / Express | Routes, controllers, middleware |
| Pug Templates | All views (layout, auth, profile, team, pokédex) |
| Sequelize + SQLite | `User` and `TeamPokemon` models with associations |
| Sessions + Cookies | `express-session` for login state |
| File Uploads | `multer` for trainer avatar (2MB limit, image-only) |
| External API | PokéAPI via `axios` — fetch Pokémon data & sprites |
| Validation | Duplicate Pokémon check, 6-Pokémon limit, form validation |
| Method Override | PUT/DELETE from HTML forms via `method-override` |
| Flash Messages | `connect-flash` for success/error feedback |
| Auth Middleware | `requireAuth` / `requireGuest` guards |

## Project Structure

```
poketrainer/
├── app.js                  # Express app setup, session, routes
├── config/
│   └── database.js         # Sequelize SQLite config
├── models/
│   ├── index.js            # Associations
│   ├── User.js             # User model (bcrypt password hashing)
│   └── TeamPokemon.js      # Team slot model (cached PokéAPI data)
├── controllers/
│   ├── authController.js   # Register, login, logout
│   ├── profileController.js # View/edit profile, avatar upload
│   ├── teamController.js   # Add/remove/nickname/reorder Pokémon
│   └── pokedexController.js # Browse & view Pokémon detail
├── routes/
│   ├── auth.js
│   ├── profile.js
│   ├── team.js
│   └── pokedex.js
├── middleware/
│   ├── auth.js             # requireAuth / requireGuest
│   └── upload.js           # multer config
├── views/
│   ├── layout.pug          # Base layout (navbar, flash messages, footer)
│   ├── error.pug
│   ├── auth/
│   │   ├── login.pug
│   │   └── register.pug
│   ├── profile/
│   │   ├── index.pug       # Own profile (with edit links)
│   │   ├── public.pug      # Public trainer card
│   │   └── edit.pug        # Edit form with avatar upload
│   ├── team/
│   │   └── index.pug       # Team management + drag-to-reorder
│   └── pokedex/
│       ├── index.pug       # Paginated Pokédex grid
│       └── detail.pug      # Individual Pokémon stats page
├── public/
│   ├── css/style.css
│   └── uploads/            # Trainer avatar images
└── data/
    └── poketrainer.sqlite  # Auto-created on first run
```

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start

# 3. Open in browser
# http://hopper.winthrop.edu:3009/login
```

The SQLite database is auto-created on first run via `sequelize.sync()`.

## Features

- **Auth**: Register with username/email/password (bcrypt hashed), login/logout with session cookies
- **Profile**: Trainer card with avatar, title, bio, hometown, gym badge count (0–8)
- **Team Builder**: Search any Pokémon by name → fetched live from PokéAPI; drag-to-reorder slots; nickname editor modal; release Pokémon
- **Validation**: Max 6 Pokémon, no duplicate species per team, image-only avatar uploads (2MB max)
- **Pokédex**: Paginated browse of all Pokémon; detail page with stats bar chart, flavor text, shiny sprite
- **Public Trainer Card**: Share your profile URL `/profile/:username`

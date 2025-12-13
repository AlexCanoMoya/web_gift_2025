# Plans Board (regalo web interactivo con memoria)

Esto es una web tipo “tablón / wishlist” de planes futuros con CRUD (crear/editar/borrar) y filtros.
Se aloja gratis en Vercel y persiste datos en Supabase (Postgres), por lo que tiene **memoria**.

## 1) Crear base de datos gratis (Supabase)

1. Crea una cuenta en Supabase.
2. Crea un proyecto nuevo (Free).
3. Ve a **SQL Editor** y ejecuta el script: `supabase/schema.sql`.
4. Ve a **Project Settings → API** y copia:
   - `Project URL`
   - `anon public key`

> Nota de seguridad: por simplicidad el proyecto está configurado “sin login” (cualquiera con la URL puede editar).
> Si quieres protección con contraseña por tablón, dímelo y te dejo la variante con RLS por `board_key`.

## 2) Configurar entorno local

```bash
npm i
cp .env.example .env.local
# edita .env.local con tus valores
npm run dev
```

Abre http://localhost:3000

## 3) Publicarlo y obtener 2 URLs (Vercel)

La forma más limpia es **desplegar el mismo repo 2 veces** con distintos ENV VARS.

### A) Subir a GitHub (un repo)

- Crea un repo y sube este proyecto.

### B) Deploy 1 (tu pareja)

En Vercel:
1. **Add New → Project** y elige el repo.
2. En **Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = (tu Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (tu anon key)
   - `NEXT_PUBLIC_BOARD_TITLE` = `ItxiCano's plans`
   - `NEXT_PUBLIC_BOARD_SLUG` = `itxicano-plans`
3. Deploy. Te dará una URL tipo `https://xxxx.vercel.app`.

### C) Deploy 2 (tus hermanas)

Repite creando **otro proyecto** en Vercel usando el mismo repo, pero con:
- `NEXT_PUBLIC_BOARD_TITLE` = `Cano brothers' plans`
- `NEXT_PUBLIC_BOARD_SLUG` = `cano-brothers-plans`

Resultado: **2 URLs distintas** (una por proyecto), cada una con su “memoria” separada por `board_slug`.

## 4) Personalización rápida

- Copy: `src/components/Board.tsx`
- Estilos: Tailwind en `src/app/globals.css`

## 5) Troubleshooting

- Si no guarda datos: revisa que ejecutaste `supabase/schema.sql` y que env vars estén bien.
- Si ves errores de CORS o permisos: revisa RLS policies en Supabase (se crean en el SQL).

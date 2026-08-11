# Fone Factory — Full-Stack Phone Shop Application

A professional, premium full-stack mobile phone shop website containing a customer-facing site (About, Services, Accessories) and a comprehensive admin control panel dashboard (CRUD, Enquiries tracking, Media upload, and authentication/authorization control).

## Tech Stack

* **Frontend**: React + Vite (SPA client-side routing)
* **Backend**: Python FastAPI (Serverless-ready APIs)
* **Database & Auth**: Supabase (RLS, PostgreSQL schema, Storage Buckets, Phone OTP Auth)
* **Hosting**: Netlify (Frontend) + Vercel (Backend)

---

## Workspace Structure

* [supabase/](file:///d:/fonefactory/supabase/) — Schema SQL, RLS Policies, Storage Buckets config, and Seeds.
* [backend/](file:///d:/fonefactory/backend/) — FastAPI backend codebase, routers, schemas, dependencies, and Vercel configurations.
* [frontend/](file:///d:/fonefactory/frontend/) — React + Vite code, UI design system, state, routing, and Netlify configurations.

---

## 1. Supabase Initialization Setup

1. **Create a Supabase Project**: Name it `fonefactory` or similar.
2. **Execute Database Schemas**:
   * Open the **SQL Editor** in the Supabase Dashboard.
   * Run the contents of [supabase/schema.sql](file:///d:/fonefactory/supabase/schema.sql) to create the tables.
   * Run the contents of [supabase/rls_policies.sql](file:///d:/fonefactory/supabase/rls_policies.sql) to enable RLS protections.
   * Run the contents of [supabase/storage_setup.sql](file:///d:/fonefactory/supabase/storage_setup.sql) to provision the public buckets.
   * Run the contents of [supabase/seed.sql](file:///d:/fonefactory/supabase/seed.sql) to load the initial shop configuration and categories.
3. **Configure OTP SMS Provider**:
   * Navigate to **Authentication** &rarr; **Providers** &rarr; **Phone**.
   * Enable the Phone provider and link your SMS Gateway (e.g. Twilio, MessageBird) credentials.
4. **Create Initial Admin Account**:
   * Go to **Authentication** &rarr; **Users** &rarr; **Add User** (Create User).
   * Enter the admin email (`fonefactory112@gmail.com`) and password.
   * Open the SQL Editor and approve the account:
     ```sql
     UPDATE admin_profiles 
     SET approval_status = 'approved', full_name = 'Farhaan Admin' 
     WHERE email = 'fonefactory112@gmail.com';
     ```

---

## 2. Backend Local Setup (FastAPI)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows PowerShell:
   .venv\Scripts\Activate.ps1
   # macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   Configure `.env` with your Supabase project parameters and `Service_role` API key.
5. Start the local development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   API docs will be live at: http://localhost:8000/docs

---

## 3. Frontend Local Setup (React + Vite)

1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   Configure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`.
4. Run the local development server:
   ```bash
   npm run dev
   ```
   Website will be live at: http://localhost:5173

---

## 4. Deployment Guides

### Backend (Vercel)
The backend is configured for serverless deployment using `vercel.json` and `api/index.py`.
1. Push your repository code to GitHub.
2. Connect your repository to **Vercel**.
3. Set the Framework Preset to **Other** (since it automatically picks up the python runtime configuration).
4. Add the following **Environment Variables** in Vercel settings:
   * `SUPABASE_URL`
   * `SUPABASE_SERVICE_ROLE_KEY`
   * `SUPABASE_ANON_KEY`
   * `FRONTEND_URL` (Set this to your live Netlify domain to whitelist CORS)
5. Click **Deploy**.

### Frontend (Netlify)
The frontend contains a `netlify.toml` file to compile the Vite build and route all client paths to `index.html` for SPA navigation.
1. Connect your repository to **Netlify**.
2. Netlify should automatically load configurations from `frontend/netlify.toml`:
   * **Build Command**: `npm run build`
   * **Publish Directory**: `frontend/dist`
   * **Base Directory**: `frontend`
3. Configure the **Environment Variables** in Netlify:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
   * `VITE_API_URL` (Set this to your live Vercel backend deployment URL)
4. Trigger the build.

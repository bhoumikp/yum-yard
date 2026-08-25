# PostgreSQL Local Setup

## Purpose

Set up PostgreSQL locally on Ubuntu for YumYard development.

## 1. Check PostgreSQL

```bash
psql --version
sudo systemctl status postgresql
```

If PostgreSQL is not installed:

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

Start PostgreSQL:

```bash
sudo systemctl enable --now postgresql
```

## 2. Create YumYard Database User

Open PostgreSQL as the administrator:

```bash
sudo -u postgres psql
```

Create the application user:

```sql
CREATE USER yumyard WITH PASSWORD 'YOUR_LOCAL_PASSWORD';
```

## 3. Create YumYard Database

```sql
CREATE DATABASE yumyard OWNER yumyard;
```

Exit PostgreSQL:

```sql
\q
```

## 4. Verify Database Connection

Connect using the application user:

```bash
psql -h localhost -U yumyard -d yumyard
```

Enter the password when prompted.

Successful connection:

```text
yumyard=>
```

Exit:

```sql
\q
```

## 5. Configure Environment Variable

In `backend/.env`:

```env
DATABASE_URL="postgresql://yumyard:YOUR_LOCAL_PASSWORD@localhost:5432/yumyard"
```

Never commit `.env`.

## Result

```text
PostgreSQL server       ✅
YumYard user            ✅
YumYard database        ✅
Password authentication ✅
Local connection        ✅
DATABASE_URL            ✅
```

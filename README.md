# IoT Market - To'liq Loyiha

## Portlar
| Servis | Port | URL |
|--------|------|-----|
| Backend API | 5000 | http://localhost:5000 |
| Frontend (Sayt) | **5174** | http://localhost:5174 |
| Admin Panel | **5173** | http://localhost:5173 |

## O'rnatish va Ishga tushirish

### 1. Barcha dependencylarni o'rnatish
```bash
npm run install:all
```

### 2. PostgreSQL ma'lumotlar bazasini yaratish
```bash
createdb iot-market
```

### 3. Prisma migratsiya
```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
cd ..
```

### 4. Hamma servislari birga ishga tushirish
```bash
npm run dev
```

### Yoki alohida ishga tushirish
```bash
npm run dev:backend   # Backend (port 5000)
npm run dev:frontend  # Frontend (port 5174)
npm run dev:admin     # Admin panel (port 5173)
```

## Admin Login
- **Email:** admin@iotmarket.uz
- **Parol:** Admin123!

## Bog'lanishlar
- Frontend → Backend: `http://localhost:5000/api`
- Admin Panel → Backend: `http://localhost:5000/api`
- Google OAuth redirect: `http://localhost:5174/auth/google/success`

## Muhim o'zgarishlar (Tuzatilgan muammolar)

### 1. Port konfiguratsiya (TO'G'RILANDI)
- Frontend: **5174** (avval 5173 deb yozilgan edi - XATO)
- Admin panel: **5173** (avval 5174 deb yozilgan edi - XATO)
- `backend/.env` → `FRONTEND_URL=http://localhost:5174`

### 2. Google OAuth (TO'G'RILANDI)
- Backend `/auth/google/callback` endi `/auth/google/success` ga redirect qiladi
- Frontend `GoogleSuccess.jsx` sahifasi to'g'ri URL da

### 3. Prisma Schema (TO'G'RILANDI)
- `Order.items` JSON field qilib o'zgartirildi (avval `OrderItem[]` relation edi)
- `Order.txId` field qo'shildi
- `OrderItem` modeli olib tashlandi

### 4. Contact sahifasi (TO'G'RILANDI)
- Endi backend `/api/messages` ga real so'rov yuboradi
- Login bo'lgan user uchun ism/email avtomatik to'ldiriladi

### 5. HeroSlider (TO'G'RILANDI)
- Admin paneldan qo'shilgan bannerlar frontendda ko'rinadi
- Agar banner yo'q bo'lsa, static slides ko'rsatiladi

### 6. Home va Products sahifalar (TO'G'RILANDI)
- Backend API dan real mahsulotlar olinadi
- Skeleton loader qo'shildi
- API ishlamasa static data fallback

### 7. Admin panel (TO'G'RILANDI)
- Dashboard real statistika: buyurtmalar, mahsulotlar, mijozlar soni
- Buyurtmalarda items JSON formatda to'g'ri ko'rsatiladi
- Banner/Product upload API URL tuzatildi

## Google OAuth sozlash
Google Cloud Console → Authorized redirect URIs ga qo'shing:
```
http://localhost:5000/api/auth/google/callback
```

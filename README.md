# أربعة و نص — موقع الفرقة

موقع Next.js 14 كامل (Full-Stack) لفرقة الروك السورية "أربعة و نص"، مع لوحة تحكم للأدمن لإدارة الصور والفيديوهات والحفلات.

## المحتويات
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** للتصميم
- **Prisma** + **PostgreSQL** لتخزين الـEvents والـMedia metadata
- **Cloudinary** لتخزين الصور والفيديوهات
- **JWT session cookies** (عبر `jose`) لتسجيل دخول الأدمن، مع كلمة مرور مُشفّرة (`bcryptjs`)
- متوافق بالكامل مع **Vercel** (لا يعتمد على تخزين محلي دائم)

---

## 1. تثبيت الـ Dependencies

```bash
npm install
```

---

## 2. إعداد قاعدة البيانات (PostgreSQL)

المشروع يستخدم PostgreSQL عبر Prisma. لا تستخدم SQLite لأنه لن يعمل على Vercel.

أسهل طريقة: أنشئ قاعدة بيانات مجانية على:
- [Neon](https://neon.tech) (موصى به، يعمل محليًا وعلى Vercel بنفس الرابط)
- أو [Supabase](https://supabase.com)

انسخ رابط الاتصال (Connection String) وضعه في `DATABASE_URL` داخل ملف `.env` (انظر الخطوة التالية).

بعد إعداد `.env`، طبّق الـ schema على قاعدة البيانات:

```bash
npx prisma db push
```

---

## 3. إعداد Cloudinary

1. أنشئ حسابًا مجانيًا على [cloudinary.com](https://cloudinary.com).
2. من الـ Dashboard، انسخ:
   - `Cloud Name`
   - `API Key`
   - `API Secret`
3. ضعها في ملف `.env` كما هو موضح بالأسفل.

لا حاجة لأي إعداد إضافي — الكود يرفع الملفات مباشرة عبر الـ Cloudinary SDK من الـ Backend، والمجلد `arb3awnoss/gallery` و`arb3awnoss/events` يُنشأان تلقائيًا.

---

## 4. متغيرات البيئة (Environment Variables)

انسخ `.env.example` إلى `.env`:

```bash
cp .env.example .env
```

ثم املأ القيم:

```bash
DATABASE_URL="postgresql://..."

CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."

ADMIN_USERNAME="admin"
ADMIN_PASSWORD_HASH="..."   # موصى به — انظر أدناه لكيفية توليده
SESSION_SECRET="..."
```

### توليد كلمة مرور الأدمن (bcrypt hash)

```bash
node -e "console.log(require('bcryptjs').hashSync('كلمة_المرور_هنا', 10))"
```

انسخ الناتج وضعه في `ADMIN_PASSWORD_HASH`.

> بديل أسرع للتطوير المحلي فقط: استخدم `ADMIN_PASSWORD="كلمة_المرور"` كنص صريح بدل الـ hash. **غير موصى به في الإنتاج.**

### توليد SESSION_SECRET

```bash
openssl rand -base64 32
```

---

## 5. صور الفرقة الثابتة (Static Assets)

الصور التالية موجودة داخل المشروع (وليست في Cloudinary) وتم وضع صور بديلة مؤقتة (placeholders) بنفس الأسماء — استبدلها بصور الفرقة الحقيقية:

```
public/assets/band/group.jpg     → صورة الفرقة الرئيسية (Hero)
public/assets/logo/logo.jpg      → شعار الفرقة
public/assets/members/yazan.jpg  → يزن القطان
public/assets/members/tima.jpg   → تيما ريماوي
public/assets/members/zein.jpg   → زين خلوف
public/assets/members/laith.jpg  → ليث قندلفت
```

فقط استبدل الملفات بنفس الاسم والامتداد (أو عدّل المسار في `src/app/page.tsx` و`src/app/about/page.tsx`).

---

## 6. تشغيل المشروع محليًا

```bash
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000).

---

## 7. تسجيل الدخول إلى لوحة التحكم (Admin Panel)

اذهب إلى: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

استخدم `ADMIN_USERNAME` وكلمة المرور التي حددتها (النص الصريح المقابل للـ hash، أو `ADMIN_PASSWORD`).

من لوحة التحكم يمكنك:
- **إدارة الوسائط (Gallery):** إضافة/تعديل/حذف صور وفيديوهات، وتحديد حتى 5 عناصر كـ "Best" لتظهر في الـ Slider بالصفحة الرئيسية.
- **إدارة الحفلات (Events):** إضافة/تعديل/حذف حفلات، تغيير الحالة بين "قادم" و"منتهي"، وإضافة صورة عند اكتمال الحدث. الصفحة الرئيسية تُحدّث نفسها تلقائيًا حسب هذه البيانات (لا حاجة لتعديل يدوي).

---

## 8. البناء للإنتاج (Production Build)

```bash
npm run build
npm run start
```

---

## 9. النشر على Vercel

1. ارفع المشروع إلى مستودع Git (GitHub/GitLab).
2. من [vercel.com](https://vercel.com)، استورد المستودع.
3. أضف جميع متغيرات البيئة من `.env` في إعدادات المشروع على Vercel (Settings → Environment Variables).
4. تأكد أن `DATABASE_URL` يشير إلى قاعدة بيانات PostgreSQL يمكن الوصول إليها من الإنترنت (Neon/Supabase تعمل مباشرة).
5. اضغط Deploy. Vercel سيشغّل `prisma generate` تلقائيًا (موجود ضمن `postinstall` و`build` في `package.json`).

بعد أول نشر، إن لم تكن قد طبّقت الـ schema من قبل، شغّل محليًا (مع نفس `DATABASE_URL` الخاص بالإنتاج):

```bash
npx prisma db push
```

---

## بنية المشروع (ملخص)

```
src/
  app/
    page.tsx              → الصفحة الرئيسية (Hero + Best Media + Events + Discography)
    about/page.tsx         → صفحة "من نحن" (ثابتة، غير قابلة للتعديل من الأدمن)
    gallery/page.tsx        → صفحة المعرض الكاملة
    admin/
      login/page.tsx        → تسجيل دخول الأدمن
      page.tsx               → لوحة التحكم (Media + Events)
    api/
      auth/login, logout     → مصادقة الأدمن
      media/                 → CRUD للوسائط + رفع Cloudinary
      events/                → CRUD للحفلات + رفع صورة الحدث
  components/                → مكوّنات الواجهة العامة والأدمن
  lib/
    prisma.ts, auth.ts, cloudinary.ts, eventLogic.ts
  middleware.ts               → يحمي مسارات /admin من الوصول بدون تسجيل دخول
prisma/schema.prisma          → نماذج Media و Event
```

## ملاحظات أمنية
- لا توجد أي كلمات مرور أو مفاتيح API داخل الكود المصدري — كلها من Environment Variables.
- جلسة الأدمن عبارة عن JWT موقّع (`SESSION_SECRET`) في كوكي `httpOnly`، صالحة 12 ساعة.
- جميع مسارات `/admin/*` (عدا `/admin/login`) محمية عبر `middleware.ts`، وجميع الـ API التي تعدّل البيانات (`POST`/`PATCH`/`DELETE`) تتحقق من الجلسة قبل التنفيذ.
- حد الـ 5 عناصر لـ "Best Media" مفروض من الـ Backend أيضًا وليس فقط من الواجهة.

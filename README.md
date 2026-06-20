# 🎮 Team Challenge Backend
### Backend احترافي للعبة تحديات بين فريقين (Quiz / Trivia Game)

> **حالة المشروع**: تم تفعيل المصادقة + الفئات + الأسئلة + متجر الألعاب + الشراء + التحليلات الإدارية ✅

---

## 1️⃣ التقنيات المستخدمة ولماذا

| التقنية | السبب |
|---|---|
| **Node.js + Express** | خفيف وسريع، مناسب جداً لتطبيقات تفاعلية مثل الألعاب (نقاط، أدوار، تحديثات لحظية لاحقاً عبر WebSocket إن لزم). نظام الـ middleware يسهّل فصل الصلاحيات والتحقق من البيانات بشكل نظيف. |
| **MongoDB + Mongoose** | شكل بيانات اللعبة (أسئلة، فئات، جلسات لعب) قد يختلف وقد يتطور لاحقاً (أنواع أسئلة جديدة، إعدادات لعب مختلفة) — المرونة في Schema تخدم هذا التوسع. Mongoose يضيف Validation وبنية قوية فوق هذه المرونة. |
| **JWT** | مصادقة عديمة الحالة (Stateless) لا تحتاج تخزين جلسات على الخادم، ما يجعل التوسع الأفقي (عدة نسخ من الخادم خلف Load Balancer) سهلاً. |
| **bcryptjs** | تشفير كلمات المرور بشكل آمن (One-way hashing) قبل تخزينها. |
| **Stripe** | حل دفع عالمي، موثوق، وسهل التكامل عبر Webhooks. |

---

## 2️⃣ هيكلة المشروع (Architecture) وشرح كل جزء

```
team-challenge-backend/
│
├── server.js                  ← نقطة انطلاق التطبيق فقط (تشغيل الخادم)
├── package.json                ← الاعتماديات والأوامر
├── .env.example                 ← قالب متغيرات البيئة (انسخه إلى .env)
│
└── src/
    ├── app.js                  ← إعداد Express (middleware + ربط الـ routes)
    │
    ├── config/                 ← كل ما يخص الإعدادات والاتصالات الخارجية
    │   ├── config.js           ← قراءة موحّدة لمتغيرات البيئة
    │   └── database.js         ← الاتصال بـ MongoDB
    │
    ├── models/                 ← مخططات Mongoose (Schemas) — تعريف شكل البيانات
    │                              Users, Categories, Questions, GameSession, Game, Purchase, Visitor
    │
    ├── controllers/            ← منطق العمل (Business Logic) لكل طلب
    │                              auth, category, question, game, purchase, admin
    │
    ├── routes/                 ← تعريف المسارات (Endpoints) وربطها بالـ controllers فقط
    │                              لا يوجد منطق هنا، فقط توجيه (Routing)
    │
    ├── middleware/              ← دوال تعمل "بين" الطلب والرد
    │   ├── errorMiddleware.js  ← معالجة الأخطاء الموحّدة
    │   ├── authMiddleware.js   ← protect (JWT) + adminOnly (صلاحيات)
    │   └── visitorMiddleware.js ← تتبع الزوار (Fire-and-forget، بدون تأثير على الأداء)
    │
    ├── services/                ← منطق معقد مُعاد استخدامه (مثل التواصل مع Stripe لاحقاً)
    │                              يُفصل عن الـ controllers لإبقائها نظيفة وقابلة للاختبار
    │
    ├── seeders/                  ← سكربتات لحقن بيانات تجريبية في قاعدة البيانات (لاحقاً)
    │
    └── utils/                    ← asyncHandler.js (تغليف async/await) + generateToken.js (JWT)
```

### لماذا هذا الفصل؟ (Routes → Controllers → Models)

تخيّل الطلب يمر كالتالي:

```
طلب HTTP  →  route (يحدد المسار)  →  middleware (تحقق/صلاحيات)  →  controller (المنطق)  →  model (قاعدة البيانات)  →  رد
```

كل طبقة لها مسؤولية واحدة فقط (مبدأ Single Responsibility). هذا يعني أنك تستطيع لاحقاً:
- تغيير قاعدة البيانات دون لمس الـ controllers
- إضافة صلاحية جديدة كـ middleware واحد يُستخدم في أي route
- اختبار الـ controllers بمعزل عن الشبكة فعلياً

---

## 3️⃣ كيفية التشغيل محلياً

### المتطلبات
- Node.js (إصدار 18 أو أحدث)
- MongoDB (محلياً عبر Docker/التثبيت المباشر، أو حساب مجاني على MongoDB Atlas)

### الخطوات

```bash
# 1. تثبيت الاعتماديات
npm install

# 2. إنشاء ملف البيئة من القالب
cp .env.example .env

# 3. عدّل ملف .env وضع فيه:
#    - MONGO_URI الخاص بك
#    - JWT_SECRET (أي نص عشوائي طويل، يمكن توليده بالأمر:
#      node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# 4. تشغيل المشروع في وضع التطوير (إعادة تشغيل تلقائية عند أي تعديل)
npm run dev

# أو تشغيله بشكل عادي
npm start
```

### التأكد من نجاح التشغيل

افتح المتصفح أو Postman على:
```
GET http://localhost:5000/api/health
```

يجب أن يعيد:
```json
{
  "success": true,
  "message": "الخادم يعمل بنجاح ✅",
  "environment": "development",
  "timestamp": "..."
}
```

---

## 4️⃣ خطة المراحل القادمة

- [x] **المرحلة 1**: الهيكلة، الإعدادات، الاتصال بقاعدة البيانات ✅
- [x] **المرحلة 2**: نماذج قاعدة البيانات (Users, Categories, Questions, GameSession) ✅
- [x] **المرحلة 3**: نظام المصادقة (Signup/Login/JWT/الصلاحيات) ✅
- [x] **المرحلة 4**: APIs الفئات والأسئلة ✅
- [ ] **المرحلة 5**: منطق اللعبة الكامل (بدء/إجابة/نقاط/أدوار/فائز/إعادة ضبط)
- [ ] **المرحلة 6**: نظام الدفع الحقيقي (Stripe webhooks)
- [ ] **المرحلة 7**: الأمان المتقدم (Validation شامل، منع الغش)
- [ ] **المرحلة 8**: بيانات تجريبية (Seed Data)
- [ ] **المرحلة 9**: التوثيق النهائي وجاهزية النشر

### 🆕 أُضيف في هذه الدفعة (متجر الألعاب + التحليلات الإدارية)

| الميزة | Endpoints |
|---|---|
| **مصادقة** | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| **فئات** | `POST /api/categories` (admin) · `GET /api/categories` · `GET /api/categories/:id` |
| **أسئلة داخل فئة** | `POST /api/categories/:categoryId/questions` (admin) · `GET /api/categories/:categoryId/questions` (مرتبة حسب difficultyScore) |
| **ألعاب** | `POST /api/games` (admin) · `GET /api/games` · `GET /api/games/:id` · `GET /api/games/:id/play` (يتحقق من الشراء) |
| **شراء** | `POST /api/games/purchase` · `GET /api/users/my-games` |
| **تحليلات إدارية** | `GET /api/admin/stats` (admin) — مستخدمين، زوار، توزيع دول، أرباح |

كل المسارات المحمية تتطلب رأس `Authorization: Bearer <token>` (يُستخرج التوكن من `/api/auth/login` أو `/api/auth/register`). مسارات `admin` تتطلب أن يكون `role = 'admin'` على حساب المستخدم (يمكن تعديله مباشرة في قاعدة البيانات لأول حساب، لا يوجد حالياً endpoint لترقية الصلاحيات تلقائياً).

تتبع الزوار (Visitor tracking) يعمل تلقائياً على كل طلب عبر middleware غير متزامن (Fire-and-forget) — لا حاجة لاستدعائه يدوياً، ولا يؤثر على زمن استجابة أي endpoint. الدولة تُستخرج محلياً عبر حزمة `geoip-lite` (قاعدة بيانات مضمّنة، بدون أي اتصال شبكي خارجي).

**ملاحظة مهمة**: حزمة `geoip-lite` جديدة في `package.json` — نفّذ `npm install` بعد سحب هذا التحديث قبل التشغيل.


---

## 5️⃣ كيف تضيف ميزة جديدة لاحقاً (مثال عام)

لإضافة أي ميزة جديدة (مثلاً "نظام شارات إنجاز" مستقبلاً)، اتبع نفس النمط:

1. أنشئ Model في `src/models/Badge.js`
2. أنشئ Controller في `src/controllers/badgeController.js`
3. أنشئ Routes في `src/routes/badgeRoutes.js`
4. اربطه في `src/app.js`:
   ```js
   app.use('/api/badges', require('./routes/badgeRoutes'));
   ```

هذا النمط الموحّد يعني أن أي مطور (أو أنت لاحقاً) يستطيع فهم أي ميزة جديدة بسرعة، لأنها كلها مبنية بنفس الطريقة بالضبط.

---

**جاهز للمرحلة 2؟** أخبرني وسننتقل مباشرة لتصميم نماذج قاعدة البيانات (Users, Categories, Questions, GameSession) مع شرح العلاقات بينها.

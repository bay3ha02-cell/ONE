// ==============================================
// Middleware تتبع الزوار (Visitor Tracking)
// يسجّل كل طلب وارد لأغراض التحليلات الإدارية (/api/admin/stats)
// مهم جداً: لا يُستخدم await على عملية الحفظ في قاعدة البيانات
// حتى لا يبطئ الرد على المستخدم بأي شكل (Fire-and-forget)
// أي خطأ في التتبع يُسجَّل في الـ console فقط ولا يوقف الطلب أبداً
// ==============================================

const geoip = require('geoip-lite');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { Visitor } = require('../models');

// لا داعي لتسجيل طلبات OPTIONS (CORS preflight) لأنها ليست زيارات حقيقية
const trackVisitor = (req, res, next) => {
  if (req.method !== 'OPTIONS') {
    // نُكمل تنفيذ التتبع في الخلفية دون انتظاره إطلاقاً
    setImmediate(() => {
      try {
        // استخراج IP الحقيقي حتى خلف Proxy/Load Balancer (مثل Render)
        const ip =
          (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
          req.socket?.remoteAddress ||
          'unknown';

        // GeoIP محلي بالكامل (قاعدة بيانات مضمّنة في الحزمة) - بدون أي طلب شبكي خارجي
        const geo = geoip.lookup(ip);
        const country = geo?.country || 'Unknown';

        // محاولة استخراج المستخدم إن وُجد توكن صالح، بدون فرض المصادقة (best-effort فقط)
        let userId = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          try {
            const decoded = jwt.verify(authHeader.split(' ')[1], config.jwtSecret);
            userId = decoded.id;
          } catch (_) {
            // توكن غير صالح أثناء التتبع فقط - نتجاهله بصمت، هذا ليس مكان فرض المصادقة
          }
        }

        Visitor.create({
          ip,
          country,
          path: req.originalUrl,
          method: req.method,
          userAgent: req.headers['user-agent'] || '',
          user: userId,
        }).catch((error) => {
          console.error('⚠️ فشل تسجيل زيارة (لن يؤثر على الطلب):', error.message);
        });
      } catch (error) {
        console.error('⚠️ خطأ في middleware تتبع الزوار:', error.message);
      }
    });
  }

  next();
};

module.exports = trackVisitor;

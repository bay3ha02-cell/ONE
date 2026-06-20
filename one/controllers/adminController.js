// ==============================================
// adminController
// /api/admin/stats: لوحة معلومات شاملة عن المنصة
// كل الاستعلامات هنا تُنفَّذ بالتوازي (Promise.all) لتقليل زمن الاستجابة
// ==============================================

const { User, Visitor, Purchase } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

// @desc    إحصائيات إدارية شاملة (مستخدمين، زوار، توزيع دول، أرباح)
// @route   GET /api/admin/stats
// @access  خاص - Admin فقط
const getStats = asyncHandler(async (req, res) => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    adminCount,
    totalVisitors,
    visitorsLast24h,
    visitorsLast7d,
    countryDistribution,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'admin' }),
    Visitor.countDocuments(),
    Visitor.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Visitor.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Visitor.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$pricePaid' }, purchaseCount: { $sum: 1 } } },
    ]),
  ]);

  // ملاحظة: الأرباح هنا محسوبة من سجلات الشراء الفعلية في قاعدة البيانات.
  // تبقى "Placeholder" بمعنى أنها ستعكس أرقاماً حقيقية تماماً فقط بعد ربط Stripe
  // webhook لتأكيد كل عملية دفع فعلياً (المرحلة القادمة في خطة المشروع)
  const revenue = revenueAgg[0]?.total || 0;
  const totalPurchases = revenueAgg[0]?.purchaseCount || 0;

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        admins: adminCount,
        regular: totalUsers - adminCount,
      },
      visitors: {
        total: totalVisitors,
        last24h: visitorsLast24h,
        last7d: visitorsLast7d,
      },
      countryDistribution: countryDistribution.map((c) => ({
        country: c._id || 'Unknown',
        count: c.count,
      })),
      revenue: {
        total: revenue,
        totalPurchases,
        note: 'قيمة محسوبة من سجلات الشراء الفعلية - ستصبح نهائية بعد تفعيل Stripe',
      },
    },
  });
});

module.exports = { getStats };

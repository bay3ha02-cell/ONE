// ==============================================
// asyncHandler
// يغلّف أي دالة Controller غير متزامنة (async) ويمرّر أي خطأ تلقائياً
// إلى next(error)، فيصل إلى errorMiddleware الموحّد
// بدون هذا، كان يجب كتابة try/catch يدوياً في كل controller
// ==============================================

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

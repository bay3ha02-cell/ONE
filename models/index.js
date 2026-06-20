// ==============================================
// ملف تجميعي لتصدير كل النماذج من مكان واحد
// يسهّل الاستيراد لاحقاً في أي مكان بالمشروع:
// const { User, Category, Question, GameSession } = require('../models');
// بدل كتابة 4 أسطر require منفصلة في كل ملف يحتاج أكثر من نموذج
// ==============================================

module.exports = {
  User: require('./User'),
  Category: require('./Category'),
  Question: require('./Question'),
  GameSession: require('./GameSession'),
  Game: require('./Game'),
  Purchase: require('./Purchase'),
  Visitor: require('./Visitor'),
};

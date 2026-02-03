// import sequelize from "../db.js";

// import User from "./User.js";

// import TraineeProfile from "./TraineeProfile.js";
// import TrainerProfile from "./TrainerProfile.js";
// import ChatSession from "./ChatSession.js";
// import Message from "./Message.js";
// // import Payment from "./Payment.js";
// import Report from "./Report.js";


// User.hasOne(TraineeProfile, { foreignKey: "userId" });
// TraineeProfile.belongsTo(User, { foreignKey: "userId" });


// User.hasOne(TrainerProfile, { foreignKey: "userId", as: "trainerProfile" });
// TrainerProfile.belongsTo(User, { foreignKey: "userId",  as: "user" });


// User.hasMany(ChatSession, {
//   foreignKey: "traineeId",
//   as: "TraineeChats"
// });
// User.hasMany(ChatSession, {
//   foreignKey: "trainerId",
//   as: "TrainerChats"
// });


// ChatSession.hasMany(Message, { foreignKey: "chatId" });
// Message.belongsTo(ChatSession, { foreignKey: "chatId" });


// // ChatSession.hasOne(Payment, { foreignKey: "chatId" });
// // Payment.belongsTo(ChatSession, { foreignKey: "chatId" });


// User.hasMany(Report, { foreignKey: "reportedUserId" });



// export default sequelize;

import sequelize from "../db.js";

import User from "./User.js";
import TraineeProfile from "./TraineeProfile.js";
import TrainerProfile from "./TrainerProfile.js";
import ChatSession from "./ChatSession.js";
import Message from "./Message.js";
import Report from "./Report.js";

/* ================= PROFILES ================= */

User.hasOne(TraineeProfile, {
  foreignKey: "userId",
  as: "traineeProfile"
});
TraineeProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "traineeUser"
});

User.hasOne(TrainerProfile, {
  foreignKey: "userId",
  as: "trainerProfile"
});
TrainerProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "trainerUser"
});

/* ================= CHAT ================= */

User.hasMany(ChatSession, {
  foreignKey: "traineeId",
  as: "TraineeChats"
});

User.hasMany(ChatSession, {
  foreignKey: "trainerId",
  as: "TrainerChats"
});

ChatSession.hasMany(Message, {
  foreignKey: "chatId",
  as: "messages"
});
Message.belongsTo(ChatSession, {
  foreignKey: "chatId",
  as: "chat"
});

/* ================= REPORT ================= */

User.hasMany(Report, {
  foreignKey: "reportedUserId",
  as: "reports"
});

/* ================= EXPORT ================= */

export {
  sequelize,
  User,
  TraineeProfile,
  TrainerProfile,
  ChatSession,
  Message,
  Report
};

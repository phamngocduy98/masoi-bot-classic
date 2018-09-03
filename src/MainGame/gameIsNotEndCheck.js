const { roomChatAll } = require('../Chat/Utils');

module.exports = (gamef, bot, userRoom, callback) => {
  let ret = false;
  gamef.getRoom(userRoom).gameIsEnd(async (winner) => {
    if (winner === 0) {
      ret = true;
      callback();
    } else {
      ret = false;
      console.log(`$ ROOM ${userRoom + 1} > END GAME > ${winner === -1 ? '🐺SÓI' : winner === 1 ? '💩DÂN' : '💞CẶP ĐÔI'} thắng!`);
      gamef.getRoom(userRoom).newLog(`${winner === -1 ? '🐺SÓI' : winner === 1 ? '💩DÂN' : '💞CẶP ĐÔI'} thắng!`);
      await roomChatAll(bot, gamef.getRoom(userRoom).players, 0, [`\`\`\`\n🏆Trò chơi đã kết thúc...\n${winner === -1 ? '🐺SÓI' : winner === 1 ? '💩DÂN' : winner === 3 ? '💞CẶP ĐÔI' : '🧚‍THIÊN SỨ'} thắng!\n\`\`\``, `🎮Bạn có thể sẵn sàng để bắt đầu chơi lại, hoặc tiếp tục trò chuyện với các người chơi khác trong phòng!`]);
      gamef.getRoom(userRoom).newLog(`🏆Trò chơi đã kết thúc với: ${gamef.getRoom(userRoom).wolfsCount} SÓI/ ${gamef.getRoom(userRoom).villagersCount} DÂN!`)
      await roomChatAll(bot, gamef.getRoom(userRoom).players, 0, gamef.getRoom(userRoom).logs.join(`\n`));
      //subscriber
      console.log(`$ ROOM ${userRoom + 1} > SUBSCRIBE REMINDER FOR ${gamef.getRoom(userRoom).subscriberList.length} PLAYERS`);
      if (gamef.getRoom(userRoom).subscriberList.length > 0) {
        roomChatAll(bot, gamef.getRoom(userRoom).players, 0, `🔔Đã có ${gamef.getRoom(userRoom).subscriberList.length} người chơi tham gia trong lúc phòng đang chơi!\n🔔Chờ họ quay lại nào!`);
      }
      gamef.getRoom(userRoom).subscriberList.forEach((joinID) => {
        bot.say(joinID, `🔔Trò chơi ở phòng ${userRoom + 1} đã kết thúc!\n🔔Hãy nhanh chóng tham gia phòng trước khi trò chơi bắt đầu lại!`);
        console.log(`>>> REMINDER: ${joinID}`);
      });
      gamef.getRoom(userRoom).resetRoom();
    }
  });
  return ret;
}
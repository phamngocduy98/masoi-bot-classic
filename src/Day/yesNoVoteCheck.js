const { roomChatAll } = require('../Chat/Utils');
const roomRoleChat = require('../Night/roomRoleChat');
const gameIsNotEndCheck = require('../MainGame/gameIsNotEndCheck');

exports = async (gamef, bot, userRoom) => {
    gamef.getRoom(userRoom).roleIsDone(async () => {
        gamef.getRoom(userRoom).cancelSchedule();
        let deathID = gamef.getRoom(userRoom).deathID;
        let deathRole = gamef.getRoom(userRoom).players[deathID].role;
        let deathRoleTxt = gamef.roleTxt[deathRole];
        let deathTxt = gamef.getRoom(userRoom).playersTxt[deathID];
        let dieCount = 0;
        let chatAllTxt = `👻Đã treo cổ ${deathTxt}!`;
        if (gamef.getRoom(userRoom).saveOrKill < 0) {
            gamef.getRoom(userRoom).newLog(`👻Mọi người đã treo cổ ${deathRoleTxt} *${deathTxt}* với ${(gamef.getRoom(userRoom).aliveCount() + gamef.getRoom(userRoom).saveOrKill) / 2} tha/${(gamef.getRoom(userRoom).aliveCount() - gamef.getRoom(userRoom).saveOrKill) / 2} treo`);
            gamef.getRoom(userRoom).kill();
            dieCount++;
            if (gamef.getRoom(userRoom).cupidsID.indexOf(gamef.getRoom(userRoom).players[deathID].joinID) != -1) { //người chết là cặp đôi
                dieCount++;
                let die1Index = gamef.getRoom(userRoom).cupidsID.indexOf(gamef.getRoom(userRoom).players[deathID].joinID); // index trong mảng cupidsID
                let die2JoinID = gamef.getRoom(userRoom).cupidsID[die1Index == 1 ? 0 : 1];
                let die2User = gamef.getRoom(userRoom).getPlayer(die2JoinID);
                chatAllTxt += `\n👻 *${die2User.first_name}* đã CHẾT!`;
                gamef.getRoom(userRoom).newLog(`👻Tình yêu đã giết chết ${gamef.roleTxt[gamef.getRoom(userRoom).getRoleByID(die2User.id)]} *${die2User.id}: ${die2User.first_name}*`);
                console.log(`$ ROOM ${userRoom + 1} > ${die2User.first_name} DIED!`);
            }
            chatAllTxt+='\nMọi người đi ngủ!';
            await roomChatAll(bot, gamef.getRoom(userRoom).players, 0, chatAllTxt);

        } else {
            await roomChatAll(bot, gamef.getRoom(userRoom).players, 0, `😇Đã tha chết cho ${deathTxt}! Mọi người đi ngủ`);
            gamef.getRoom(userRoom).newLog(`😇Mọi người tha chết cho ${deathRoleTxt} *${deathTxt}* với ${(gamef.getRoom(userRoom).aliveCount() + gamef.getRoom(userRoom).saveOrKill) / 2} tha/${(gamef.getRoom(userRoom).aliveCount() - gamef.getRoom(userRoom).saveOrKill) / 2} treo`);
        }
        gameIsNotEndCheck(gamef, bot, userRoom, () => {
            // Đêm tiếp theo
            gamef.getRoom(userRoom).dayNightSwitch();
            roomChatAll(bot, gamef.getRoom(userRoom).players, 0, `🌛Đêm thứ ${gamef.getRoom(userRoom).day}🌛`);
            gamef.getRoom(userRoom).newLog(`🌛Đêm thứ ${gamef.getRoom(userRoom).day}🌛++++++++++`);
            gamef.func(roomRoleChat, bot, userRoom);
        });
    })
}
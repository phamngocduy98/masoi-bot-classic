const { roomChatAll, roomWolfChatAll } = require('../Chat/Utils');
const nightDoneCheck = require('../Night/nightDoneCheck');
const dayVoteCheck = require('../Day/dayVoteCheck');

var wolfVote = async (gamef, bot, chat, userRoom, joinID, voteID) => {
    if (gamef.getRoom(userRoom).vote(joinID, voteID)) {
        if (voteID == -1) { //ăn chay (phiếu trống)
            await chat.say(`🍴Bạn đã vote ăn chay!`);
            roomWolfChatAll(bot, gamef.getRoom(userRoom).wolfsID, joinID, '🍴' + user.first_name + ' đã vote ăn chay!');
        } else {
            let voteKill = gamef.getRoom(userRoom).playersTxt[voteID];
            await chat.say(`🍗Bạn đã vote cắn ${voteKill}`);
            roomWolfChatAll(bot, gamef.getRoom(userRoom).wolfsID, joinID, '🍗' + user.first_name + ' đã vote cắn ' + voteKill);
        }
    } else {
        chat.say("```\nBạn không thể thực hiện vote 2 lần hoặc vote người chơi đã chết!\n```");
    }
    // kiểm tra đã VOTE xong chưa?
    gamef.func(nightDoneCheck, bot, userRoom);
}

var seerAction = async (gamef, bot, chat, user, userRoom, joinID, voteID) => {
    gamef.getRoom(userRoom).see(joinID, voteID, async (role) => {
        await chat.say(`${voteID} là ${(role == -1) ? '🐺SÓI' : role == 1 ? '🔍TIÊN TRI, Bạn đùa tớ à :v' : '💩PHE DÂN'}`);
        if (gamef.getRoom(userRoom).oldManID != undefined && gamef.getRoom(userRoom).oldManLive <= 0) { // già làng chết
            gamef.getRoom(userRoom).newLog(`🔍${user.first_name} soi *${gamef.getRoom(userRoom).playersTxt[voteID]}* ra 💩AUTO DÂN`);
        } else {
            gamef.getRoom(userRoom).newLog(`🔍${user.first_name} soi *${gamef.getRoom(userRoom).playersTxt[voteID]}* ra ${(role == -1) ? '🐺SÓI' : role == 1 ? '🔍TỰ SOI MÌNH' : '💩PHE DÂN'}`);
        }
    }, (err) => {
        chat.say('```\nBạn không thể soi 2 lần hoặc soi người chơi đã chết!\n```');
    })
    // kiểm tra đã hết đêm chưa?
    gamef.func(nightDoneCheck, bot, userRoom);
}

var saveAction = async (gamef, bot, chat, userRoom, joinID, voteID) => {
    if (!gamef.getRoom(userRoom).save(joinID, voteID)) {
        chat.say(`\`\`\`\nBạn không thể bảo vệ 1 người 2 đêm liên tiếp hoặc bảo vệ người chơi đã chết!\n\`\`\``);
    } else {
        await chat.say(`🗿Bạn đã bảo vệ ${gamef.getRoom(userRoom).playersTxt[voteID]}!`);
        // kiểm tra đã hết đêm chưa?
        gamef.func(nightDoneCheck, bot, userRoom);
    }
}
var fireAction = async (gamef, bot, chat, userRoom, joinID, voteID, fireKill) => {
    if (!gamef.getRoom(userRoom).fire(joinID, voteID, fireKill)) {
        if (!fireKill) { // bị động
            chat.say(`\`\`\`\nBạn không thể ghim 1 người 2 đêm liên tiếp hoặc ghim người đã chết!\n\`\`\``);
        } else { // chủ động
            chat.say(`\`\`\`\nBạn chỉ được giết người còn sống!\n\`\`\``);
        }
    } else {
        if (voteID != -1) {
            await chat.say(`🔫Bạn đã ghim ${gamef.getRoom(userRoom).playersTxt[voteID]}!`);
            gamef.getRoom(userRoom).newLog(`🔫Thợ săn đã ghim *${gamef.getRoom(userRoom).playersTxt[voteID]}* !`);
        } else {
            await chat.say(`🔫Bạn đã bắn lên trời (không ghim ai)!`);
            gamef.getRoom(userRoom).newLog(`🔫Thợ săn đã bắn lên trời (không ghim ai)!`)
        }
        // kiểm tra đã hết đêm chưa?
        gamef.func(nightDoneCheck, bot, userRoom);
    }
}
var cupidAction = async (gamef, bot, chat, userRoom, joinID, voteID1, voteID2) => {
    if (!gamef.getRoom(userRoom).cupid(joinID, voteID1, voteID2)) {
        chat.say(`\`\`\`\nBạn chỉ được ghép đôi (1 lần duy nhất) 2 người tồn tại!\n\`\`\``);
    } else {
        await chat.say(`👼Bạn đã ghép cặp ${gamef.getRoom(userRoom).playersTxt[voteID1]} với ${gamef.getRoom(userRoom).playersTxt[voteID2]}!\nBạn đã hoàn thành nhiệm vụ và trở thành DÂN!`);
        gamef.getRoom(userRoom).newLog(`👼CUPID đã ghép cặp *${gamef.getRoom(userRoom).playersTxt[voteID1]}* với *${gamef.getRoom(userRoom).playersTxt[voteID2]}* !`)
        let user1 = gamef.getRoom(userRoom).players[voteID1];
        let user2 = gamef.getRoom(userRoom).players[voteID2];
        let thirdParty = ``;
        if (gamef.getRoom(userRoom).cupidTeam) {
            thirdParty = `👼Bạn giờ thuộc phe thứ 3 CẶP ĐÔI`;
        }
        bot.say(user1.joinID, `\`\`\`\n${thirdParty}\n👼Bạn đã bị ghép đôi với ${user2.first_name}\n/p <nội dung> để chat riêng\n\`\`\``);
        bot.say(user2.joinID, `\`\`\`\n${thirdParty}\n👼Bạn đã bị ghép đôi với ${user1.first_name}\n/p <nội dung> để chat riêng\n\`\`\``);

        roomChatAll(bot, gamef.getRoom(userRoom).players, joinID, '```\n👼Thần tình yêu đã ghép đôi thành công\n```');
        // kiểm tra đã hết đêm chưa?
        gamef.func(nightDoneCheck, bot, userRoom);
    }
}

var witchAction = async (gamef, bot, chat, userRoom, voteID) => {
    if (!gamef.getRoom(userRoom).witchKillVote(voteID)) {
        chat.say(`\`\`\`\nBạn không thể giết người chơi đã chết!\n\`\`\``);
    } else {
        await chat.say(`⛔Bạn đã giết ${gamef.getRoom(userRoom).playersTxt[voteID]}!`);
        // gamef.getRoom(userRoom).newLog(`⛔Phù thủy ${gamef.getRoom(userRoom).getPlayer(gamef.getRoom(userRoom).witchID).first_name} đã giết *${gamef.getRoom(userRoom).playersTxt[voteID]}* !`)
        // kiểm tra đã hết đêm chưa?
        gamef.func(nightDoneCheck, bot, userRoom);
    }
}

var dayVote = async (gamef, bot, chat, user, userRoom, joinID, voteID) => {
    if (gamef.getRoom(userRoom).vote(joinID, voteID)) {
        if (voteID == -1) {
            await chat.say(`*✊Bạn đã từ chối bỏ phiếu!*`);
            roomChatAll(bot, gamef.getRoom(userRoom).players, joinID, `*✊${user.first_name} đã từ chối bỏ phiếu*`);
        } else {
            let voteKill = gamef.getRoom(userRoom).playersTxt[voteID];
            await chat.say(`*✊Bạn đã vote treo cổ ${voteKill} (${gamef.getRoom(userRoom).voteList[voteID]} phiếu)*`);
            roomChatAll(bot, gamef.getRoom(userRoom).players, joinID, `*✊${user.first_name} đã vote treo cổ ${voteKill} (${gamef.getRoom(userRoom).voteList[voteID]} phiếu)*`);
        }
    } else {
        chat.say('```\nBạn chỉ được vote MỘT lần cho MỘT người còn sống!\n```');
    }
    // kiểm tra đã VOTE XONG chưa?
    gamef.func(dayVoteCheck, bot, userRoom);
}

module.exports = {
    wolfVote: wolfVote,
    seerAction: seerAction,
    saveAction: saveAction,
    fireAction: fireAction,
    cupidAction: cupidAction,
    witchAction: witchAction,
    dayVote: dayVote,
};
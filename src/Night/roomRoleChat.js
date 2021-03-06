const { asyncForEach, roomChatAll, sendImageCard } = require('../Chat/Utils');
const gameIsNotEndCheck = require('../MainGame/gameIsNotEndCheck');

module.exports = async function (gamef, bot, userRoom) {
    let wolfListTxt = gamef.getRoom(userRoom).wolfsTxt.join(' ; ');
    let villagersListTxt = gamef.getRoom(userRoom).villagersTxt.join(' ; ');
    let playersListTxt = gamef.getRoom(userRoom).playersTxt.join(' ; ');
    let gameIsNotEnd = true;

    let playerList = gamef.getRoom(userRoom).getAlivePlayerList();
    let villagerList = gamef.getRoom(userRoom).getAliveVillagerList();

    // giết người afk
    gamef.getRoom(userRoom).players.forEach((p) => {
        if (p && p.afkCount >= 6) {
            gamef.getRoom(userRoom).killAction(p.id);
            roomChatAll(bot, gamef.getRoom(userRoom).players, 0, `\`\`\`\n👻 *${p.first_name}* đã bị giết (uy tín < 0)\n\`\`\``);
            gamef.getRoom(userRoom).newLog(`👻 *${p.first_name}* đã bị giết (uy tín < 0)`);
        }
        if (p && p.role == 9 && gamef.getRoom(userRoom).day >= 2) {
            gamef.getRoom(userRoom).setPlayersRole(p.id, 4);
        }
    });
    gameIsNotEnd = gameIsNotEndCheck(gamef, bot, userRoom, () => { });
    // đếm giờ ban đêm
    gameIsNotEnd ? gamef.getRoom(userRoom).players.every((p, index, players) => {
        if (p && gamef.getRoom(userRoom).alivePlayer[p.joinID]) {
            if (p.role == -2 || p.role == 4 || p.role == 6 || p.role == 5 || p.role == 8 || p.role == 9) { //BÁN SÓI / DÂN / GIÀ LÀNG / PHÙ THỦY / NGƯỜI HÓA SÓI / THIÊN SỨ
                if (gamef.getRoom(userRoom).nguyenID == p.joinID && gamef.getRoom(userRoom).wolfsCount == 1) { // kẻ bị nguyền là con sói cuối
                    let time = new Date(Date.now() + 30 * 1000);
                    players[index].addSchedule(time, () => {
                        let time = new Date(Date.now() + 30 * 1000);
                        bot.say(p.joinID, {
                            text: `⏰Hết giờ! Còn 30 giây để cắn...`,
                            quickReplies: ["/evote"],
                        });
                        console.log(`$ ROOM ${userRoom + 1} > TIMER > WOLF > 30 SECONDS REMAINING`);
                        players[index].addSchedule(time, () => {
                            console.log(`$ ROOM ${userRoom + 1} > AUTO ROLE > WOLF`);
                            bot.say(p.joinID, '```\n⏰Bạn đã ngủ quên mà không cắn ai! (-50 uy tín)\n```');
                            gamef.getRoom(userRoom).roleDoneBy(p.joinID, true);
                            gamef.func(nightDoneCheck, bot, userRoom);
                        });
                    });
                    return true;
                } else {
                    return true;
                }
            }

            if (p.role == -1 || p.role == -3) { // SÓI có 1 phút 30 giây
                let time = new Date(Date.now() + 60 * 1000);
                players[index].addSchedule(time, () => {
                    let time = new Date(Date.now() + 30 * 1000);
                    bot.say(p.joinID, {
                        text: `⏰Hết giờ! Còn 30 giây để vote...`,
                        quickReplies: ["/evote"],
                    });
                    console.log(`$ ROOM ${userRoom + 1} > TIMER > WOLF > 30 SECONDS REMAINING`);
                    players[index].addSchedule(time, () => {
                        console.log(`$ ROOM ${userRoom + 1} > AUTO ROLE > WOLF`);
                        bot.say(p.joinID, '```\n⏰Bạn đã ngủ quên mà không cắn ai! (-50 uy tín)\n```');
                        gamef.getRoom(userRoom).autoRole(p.joinID, p.role);
                        gamef.func(nightDoneCheck, bot, userRoom);
                    });
                });
            } else {
                let time;
                if (p.role == 7) { // CUPID có 40 giây
                    time = new Date(Date.now() + 20 * 1000);
                } else { // còn lại: Tiên tri, bảo vệ, thợ săn, phù thủy có 1 phút
                    time = new Date(Date.now() + 40 * 1000);
                }
                players[index].addSchedule(time, () => {
                    bot.say(p.joinID, {
                        text: `⏰Bạn còn 20 giây để thực hiện...`,
                        quickReplies: ["/evote"],
                    });
                    console.log(`$ ROOM ${userRoom + 1} > TIMER > 20 SECONDS REMAINING`);
                    let time = new Date(Date.now() + 20 * 1000);
                    players[index].addSchedule(time, () => {
                        bot.say(p.joinID, '```\n⏰Hết giờ! Bạn đã mất quyền năng! (-50 uy tín)\n```');
                        gamef.getRoom(userRoom).autoRole(p.joinID, p.role);
                        console.log(`$ ROOM ${userRoom + 1} > AUTO ROLE > ${p.first_name} > ${p.role}`);
                        gamef.func(nightDoneCheck, bot, userRoom);
                    });
                });
            }
        }
        return true;
    }) : null;

    gameIsNotEnd ? await asyncForEach(gamef.getRoom(userRoom).players, (p) => {
        if (p && gamef.getRoom(userRoom).alivePlayer[p.joinID]) {
            console.log(`$ ROOM ${userRoom + 1} > ${gamef.roleTxt[p.role]} > ${p.first_name}`);

            let preTxt = ``;

            if (gamef.getRoom(userRoom).cupidsID.indexOf(p.joinID) != -1) {
                if (gamef.getRoom(userRoom).cupidTeam) {
                    preTxt += `💘Bạn thuộc PHE CẶP ĐÔI (thứ 3)!\n💘Bảo vệ tình yêu của mình và tiêu diệt các người chơi khác để dành chiến thắng!\n`;
                }
                preTxt += `💞ID CẶP ĐÔI:\n${gamef.getRoom(userRoom).cupidsTxt.join(' ; ')}\n\n`;
            }

            preTxt += `💎Uy tín của bạn là: ${(6 - p.afkCount) * 10}/60\n\n`;

            let autoRoleDone = true;
            if (gamef.getRoom(userRoom).nguyenID == p.joinID) {
                if (gamef.getRoom(userRoom).wolfsCount == 1) { // còn một mình kẻ bị sói nguyền
                    autoRoleDone = false;
                    preTxt += `🐺Bạn là con SÓI cuối cùng!\n"/vote <số id>" để cắn\n${playersListTxt}\n\n`;
                } else {
                    preTxt += `🐺ID TEAM SÓI:\n${wolfListTxt}\n🐺Bạn đã bị nguyền và theo phe SÓI!\n"/p <nội dung>" để chat với phe sói\n\n`;
                }
            }

            if (p.role == -1) {//SÓI
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278418034541', 'Ma sói')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + `🐺Sói ơi dậy đi! Đêm nay sói muốn cắn ai?\n"/vote <số ID>" để cắn ai đó\nVD: "/vote 1" để cắn ${gamef.getRoom(userRoom).players[1].first_name}\n👥ID TẤT CẢ:\n${playersListTxt}\n🐺ID TEAM SÓI:\n${wolfListTxt}\n🎅ID TEAM DÂN:\n${villagersListTxt}`,
                            quickReplies: playerList,
                        });
                    });
            } else if (p.role == -3) {//SÓI NGUYỀN
                let nguyenTxt;
                if (gamef.getRoom(userRoom).soiNguyen) {
                    nguyenTxt = `🐺Sói nguyền dậy đi!`;
                } else {
                    nguyenTxt = `🐺Sói ơi dậy đi!`;
                }
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1897745170521199', 'Sói nguyền')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + nguyenTxt + `Đêm nay sói muốn cắn ai?\n"/vote <số ID>" để cắn ai đó\nVD: "/vote 1" để cắn ${gamef.getRoom(userRoom).players[1].first_name}\n👥ID TẤT CẢ:\n${playersListTxt}\n🐺ID TEAM SÓI:\n${wolfListTxt}\n🎅ID TEAM DÂN:\n${villagersListTxt}`,
                            quickReplies: playerList,
                        });
                    });
            } else if (p.role == 1) { // tiên tri
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278528034530', 'Tiên tri')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + `👁Tiên tri dậy đi! Tiên tri muốn kiểm tra ai?\n"/see <số ID>" để kiểm tra\n${playersListTxt}`,
                            quickReplies: ["/evote"],
                        });
                    });
            } else if (p.role == 2) { // Bảo vệ
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278331367883', 'Bảo vệ')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + `🛡Bảo vệ dậy đi! Đêm nay bạn muốn bảo vệ ai?\n"/save <số ID>" để bảo vệ\n${playersListTxt}`,
                            quickReplies: ["/evote"],
                        });
                    });
            } else if (p.role == 3) { // Thợ săn
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278518034531', 'Thợ săn')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + `🏹Thợ săn dậy đi! Đêm nay bạn muốn bắn ai?\n"/fire <số ID>" để ghim\n"/kill <số ID>" để bắn chết luôn\n${playersListTxt}`,
                            quickReplies: ["/evote"],
                        });
                    });
            } else if (p.role == -2) { // Bán sói
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278411367875', 'Bán sói')
                    .then(() => {
                        bot.say(p.joinID, preTxt + `🐺Bạn là BÁN SÓI!\nBạn vẫn còn là DÂN nhưng theo phe SÓI\nID CẢ LÀNG:\n${playersListTxt}`);
                    });
            } else if (p.role == 5) { // Phù thủy
                let sayTxt;
                if (gamef.getRoom(userRoom).witchKillRemain) {
                    sayTxt = `🧙‍Bạn là Phù thủy!\n${gamef.getRoom(userRoom).witchSaveRemain ? '☑Bạn còn quyền cứu' : '⛔Bạn đã dùng quyền cứu!'}\n☑Bạn còn quyền giết\n(Bạn vẫn có thể sử dụng lệnh /kill)\n${playersListTxt}`;
                } else {
                    sayTxt = `🧙‍Bạn là Phù thủy!\n${gamef.getRoom(userRoom).witchSaveRemain ? '☑Bạn còn quyền cứu' : '⛔Bạn đã dùng quyền cứu!'}\n⛔Bạn đã dùng quyền giết!\n${playersListTxt}`;
                }
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278464701203', 'Phù thủy')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + sayTxt,
                            quickReplies: ["/evote"],
                        });
                    });
            } else if (p.role == 6) { // GIÀ LÀNG
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278381367878', 'Già làng')
                    .then(() => {
                        bot.say(p.joinID, preTxt + `👴Bạn là Già làng! Bảo trọng =))\n${playersListTxt}`);
                    });
            } else if (p.role == 7) { // THẦN TÌNH YÊU
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278324701217', 'Thần tình yêu')
                    .then(() => {
                        bot.say(p.joinID, {
                            text: preTxt + `👼Bạn là THẦN TÌNH YÊU!\n/cupid <id1> <id2> để ghép đôi\n${playersListTxt}`,
                            quickReplies: ["/evote"],
                        });
                    });
            } else if (p.role == 8) { // NGƯỜI HÓA SÓI
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1891874781108238', 'Người hóa sói')
                    .then(() => {
                        bot.say(p.joinID, preTxt + `👽Yên tâm, bạn là DÂN tuy nhiên tiên tri thì không nghĩ vậy :v`);
                    });
            } else if (p.role == 9) { // THIÊN SỨ
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1903763679919348', 'Thiên sứ')
                    .then(() => {
                        bot.say(p.joinID, preTxt + `🧚‍Bạn là THIÊN SỨ\nHãy chết ở ngày đầu tiên để dành chiến thắng!`);
                    });
            } else { // DÂN
                autoRoleDone ? gamef.getRoom(userRoom).roleDoneBy(p.joinID, false, true) : false;
                return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1889278298034553', 'Dân thường')
                    .then(() => {
                        bot.say(p.joinID, preTxt + `🎅Bạn là thường dân! Ngủ tiếp đi :))\n${playersListTxt}`);
                    });
            }
        } else {
            return sendImageCard(bot, p.joinID, 'https://www.facebook.com/masoibot/photos/pcb.1889279921367724/1898943877067995', 'Bạn đã chết')
                .then(() => {
                    bot.say(p.joinID, `💀Đêm nay bạn đã chết =))\n${playersListTxt}`);
                });
        }
    }) : null;
}
const nightDoneCheck = require('../Night/nightDoneCheck');
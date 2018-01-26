var W = 800,
    H = 600;
var roles = {
    '花喵当道': {
        roleImg: 'role_nam_01',
        state: {
            x: 0,
            y: 0,
            imageIndex: 0
        },
        name: '花喵当道',
        chatText: '我的天哈啊啊啊啊'
    }
};
var images = {};
var keydown = false;
var myName = '花喵当道';

$(function () {
    var context = document.querySelector('#stage').getContext('2d');
    context.canvas.width = W;
    context.canvas.height = H;
    $.get("/getResources",
        function (data, textStatus) {
            var imgs = data.imgs;
            var promises = [];
            if (textStatus === 'success') {
                for (var i = 0; i < imgs.length; i++) {
                    promises.push(loadImages(imgs[i]))
                }
            }
            Promise
                .all(promises)
                .then(function (results) {
                    console.log('资源加载完成');
                    drawStage(context, '../images/bg.png');
                    drawRole(context);
                    changeRoleState(myName, 0);
                    setInterval(function () {
                        context.clearRect(0, 0, W, H);
                        drawStage(context, '../images/bg.png');
                        drawRole(context);
                    }, 50);
                    keyboardJS.watch(document);
                    keyboardJS.bind('space', function (e) {
                        var step = 7;
                        if (!keydown) {
                            changeRoleState(myName, 3)
                            window.clearInterval(window[myName + 'jump']);
                            window[myName + 'jump'] = setInterval(function () {
                                if (step < 2) {
                                    step = -7 - step * 0.95;
                                } else {
                                    step = step * 0.95;
                                }
                                roles[myName].state.y += step
                                console.log(roles[myName].state.y);
                                if (roles[myName].state.y <= 0) {
                                    roles[myName].state.y = 0;
                                    window.clearInterval(window[myName + 'jump']);
                                    changeRoleState(myName, 0)
                                    keydown = false;
                                }
                            }, 16);
                        }
                        keydown = true;
                    });

                    keyboardJS.bind('left', function (e) {
                        if (!keydown) {
                            changeRoleState(myName, 2)
                        }
                        keydown = true;
                        roles[myName].state.x -= 4
                        roles[myName].state.isfilp = true;
                    }, function () {
                        changeRoleState(myName, 0)
                        keydown = false;
                    });

                    keyboardJS.bind('right', function (e) {
                        if (!keydown) {
                            changeRoleState(myName, 2)
                        }
                        keydown = true;
                        if (roles[myName].state.x) {

                        }
                        roles[myName].state.x += 4
                        roles[myName].state.isfilp = false;
                    }, function () {
                        changeRoleState(myName, 0)
                        keydown = false;
                    });

                    keyboardJS.bind('down', function (e) {
                        if (!keydown) {
                            changeRoleState(myName, 1)
                        }
                        keydown = true;
                    }, function () {
                        changeRoleState(myName, 0)
                        keydown = false;
                    });
                });
        },
        "json"
    );
})

function loadImages(filename) {
    var bgImage = new Image();
    bgImage.src = '../images/' + filename + '.png';
    var p = new Promise(function (resolve, reject) {
        bgImage.onload = function () {
            if (filename.indexOf('/') !== -1) {
                filename = filename.split('/')[1]
            }
            images[filename] = bgImage;
            resolve(filename);
        }
    });
    return p;
}

function drawStage(ctx, imageUrl) {
    ctx.rect(0, 0, W, H);
    ctx.fillStyle = ctx.createPattern(images.bg, 'no-repeat');;
    ctx.fill();
}

function drawRole(context) {
    for (var i in roles) {
        var img = images[roles[i].roleImg]
        var role = roles[i]
        //画人物动作
        context.save();
        //判断是否向左走，向左走得水平翻转人物
        if (role.state.isfilp) {
            context.translate(800, 0);
            context.scale(-1, 1);
            context.drawImage(img, role.state.imageIndex * img.width / 9, 0, img.width / 9, img.height, 800 - (20 + role.state.x + img.width / 9), 480 - img.height - role.state.y, img.width / 9, img.height);
        } else {
            context.drawImage(img, role.state.imageIndex * img.width / 9, 0, img.width / 9, img.height, 20 + role.state.x, 480 - img.height - role.state.y, img.width / 9, img.height);
        }
        context.restore();
        //画人物名字框
        context.beginPath();
        context.lineJoin = "round";
        context.lineWidth = 8;
        context.strokeStyle = 'rgba(0,0,0,.3)';
        context.strokeRect(10 + role.state.x + (img.width / 9 - role.name.length * 12 + 16) / 2, 480 + 8 - role.state.y, role.name.length * 12, 8);
        context.font = '12px 宋体';
        context.fillStyle = '#fff';
        context.fillText(role.name, 10 + role.state.x + (img.width / 9 - role.name.length * 12 + 16) / 2, 480 + 16 - role.state.y);
        context.closePath();
        if (role.chatText.length !== 0) {
            var length = role.chatText.length;
            drawChatText(context, role.chatText, role.state.x, role.state.y, img.width / 9, img.height)
        }
    }
}

//聊天文字渲染
function drawChatText(context, text, x, y, roleWidth, roleHeight) {
    var len = text.length,
        count = 0,
        line = [],
        oneLine = '';
    //单行文字截取，一行14个字节长度。中文=2，英文=1
    for (var i = 0; i < len; i++) {
        if (/[^\x00-\xff]/.test(text[i])) {
            count += 2;
        } else {
            count += 1;
        }
        oneLine += text[i]
        if (count == 13) {
            if (/[^\x00-\xff]/.test(text[++i])) {
                line.push(oneLine)
                count = 0;
                oneLine = '';
                i--;
            }
        } else if (count == 14) {
            line.push(oneLine)
            oneLine = '';
            count = 0;
        }
    }
    line.push(oneLine)

    var textHeight = line.length * 16,
        starY = 480 - y - roleHeight - images.chat_bg3.height,
        startX = 20 + x + (roleWidth - images.chat_bg3.width) / 2;
    //画聊天框底边
    context.drawImage(images.chat_bg3, startX, starY, images.chat_bg3.width, images.chat_bg3.height);
    //画聊天框内容背景
    for (var i = 1; i < textHeight + 1; i++) {
        context.drawImage(images.chat_bg2, startX, starY - i, images.chat_bg2.width, images.chat_bg2.height);
    }
    //画聊天框顶边
    context.drawImage(images.chat_bg1, startX, starY - textHeight - images.chat_bg1.height, images.chat_bg1.width, images.chat_bg1.height);
    //在聊天框上写字
    for (var i = 0; i < line.length; i++) {
        context.beginPath();
        context.font = '12px 宋体';
        context.fillStyle = '#000';
        context.fillText(line[i], 5 + startX, starY - textHeight - images.chat_bg1.height + (i + 1) * 16);
        context.closePath();
    }
}

function changeRoleState(roleanme, state) {
    window.clearInterval(window[roleanme])
    var rule = [0, 1, 2, 1],
        fun, speed = 0,
        index = 1;
    if (state == 0) {
        console.log('站');
        speed = 500;
        roles[roleanme].state.imageIndex = 0;
        fun = function () {
            if (index == rule.length) {
                index = 0;
            }
            roles[roleanme].state.imageIndex = rule[index++]
        }
    } else if (state == 1) {
        console.log('趴');
        speed = 0;
        fun = function () {
            index = 0;
            roles[roleanme].state.imageIndex = 8
        }
    } else if (state == 2) {
        console.log('走');
        speed = 150;
        rule = [3, 4, 5, 6];
        roles[roleanme].state.imageIndex = 1;
        fun = function () {
            if (index == rule.length) {
                index = 0;
            }
            roles[roleanme].state.imageIndex = rule[index++]
        }
    } else if (state == 3) {
        console.log('跳');
        speed = 0;
        fun = function () {
            index = 0;
            roles[roleanme].state.imageIndex = 7
        }
    }
    window[roleanme] = setInterval(fun, speed);
}
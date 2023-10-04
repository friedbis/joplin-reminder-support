//joplin_config.js
/*
 *
 * Sample of joplin-reminder-support config
 *
 **/
config={
    sync: joplin.process + " " + "sync --use-lock 0",
    syncResult: "完了",
    decrypt: joplin.process + " " + "e2ee decrypt",
    decResult: "完了",
    use: joplin.process + " " + "use" + " 仕事タスク",
    getnote: joplin.process + " " + "ls" + " | grep -E \"(ToDo|Work|Alarm)\" |sed -e 's/^\\[[^\\]]*\\] //g'",
    catnote: joplin.process + " " + "cat",
    tagAlarmPattern: "<span class=\"alarm\"",
    tagToDoPattern: "<span class=\"todo\"",
    noticeUrl: "{WEBHOOKURL}"
};

module.exports=config;

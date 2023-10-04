const { exec } = require('child_process');
const { execSync } = require('child_process');
const joplin_config = require('./joplin_config');

/**
 *
 * joplin.exec={
 *    sync: joplin.process + " " + "sync --use-lock 0",
 *    syncResult: "done",
 *    decrypt: joplin.process + " " + "e2ee decrypt",
 *    decResult: "done",
 *    use: joplin.process + " " + "use" + " short_term_task",
 *    getnote: joplin.process + " " + "ls" + " |sed -e 's/^\\[[^\\]]*\\] //g' " + " |grep \"mytask\"",
 *    catnote: joplin.process + " " + "cat",
 *    tagAlarmPattern: "<span class=\"alarm\"",
 *    tagToDoPattern: "<span class=\"todo\"",
 * };
 *
 */
var joplin={};
joplin.process="joplin";
joplin.exec={
    sync: joplin.process + " " + joplin_config.syncArgs,
    syncResult: joplin_config.syncResult,
    decrypt: joplin.process + " " + joplin_config.decryptArgs,
    decResult: joplin_config.decResult,
    use: joplin.process + " " + "use" + " " + joplin_config.useArgs,
    getnote: joplin.process + " " + "ls" + " " + " |sed -e 's/^\\[[^\\]]*\\] //g'" + joplin_config.lsArgs,
    catnote: joplin.process + " " + "cat",
    tagAlarmPattern: joplin_config.tagAlarmPattern,
    tagToDoPattern: joplin_config.tagToDoPattern,
};
joplin.notices=[];
joplin.notes=[];
var Notice={
    noticeType: null,
    noticeDateTime: null,
    noticeDescription: null,
    noticeUndone: null,
};

joplin.sync=async ()=>{
    return await exec(joplin.exec.sync, async (err, stdout, stderr)=>{
        if(err){
            console.log(`sync stderr: ${stderr}`);
            return await false;
        }
        console.log(`sync stdout: ${stdout}`);
        return await exec(joplin.exec.decrypt, async (err, stdout, stderr)=>{
            if(err){
                console.log(`decrypt stderr: ${stderr}`);
                return await false;
            }
            console.log(`decrypt stdout: ${stdout}`);
            return await true;
        });
    });
}

joplin.syncSync=async ()=>{
    const syncResult=execSync(joplin.exec.sync).toString();
    console.log("sync ["+syncResult+"]");
    //console.log(syncResult.search(`${joplin.exec.syncResult}`));
    if(syncResult.search(`${joplin.exec.syncResult}`)>-1){
        const decResult=execSync(joplin.exec.decrypt).toString();
        console.log("decrypt ["+decResult+"]");
        if(decResult.search(`${joplin.exec.decResult}`)>-1){
            return await true;
        }else{
            return await false;
        }
    }else{
        return await false;
    }
}

joplin.getnotes=async ()=>{
    return await exec(joplin.exec.use, async (err, stdout, stderr)=>{
        if(err){
            console.log(`use stderr: ${stderr}`);
            return await false;
        }
        console.log(`use stdout: ${stdout}`);
        console.log(joplin.exec.getnote);
        return await exec(joplin.exec.getnote, async (err, stdout, stderr)=>{
            if(err){
                console.log(`ls stderr: ${stderr}`);
                return await false;
            }
            console.log(`ls stdout: ${stdout}`);
            let notelist=[];
            notelist=stdout.split('\n');
            console.log(`notelist: ${notelist}`);
            return await notelist;
        });
    });
}

joplin.getnotesSync=async ()=>{
    const useResult=execSync(joplin.exec.use).toString();
    console.log("use ["+useResult+"]");
    if(useResult===""){
        const noteResult=execSync(joplin.exec.getnote).toString();
        console.log("note ["+noteResult+"]");
        if(noteResult!==""){
            joplin.notes=noteResult.split("\n");
            for(let i=0;i<joplin.notes.length;i++){
                joplin.notes[i]=joplin.notes[i].replace(/ /g,'');
            }
            joplin.notes.pop();
            return await joplin;
        }
    }
}

joplin.checkToDoAlarm=async ()=>{
    if(joplin.notes.length>0){
        let notices=[];
        let noticecol=[];
        let nowdatetime=new Date();
        console.log('note length ['+joplin.notes.length+']');
        joplin.notes.forEach((note)=>{
            let catResult=execSync(joplin.exec.catnote + " " + note).toString();
            let catResults=catResult.split('\n');
            catResults.forEach((result)=>{
                if(result.search(`${joplin.exec.tagAlarmPattern}`)>-1&&result.search(/\- \[ \]/)>-1){
                    notices.push(result.replace(/\- \[ \]/, ''));
                }
                if(result.search(`${joplin.exec.tagToDoPattern}`)>-1&&result.search(/\- \[ \]/)>-1){
                    notices.push(result.replace(/\- \[ \]/, ''));
                }
            });
        });
        notices.forEach((ntc)=>{
            var Notice={
                noticeType: null,
                noticeDateTime: null,
                noticeDescription: null,
                noticeUndone: null,
            };
            Notice.noticeType=ntc.replace(/^[^<]*<span class='([^']*)'[^$]*$/, '$1').toLowerCase();
            let ndatetime=ntc.replace(/^[^<]*<span[^>]*>([^<]*)<\/span>.*$/, '$1').replace(/([0-9][0-9][0-9][0-9])\-([0-9])\-/,'$1-0$2-').replace(/([0-9]) ([0-9]):/,'$1 0$2:').replace(/([0-9]) ([0-9])/,'$1T$2').replace(/\//g,'-');
            Notice.noticeDateTime=new Date(ndatetime);
            Notice.noticeDescription=ntc.replace(/^([^<]*)<.*$/, '$1').replace(/ /g,'');

            console.log(`Notice [${Notice.noticeType}]`);
            console.log(`Notice [${Notice.noticeDateTime}]`);
            console.log(`Notice [${Notice.noticeDescription}]`);
            noticecol.push(Notice);
        });
        noticecol.forEach((n)=>{
            let diffmsec=n.noticeDateTime - nowdatetime;
            let diffmin=parseInt(diffmsec/1000/60);
            let diffhour=parseInt(diffmin/60);
            let diffday=parseInt(diffhour/24);
            let diffmonth=parseInt(diffday/25);
            console.log(`diffmin [${diffmin}]`);
            console.log(`diffhour [${diffhour}]`);
            console.log(`diffday [${diffday}]`);
            let needToNotice=false;
            if(n.noticeType==="alarm"){
                if(diffmin<=0){
                    needToNotice=true;
                }
            }
            if(n.noticeType==="todo"){
                if(diffmin<=0
                    ||(diffmin<=31&&diffmin>=29)
                    ||(diffhour<=1&&diffmin>=59)
                    ||(diffday<=1&&diffhour>=23)
                    ||(diffday===7)){
                    needToNotice=true;
                }
            }
            if(needToNotice){
                joplin.notices.push(n);
            }
        });
        return await joplin.notices;
    }
}

module.exports=joplin;

const webcli = require('request');
const joplin = require('./joplin_sync');
const config = require('./joplin_config');
const thetimecoming="時間が来ました";
const thetimereminds="通知します";

var webNotify=(textMessage)=>{
    webcli.post({
        url: config.noticeUrl,
        headers: {
            "content-type": "application/json",
        },
        body: JSON.stringify({"text": textMessage}),
    }, (error, response, body)=>{
        console.log(body);
    });
}

var getnotes=async ()=>{
    let ret=await joplin.syncSync();
    console.log(`syncSync result[${ret}]`);
    if(ret){
        let result=await joplin.getnotesSync();
        console.log(`getnote [${result.notes}]`);
        if(result.notes.length>0){
            let result2=await joplin.checkToDoAlarm();
            result2.forEach((n)=>{
                let ndt=n.noticeDateTime;
                let formatteddt = `${ndt.getFullYear()}-${ndt.getMonth()+1}-${ndt.getDate()} ${ndt.getHours()}:${ndt.getMinutes()}:${ndt.getSeconds()}`;
                if(n.noticeType==="alarm"){
                    webNotify(thetimecoming+" TIME:"+formatteddt+" DESC:"+n.noticeDescription);
                }
                if(n.noticeType==="todo"){
                    webNotify(thetimereminds+" DUE:"+formatteddt+" DESC:"+n.noticeDescription);
                }
            });
        }
    }
}
getnotes();


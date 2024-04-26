schedule("* * * * *",function(){
const axios = require('axios');
const crypto = require("crypto");
debugger;

// Error reporting and timezone settings
//const crlf = process.env.NODE_ENV === 'cli' ? "\n" : "<br>\n";
const timeZone = 'Europe/Berlin';
const currentDate = new Date().toLocaleString("en-US", {timeZone: timeZone});

// Configuration
const host = 'https://eu-api-genergal.aisweicloud.com';
const apiKey = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // apikey for the inverter
const appKey = 'xxxxxxxxxxx'; // appkey for pro or consumer version
const appSecret = 'xxxxxxxxxxxxxxxxxxxxxxxxxxx';
const token = 'xxxxxxxxxxxxxxxxxxxxxxxxx'; // only needed for pro
const isnos= 'xxxxxxxxxxxxxxxxx'; //InverterID
console.debug ("Variablen sind gesetzt");

createStates();

/**
* @param {string} url
*/
async function GetFromAPI(url){
console.debug("Entering GetFromAPI with: " + host + url);
let url_to_sign = url;
let to_sign = `GET
application/json

application/json; charset=UTF-8

X-Ca-Key:204558926
` + url_to_sign;

console.debug("zu signierender String:"+to_sign);
const sha256Hasher = crypto.createHmac("sha256", appSecret);
const sign = sha256Hasher.update(to_sign).digest("base64");

//console.debug ("Signatur: "+sign_raw);
console.debug ("Signarur_base64: "+sign);
const config = {
    headers:{
        'Host': 'eu-api-genergal.aisweicloud.com',
        'User-Agent': 'app 1.0',
        'Content-Type': 'application/json; charset=UTF-8',
        'Accept': 'application/json',
        'X-Ca-Signature-Headers': 'X-Ca-Key',
        'X-Ca-Key': appKey,
        'X-Ca-Signature': sign,
    },
};



//let result = await axios.get( host + url + "?apikey="+apiKey+"&token="+token, config);
// let result = 

rest = await axios.get( host + url_to_sign, config)
.then(response => {
        // Handle response
        console.log(response.data);
        let json = response.data;
        let pac = parseInt(json.data[0].pac);
        let etd = json.data[0].etd /10 ;
        let eto = json.data[0].eto /10;
        console.log("ETD="+etd);
        console.log("PAC="+pac);
        console.log("ETO="+eto);
        setState("0_userdata.0.PV_Anlage.Solplanet.TotalPAC",pac,true);
        setState("0_userdata.0.PV_Anlage.Solplanet.E_Today",etd,true);
        setState("0_userdata.0.PV_Anlage.Solplanet.E_Total",eto,true);
        console.log("Rückgabe des calls: "+JSON.stringify(json, null, 4));
    })
    .catch(err => {
        // Handle errors
        console.error(err);
    }
);

}

var now = new Date();
const endDate = formatDate(now,"JJJJ-MM-TT SS:mm:ss");
now.setMinutes(now.getMinutes() - 11); // timestamp
const startDate =formatDate(now,"JJJJ-MM-TT SS:mm:ss");

const Tag = formatDate(now,"JJJJ-MM-TT");
console.log("EndDatum= "+endDate, 'info');
console.log("StartDatum= "+startDate,'info');
 


//var result = GetFromAPI("/pro/getDeviceListPro?apikey="+apiKey+"&token="+token);
var result = GetFromAPI("/pro/getLastTsDataPro?apikey="+apiKey+"&isnos="+isnos+"&token="+token);
//var result = GetFromAPI("/pro/getPlantOutputPro?apikey="+apiKey+"&date="+Tag+"&period=bydays"+"&token="+token); //Leistung alle 10 min?
//var result = await GetFromAPI("/pro/getInverterDataPagePro?apikey="+apiKey+"&endDate="+endDate+"&pageNum=1&pageSize=100&startDate="+startDate+"&token="+token);
//setState('0_userdata.0.PV_Anlage.Solplanet.Status', ))
/*
let etd = result.data.etd;
console.log("etd="+etd);
let eto = result.data.eto;
console.log("eto="+eto);
let pac = result.data.pac;
console.log("pac="+pac);
*/
function createStates(){


// Objekt erstellen
createState('0_userdata.0.PV_Anlage.Solplanet.Status',0, {
    name: 'PV-Anlage: Solplanet Status',
    desc: 'Status des Solplanet Wechselrichters',
    read: true,
    write: true,
    type: 'number'
    
});
createState('0_userdata.0.PV_Anlage.Solplanet.E_Total',0, {
    name: 'Solplanet Inverter Ertrag gesamt',
    desc: 'Solplanet Inverter Ertrag gesamt',
    read: true,
    write: true,
    type: 'number',
    unit: 'kWh'
}); 
createState('0_userdata.0.PV_Anlage.Solplanet.E_Today',0, {
    name: 'Solplanet Inverter Tagesertrag',
    desc: 'Solplanet Inverter Tagesertrag',
    read: true,
    write: true,
    type: 'number',
    unit: 'kWh'
}); 

createState('0_userdata.0.PV_Anlage.Solplanet.TotalPAC',0, {
    name: 'Solplanet Inverter Gesamtleistung',
    desc: 'Solplanet Inverter Gesamtleistung',
    read: true,
    write: true,
    type: 'number',
    unit: 'W'
}); 
};
console.debug(result);

});

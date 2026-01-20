import * as messaging from "messaging";
import { document } from "document";

const labelUSD = document.getElementById("labelUSD");
const labelEUR = document.getElementById("labelEUR");
const labelGOLD = document.getElementById("labelGOLD");
const labelSILVER = document.getElementById("labelSILVER");
const statusText = document.getElementById("statusText");
const btnRefresh = document.getElementById("btnRefresh");

// Başlangıç durumu
statusText.text = "Başlatılıyor...";

// 1. Mesaj Geldiğinde
messaging.peerSocket.onmessage = function(evt) {
  console.log("Cihaz: Veri alındı!");
  if (evt.data) {
    if (evt.data.success) {
      updateUI(evt.data);
    } else {
      statusText.text = evt.data.error || "Veri Hatası";
      statusText.style.fill = "fb-red";
    }
  }
}

// 2. Bağlantı Açıldığında (EN ÖNEMLİ KISIM)
messaging.peerSocket.onopen = function() {
  console.log("Cihaz: Bağlantı Hazır -> Veri isteniyor");
  statusText.text = "Güncelleniyor...";
  fetchData();
}

messaging.peerSocket.onerror = function(err) {
  console.log("Cihaz: Bağlantı Hatası -> " + err.code);
  statusText.text = "BT Hatası";
}

btnRefresh.onclick = function() {
  statusText.text = "İsteniyor...";
  fetchData();
}

function fetchData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    statusText.text = "Bağlanıyor...";
    // Socket açık değilse bile zorlamıyoruz, onopen tetiklenince isteyecek zaten.
  }
}

function updateUI(data) {
  labelUSD.text = `USD: ${data.usd}`;
  labelEUR.text = `EUR: ${data.eur}`;
  labelGOLD.text = `GR: ${data.gold}`;
  labelSILVER.text = `GM: ${data.silver}`;
  
  let today = new Date();
  let timeStr = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2);
  statusText.text = "Son: " + timeStr;
  statusText.style.fill = "#555555"; 
}

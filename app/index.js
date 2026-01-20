import * as messaging from "messaging";
import { document } from "document";

// UI Elementleri
const labelUSD = document.getElementById("labelUSD");
const labelEUR = document.getElementById("labelEUR");
const labelGOLD = document.getElementById("labelGOLD");
const labelSILVER = document.getElementById("labelSILVER");
const statusText = document.getElementById("statusText");
const btnRefresh = document.getElementById("btnRefresh");

// 1. Companion'dan mesaj (veri) geldiğinde
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    updateUI(evt.data);
  }
}

// 2. Hata takibi
messaging.peerSocket.onerror = function(err) {
  statusText.text = "Bağlantı Hatası";
  console.log("Hata: " + err.code + " - " + err.message);
}

// 3. Ekrana tıklayınca veri iste
btnRefresh.onclick = function() {
  statusText.text = "Güncelleniyor...";
  fetchData();
}

// Companion'a "Veri Getir" komutu yolla
function fetchData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    statusText.text = "Telefona Bağlan...";
  }
}

// Arayüzü güncelle
function updateUI(data) {
  // Verileri kontrol et, yoksa varsayılan koy
  labelUSD.text = `USD: ${data.usd || "--"}`;
  labelEUR.text = `EUR: ${data.eur || "--"}`;
  labelGOLD.text = `GR: ${data.gold || "--"}`;
  labelSILVER.text = `GM: ${data.silver || "--"}`;
  
  // Saat bilgisini ekrana yaz ki güncel olduğunu anlayalım
  let today = new Date();
  let timeStr = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2);
  statusText.text = "Son: " + timeStr;
}

// Uygulama açılışında otomatik iste
setTimeout(fetchData, 1500);

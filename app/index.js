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

// 1. Companion'dan mesaj geldiğinde
messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    if (evt.data.success) {
      // Veri başarılı geldi
      updateUI(evt.data);
    } else {
      // Companion hata mesajı yolladı
      statusText.text = evt.data.error || "Hata";
      statusText.style.fill = "red";
    }
  }
}

// 2. Bağlantı açıldığında
messaging.peerSocket.onopen = function() {
  statusText.text = "Veri İsteniyor...";
  statusText.style.fill = "#555555";
  requestData();
}

// 3. Bağlantı hatası
messaging.peerSocket.onerror = function(err) {
  statusText.text = "BT Hatası";
  statusText.style.fill = "red";
}

// Butona tıklayınca
btnRefresh.onclick = function() {
  statusText.text = "Yenileniyor...";
  requestData();
}

// Veri İsteme Fonksiyonu
function requestData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    statusText.text = "Telefona Bağlan...";
    statusText.style.fill = "orange";
  }
}

// Arayüzü Güncelle
function updateUI(data) {
  labelUSD.text = `USD: ${data.usd}`;
  labelEUR.text = `EUR: ${data.eur}`;
  labelGOLD.text = `GR: ${data.gold}`;
  labelSILVER.text = `GM: ${data.silver}`;
  
  let d = new Date();
  let timeStr = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  statusText.text = "Son: " + timeStr;
  statusText.style.fill = "#00FF00"; // Güncel olduğunu göstermek için yeşilimsi
}

// --- GÜVENLİK MEKANİZMASI ---
// Uygulama ilk açıldığında bağlantı hemen hazır olmayabilir.
// Bu yüzden 2 saniye sonra bir kere zorluyoruz.
setTimeout(requestData, 2000);

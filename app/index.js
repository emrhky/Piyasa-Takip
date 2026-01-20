import * as messaging from "messaging";
import { document } from "document";

const labelUSD = document.getElementById("labelUSD");
const labelEUR = document.getElementById("labelEUR");
const labelGOLD = document.getElementById("labelGOLD");
const labelSILVER = document.getElementById("labelSILVER");
const statusText = document.getElementById("statusText");
const btnRefresh = document.getElementById("btnRefresh");

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data) {
    if (evt.data.success) {
      updateUI(evt.data);
    } else {
      // Companion'dan gelen hata mesajını göster
      statusText.text = evt.data.error || "Veri Hatası";
      statusText.style.fill = "red"; // Hatayı kırmızı yap
    }
  }
}

messaging.peerSocket.onerror = function(err) {
  statusText.text = "BT Bağlantı Hatası";
  statusText.style.fill = "red";
}

btnRefresh.onclick = function() {
  statusText.text = "Yükleniyor...";
  statusText.style.fill = "#555555"; // Rengi normale döndür
  fetchData();
}

function fetchData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    statusText.text = "Telefona Bağlan...";
    statusText.style.fill = "red";
  }
}

function updateUI(data) {
  labelUSD.text = `USD: ${formatPrice(data.usd)}`;
  labelEUR.text = `EUR: ${formatPrice(data.eur)}`;
  labelGOLD.text = `GR: ${formatPrice(data.gold)}`;
  labelSILVER.text = `GM: ${formatPrice(data.silver)}`;
  
  let today = new Date();
  let timeStr = ("0" + today.getHours()).slice(-2) + ":" + ("0" + today.getMinutes()).slice(-2);
  statusText.text = "Son: " + timeStr;
  statusText.style.fill = "#555555";
}

// Fiyatları düzgün göstermek için yardımcı fonksiyon
function formatPrice(val) {
  if(!val || val === "0") return "--";
  // Gelen veri string olabilir, sayıya çevirip 2 hane göster
  let num = parseFloat(val.replace(",", "."));
  return isNaN(num) ? val : num.toFixed(2);
}

setTimeout(fetchData, 2000);

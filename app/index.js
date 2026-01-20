import * as messaging from "messaging";
import { document } from "document";

const labelUSD = document.getElementById("labelUSD");
const labelEUR = document.getElementById("labelEUR");
const labelGOLD = document.getElementById("labelGOLD");
const labelSILVER = document.getElementById("labelSILVER");
const statusText = document.getElementById("statusText");
const btnRefresh = document.getElementById("btnRefresh");

// İlk açılış
statusText.text = "Bekleniyor...";

// Mesaj Alımı
messaging.peerSocket.onmessage = function(evt) {
  console.log("Cihaz: Veri paketi geldi.");
  
  if (evt.data) {
    if(evt.data.success) {
      updateUI(evt.data);
    } else {
      statusText.text = evt.data.error || "Hata";
      statusText.style.fill = "red";
    }
  }
}

messaging.peerSocket.onopen = function() {
  statusText.text = "Bağlandı.";
  fetchData(); // Bağlanınca hemen iste
}

messaging.peerSocket.onerror = function() {
  statusText.text = "BT Hatası";
}

btnRefresh.onclick = function() {
  statusText.text = "Yenileniyor...";
  fetchData();
}

function fetchData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    statusText.text = "Telefona Bağlan...";
  }
}

function updateUI(data) {
  // Gelen veri zaten string ve düzeltilmiş olduğu için direkt basıyoruz
  labelUSD.text = `USD: ${data.usd}`;
  labelEUR.text = `EUR: ${data.eur}`;
  labelGOLD.text = `GR: ${data.gold}`;
  labelSILVER.text = `GM: ${data.silver}`;
  
  let d = new Date();
  let timeStr = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
  statusText.text = "Son: " + timeStr;
  statusText.style.fill = "#555555";
}

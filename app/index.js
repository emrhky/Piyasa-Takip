import * as messaging from "messaging";
import { document } from "document";

// Hata oluşursa ekrana basmak için güvenli fonksiyon
function logStatus(msg, color) {
  try {
    const el = document.getElementById("TXT_STATUS");
    if (el) {
      el.text = msg;
      el.style.fill = color || "white";
    }
  } catch (e) {
    console.log("Status hatası: " + e);
  }
}

// Güvenli başlatma
try {
  console.log("Uygulama başlatılıyor...");
  logStatus("JS Başlatıldı...", "yellow");

  // Elementleri Seç
  const ui = {
    usd: document.getElementById("TXT_USD"),
    eur: document.getElementById("TXT_EUR"),
    gold: document.getElementById("TXT_GOLD"),
    silver: document.getElementById("TXT_SILVER"),
    btn: document.getElementById("BTN_REFRESH")
  };

  // Buton Tıklama
  if (ui.btn) {
    ui.btn.onclick = function() {
      logStatus("Veri İsteniyor...", "cyan");
      fetchData();
    }
  }

  // Mesaj Geldiğinde (Companion'dan)
  messaging.peerSocket.onmessage = function(evt) {
    console.log("Mesaj alındı: " + JSON.stringify(evt.data));
    if (evt.data) {
      if (evt.data.error) {
        logStatus(evt.data.error, "red");
      } else {
        // Verileri Yazdır
        if(ui.usd) ui.usd.text = `USD: ${evt.data.usd}`;
        if(ui.eur) ui.eur.text = `EUR: ${evt.data.eur}`;
        if(ui.gold) ui.gold.text = `GR: ${evt.data.gold}`;
        if(ui.silver) ui.silver.text = `GM: ${evt.data.silver}`;
        
        let saat = new Date();
        let zaman = ("0" + saat.getHours()).slice(-2) + ":" + ("0" + saat.getMinutes()).slice(-2);
        logStatus("Son Güncelleme: " + zaman, "#55ff55");
      }
    }
  }

  // Bağlantı Durumları
  messaging.peerSocket.onopen = function() {
    logStatus("Telefona Bağlandı", "cyan");
    fetchData();
  }

  messaging.peerSocket.onerror = function(err) {
    logStatus("BT Hatası!", "red");
  }

  // İlk açılışta veriyi zorla iste (2 saniye sonra)
  setTimeout(fetchData, 2000);

} catch (err) {
  // Eğer burada bir hata çıkarsa ekranda göreceksin
  console.error("KRİTİK HATA: " + err);
  const errEl = document.getElementById("TXT_STATUS");
  if(errEl) errEl.text = "Kod Hatası!";
}

function fetchData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({ command: "update" });
  } else {
    logStatus("Telefona Bağlan...", "orange");
  }
}

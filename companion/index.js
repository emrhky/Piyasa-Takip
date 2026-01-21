import * as messaging from "messaging";

const API_URL = "https://finans.truncgil.com/today.json";

messaging.peerSocket.onmessage = function(evt) {
  if (evt.data && evt.data.command === "update") {
    fetchMarkets();
  }
}

function fetchMarkets() {
  fetch(API_URL)
  .then(response => {
    if (!response.ok) {
      throw new Error("Sunucu Hatası");
    }
    return response.json();
  })
  .then(data => {
    // İSTEĞİN ÜZERİNE 'Alis' VERİSİ KULLANILIYOR
    // Veri güvenliği: Veri yoksa "0" döner.
    let usd = parsePrice(data, "ABD DOLARI");
    let eur = parsePrice(data, "EURO");
    let gold = parsePrice(data, "GRAM ALTIN");
    let silver = parsePrice(data, "GÜMÜŞ");

    let packet = {
      success: true,
      usd: usd,
      eur: eur,
      gold: gold,
      silver: silver
    };

    sendToDevice(packet);
  })
  .catch(err => {
    console.error("Hata: " + err);
    sendToDevice({ success: false, error: "Veri Yok" });
  });
}

function parsePrice(data, key) {
  if (data && data[key] && data[key].Alis) {
    // Virgülü noktaya çevirip sadece string olarak döndürüyoruz
    // Ekrana sığması için uzun küsuratları kırpıyoruz (örn: 34.12)
    let val = data[key].Alis.replace(",", ".");
    let num = parseFloat(val);
    if(isNaN(num)) return "0.00";
    return num.toFixed(2); // Sadece virgülden sonra 2 basamak
  }
  return "0.00";
}

function sendToDevice(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  }
}

const WHATSAPP_NUMBER = "5534991258000";

function isMobile(): boolean {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
    navigator.userAgent
  );
}

export function openWhatsAppLink(message: string) {
  const encoded = encodeURIComponent(message);
  const url = isMobile()
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`
    : `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encoded}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

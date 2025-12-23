export type ToastType = "success" | "error" | "warning" | "info";

export class Toast {
  static show(message: string, type: ToastType = "info", timeout = 3000) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);
;
    if(type === "error" || type === "warning") {
      timeout = 5000;
    }


    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.2s";
      setTimeout(() => toast.remove(), 200);
    }, timeout);
  }
}

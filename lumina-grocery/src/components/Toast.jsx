import { useCart } from "../context/CartContext";

export default function Toast() {
  const { toast } = useCart();
  if (!toast) return null;

  const msg = typeof toast === "string" ? toast : toast.msg;
  const type = typeof toast === "object" ? toast.type : "success";

  const getIcon = () => {
    switch (type) {
      case "error":
        return { icon: "error", color: "text-red-500" };
      case "info":
        return { icon: "info", color: "text-blue-500" };
      default:
        return { icon: "check_circle", color: "text-emerald-600" };
    }
  };

  const { icon, color } = getIcon();

  return (
    <div className="fixed bottom-8 left-1/2 z-[200] toast-enter" style={{ transform: "translateX(-50%)" }}>
      <div className="glass-modal rounded-full px-6 py-3 flex items-center gap-3 shadow-[0_12px_40px_rgba(131,70,145,0.25)] border border-white/90">
        <span className={`material-symbols-outlined ${color} text-xl`}>{icon}</span>
        <span className="font-label text-xs md:text-sm font-semibold text-on-surface whitespace-nowrap">
          {msg}
        </span>
      </div>
    </div>
  );
}

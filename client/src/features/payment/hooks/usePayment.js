import { useMutation } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { createOrder, verifyPayment } from "../service/paymentService.js";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function usePayment(auctionId, auctionTitle) {
  const user = useSelector((state) => state.auth.user);

  return useMutation({
    mutationFn: async () => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Could not load the payment gateway. Check your connection and try again.");
      }

      const { order, keyId } = await createOrder(auctionId);

      return new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: keyId,
          amount: order.amount,
          currency: order.currency,
          name: "BidArena",
          description: auctionTitle,
          order_id: order.id,
          prefill: { email: user?.email },
          theme: { color: "#dd8b42" },
          handler: async (response) => {
            try {
              const result = await verifyPayment({
                auctionId,
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });
              resolve(result);
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
        });

        razorpay.open();
      });
    },
  });
}

import Button from "../../../shared/components/Button.jsx";
import { usePayment } from "../hooks/usePayment.js";

export default function PaymentButton({ auctionId, auctionTitle }) {
  const pay = usePayment(auctionId, auctionTitle);

  if (pay.isSuccess) {
    return (
      <p className="text-brand text-sm font-semibold text-center py-2">
        ✓ Payment completed
      </p>
    );
  }

  return (
    <div>
      <Button variant="primary" onClick={() => pay.mutate()} disabled={pay.isPending} className="w-full">
        {pay.isPending ? "Opening checkout..." : "Pay now →"}
      </Button>
      {pay.isError && (
        <p className="text-urgent text-sm text-center mt-2">
          {pay.error?.response?.data?.message || pay.error?.message || "Payment failed. Try again."}
        </p>
      )}
    </div>
  );
}

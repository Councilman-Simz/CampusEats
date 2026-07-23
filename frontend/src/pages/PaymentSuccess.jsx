function PaymentSuccess() {
  function returnHome() {
    window.history.replaceState({}, "", "/");
    window.location.reload();
  }

  localStorage.removeItem("campusEatsCart");

  return (
    <section className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-icon">✓</div>
        <p className="eyebrow">Payment complete</p>
        <h1>Thank you for your order</h1>
        <p>
          Your payment was successful. The restaurant
          will receive your confirmed order shortly.
        </p>

        <button type="button" onClick={returnHome}>
          Return to Savora
        </button>
      </div>
    </section>
  );
}

export default PaymentSuccess;

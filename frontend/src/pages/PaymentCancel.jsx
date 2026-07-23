function PaymentCancel() {
  function returnToMenu() {
    window.history.replaceState({}, "", "/");
    window.location.reload();
  }

  return (
    <section className="payment-result-page">
      <div className="payment-result-card">
        <div className="payment-result-icon">!</div>
        <p className="eyebrow">Payment cancelled</p>
        <h1>Your order was not paid</h1>
        <p>
          Your cart has been preserved. You can return
          to Savora and try the checkout again.
        </p>

        <button type="button" onClick={returnToMenu}>
          Return to Savora
        </button>
      </div>
    </section>
  );
}

export default PaymentCancel;

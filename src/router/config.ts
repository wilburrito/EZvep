const routes = [
  {
    path: ["/", "/home"],
    exact: true,
    component: "Home",
  },
  {
    path: ["/checkout"],
    exact: true,
    component: "Checkout",
  },
  {
    path: ["/thank-you"],
    exact: true,
    component: "ThankYou",
  },
  {
    path: ["/payment-success"],
    exact: true,
    component: "PaymentSuccess",
  },
  {
    path: ["/payment-cancel"],
    exact: true,
    component: "PaymentCancel",
  },
];

export default routes;

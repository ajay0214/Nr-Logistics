// Simple in-memory store shared across screens so OTP-confirmed orders
// (both "Confirm Pickup" and "Deliver") can be tracked and shown on the
// Delivered Orders screen, even though each confirmation happens on a
// different stack screen. No new library / context provider wiring
// needed — screens just import these functions directly.

let confirmedOrders = [];
let listeners = [];

function notify() {
  listeners.forEach(listener => listener(confirmedOrders));
}

// Adds (or updates, if same order) a confirmed order to the front of the list.
export function addConfirmedOrder(order) {
  if (!order) return;
  const key = order.orderId || order.id;
  confirmedOrders = [
    order,
    ...confirmedOrders.filter(
      existing => (existing.orderId || existing.id) !== key,
    ),
  ];
  notify();
}

export function getConfirmedOrders() {
  return confirmedOrders;
}

// Returns an unsubscribe function.
export function subscribeConfirmedOrders(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

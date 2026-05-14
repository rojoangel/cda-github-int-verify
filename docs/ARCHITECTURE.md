Order change listener architecture:
- Adobe Commerce emits com.adobe.commerce.observer.sales_order_save_commit_after.
- Adobe I/O Events forwards the payload to the Runtime action.
- The action validates the event, extracts the order ID, and persists an audit record in App Builder State.
- Audit records store orderId, timestamp, source, and eventId.
- Retry is applied for transient state write failures.

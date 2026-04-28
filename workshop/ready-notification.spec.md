# Spec: Food Ready Notification

## Selected Error from `feedback.md`

> "There's no notification when my food is ready. I just have to keep checking."

This is a good review candidate because it directly affects waiting time, user stress, and pickup flow.

## Problem

Students who pre-order still need to manually check if the order is ready. This creates uncertainty, crowding near the counter, and delayed pickups.

## Goal

Notify users as soon as their order status changes to `READY_FOR_PICKUP`.

## User Story

As a student who placed a canteen order,  
I want to receive a ready notification,  
so I can pick up my food on time without repeatedly checking.

## Functional Requirements

1. When canteen staff marks an order as `READY_FOR_PICKUP`, the system creates one notification event for that order.
2. The user sees an in-app notification badge and message on their next app interaction.
3. Notification content includes:
   - order reference
   - canteen name (or pickup point)
   - ready timestamp
4. A notification can be marked as read.
5. Duplicate ready notifications for the same order must be prevented.

## V1 Decision Log (Implementation Rules)

- **Trigger rule (V1):** Create a ready notification on any transition into `READY_FOR_PICKUP`, regardless of prior status.
- **Idempotency:** Notification creation must be idempotent. Repeated sets to `READY_FOR_PICKUP` must not create duplicates.
- **Delivery model (V1):** Notifications are pull-based (visible via notification fetch on next client interaction). Real-time delivery (SSE/WebSocket) is out of scope for V1.
- **User actions (V1):** Notifications support read/unread only; deletion is out of scope.
- **Duplicate prevention strategy:** Enforce both:
  - **DB hard guard:** unique constraint on (`orderId`, `type`)
  - **App guard:** pre-check and graceful skip/handle unique-conflict race

## Non-Goals (V1)

- Push notifications to device OS
- SMS / email delivery
- Escalation reminders if user does not collect

## Acceptance Criteria

1. Given a placed order, when status changes to `READY_FOR_PICKUP`, then one unread notification is visible to that user.
2. Given an order already notified as ready, when the status is updated again to `READY_FOR_PICKUP`, then no duplicate notification is created.
3. Given an unread ready notification, when user opens notifications and marks it read, then unread count decreases by one.
4. Given multiple users, each user can only see notifications for their own orders.

## Data/Domain Notes

- Suggested notification fields:
  - `id`
  - `userId`
  - `orderId`
  - `type` (`ORDER_READY`)
  - `title`
  - `body`
  - `readAt` (nullable)
  - `createdAt`

## Risks and Edge Cases

- Staff toggles order status accidentally; ensure idempotent notification creation.
- User has multiple active orders; notifications must remain per-order and clearly labeled.
- Late app opens; unread notifications must persist until read.

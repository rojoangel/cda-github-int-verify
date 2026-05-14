Deployment sequence:
1. Cleanup scaffolded files that are not needed for the order listener flow.
2. Update configuration in this order: EVENTS_SCHEMA.json, commerce-event-subscribe.json, events.json, starter-kit-registrations.json, app.config.yaml, env.dist.
3. Implement the action, validator, transformer, and state logger.
4. Run tests.
5. Deploy with aio app deploy.
6. Run npm run onboard.
7. Run npm run commerce-event-subscribe.

Environment:
- Set LOG_LEVEL for runtime logging.
- Set IIO_EVENTS_WEBHOOK_URL to the public webhook endpoint used by Adobe I/O Events.

Troubleshooting:
- If events do not arrive, confirm the webhook URL is reachable and uses HTTPS.
- If delivery fails, inspect action logs for signature and timestamp validation issues.
- If state persistence fails, verify App Builder State is enabled and the action has permission to initialize storage.
- If duplicate events appear, confirm event idempotency is handled at the consumer layer.

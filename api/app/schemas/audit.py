from pydantic import BaseModel


class AuditLogOut(BaseModel):
    id: int
    actor_user_id: int | None
    action: str
    entity_type: str
    entity_id: int | None
    before: dict | None
    after: dict | None
    created_at: str

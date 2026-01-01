from pydantic import BaseModel, EmailStr


class UserOut(BaseModel):
    id: int
    email: EmailStr
    role: str
    is_active: bool


class RegisterIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

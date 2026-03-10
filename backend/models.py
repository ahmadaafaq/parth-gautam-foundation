from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class User(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    name: str
    phone: str
    age_group: str
    ward: str
    occupation: str
    interests: List[str]
    citizen_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    volunteer_points: int = Field(default=0)
    programs_attended: int = Field(default=0)
    community_reports: int = Field(default=0)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class Program(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    title: str
    description: str
    category: str  # healthcare, education, community
    subcategory: str
    location: str
    ward: str
    date: Optional[str] = None
    seats_available: Optional[int] = None
    image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class CommunityIssue(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    issue_type: str
    description: str
    location: str
    ward: str
    image: Optional[str] = None
    status: str = Field(default="pending")  # pending, in_progress, resolved
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class ChatMessage(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    session_id: str
    role: str  # user, assistant
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class UserCreate(BaseModel):
    name: str
    phone: str
    age_group: str
    ward: str
    occupation: str
    interests: List[str]


class ProgramCreate(BaseModel):
    title: str
    description: str
    category: str
    subcategory: str
    location: str
    ward: str
    date: Optional[str] = None
    seats_available: Optional[int] = None
    image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class IssueCreate(BaseModel):
    user_id: str
    issue_type: str
    description: str
    location: str
    ward: str
    image: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class ChatRequest(BaseModel):
    user_id: str
    message: str
    session_id: str

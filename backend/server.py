from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List
from datetime import datetime
from bson import ObjectId
from models import (
    User, UserCreate, Program, ProgramCreate,
    CommunityIssue, IssueCreate, ChatMessage, ChatRequest
)
from emergentintegrations.llm.chat import LlmChat, UserMessage
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# Helper function to convert ObjectId to string
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
        doc["id"] = doc["_id"]
    return doc


# AUTHENTICATION & USER ENDPOINTS
@api_router.post("/auth/register", response_model=User)
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"phone": user_data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered")
    
    # Generate citizen ID
    citizen_id = f"BG-{random.randint(10000, 99999)}"
    
    user_dict = user_data.dict()
    user_dict["citizen_id"] = citizen_id
    user_dict["created_at"] = datetime.utcnow()
    user_dict["volunteer_points"] = 0
    user_dict["programs_attended"] = 0
    user_dict["community_reports"] = 0
    
    result = await db.users.insert_one(user_dict)
    created_user = await db.users.find_one({"_id": result.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    created_user["id"] = created_user["_id"]
    return created_user


@api_router.post("/auth/login")
async def login_user(phone: str):
    user = await db.users.find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user["_id"] = str(user["_id"])
    user["id"] = user["_id"]
    return user


@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return serialize_doc(user)


# PROGRAMS ENDPOINTS
@api_router.get("/programs")
async def get_programs(category: str = None, ward: str = None):
    query = {}
    if category:
        query["category"] = category
    if ward:
        query["ward"] = ward
    
    programs = await db.programs.find(query).to_list(100)
    return [serialize_doc(p) for p in programs]


@api_router.post("/programs", response_model=Program)
async def create_program(program_data: ProgramCreate):
    program_dict = program_data.dict()
    program_dict["created_at"] = datetime.utcnow()
    
    result = await db.programs.insert_one(program_dict)
    created_program = await db.programs.find_one({"_id": result.inserted_id})
    return serialize_doc(created_program)


@api_router.get("/programs/{program_id}")
async def get_program(program_id: str):
    program = await db.programs.find_one({"_id": ObjectId(program_id)})
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return serialize_doc(program)


# AI SUGGESTIONS ENDPOINT
@api_router.get("/suggestions/{user_id}")
async def get_suggestions(user_id: str):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get programs matching user interests and ward
    suggestions = await db.programs.find({
        "$or": [
            {"category": {"$in": user.get("interests", [])}},
            {"ward": user.get("ward", "")}
        ]
    }).limit(5).to_list(5)
    
    return [serialize_doc(s) for s in suggestions]


# COMMUNITY ISSUES ENDPOINTS
@api_router.post("/issues", response_model=CommunityIssue)
async def create_issue(issue_data: IssueCreate):
    issue_dict = issue_data.dict()
    issue_dict["status"] = "pending"
    issue_dict["created_at"] = datetime.utcnow()
    
    result = await db.issues.insert_one(issue_dict)
    
    # Update user's community reports count
    await db.users.update_one(
        {"_id": ObjectId(issue_data.user_id)},
        {"$inc": {"community_reports": 1}}
    )
    
    created_issue = await db.issues.find_one({"_id": result.inserted_id})
    return serialize_doc(created_issue)


@api_router.get("/issues")
async def get_issues(ward: str = None, status: str = None):
    query = {}
    if ward:
        query["ward"] = ward
    if status:
        query["status"] = status
    
    issues = await db.issues.find(query).to_list(100)
    return [serialize_doc(i) for i in issues]


# COMMUNITY UPDATES ENDPOINT
@api_router.get("/updates")
async def get_community_updates(ward: str = None):
    # Get recent resolved issues and upcoming programs
    updates = []
    
    resolved_issues = await db.issues.find(
        {"status": "resolved"}
    ).sort("created_at", -1).limit(3).to_list(3)
    
    for issue in resolved_issues:
        updates.append({
            "type": "resolved_issue",
            "title": f"{issue['issue_type']} resolved in Ward {issue['ward']}",
            "date": issue.get("created_at", datetime.utcnow()).strftime("%B %d"),
            "id": str(issue["_id"])
        })
    
    upcoming_programs = await db.programs.find().sort("created_at", -1).limit(3).to_list(3)
    
    for program in upcoming_programs:
        updates.append({
            "type": "program",
            "title": program["title"],
            "date": program.get("date", "Soon"),
            "id": str(program["_id"])
        })
    
    return updates


# AI CHAT ENDPOINT
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    try:
        # Get user info for context
        user = await db.users.find_one({"_id": ObjectId(chat_request.user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get chat history
        chat_history = await db.chat_messages.find({
            "user_id": chat_request.user_id,
            "session_id": chat_request.session_id
        }).sort("created_at", 1).limit(10).to_list(10)
        
        # Initialize LLM chat
        system_message = f"""You are an AI assistant for Parth Gautam Foundation's Citizen Super App. 
        You help citizens with healthcare, education, and community services.
        
        User Context:
        - Name: {user.get('name', '')}
        - Ward: {user.get('ward', '')}
        - Interests: {', '.join(user.get('interests', []))}
        
        Provide helpful, concise responses about:
        - Healthcare services (doctor appointments, health camps)
        - Education opportunities (scholarships, skill training)
        - Community programs (volunteer work, issue reporting)
        - Citizen card benefits
        
        Be friendly and actionable."""
        
        chat = LlmChat(
            api_key=os.environ['EMERGENT_LLM_KEY'],
            session_id=chat_request.session_id,
            system_message=system_message
        ).with_model("openai", "gpt-4")
        
        user_message = UserMessage(text=chat_request.message)
        response = await chat.send_message(user_message)
        
        # Save user message
        await db.chat_messages.insert_one({
            "user_id": chat_request.user_id,
            "session_id": chat_request.session_id,
            "role": "user",
            "content": chat_request.message,
            "created_at": datetime.utcnow()
        })
        
        # Save assistant response
        await db.chat_messages.insert_one({
            "user_id": chat_request.user_id,
            "session_id": chat_request.session_id,
            "role": "assistant",
            "content": response,
            "created_at": datetime.utcnow()
        })
        
        return {"response": response}
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# SEED DATA ENDPOINT (for development)
@api_router.post("/seed")
async def seed_database():
    # Check if already seeded
    program_count = await db.programs.count_documents({})
    if program_count > 0:
        return {"message": "Database already seeded"}
    
    # Seed programs
    sample_programs = [
        {
            "title": "Free Health Camp",
            "description": "General health checkup with free medicines",
            "category": "healthcare",
            "subcategory": "health_camp",
            "location": "Ward 12 Community Center",
            "ward": "12",
            "date": "Tomorrow 10 AM",
            "seats_available": 50,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Digital Skills Workshop",
            "description": "Learn basic computer skills and internet usage",
            "category": "education",
            "subcategory": "skill_training",
            "location": "Ward 8 School",
            "ward": "8",
            "date": "Next Monday",
            "seats_available": 20,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Merit Scholarship Program",
            "description": "Scholarships for students scoring above 80%",
            "category": "education",
            "subcategory": "scholarship",
            "location": "All Wards",
            "ward": "all",
            "date": "Apply by March 31",
            "seats_available": 100,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Community Cleanup Drive",
            "description": "Join us in cleaning public spaces",
            "category": "community",
            "subcategory": "volunteer",
            "location": "City Park",
            "ward": "5",
            "date": "This Sunday 7 AM",
            "seats_available": 30,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "created_at": datetime.utcnow()
        },
        {
            "title": "Teleconsultation Service",
            "description": "Free online doctor consultations",
            "category": "healthcare",
            "subcategory": "doctor_booking",
            "location": "Online",
            "ward": "all",
            "date": "Available daily",
            "seats_available": None,
            "latitude": 28.6139,
            "longitude": 77.2090,
            "created_at": datetime.utcnow()
        }
    ]
    
    await db.programs.insert_many(sample_programs)
    
    return {"message": "Database seeded successfully", "programs_added": len(sample_programs)}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

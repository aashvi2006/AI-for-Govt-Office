from pydantic import BaseModel, EmailStr, Field
from typing import Any
class RegisterIn(BaseModel): fullName:str; email:EmailStr; phone:str=""; password:str=Field(min_length=8); role:str="citizen"
class LoginIn(BaseModel): email:EmailStr; password:str
class UserOut(BaseModel): id:str; fullName:str; email:str; phone:str; role:str; status:str; createdAt:str; lastLoginAt:str|None=None; department:str|None=None; designation:str|None=None
class AuthOut(BaseModel): token:str; user:UserOut
class ApplicationIn(BaseModel): serviceId:str; formData:dict[str,Any]=Field(default_factory=dict)
class DecisionIn(BaseModel): decision:str; remarks:str=""; requestedDocuments:list[str]=Field(default_factory=list)
class InspectIn(BaseModel): status:str; officerComment:str|None=None
class ServiceIn(BaseModel): code:str; name:str; department:str=""; category:str="Identity & Civil"; shortDescription:str=""; fullDescription:str=""; processingDays:int=15; feeInr:int=0; isActive:bool=True; eligibilitySummary:list[str]=Field(default_factory=list); formFields:list[dict]=Field(default_factory=list)
class RequirementIn(BaseModel): serviceId:str; documentType:str; title:str; description:str=""; mandatory:bool=True; acceptedFormats:list[str]=Field(default_factory=lambda:["pdf","jpg","png"]); maxSizeMb:int=5; aiCheckPoints:list[str]=Field(default_factory=list)
class RuleIn(BaseModel): serviceId:str; ruleName:str; field:str; operator:str; value:str; failureMessage:str=""; severity:str="warning"; isActive:bool=True

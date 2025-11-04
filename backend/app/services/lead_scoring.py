from dataclasses import dataclass
from datetime import datetime

from sqlmodel import Session, select

from app.models import Lead, Property
from app.schemas.lead import LeadNextAction, LeadPublic, LeadRecommendation
from app.schemas.property import PropertySummary
from app.schemas.user import UserSummary


@dataclass
class LeadInsights:
    score: int
    status: str
    probability: float
    recommendations: list[LeadRecommendation]
    next_actions: list[LeadNextAction]


class LeadScoringService:
    """Serviço determinístico simples para priorização inicial de leads."""

    def __init__(self, session: Session):
        self.session = session

    def enrich(self, lead: Lead) -> LeadPublic:
        insights = self._build_insights(lead)
        lead.score = insights.score
        lead.status = insights.status
        lead.probability_to_close = insights.probability
        lead.updated_at = datetime.utcnow()
        self.session.add(lead)
        self.session.commit()
        self.session.refresh(lead)
        return self._to_public(lead, insights)

    def to_public(self, lead: Lead) -> LeadPublic:
        insights = self._build_insights(lead)
        return self._to_public(lead, insights)

    def _build_insights(self, lead: Lead) -> LeadInsights:
        base_score = 50
        if lead.email:
            base_score += 5
        if lead.phone:
            base_score += 10
        if lead.preferences:
            prefs = lead.preferences
            if prefs.get("budget_max"):
                base_score += 10
            if prefs.get("locations"):
                base_score += 5
            if prefs.get("operation") == "buy":
                base_score += 5
        if lead.property_id:
            base_score += 10

        score = max(30, min(95, base_score))
        status = "HOT" if score >= 80 else "WARM" if score >= 65 else "COLD"
        probability = round(min(0.95, score / 100), 2)

        recommendations = self._recommend_properties(lead)
        next_actions = self._next_actions(status)
        return LeadInsights(
            score=score,
            status=status,
            probability=probability,
            recommendations=recommendations,
            next_actions=next_actions,
        )

    def _recommend_properties(self, lead: Lead) -> list[LeadRecommendation]:
        query = select(Property)
        prefs = lead.preferences or {}
        if operation := prefs.get("operation"):
            query = query.where(Property.operation == operation)
        if city := prefs.get("locations"):
            query = query.where(Property.city.in_(city))
        if budget_max := prefs.get("budget_max"):
            query = query.where(Property.price <= float(budget_max) * 1.05)
        if lead.property_id:
            query = query.union_all(select(Property).where(Property.id == lead.property_id))

        properties = self.session.exec(query.limit(3)).all()
        recommendations: list[LeadRecommendation] = []
        for property in properties:
            summary = PropertySummary.model_validate(property, from_attributes=True)
            match_score = 0.75
            if lead.property_id == property.id:
                match_score = 0.95
            elif prefs.get("budget_max"):
                diff = abs(property.price - float(prefs["budget_max"]))
                match_score = max(0.6, 1 - (diff / max(property.price, 1)) * 0.3)
            recommendations.append(LeadRecommendation(property=summary, match_score=round(match_score, 2)))
        return recommendations

    @staticmethod
    def _next_actions(status: str) -> list[LeadNextAction]:
        if status == "HOT":
            return [
                LeadNextAction(label="Enviar proposta personalizada", channel="whatsapp"),
                LeadNextAction(label="Agendar visita com confirmação", channel="calendar"),
            ]
        if status == "WARM":
            return [
                LeadNextAction(label="Enviar tour virtual", channel="email"),
                LeadNextAction(label="Agendar follow-up em 2 dias", channel="crm"),
            ]
        return [
            LeadNextAction(label="Enviar materiais educativos", channel="email"),
            LeadNextAction(label="Agendar contato em 7 dias", channel="crm"),
        ]

    @staticmethod
    def _to_public(lead: Lead, insights: LeadInsights) -> LeadPublic:
        assigned = (
            UserSummary.model_validate(lead.assigned_to, from_attributes=True)
            if lead.assigned_to
            else None
        )
        return LeadPublic(
            id=lead.id,
            name=lead.name,
            email=lead.email,
            phone=lead.phone,
            message=lead.message,
            source=lead.source,
            preferences=lead.preferences,
            property_id=lead.property_id,
            status=insights.status,
            score=insights.score,
            probability_to_close=insights.probability,
            assigned_to=assigned,
            recommended_properties=insights.recommendations,
            next_best_actions=insights.next_actions,
            created_at=lead.created_at,
            updated_at=lead.updated_at,
        )

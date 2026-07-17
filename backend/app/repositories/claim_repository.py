from sqlalchemy.orm import Session

from app.models.claim import Claim


class ClaimRepository:

    @staticmethod
    def get_all(db: Session):
        return db.query(Claim).all()

    @staticmethod
    def create(db: Session, claim: Claim):
        db.add(claim)
        db.commit()
        db.refresh(claim)
        return claim